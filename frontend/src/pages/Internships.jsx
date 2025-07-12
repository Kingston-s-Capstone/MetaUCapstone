import SearchForm from "../components/SearchForm"
import "./Internships.css"
import { supabase } from "../SupaBaseClient"
import { useState, useEffect } from "react"
import { getRecommendations } from "../utilities/data"

const Internships = () => {
    const [internships, setInternships] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [sortBy, setSortBy] = useState("recommended")
    const [searchQuery, setSearchQuery] = useState("")
    const [hasMore, setHasMore] = useState(true)
    const [recommendedIds, setRecommendedIds] = useState([])

    const pageSize = 15

    //fetch recommended internships
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true)
                const { data: { user }, error: useError } = await supabase.auth.getUser();
                if(useError) console.error("User fetch error:", useError)
                if (!user) return;

                //Get user profile
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("user_id")
                    .eq("user_id", user.id)
                    .single();

                if (profileError) {
                    console.error("Profile fetch error:", profileError)
                    return;
                }

                //Get recommendations
                const userProfile = profile.user_id

                const recs = await getRecommendations(userProfile)

                const internshipIDs = recs
                    .filter((item) => item.type === "internships")
                    .map((item) => item.id);

                const pagedIds = internshipIDs.slice(0, pageSize)
                setPage(1);
                setHasMore(internshipIDs.length >= pageSize);
                
                //Fetch internship data from supabase
                const { data, error } = await supabase
                    .from("internships")
                    .select("*")
                    .in("id", pagedIds)

                if (error) {
                    console.error("Error fetching internship details:", error)
                } else {
                    const sortedData = pagedIds.map(
                        (id) => data.find((intern) => intern.id === id)
                    );

                    setInternships(sortedData);
                    setRecommendedIds(internshipIDs)
                }
            }   catch (error) {
                console.error("Error fetching recommendations:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchRecommendations()
    }, [])

    //Fetch internships 15 at a time for a page
    const fetchInternships = async (reset = false, customSearch = searchQuery, customRecommendedIds = recommendedIds) => {
        setLoading(true);
        const pageSize = 15;
        const from = reset ? 0 : (page - 1) * pageSize;
        const to = from + pageSize - 1;

        try {
            let query = supabase
                .from("internships")
                .select("*")
                .range(from, to);

            // Apply search if present
            if (customSearch.trim()) {
                query = query.ilike("title", `%${customSearch.toLowerCase()}%`)
            }

            //Apply filter for sortBy if selected
            if (sortBy === "newest") {
                query = query.order("date_created", { ascending: false })
            }

            const { data, error } = await query;

            if (error) {
                console.error("Fetch error:", error)
            } else {
                setInternships(reset ? data : [...internships, ...data]);
                if (!reset) setPage((prev) => prev + 1);
                setHasMore(data.length === pageSize);
            }
        } catch (err) {
            console.error("Unexpected error:", err.messege)
        };

        setLoading(false);
    };
    
    //Load more logic
    const handleLoadMore = async () => {
        try {
            setLoading(true);
            if (sortBy === "recommended") {
                const nextPage = page + 1;
                const nextIds = recommendedIds.slice(
                    page * pageSize,
                    nextPage * pageSize
                );
                if (nextIds.length === 0) {
                    setHasMore(false);
                    return
                }
                const moreData = await fetchInternships({ ids: nextIds })
                setInternships((prev) => [...prev, ...moreData]);
                setPage(nextPage);
                if (recommendedIds.length <= nextPage * pageSize) {
                    setHasMore(false)
                }
            } else {
                const data = await fetchInternships({ page, sortBy });
                if (data.length < pageSize) setHasMore(false);
                setInternships((prev) => [...prev, ...data]);
                setPage(page + 1)
            }
        } catch (error) {
            console.error("Error loading more internships", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInternships(true)
    }, [sortBy, searchQuery])

    return (
        <div className="page">
            <header className="pageHeader">
                <h2>Internships</h2>
            </header>
            <main className="main">
                <div className="searchContainer">
                    <div className="filters">
                        <select value={sortBy} onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                            fetchInternships(true)
                        }} >
                            <option value="">Recommended</option>
                            <option value="newest">Newly Added</option>
                            <option value="all">All Internships</option>
                        </select>
                    </div>
                    <div className="searchAdd">
                        <div className="search">
                            <SearchForm 
                                onSearch={(query) => {
                                    setSearchQuery(query);
                                    fetchInternships(true, query)
                                }}
                                onClear={() => {
                                    setSearchQuery("");
                                    fetchInternships(true, "")
                                }}
                            />
                        </div>
                        <div className="addNew">
                            <button className="addButton">Add New</button>
                        </div>
                    </div>
                    
                </div>
                <div className="internshipList">
                    {internships.map((intern) => (
                        <div key={intern.id} className="internship">
                            <a href={intern.url} target="_blank" rel="noreffer">{intern.title}</a>
                            <span>{intern.organization}</span>
                        </div>
                    ))}
                </div>

                {!loading && hasMore && internships.length > 0 && (
                    <div className="loadMoreContainer">
                        <button onClick={() => handleLoadMore} className="loadMore">Load More</button>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Internships