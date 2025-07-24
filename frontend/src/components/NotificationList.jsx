import React, { useEffect, useState } from "react"
import NotificationCard from "./NotificationCard"
import "./NotificationList.css"
import { markNotificationAsRead, getUserNotifications } from "../utilities/data"

const NotificationList = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await getUserNotifications();
                setNotifications(res.data)
            } catch (err) {
                console.error("Failed to fetch notifications:", err)
            } finally {
                setLoading(false)
            }
        };
        fetchNotifications();
    }, [])

    const handleCardClick = async (notif) => {
        if (notif.status === 'unread') {
        try {
            await markNotificationAsRead(notif.id);
            setNotifications((prev) =>
                prev.map((n) => 
                    n.id === notif.id ? { ...n, read: true } : n 
                )
            )
        } catch (err) {
            console.error("Failed to mark as read:", err)
        }
    }}

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
                        onClick={() => handleCardClick(notif)}/>
                ))
            )}
        </div>
    )
}

export default NotificationList