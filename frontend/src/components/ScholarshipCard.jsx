import { useState, useEffect } from "react"
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { saveScholarship, getSavedScholarships, unsaveScholarship } from "../utilities/data";

const ScholarshipCard = ({ scholar, userId}) => {
    const [saved, setSaved] = useState(false)
    
    useEffect(() => {
        const checkIfSaved = async() => {
            try {
                const res = await getSavedScholarships(userId);
                const savedIds = res.data.map((entry)=> entry.scholarship_id);
                setSaved(savedIds.includes(scholar.id));
            } catch (err) {
                console.error('Error checking saved scholarships', err)
            }
        }
        checkIfSaved();
    }, [userId, scholar.id]);

    const toggleSave = async () => {
        try {
            if (saved) {
                await unsaveScholarship(userId.user_id, scholar.id);
            } else {
                await saveScholarship(userId.user_id, scholar.id)
            }
            setSaved(!saved)
        } catch (err) {
            console.error("Error saving scholarship", err)
        }
    }
    return (
        <div key={scholar.id} className="opportunity">
            <div className="opportunityContent">
                <a href={scholar.url} target="_blank" rel="noreffer">{scholar.title}</a>
                <span>{scholar.organization}</span>
            </div>
            <button className={`save ${saved ? 'saved' : ''}`} onClick={toggleSave} title={saved ? 'Unsave' : 'Save'}>
                {saved ? <FaBookmark /> :  <FaRegBookmark />}
            </button>
        </div>
    )
}

export default ScholarshipCard