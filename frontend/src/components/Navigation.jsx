import { Link, Outlet } from 'react-router-dom'
import "../components/Navigation.css"
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { UserAuth } from '../context/AuthContext'
import NotificationCenterModal from './NotificationModal'
import {NotificationBell} from '@novu/notification-center'

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

    const toggleModal = () => setIsModalOpen(!isModalOpen)

    return (
        <>
            <nav className='navbar'>
                <ul className='navbarList'>
                    <li onClick={toggleModal}><NotificationBell /></li>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/saved">Saved</Link></li>
                    <li><Link to="/internshippage">Internships</Link></li>
                    <li><Link to='/scholarshippage'>Scholarships</Link></li>
                    <li><Link to="/profilepage">Profile</Link></li>
                    <li><p onClick={handleSignOut} className='signOut'>Sign Out</p></li>
                </ul>
            </nav>
            <NotificationCenterModal isOpen={isModalOpen} onClose={toggleModal} />
            <main className='content'>
                <Outlet />
            </main>
        </>
    )
}

export default Navigation