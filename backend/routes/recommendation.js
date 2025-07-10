const express = require("express")
const router = express.Router()
const axios = require("axios")

router.get('/:user_id', async (req, res) => {
    console.log("Hit the /recommendations route")
    const userId = req.params.user_id;

    try {
        const response = await axios.get(`http://localhost:5001/recommendations/${userId}`)
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching from Flask:', error.message);
        res.status(500).json({ error: "Failed to get recommendations"})
    }
});

module.exports = router

