import { Link, Outlet } from 'react-router-dom'
import "../components/Navigation.css"
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { UserAuth } from '../context/AuthContext'

const Navigation = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const { signOut } = UserAuth()

    const handleSignOut = async (e) => {
        e.preventDefault()
        try {
            await signOut()
            navigate("/")
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
            <nav className='navbar'>
                <ul className='navbarList'>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/saved">Saved</Link></li>
                    <li><Link to="/internshippage">Internships</Link></li>
                    <li><Link to='/scholarshippage'>Scholarships</Link></li>
                    <li><Link to="/profilepage">Profile</Link></li>
                    <li><p onClick={handleSignOut} className='signOut'>Sign Out</p></li>
                </ul>
            </nav>
            <main className='content'>
                <Outlet />
            </main>
        </>
    )
}

export default Navigation