const express = require("express")
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { handleChatMessage } = require("../controllers/chatbotController");

router.post("/", requireAuth, handleChatMessage)

module.exports = router;