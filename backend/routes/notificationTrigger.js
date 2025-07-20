const express = require("express")
const { supabase } = require('../supabaseClient');

function createNotificationTriggerRoutes(emitToUser) {
    const router = express.Router()

    //Weighted helper function
    const changeToText = (profile) => {
        return (
            ((profile.career_interests || "") + " ") +
            ((profile.major || "") + " ") +
            ((profile.classification || "") + " ") +
            ((profile.location_preferences || "") + " ")
        ).toLowerCase();
    }

    //internship route, match on title
    router.post("/new-internship", async (req, res) => {
        const internship = req.body.new;
        const { title, url } = internship

        try {
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("user_id, major, career_interests")

            if (error) throw error;

            profiles.forEach((profile) => {
                const profileText = changeToText(profile);
                const profileSet = new Set(
                    profileText
                        .split(/\s+/)
                        .map((word) => word.toLowerCase())
                );

                const titleSet = new Set(
                    (title || "")
                        .toLowerCase()
                        .split(/\s/)
                );

                const hasMatch = [...profileSet].some((term) => titleSet.has(term));

                if (hasMatch) {
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
                const profileText = changeToText(profile);
                const profileSet = new Set(
                    profileText
                        .split(/\s+/)
                        .map((word) => word.toLowerCase())
                );

                const combinedText = `${title || ""} ${desciption || ""}`.toLowerCase();
                const combinedSet = new Set(combinedText.split(/\s+/))

                const hasMatch = [...profileSet].some((word) => combinedSet.has(term));

                if (hasMatch) {
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