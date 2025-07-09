import { useState } from "react";


function SearchForm({ onSearch, onClear }) {

    const [input, setInput] = useState("")

    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmedInput = input.trim();
        if (trimmedInput !== "") {
            onSearch(trimmedInput);
        }
    }

    const formSubmit=(event)=> {
        if (event.keyCode === 13) {
            event.preventDefault();
            handleSubmit(event)
        }
    }

    const handleClear = (event) => {
        setInput("");
        onClear();
    }

    return (
        <div className="SearchForm">
            <form onSubmit={handleSubmit}>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search Internships" onKeyDown={(e) => formSubmit(e)}></input>
                <button type="submit" className="formSubmit">Submit</button>
                <button className="reset" type="button" onClick={handleClear}>Clear</button>
            </form>
        </div>
    )
}

export default SearchForm