import SearchForm from "../components/SearchForm"
import "./Internships.css"
import { supabase } from "../SupaBaseClient"
import { useState, useEffect } from "react"
import { getRecommendations } from "../utilities/data"

const Internships = () => {
    const [internships, setInternships] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [sortBy, setSortBy] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const data = await getRecommendations("32df310e-b39a-48c8-8431-68df22bb0332")
                console.log("Recommendations:", data);
            }   catch (error) {
                console.error("Error fetching recommendations:", error)
            }
        }
        fetchRecommendations()
    }, [])

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
                        <button onClick={() => fetchInternships()} className="loadMore">Load More</button>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Internships