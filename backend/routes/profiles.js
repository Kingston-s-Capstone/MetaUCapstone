const express = require("express")
const router = express.Router()
const supabase = require('../supabaseClient');
const { requireAuth } = require("../middleware/requireAuth");

// Get profile of authenticated user
router.get('/me', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq('id', userId)
        .single();

    if (error) res.status(400).json({ error });
    res.json(data)
})

//Update prifile of authenticated user
router.put('/me', requireAuth,  async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const { data, error } =  await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data)
    }
)

module.exports = router;


