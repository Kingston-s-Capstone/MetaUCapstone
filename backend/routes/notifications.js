const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { createNotification, getUserNotifications, markAsRead } = require("../controllers/notificationsController");

//protect all routes
router.use(requireAuth);

//create new notif
router.post("/", createNotification);

//get all notifs for a user
router.get("/", getUserNotifications);

//mark as read
router.patch("/:id/read", markAsRead);

module.exports = router 