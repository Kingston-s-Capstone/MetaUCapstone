const express = require("express")
const router = express.Router()
const axios = require("axios")

const FLASK_URL =
    process.env.FLASK_BASE_URL || "http://localhost:5001";

router.get('/:user_id', async (req, res) => {
    console.log("Hit the /recommendations route")
    const userId = req.params.user_id;

    try {
        const response = await axios.get(`${FLASK_URL}/recommendations/${userId}`)
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching from Flask:', error.message);
        res.status(500).json({ error: "Failed to get recommendations"})
    }
});

module.exports = router

