import SearchForm from "../components/SearchForm"
import "./Opportunities.css"
import { supabase } from "../SupaBaseClient"
import { useState, useEffect } from "react"
import { getRecommendations } from "../utilities/data"
import ScholarshipCard from "../components/ScholarshipCard"


const Scholarships = () => {
    const [scholarships, setScholarships] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [sortBy, setSortBy] = useState("recommended")
    const [searchQuery, setSearchQuery] = useState("")
    const [hasMore, setHasMore] = useState(true)
    const [currentUser, setCurrentUser] = useState(null)

    const pageSize = 15

    //Fetch recommended scholarships
    const fetchRecommendations = async (reset = false, customSearch = searchQuery) => {
        try {
            setLoading(true)

            const currentPage = reset ? 0 : page;
            const from = currentPage * pageSize;
            const to = from + pageSize;

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
            } else {
                setCurrentUser(profile)
            }

            //Get recommendations
            const userProfile = profile.user_id

            const recs = await getRecommendations(userProfile)

            const scholarshipIDs = (recs.scholarship_ids || []).map(i => i.id)

            const pagedIds = scholarshipIDs.slice(from, to);
                
            //Fetch scholarship data from supabase
            const { data, error } = await supabase
                .from("scholarships")
                .select("*")
                .in("id", pagedIds)

            // Apply search if present
            let searchData = data;

            if (customSearch.trim()) {
                searchData = data.ilike("title", `%${customSearch.toLowerCase()}%`)
            }

            if (error) {
                console.error("Error fetching scholarship details:", error)
                return;
            } else {
                const sortedData = pagedIds.map((id) => searchData.find((scholar) => scholar.id === id))
                setScholarships(prev => (reset ? sortedData : [...prev, ...sortedData]));
            }
            setPage(prev => (reset ? 1 : prev + 1));
            setHasMore(scholarshipIDs.length > to)
        }   catch (error) {
            console.error("Error fetching recommendations:", error)
        } finally {
            setLoading(false)
        }
    }

    //Fetch scholarships 15 at a time for a page
    const fetchScholarships = async (reset = false, customSearch = searchQuery) => {
        setLoading(true);
        const pageSize = 15;
        const from = reset ? 0 : (page - 1) * pageSize;
        const to = from + pageSize - 1;

        try {
            let query = supabase
                .from("scholarships")
                .select("*")
                .range(from, to);

            // Apply search if present
            if (customSearch.trim()) {
                query = query.ilike("title", `%${customSearch.toLowerCase()}%`)
            }

            //Apply filter for sortBy if selected
            if (sortBy === "newest") {
                query = query.order("created_at", { ascending: false })
            } else {
                query = query.order("id", { ascending: true })
            }

            const { data, error } = await query;

            if (error) {
                console.error("Fetch error:", error)
                return
            } 

            setScholarships(prev => (reset ? data : [...prev, ...data]));
            setPage(prev => (reset ? 1 : prev + 1))
            setHasMore(data.length === pageSize)
            
        } catch (err) {
            console.error("Unexpected error:", err.messege)
        };

        setLoading(false);
    };

    //Load more logic
    const handleLoadMore = () => {
        if (sortBy === "recommended") {
            fetchRecommendations()
        } else {
            fetchScholarships()
        }
    }

    useEffect(() => {
        if (sortBy == "recommended") {
            fetchRecommendations(true)
        } else {
        fetchScholarships(true)
        }
    }, [sortBy, searchQuery])

    return (
        <div className="page">
            <header className="pageHeader">
                <h2>Scholarships</h2>
            </header>
            <main className="main">
                <div className="searchContainer">
                    <div className="filters">
                        <select value={sortBy} onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                            fetchScholarships(true)
                        }} >
                            <option value="recommended">Recommended</option>
                            <option value="newest">Newly Added</option>
                            <option value="all">All Scholarships</option>
                        </select>
                    </div>
                    <div className="searchAdd">
                        <div className="search">
                            <SearchForm 
                                onSearch={(query) => {
                                    setSearchQuery(query);
                                    fetchScholarships(true, query)
                                }}
                                onClear={() => {
                                    setSearchQuery("");
                                    if (sortBy === "recommended") {
                                        fetchRecommendations(true, "")
                                    } else {
                                        fetchScholarships(true, "")
                                    }
                                }}
                            />
                        </div>
                        <div className="addNew">
                            <button className="addButton">Add New</button>
                        </div>
                    </div>
                    
                </div>
                <div className="opportunityList">
                    {scholarships.map((scholar) => (
                        <ScholarshipCard key={scholar.id} scholar={scholar} userId={currentUser} />
                    )
                    )}
                </div>

                {!loading && hasMore && scholarships.length > 0 && (
                    <div className="loadMoreContainer">
                        <button onClick={handleLoadMore} className="loadMore">Load More</button>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Scholarships