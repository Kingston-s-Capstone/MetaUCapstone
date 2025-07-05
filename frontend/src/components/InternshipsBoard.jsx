import "./Board.css"
import { supabase } from "../SupaBaseClient"
import { useEffect, useState } from "react"

const InternshipBoard = () => {
    const [internships, setInternships] = useState([])
    const [careerInterest, setCareerInterest ] = useState('')

    // Get internships that match career interest using career interest as key words
    useEffect(() => {
        const fetchInternships = async () => {
            try {
                const { data: { user }, error: useError } = await supabase.auth.getUser();
                if(useError) console.error("User fetch error:", useError)
                if (!user) return;

                //Get user profile
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("career_interests")
                    .eq("user_id", user.id)
                    .single();

                if (profileError) {
                    console.error("Profile fetch error:", profileError)
                    return;
                }
                //Use career interest as key words
                const interest = profile?.career_interests || "";
                setCareerInterest(interest);

                const keywords = interest
                    .toLowerCase()
                    .split(/\s+/)
                    .filter(word => word.length > 2);

                const firstKeyword = keywords[0]
                const otherKeywords = keywords.slice(1)

                //Search internships table using the keywords as a filter

                //First keyword search
                const { data: primaryResults, error: primaryError } = await supabase
                    .from("internships")
                    .select("*")
                    .ilike("title", `%${firstKeyword}`)
                    .limit(5);

                if (primaryError) throw primaryError;

                let allResults = primaryResults || []

                //Other keywords search
                if (otherKeywords.length > 0) {
                const filter = otherKeywords.map(word => `title.ilike.%${word}%`).join(",");
                const { data: secondaryResults, error: secondaryError } = await supabase
                    .from("internships")
                    .select("*")
                    .or(filter)
                    .limit(5);

                if (secondaryError) throw secondaryError;

                //Combine and deduplicate by internship Id
                const combined = [...allResults, ...(secondaryResults || [])];
                const seen = new Set();
                const deduped = combined.filter(item => {
                    const key = item.id
                    if (seen.has(key)) return false;
                    seen.add(key)
                    return true;
                })
                allResults = deduped;
                }

                const sorted = allResults.sort((a, b) => {
                    const aMatch = a.title.toLowerCase().includes(firstKeyword);
                    const bMatch = b.title.toLowerCase().includes(firstKeyword);
                    if (aMatch === bMatch) return 0;
                    return aMatch ? -1 : 1;
                });

                setInternships(sorted);
            } catch (err) {
                console.error("Error:", err.message)
            }
        };
        fetchInternships();
    }, []);

    return (
        <div className="board">
            <div className="boardHeader">
                <h4>Internships</h4>
            </div>
            <div className="content">
                {internships.length > 0 ? (
                    internships.map((intern, i) => (
                        <div className="card" key={i}>
                            <a href={intern.url} target="_blank" rel="noopener noreferrer">
                                {intern.title}
                            </a>
                            <span>{intern.organization}</span>
                        </div>
                    ))
                ) : ( <p>No internships found for "{careerInterest}"</p>)}
            </div>
        </div>
    )
}

export default InternshipBoard