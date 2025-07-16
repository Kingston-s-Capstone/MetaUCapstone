const express = require("express")
const { supabase } = require('../supabaseClient');
const axios = require("axios")
const router = express.Router();
require("dotenv").config();

//Save scholarships
router.post('/save', async (req, res) => {
    const { user_id, scholarship_id } = req.body;

    const { data, error } = await supabase
        .from("saved_scholarships")
        .insert([{ user_id, scholarship_id }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'scholarship saved', data})
});

//Unsave scholarships
router.delete('/unsave', async (req, res) => {
    const { user_id, scholarship_id } = req.body;

    try {
        const { error } = await supabase
            .from('saved_scholarships')
            .delete()
            .match({ user_id, scholarship_id })
        
        if (error) throw error;
        res.status(200).json({ message: 'Scholarship unsaved successfully'})
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
});

//Get saved scholarships
router.get('/saved/:user_id', async (req, res) => {
    const { user_id } = req.params;

    const { data, error } = await supabase
        .from('saved_scholarships')
        .select('*, scholarships(*)');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data)
});

module.exports = router