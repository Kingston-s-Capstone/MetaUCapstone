import { useEffect, useState } from "react";
import { getProfile } from "../utilities/data";
import "../pages/Dashboard.css"
import PinnedBoard from "../components/SavedBoard";
import InternshipBoard from "../components/InternshipsBoard";
import ScholarshipsBoard from "../components/ScholarshipsBoard";
import ProfessionalBoard from "../components/ProfessionalBoard";

const Dashboard = () => {
    const [userName, setUserName ] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                setUserName(response.data.name)
            } catch (err) {
                console.error('Failed to fetch profile', err)
            }
        };

        fetchProfile()
    }, []);
    
    return (
        <div className="content">
            <header className="header">
                <h2>{userName}'s Dashboard </h2>
            </header>
            <main className="boards">
                <PinnedBoard />
                <InternshipBoard />
                <ScholarshipsBoard />
                <ProfessionalBoard />
            </main>
        </div>
    )
}

export default Dashboard