import SearchForm from "../components/SearchForm"
import "./Opportunities.css"
import { supabase } from "../SupaBaseClient"
import { useState, useEffect } from "react"
import { getRecommendations } from "../utilities/data"
import InternshipCard from "../components/InternshipCard"
import { toast } from "react-toastify"
import AddOpportunityModal from "../components/AddOpportunityModal"

const Internships = () => {
    const [internships, setInternships] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [sortBy, setSortBy] = useState("recommended")
    const [searchQuery, setSearchQuery] = useState("")
    const [hasMore, setHasMore] = useState(true)
    const [currentUser, setCurrentUser] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const pageSize = 15

    //fetch recommended internships

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

            const internshipIDs = (recs.internship_ids || []).map(i => i.id)

            const pagedIds = internshipIDs.slice(from, to);
                
            //Fetch internship data from supabase
            const { data, error } = await supabase
                .from("internships")
                .select("*")
                .in("id", pagedIds)

            // Apply search if present
            let searchData = data;

            if (customSearch.trim()) {
                searchData = data.ilike("title", `%${customSearch.toLowerCase()}%`)
            }

            if (error) {
                console.error("Error fetching internship details:", error)
                return;
            } else {
                const sortedData = pagedIds.map((id) => searchData.find((intern) => intern.id === id))
                setInternships(prev => (reset ? sortedData : [...prev, ...sortedData]));
            }
            setPage(prev => (reset ? 1 : prev + 1));
            setHasMore(internshipIDs.length > to)
        }   catch (error) {
            console.error("Error fetching recommendations:", error)
        } finally {
            setLoading(false)
        }
    }


    //Fetch internships 15 at a time for a page
    const fetchInternships = async (reset = false, customSearch = searchQuery) => {
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
            } else {
                query = query.order("id", { ascending: true })
            }

            const { data, error } = await query;

            if (error) {
                console.error("Fetch error:", error)
                return
            } 

            setInternships(prev => (reset ? data : [...prev, ...data]));
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
            fetchInternships()
        }
    }

    useEffect(() => {
        if (sortBy == "recommended") {
            fetchRecommendations(true)
        } else {
        fetchInternships(true)
        }
    }, [sortBy, searchQuery])

    const handleAdd = async (formData, type) => {
        const payload = {
            ...formData,
            date_validthrough: new Date(formData.deadline)
        }

        delete payload.deadline
        delete payload.amount
        delete payload.date

        //insert to supabase
        const { data, error } = await supabase.from("internships").insert(payload)
        if (error) console.error("Insert error:", error);
        else toast.info(
            "Internship added"
        )
    }

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
                            <option value="recommended">Recommended</option>
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
                                    if (sortBy === "recommended") {
                                        fetchRecommendations(true, "")
                                    } else {
                                        fetchInternships(true, "")
                                    }
                                }}
                            />
                        </div>
                        <div className="addNew">
                            <button className="addButton" onClick={() => setShowModal(true)}>Add New</button>
                        </div>
                    </div>
                    
                </div>
                <div className="opportunitiesList">
                    {internships.map((intern) => (
                        <InternshipCard key={intern.id} intern={intern} userId={currentUser.user_id}/>
                    ))}
                </div>

                {!loading && hasMore && internships.length > 0 && (
                    <div className="loadMoreContainer">
                        <button onClick={handleLoadMore} className="loadMore">Load More</button>
                    </div>
                )}
            </main>
            <AddOpportunityModal
                type="internship"
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleAdd}
            />
        </div>
    )
}

export default Internships