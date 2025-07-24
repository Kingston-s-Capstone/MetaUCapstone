import { Link, Outlet } from 'react-router-dom'
import "../components/Navigation.css"
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { UserAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import { getUserNotifications } from '../utilities/data'
import NotificationModal from './NotificationModal'

const Navigation = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
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

    useEffect(() => {
            const fetchNotifications = async () => {
                try {
                    const res = await getUserNotifications();
                    setNotifications(res.data)
                    console.log(notifications)
                } catch (err) {
                    console.error("Failed to fetch notifications:", err)
                } 
            };
            fetchNotifications();
        }, [])
    
    useEffect(() => {
        const count = notifications.filter(n => n.status === "unread").length
        setUnreadCount(count)
    }, [notifications])
    

    return (
        <>
            <nav className='navbar'>
                <ul className='navbarList'>
                    <NotificationBell 
                        unreadCount={unreadCount}
                        onClick={()=> setIsModalOpen(true)}/>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/saved">Saved</Link></li>
                    <li><Link to="/internshippage">Internships</Link></li>
                    <li><Link to='/scholarshippage'>Scholarships</Link></li>
                    <li><Link to="/profilepage">Profile</Link></li>
                    <li><p onClick={handleSignOut} className='signOut'>Sign Out</p></li>
                </ul>
            </nav>
            <NotificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <main className='content'>
                <Outlet />
            </main>
        </>
    )
}

export default Navigation