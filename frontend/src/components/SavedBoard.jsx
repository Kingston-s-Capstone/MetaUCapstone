import "./Board.css"
import { useState, useEffect } from "react";
import { supabase } from "../SupaBaseClient";
import { getInternships, getScholarships } from "../utilities/data";

const PinnedBoard = () => {
    const [internships, setInternships] = useState([])
    const [scholarships, setScholarships] = useState([])

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                //get user id
                const { data: { user }, error: useError } = await supabase.auth.getUser();
                if(useError) console.error("User fetch error:", useError)
                if (!user) return;
                const user_id = user.id

                //get saved internships by user
                const { data: internships, internError } = await supabase
                    .from("saved_internships")
                    .select("*")
                    .eq("user_id", user_id)
                    .limit(2)
                
                if (internError) console.error("Error fetching user saved internships:", internError)
                
                //get saved scholarships
                const { data: scholarships, scholarError } = await supabase
                    .from("saved_scholarships")
                    .select("*")
                    .eq("user_id", user_id)
                    .limit(2)
                if (scholarError) console.error("Error fetching user saved scholarships:", scholarError)

                //get saved internship data from internship/scholarship tables
                const allInternships = await getInternships()
                const allScholarships = await getScholarships()

                const savedInternshipIds = internships.map((entry) => entry.internship_id)
                const savedScholarshipIds = scholarships.map((entry) => entry.scholarship_id)

                const sortedInternships = allInternships.data
                    .filter((intern) => savedInternshipIds.includes(intern.id))
                    .sort((a, b) => new Date(a.date_validthrough) - new Date(b.date_validthrough))
                setInternships(sortedInternships)

                const sortedScholarships = allScholarships.data
                    .filter((scholarship) => savedScholarshipIds.includes(scholarship.id))
                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                setScholarships(sortedScholarships)

            } catch (err) {
                console.error("Error fetching saved opportunities:", err)
            }
        }
        fetchSaved();
    }, [])
    return (
        <div className="board">
            <div className="boardHeader">
                <h4>Saved Opportunties</h4>
            </div>
            <div className="content">
                <div className="saved-opportunity-columns">
                <div className="column">
                    <h3>Scholarships</h3>
                    <div className="opportunityList">
                        {scholarships.length > 0 ? (
                            scholarships.map(( scholar, i ) => (
                                <div className="card" key={i}>
                                    <a href={scholar.url} target="_blank" rel="noopener noreferrer">
                                        {scholar.title}
                                    </a>
                                    <span>{scholar.organization}</span>
                                </div>
                                ))
                            ) : (
                                <p> No scholarships saved.</p>
                            )}
                    </div>
                </div>
                <div className="column">
                    <h3>Internships</h3>
                    <div className="opportunityList">
                        {internships.length > 0 ? (
                            internships.map(( intern, i ) => (
                                <div className="card" key={i}>
                                    <a href={intern.url} target="_blank" rel="noopener noreferrer">
                                        {intern.title}
                                    </a>
                                    <span>{intern.organization}</span>
                                </div>
                            ))
                        ) : (
                            <p> No internships saved.</p>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}

export default PinnedBoard