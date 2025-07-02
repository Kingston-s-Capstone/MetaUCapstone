import { Link, Outlet } from 'react-router-dom'
import "../components/Navigation.css"

const Navigation = () => {
    return (
        <>
            <nav className='navbar'>
                <ul className='navbarList'>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/profilepage">Profile</Link></li>
                </ul>
            </nav>
            <main>
                <Outlet />
            </main>
        </>
    )
}

export default Navigation