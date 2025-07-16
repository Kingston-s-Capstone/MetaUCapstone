import { useState, useEffect } from "react"
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { saveInternship, getSavedInternships, unsaveInternship } from "../utilities/data";

const InternshipCard = ({ intern, userId, handleRemove}) => {
    const [saved, setSaved] = useState(false)
    
    useEffect(() => {
        const checkIfSaved = async() => {
            try {
                const res = await getSavedInternships(userId);
                const savedIds = res.data.map((entry)=> entry.internship_id);
                setSaved(savedIds.includes(intern.id));
            } catch (err) {
                console.error('Error checking saved internships', err)
            }
        }
        checkIfSaved();
    }, [userId, intern.id]);

    const toggleSave = async () => {
        try {
            if (saved) {
                await unsaveInternship(userId, intern.id);
                if (handleRemove) handleRemove(intern.id)
            } else {
                await saveInternship(userId, intern.id)
            }
            setSaved(!saved)
        } catch (err) {
            console.error("Error saving Internship", err)
        }
    }
    return (
        <div key={intern.id} className="opportunity">
            <div className="opportunityContent">
                <a href={intern.url} target="_blank" rel="noreffer">{intern.title}</a>
                <span>{intern.organization}</span>
            </div>
            <button className={`save ${saved ? 'saved' : ''}`} onClick={toggleSave} title={saved ? 'Unsave' : 'Save'}>
                {saved ? <FaBookmark /> :  <FaRegBookmark />}
            </button>
        </div>
    )
}

export default InternshipCard