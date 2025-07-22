import { FaBell } from 'react-icons/fa6';

const NotificationBell = ({ onClick, unreadCount }) => {
    return (
        <div className="notifBell" onClick={onClick}>
            <FaBell className='bellIcon' />
            {unreadCount > 0 && (
                <span className='notificationCount'>{unreadCount}</span>
            )}
        </div>
    )
}

export default NotificationBell