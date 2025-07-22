import React from "react";
import "./NotificationCard.css"

const NotificationCard = ({ notification, onClick }) => {
    return (
        <div
            className={`notificationCard ${notification.status === 'unread' ? 'unread' : ''}`}
            onClick={onClick}
        >
            <div className="notificationMessage">
                {notification.message}
            </div>
            <div className="notificationTime">
                {new Date(notification.created_at).toLocaleString()}
            </div>
        </div>
    )
}

export default NotificationCard