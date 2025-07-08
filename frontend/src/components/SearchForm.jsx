import { useState } from "react";


function SearchForm({ onSearch }) {

    let [input, setInput] = useState("")

    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmedInput = input.trim();
        if (trimmedInput !== "") {
            onSearch(trimmedInput);
            setInput("");
        }
    }

    const FormSubmit=(event)=> {
        if (event.keyCode === 13) {
            console.log("enter")
        }
    }

    const handleClear = (event) => {
        setInput("")
    }

    return (
        <div className="SearchForm">
            <form onSubmit={handleSubmit}>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search Movies" onKeyDown={(e) => FormSubmit(e)}></input>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default SearchForm