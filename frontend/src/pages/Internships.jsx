import SearchForm from "../components/SearchForm"
import { supabase } from "../SupaBaseClient"
import { useState, useEffect } from "react"

const Internships = () => {
    const [internships, setInternships] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [sortBy, setSortBy] = useState("")

    
    const fetchInternships = async (reset = false) => {
        setLoading(true);
        const pageSize = 15;
        const from = reset ? 0 : (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from("internships")
            .select("*")
            .range(from, to);

        if (sortBy === "newest") {
            query = query.order("date_created", { ascending: false })
        }

        const { data, error } = await query;

        if (error) {
            console.error("Fetch error:", error)
        } else {
            setInternships(reset ? data : [...internships, ...data]);
            if (!reset) setPage((prev) => prev + 1);
        }

        setLoading(false)
    }
    
    useEffect(() => {
        fetchInternships(true)
    }, [sortBy])
    return (
        <div className="content">
            <header className="header">
                <h2>Internships</h2>
            </header>
            <main className="main">
                <div className="searchContainer">
                    <div className="filters">
                        <select onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                            fetchInternships(true)
                        }} >
                            <option value="">Recommended</option>
                            <option value="newest">Newly Added</option>
                            <option value="all">All Internships</option>
                        </select>
                    </div>
                    <div className="search">
                        <SearchForm />
                        <button onClick={resetPage} className="resetButton">Clear</button>
                    </div>
                    <div className="addNew">
                        <button className="addButton">Add New</button>
                    </div>
                </div>
                <div className="internships">
                    {internships.map((intern) => (
                        <div key={intern.id} className="card">
                            <a href={intern.url} target="_blank" rel="noreffer">{intern.title}</a>
                            <span>{intern.organization}</span>
                        </div>
                    ))}
                </div>

                {!loading && (
                    <button onClick={() => fetchInternships()} className="loadMore">Load More</button>
                )}
            </main>
        </div>
    )
}