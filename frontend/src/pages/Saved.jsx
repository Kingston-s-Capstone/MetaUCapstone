import { getSavedInternships, getSavedScholarships, unsaveInternship, unsaveScholarship } from "../utilities/data";
import { useEffect, useState } from "react";
import SearchForm from "../components/SearchForm";
import ScholarshipCard from "../components/ScholarshipCard";
import InternshipCard from "../components/InternshipCard";
import './Opportunities.css'
import { supabase } from "../SupaBaseClient";

const SavedOpportunities = () => {
    const [currentUser, setCurrentUser] = useState(null)
    const [scholarships, setScholarships] = useState([]);
    const [internships, setInternships] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    //fetch user
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        }
        fetchUser();
    }, []);

    //fetch saved opportunities and sort by deadline
    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;

            const [scholarshipRes, internshipRes] = await Promise.all([
                getSavedInternships(currentUser.id),
                getSavedScholarships(currentUser.id)
            ]);
            
            const sortedScholarships = scholarshipRes.data.sort((a, b) =>
                new Date(a.scholarships.deadline) - new Date(b.scholarships.deadline));

            const sortedInternships = internshipRes.data.sort((a, b) => 
                new DataTransfer(a.internships.date_validthrough) - new Date(b.internships.date_validthrough));

            setScholarships(sortedScholarships);
            setInternships(sortedInternships)
        };
        fetchData()
    }, [currentUser])

    //remove opportunites if unsaved
    const removeScholarship = async (id) => {
        try {
            await unsaveScholarship(currentUser.id, id);
            setScholarships((prev) => prev.filter((item) => item.scholarships.id !== id));
        } catch (err) {
            console.error("Failed to unsave scholarship", err);
        }
    }

    const removeInternship = async (id) => {
        try {
            await unsaveInternship(currentUser.id, id);
            setScholarships((prev) => prev.filter((item) => item.internships.id !== id));
        } catch (err) {
            console.error("Failed to unsave internship", err);
        }
    }

    //filter for search queries
    const filteredScholarships = scholarships.filter(({ scholarships }) => 
        scholarships.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scholarships.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    const filteredInternships = internships.filter(({ internships }) => 
        internships.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internships.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!currentUser) return <div className="page">Loading user...</div>;

    return (
        <div className="page">
            <div className="pageHeader">Saved Opportunities</div>

            <div className="searchContainer">
                <SearchForm
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                />
            </div>

            <div className="saved-opportunity-columns">
                <div className="saved-column">
                    <h3>Scholarships</h3>
                    <div className="opportunityList">
                        {filteredScholarships.length > 0 ? (
                            filteredScholarships.map(({ scholarships }) => (
                                <ScholarshipCard
                                    key={scholarships.id}
                                    scholar={scholarships}
                                    userId={currentUser.id}
                                    handleRemove={removeScholarship}
                                />
                            ))
                        ) : (
                            <p> No scholarships saved.</p>
                        )}
                    </div>
                </div>
                <div className="saved-column">
                    <h3>Internships</h3>
                    <div className="opportunityList">
                        {filteredInternships.length > 0 ? (
                            filteredInternships.map(({ internships }) => (
                                <InternshipCard
                                    key={internships.id}
                                    intern={internships}
                                    userId={currentUser.id}
                                    handleRemove={removeInternship}
                                />
                            ))
                        ) : (
                            <p> No internships saved.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavedOpportunities