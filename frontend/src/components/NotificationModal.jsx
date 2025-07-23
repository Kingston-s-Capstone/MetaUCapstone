import NotificationList from "./NotificationList";
import "./modal.css"

const NotificationModal = ({ isOpen, onClose, onMarkAsRead}) => {
    if (!isOpen) return null;

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h2>Notifications</h2>
                    <button className="close" onClick={onClose}>
                        x
                    </button>
                </div>
                <NotificationList />

            </div>
        </div>
    )
}

export default NotificationModal