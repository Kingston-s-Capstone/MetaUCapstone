//controls how the route request is handled
const notificationService = require("../services/notificationsService");
const { supabase } = require("../supabaseClient");

//create new
exports.createNotification = async (req, res) => {
    const { user_id, type, title, message, url} = req.body;
    try {
        const notification = await notificationService.create({ user_id, type, title, message, url });

        //check user prefereces for notis
        const { data: prefs, error: prefError } = await supabase
            .from("user_preferences")
            .select("in_app_notifications")
            .eq("user_id", user_id)
            .maybeSingle();
        if (prefError) {
            console.warn("Preference fetch error:", prefError.message)
        }
        //send real time notification via socket.io if user is opted in
        if (prefs?.in_app_notifications) {
            const emitToUser = req.app.get("emitToUser")
            emitToUser(user_id, "new_notification", {
                id: notification.id,
                title,
                message,
                url,
                type,
                status: "unread",
                created_at: notification.created_at,
            });
        }
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

