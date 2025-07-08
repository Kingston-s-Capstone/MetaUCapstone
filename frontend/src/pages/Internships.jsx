import SearchForm from "../components/SearchForm"

const Internships = () => {
    return (
        <div className="content">
            <header className="header">
                <h2>Internships</h2>
            </header>
            <main className="main">
                <div className="searchContainer">
                    <div className="filters">
                        <select >
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
                    
                </div>
            </main>
        </div>
    )
}