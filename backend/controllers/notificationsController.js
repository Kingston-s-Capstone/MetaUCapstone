//controls how the route request is handled
const notificationService = require("../services/notificationsService");

//create new
exports.createNotification = async (req, res) => {
    const { user_id, type, title, message, url} = req.body;
    try {
        const notification = await notificationService.create({ user_id, type, title, message, url })
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};

//get user notis
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getByUserId(req.user_id)
        res.json(notifications)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};

//mark as read
exports.markAsRead = async (req, res) => {
    try {
        const updated = await notificationService.markAsRead(req.params.id);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};

