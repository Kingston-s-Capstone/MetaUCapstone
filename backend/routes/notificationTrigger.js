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

    //saved opportunities deadline notifications route
    router.post("/check-deadlines", async (req, res) => {
        const now = new Date();
        const intervals = [
            { label: "7_days", days: 7 },
            { label: "3_days", days: 3 },
            { label: "day_of", days: 0 }
        ];

        const checkAndNotify = async ({ table, joinField, dateField, type }) => {
            for (const { label, days } of intervals) {
                const targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() + days);

                try {
                    const { data, error } = await supabase
                        .from(table)
                        .select(`
                            user_id,
                            ${joinField},
                            ${type === "internship" ? `${joinField}(${dateField}, titile)` : `${joinField}(${dateField}, title)`}
                        `);

                    if (error) {
                        console.error(`Error fetching from ${table}:`, error);
                        continue
                    };

                    for (const item of data) {
                        const user_id = item.user_id;
                        const opportunity_id = item[joinField];
                        const opportunity = item[joinField];
                        const deadline = opportunity?.[dateField];
                        const title = opportunity?.title;

                        //skip if no deadlines
                        if (!deadline) continue;

                        //standardize date comparison (ex. strip time if a timestamp)
                        const deadlineDate = new Date(deadline);
                        const normalizedDeadline = new Date(
                            deadlineDate.getFullYear(),
                            deadlineDate.getMonth(),
                            deadlineDate.getDate()
                        );

                        const normalizedTarget = new Date(
                            targetDate.getFullYear(),
                            targetDate.getMonth(),
                            targetDate.getDate()
                        );

                        //only trigger if matches this interval
                        if (normalizedDeadline.getTime() !== normalizedTarget.getTime()) continue;

                        //check if notif was already sent
                        const { data: sent, error: sentError } = await supabase
                            .from("sent_deadline_notifications")
                            .select("id")
                            .eq("user_id", user_id)
                            .eq("opportuntiy_id", opportunity_id)
                            .eq("opportunity_type", type)
                            .eq("notification_type", label)
                            .maybeSingle();

                        if (sentError) {
                            console.error("Sent check failed", sentError)
                            continue;
                        }

                        if (!sent) {
                        emitToUser(user_id, "new_notification", {
                            message: `${type === "internship" ? "Internship" : "Scholarship"} due in ${
                                days === 0 ? "today!" : `${days} day(s)`
                            }: ${title}`,
                            url
                        });

                        // Insert record to prevent duplicate
                        await supabase.from("sent_deadline_notifications").insert([
                            {
                                user_id,
                                opportunity_id,
                                opportunity_type: type,
                                notification_type: label,
                            },
                        ]);
                    }
                }
            } catch (err) {
                console.error(`Failed to process ${type} for ${label}:`, err)
            }
            }
        };

        try {
            await checkAndNotify({
                table: "saved_internship",
                joinField: "internship_id",
                dateField: "date_validation",
                type: "internship",
            });

            await checkAndNotify({
                table: "saved_scholarships",
                joinField: "scholarship_id",
                dateField: "deadline",
                type: "scholarship"
            });

            res.status(200).json({ success: true });
        } catch (err) {
            console.error("Error in deadline trigger:", err);
            res.status(500).json({ error: "Deadline trigger failed" });
        }
    })
    return router
}
module.exports = createNotificationTriggerRoutes;