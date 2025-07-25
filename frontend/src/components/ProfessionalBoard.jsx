import { useState, useEffect } from "react"
import "./Board.css"
import { supabase } from "../SupaBaseClient"

const ProfessionalBoard = () => {
    const [opportunities, setOpportunities] = useState([])

    useEffect(() => {
        const getOpps = async () => {
            const {data: opps, error} = await supabase
                .from("professional_development")
                .select("*")
                .limit("4")

            if (error) console.error("Error fetching professional development opportunities:", error)
            setOpportunities(opps)
        }
        getOpps()
    }, [])

    return (
        <div className="board">
            <div className="boardHeader">
                <h4>Professional Development</h4>
            </div>
            <div className="content">
                {opportunities.length > 0 ? (
                    opportunities.map((opps, i) => (
                        <div className="card" key={i}>
                            <a href={opps.url} target="_blank" rel="noopener noreferrer">
                                {opps.title}
                            </a>
                            <span><strong>{opps.organization}</strong> | {new Date(opps.date).toLocaleDateString("en-US")}</span>
                        </div>
                    ))
                ) : ( <p>No professional development opportunities</p>)}
            </div>
        </div>
    )
}

export default ProfessionalBoard