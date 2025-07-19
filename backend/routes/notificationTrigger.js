const express = require("express")
const { supabase } = require('../supabaseClient');

function createNotificationTriggerRoutes(emitToUser) {
    const router = express.Router()

    //Weighted helper function
    const weightedProfileText = (profile) => {
        return (
            ((profile.career_interests || "") + " ").repeat(3) +
            ((profile.major || "") + " ").repeat(2) +
            ((profile.classification || "") + " ").repeat(2) +
            ((profile.location_preferences || "") + " ").repeat(3)
        ).toLowerCase();
    }

    //internship route, match on title
    router.post("/new-internship", async (req, res) => {
        const internship = req.body.new;
        const { title, url } = internship

        try {
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("user_id, major, career_interests, classification, location_preferences")

            if (error) throw error;

            profiles.forEach((profile) => {
                const profileText = weightedProfileText(profile);
                const titleText = (title || "").toLowerCase();

                const isMatch = profileText
                    .split(" ")
                    .some((term) => titleText.includes(term))

                if (isMatch) {
                    const link = url
                    emitToUser(profile.user_id, "new_notification", {
                        message: `New Internship matches your profile, check it out: ${title}`,
                        url: link
                    });
                }
            });
            res.status(200). json({ success: true });
        } catch (err) {
            console.error("Error in /new-internship:", err);
            res.status(500).json({ error: "Internship notification failed"})
        }
    })

    //scholarship route, match on title and description
    router.post("/new-scholarship", async (req, res) => {
        const scholarship = req.body.new;
        const { title, desciption, url } = scholarship;

        try {
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("user_id, major, career_interests, classification, location_preferences")

            if (error) throw error;

            profiles.forEach((profile) => {
                const profileText = weightedProfileText(profile);
                const combinedText = `${title || ""} ${desciption || ""}`.toLowerCase();

                const isMatch = profileText
                    .split(" ")
                    .some((term) => combinedText.includes(term))

                if (isMatch) {
                    const link = url
                    emitToUser(profile.user_id, "new_notification", {
                        message: `New Scholarship matches your profile, check it out: ${title}`,
                        url: link
                    });
                }
            })
            res.status(200).json({ success: true });
        } catch (err) {
            console.error("Error in /new-scholarship:", err)
            res.status(500).json({ error: "Scholarship notification failed"})
        }
    })
    return router
}
module.exports = createNotificationTriggerRoutes;