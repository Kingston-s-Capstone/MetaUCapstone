import React, { useEffect, useState } from "react"
import NotificationCard from "./NotificationCard"
import "./NotificationList.css"

const NotificationList = ({ userId, onCardClick }) => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/notifications", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`
                    },
                });
                const data = await res.json();
                setNotifications(data || [])
            } catch (err) {
                console.error("Failed to fetch notifications:", err)
            } finally {
                setLoading(false)
            }
        };
        fetchNotifications();
    }, [])

    if (loading) return <p>Loading noifications....</p>

    return (
        <div className="notificationsList">
            {notifications.length === 0 ? (
                <p className="emptyMessage">No notifications</p>
            ) : (
                notifications.map((notif) => (
                    <NotificationCard 
                        key={notif.id} 
                        notification={notif} 
                        onClick={() => onCardClick?.(notif)}/>
                ))
            )}
        </div>
    )
}

export default NotificationList