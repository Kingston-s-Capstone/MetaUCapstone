import { useState, useEffect } from "react";
import SearchForm from "../components/SearchForm";
import "./Opportunities.css"
import { supabase } from "../SupaBaseClient"
import ProfDevCard from "../components/ProfDevelopmentCard";

const ProfessionalDevelopment = () => {
    const [opportunities, setOpportunities] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [hasMore, setHasMore] = useState(true)

    const fetchOpportunities = async (reset = false, customSearch = searchQuery) => {
        setLoading(true);
        const pageSize = 15;
        const from = reset ? 0 : (page - 1) * pageSize;
        const to = from + pageSize - 1;

        try {
            let query = supabase
                .from("professional_development")
                .select("*")
                .range(from, to);

            console.log("query",query)
            // Apply search if present
            if (customSearch.trim()) {
                query = query.ilike("title", `%${customSearch.toLowerCase()}%`)
            }

            const { data, error } = await query;

            if (error) {
                console.error("Fetch error:", error)
                return
            } 

            setOpportunities(prev => (reset ? data : [...prev, ...data]));
            setPage(prev => (reset ? 1 : prev + 1))
            setHasMore(data.length === pageSize)
            
        } catch (err) {
            console.error("Unexpected error:", err.messege)
        };

        setLoading(false);
    };

    //Load more logic
    const handleLoadMore = () => {
        fetchOpportunities()
    }

    useEffect(() => {
        fetchOpportunities(true)
    }, [searchQuery])

    return (
        <div className="page">
            <header className="pageHeader">
                <h2>Professional Development Opportunities</h2>
            </header>
            <main className="main">
                <div className="searchContainer">
                    <div className="searchAdd">
                        <div className="search">
                            <SearchForm 
                                onSearch={(query) => {
                                    setSearchQuery(query);
                                    fetchOpportunities(true, query)
                                }}
                                onClear={() => {
                                    fetchOpportunities(true, "")
                                }}
                            />
                        </div>
                        <div className="addNew">
                            <button className="addButton">Add New</button>
                        </div>
                    </div>
                    
                </div>
                <div className="opportunityList">
                    {opportunities.map((opp) => (
                        <ProfDevCard key={opp.id} opp={opp}  />
                    )
                    )}
                </div>

                {!loading && hasMore && opportunities.length > 0 && (
                    <div className="loadMoreContainer">
                        <button onClick={handleLoadMore} className="loadMore">Load More</button>
                    </div>
                )}
            </main>
        </div>
    )
}

export default ProfessionalDevelopment