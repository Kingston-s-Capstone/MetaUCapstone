import "./Board.css"
import { supabase } from "../SupaBaseClient"
import { useEffect, useState } from "react"

const ScholarshipsBoard = () => {
    const [scholarships, setScholarships] = useState([])
    const [userMajor, setUserMajor] = useState('')

    useEffect(() => {
        const fetchScholarships = async () => {
            try {
                const { data: { user }, error: useError } = await supabase.auth.getUser();
                if(useError) console.error("User fetch error:", useError)
                if (!user) return;

                //Get user profile
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("major")
                    .eq("user_id", user.id)
                    .single();

                if (profileError) {
                    console.error("Profile fetch error:", profileError)
                    return;
                }

                //Use major as keyword search for scholarships
                const major = profile.major || "";
                setUserMajor(major)

                const keywords = userMajor
                    .toLowerCase()
                    .split(/\s+/)

                const majorsFilter = keywords
                    .map(word => `eligibility.ilike.%${word}%`)
                    .join(',')
                
                const { data: majorResults, error: majorError } = await supabase
                    .from('scholarships')
                    .select('*')
                    .or(majorsFilter)
                    .limit(3);

                if (majorError) throw majorError;

                let allResults = majorResults || []

                const allMajorsFilter = `eligibility.ilike.%All majors%`;
                
                const  { data: allMajorsResults, error: allMjorsError } = await supabase
                    .from('scholarships')
                    .select('*')
                    .or(allMajorsFilter)
                    .limit(2);

                if (allMjorsError) throw allMjorsError;

                const combined = [...allResults, ...allMajorsResults]

                setScholarships(combined)
            } catch (err) {
                console.error("Fetch error:", err.message)
            }
        };
        fetchScholarships()
    }, [])

    
    return (
        <div className="board">
            <div className="boardHeader">
                <h4>Scholarships</h4>
            </div>
            <div className="content">
                {scholarships.length > 0 ? (
                    scholarships.map((scholarship, i) => (
                        <div className="card" key={i}>
                            <a href={scholarship.url} target="_blank" rel="noopener noreferrer">
                                {scholarship.title}
                            </a>
                            <span>{scholarship.organization}</span>
                        </div>
                    ))
                ) : ( <p>No internships found for "{userMajor}"</p>)}
            </div>
        </div>
    )
}

export default ScholarshipsBoard