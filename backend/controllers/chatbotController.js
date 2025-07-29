const { fetchProfileData } = require("../services/profileService")
const { generateChatbotResponse } = require("../services/chatbotService")

const handleChatMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        const profile = await fetchProfileData(userId);
        const response = await generateChatbotResponse(message, profile);

        res.status(200).json({ response });
    } catch (err) {
        console.error("Chatbot error:", err.message)
        res.status(500).json({ error: "Chatbot failed to respond." })
    }
};

module.exports = { handleChatMessage }