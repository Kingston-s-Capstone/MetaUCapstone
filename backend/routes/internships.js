const express = require("express")
const { supabase } = require('../supabaseClient');
const axios = require("axios")
const router = express.Router();
require("dotenv").config();

//Get all internships
router.get("/", async (req, res) => {
    const { data, error } = await supabase
        .from("internships")
        .select("*")
        .order("date_posted", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Enviornment variables 
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "internships-api.p.rapidapi.com";
const API_URLS = [
    "https://internships-api.p.rapidapi.com/active-ats-7d?location_filter=United%20States",
    "https://internships-api.p.rapidapi.com/active-jb-7d?location_filter=United%20States"
];

// Check if internshi already exists
const internshipsExists = async (url) => {
    const { data, error } = await supabase
        .from("internships")
        .select("id")
        .eq("url", url)
        .maybeSingle();
    return !!data;
}

// Insert internships from RapidAPI into database
router.post("/apiPopulate", async (req, res) => {
    try {
        let inserted = 0;

        for (const apiUrl of API_URLS) {
            const response = await axios.get(apiUrl, {
                headers: {
                    "x-rapidapi-host": RAPIDAPI_HOST,
                    "x-rapidapi-key": RAPIDAPI_KEY,
                },
            });
            const internships = response.data || response.data.data || [];

            for (const job of internships) {
                if (!job?.url) continue;

                const alreadyExists = await internshipsExists(job.url);
                if (alreadyExists) continue;

                const { error } = await supabase.from("internships").insert([
                    {
                        title: job.title,
                        organization: job.organization,
                        organization_url: job.organization_url,
                        organization_logo: job.organization_logo,
                        date_posted: job.date_posted,
                        date_created: job.date_created,
                        date_validthrough: job.date_validthrough,
                        locations_derived: job.locations_derived,
                        location_type: job.location_type,
                        salary_raw: job.salary_raw,
                        employment_type: job.employment_type?.[0] || null,
                        url: job.url,
                        source: job.source,
                        description: job.description_text || null,
                    }
                ]);
                if (!error) inserted++;
                else console.error("Insert error:", error)
            }
        }
        res.status(200).json({ message: `Inserted ${inserted} internships` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch internships "});
    }
});


//User input
router.post("/userInput", async(req, res) => {
    try {
        const job = req.body

        if (!job.title || !job.organization || !job.url) {
            return res.status(400).json({ error: "Missing required fields" })
        }

        const { data: existing, error: lookupErrr } = await supabase
            .from("internships")
            .select("id")
            .eq("url", job.url)
            .maybeSingle();

        if (existing) {
            return res.status(409).json({ message: "Internship already exists" })
        }

        const { error } = await supabase.from("internships").insert({
            title: job.title,
            organization: job.organization,
            url: job.url,
            organization_logo: job.organization_logo || null,
            date_posted: job.date_posted || null,
            date_created: job.date_created || null,
            locations_derived: job.locations_derived || null,
            employment_type: job.employment_type || null,
            salary_raw: job.salary_raw || null,
            source: job.source || "user input",
            description: job.description_text || null,
        });

        if (error) {
            console.error("Insert error:", error);
            return res.status(500). json({ error: "Insert failed" })
        }

        res.status(201).json({ message: "Internship added to database" });
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
});

//Save Internships
router.post('/save', async (req, res) => {
    const { user_id, internship_id } = req.body;

    const { data, error } = await supabase
        .from('saved_internships')
        .insert([{ user_id, internship_id }])

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Internship saved!', data})
});

//Get saved internships
router.get('/saved/:user_id', async (req, res) => {
    const { user_id } = req.params;

    const { data, error } = await supabase
        .from('saved_internships')
        .select('*, internships(*)');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data)
});

//Unsave internships
router.delete('/unsave', async (req, res) => {
    const { user_id, internship_id } = req.body;

    try {
        const { error } = await supabase
            .from('saved_internships')
            .delete()
            .match({ user_id, internship_id })
        
        if (error) throw error;
        res.status(200).json({ message: 'Scholarship unsaved successfully'})
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
});

// Delete internships
router.delete("/cleanup", async (req, res) => {
    try {
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        const { error } = await supabase
            .from("internships")
            .delete()
            .lt("date_posted", twoMonthsAgo.toISOString());

        if (error) throw error;
        res.status(200).json({ message: "Old internships cleaned up." })
    } catch (err) {
        res.status(500).json({ error: "Failed to clean up old internhsips." })
    }
});

module.exports = router
