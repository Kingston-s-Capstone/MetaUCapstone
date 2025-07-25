const express = require("express")
const { supabase } = require('../supabaseClient');
const sendEmail = require('../utilities/sendEmail')
const notificationService = require("../services/notificationsService")
const { computeBM25, prepareDocument } = require("../utilities/bm25");

function createNotificationTriggerRoutes(emitToUser) {
    const router = express.Router()

    //change to text helper function
    const changeToText = (profile) => {
        return (
            ((profile.career_interests || "") + " ") +
            ((profile.major || "") + " ") +
            ((profile.classification || "") + " ") +
            ((profile.location_preferences || "") + " ")
        ).toLowerCase()
        .split(/\s+/);
    }

    //internship route, match on title
    router.post("/new-internship", async (req, res) => {
        const internship = req.body.new;
        const { title, url } = internship
        const matchMap = new Map();

        const opportunityText = `${title}`;
        const documents = [prepareDocument(opportunityText, { title, url })]

        try {
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("user_id, major, career_interests")

            if (error) throw error;

            profiles.forEach(async (profile) => {
                const queryTokens = changeToText(profile);
                console.log("profile", profile.user_id)
                
                //get BM25 score
                const [scored] = computeBM25(queryTokens, documents)
                const hasMatch = scored.score > .20;

                //match met, add to batch
                if (hasMatch) {
                    if (!matchMap.has(profile.user_id)) {
                        matchMap.set(profile.user_id, [])
                    }

                    matchMap.get(profile.user_id).push({ title, link: url})
                } 
            });
            
            //after looping through all profiles, send one email + emit per match group
            for (const profile of profiles) {
                const matched = matchMap.get(profile.user_id) || []
                profile._matchedItems = matched
                const matchedItems = profile._matchedItems;
                if (!matchedItems || matchedItems.length === 0) continue;

                const email = (
                    await supabase
                        .from("profiles")
                        .select("email")
                        .eq("user_id", profile.user_id)
                        .maybeSingle()
                ).data?.email;

                const htmlBody = matchedItems
                    .map((item) => `<p><a href="${item.link}">${item.title}</a></p>`)
                    .join("")

                await sendEmail({
                    to: email,
                    subject: "You have new internship matches!",
                    html:`
                    <p>We've found ${matchedItems.length} new internship(s) that match your profile:</p>
                    ${htmlBody}
                    `
                });
                console.log("profle emit:", profile.user_id)
                //send a push notif
                emitToUser(profile.user_id, "new_notification", {
                    message: `${matchedItems.length} new internship(s) match your profile.`,
                    url: "http://localhost:5173/internshippage"
                });

                //save to notification table
                try {
                    await notificationService.create({
                        user_id: profile.user_id,
                        type:"internship",
                        title: "New internship matches!",
                        message: `
                                    <p>We've found ${matchedItems.length} new internship(s) that match your profile:</p>
                                    ${htmlBody}
                                `,
                        url: "http://localhost:5173/internshippage"
                    })
                    } catch (err) {
                        console.error("Error saving new internship notification", err)
                    }
            }
            res.status(200). json({ success: true });
        } catch (err) {
            console.error("Error in /new-internship:", err);
            res.status(500).json({ error: "Internship notification failed"})
        }
    })

    //scholarship route, match on title and description
    router.post("/new-scholarship", async (req, res) => {
        const scholarship = req.body.new;
        const { title, desciption, url, eligibility } = scholarship;
        const matchMap = new Map();

        const opportunityText = `${title} ${desciption} ${eligibility}`;
        const documents = [prepareDocument(opportunityText, { text, url, desciption, eligibility })]

        try {
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("user_id, major, career_interests, classification, location_preferences")

            if (error) throw error;

            profiles.forEach(async (profile) => {
                const queryTokens = changeToText(profile);
                
                //get BM25 score
                const [scored] = computeBM25(queryTokens, documents)
                const hasMatch = scored.score > 0.2;

                //match met, add to batch
                if (hasMatch) {
                    if (!matchMap.has(profile.user_id)) {
                        matchMap.set(profile.user_id, [])
                    }

                    matchMap.get(profile.user_id).push({ title, link: url})
                } 
            })
            //after looping through all profiles, send one email + emit per match group
            for (const profile of profiles) {
                const matched = matchMap.get(profile.user_id) || []
                profile._matchedItems = matched
                const matchedItems = profile._matchedItems;
                if (!matchedItems || matchedItems.length === 0) continue;

                const email = (
                    await supabase
                        .from("profiles")
                        .select("email")
                        .eq("user_id", profile.user_id)
                        .maybeSingle()
                ).data?.email;

                const htmlBody = matchedItems
                    .map((item) => `<p><a href="${item.link}">${item.title}</a></p>`)
                    .join("")

                await sendEmail({
                    to: email,
                    subject: "You have new scholarship matches!",
                    html:`
                    <p>We've found ${matchedItems.length} new scholarship(s) that match your profile:</p>
                    ${htmlBody}
                    `
                });

                //send a push notif
                emitToUser(profile.user_id, "new_notification", {
                    message: `${matchedItems.length} new scholarship(s) match your profile.`,
                    url: "http://localhost:5173/internshippage"
                });

                //save to notification table
                try {
                    await notificationService.create({
                        user_id: profile.user_id,
                        type:"scholarship",
                        title: "New scholarship matches!",
                        message: `
                                    <p>We've found ${matchedItems.length} new scholarship(s) that match your profile:</p>
                                    ${htmlBody}
                                `,
                        url: "http://localhost:5173/scholarshippage"
                    })
                    } catch (err) {
                        console.error("Error saving new scholarship notification", err)
                    }
            }
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
                            ${type === "internship" ? `${joinField}(${dateField}, title)` : `${joinField}(${dateField}, title)`}
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

                        //get deadline
                        const deadlineDate = new Date(deadline);

                        //Normalize dates
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

                        if (sent) continue;

                        const urgency = 1 / (days + 1)

                        if (days <= 7) {
                        emitToUser(user_id, "new_notification", {
                            message: `${type === "internship" ? "Internship" : "Scholarship"} due ${
                                days === 0 ? "today!" : `in ${days} day(s)`
                            }: ${title}`,
                            url: "http://localhost:5173/saved"

                        
                        });

                        //save into all notification table
                        try {
                            await notificationService.create({
                                user_id: profile.user_id,
                                type:"deadline",
                                title: `Saved ${type}'s deadline approaching`,
                                message: `Some of your saved ${type}'s deadline is approaching. Get to it `,
                                url: link
                            })
                        } catch (err) {
                        console.error("Error saving deadline notification", err)
                        }

                        // Insert record to prevent duplicate
                        await supabase.from("sent_deadline_notifications").insert([
                            {
                                user_id,
                                opportunity_id,
                                opportunity_type: type,
                                notification_type: label,
                            },
                        ]);
                    } else {
                        //store in digest batch
                        await supabase.from("digest_deadline_notifications").insert([
                            {
                                user_id,
                                opportunity_id,
                                opportunity_type: type,
                                title,
                                deadline,
                                urgency_score: urgency
                            }
                        ])
                    }
                }
            } catch (err) {
                console.error(`Failed to process ${type} for ${label}:`, err)
            }
            }
        };

        try {
            await checkAndNotify({
                table: "saved_internships",
                joinField: "internship_id",
                dateField: "date_validthrough",
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
    });

    //digest sending route
    router.post("/send-digest", async (req, res) => {
        try {
            const { data: digestData, error } = await supabase
                .from("digest_deadline_notifications")
                .select("user_id, opportunity_id, opportunity_type, title, deadline")
                .order("deadline", { ascending: true });
            
                if (error) throw error;

                const grouped = {};
                for (const row of digestData) {
                    if (!grouped[row.user_id]) grouped[row.user_id] = [];
                    grouped[row.user_id].push(row);
                }

                for (const [user_id, items] of Object.entries(grouped)) {
                    const { data: emailData, error: emailError } = await supabase
                        .from("profiles")
                        .select("email")
                        .eq("user_id", user_id)
                        .maybeSingle();
                    if (emailError || !emailData?.email) continue;

                    const html = `
                        <h3>Upcoming Deadlines</h3>
                        <ul>
                            ${items.map(
                                (item) => `<li><strong>${item.opportunity_type}</strong>: ${item.title} - due by ${item.deadlines}</li>`
                            )
                            .join("")}
                        </ul>
                        <p>Check all saved opportunities <a href="http://localhost:5173/saved">here</a>.</p>
                    `;

                    await sendEmail({
                        to: emailData.email,
                        subject: "Upcoming Deadline Digest",
                        html: html
                    });
                }

                //clear digest table after sending
                await supabase.from("digest_deadline_notifications").delete().neq("id", "")

                res.status(200).json({ success: true });
        } catch (err) {
            console.error("/send-digest failed", err);
            res.status(500).json({ error: "Digest sending failed" });
        }
    });

    router.post("/check-inactive-users", async (req, res) => {

        const checkInactiveUsers = async () => {
            const now = new Date();
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);

            const { data, error } = await supabase.auth.admin.listUsers();

            if (error) {
                console.error("Error fetching users:", error);
                return;
            }

            const users = data?.users ?? [];

            for (const user of users) {
                const { id: user_id, email, last_sign_in_at } = user;

                if (!last_sign_in_at) continue;

                const lastSignIn = new Date(last_sign_in_at);
                if (lastSignIn > sevenDaysAgo) continue; //user logged in recently

                //check if inactive email was already send
                const { data: alreadySent, error: checkError } = await supabase
                    .from("sent_email_notifications")
                    .select("id")
                    .eq("user_id", user_id)
                    .eq("notification_type", "inactive_reminder")
                    .gte("date_sent", sevenDaysAgo.toISOString())
                    .maybeSingle()

                if (checkError) {
                    console.error("Check email send error:", checkError);
                    continue;
                }

                if (alreadySent) continue;

                //send the email
                await sendEmail({
                    to: email,
                    subject: "We miss you at UpliftED!",
                    html: `
                        <p>Hey there!</p>
                        <p>We've haven't seen you in a while. We have new opportunities added. Come back and apply before deadlines pass!</p>
                        `
                });

                //log the email so it isn't resent
                await supabase.from("sent_email_notifications").insert([
                    {
                        user_id,
                        notification_type: "inactive_reminder",
                        date_sent: Date(now)
                    }
                ]);

                console.log(`Inactive reminder email send to ${email}`);
            }
        }

        try {
            await checkInactiveUsers();
            res.status(200).json({ success: true });
        } catch (err) {
            console.error("Inactive user check failed:", err);
            res.status(500).json({ error: "Inactive check failed" })
        }
    })

    //add email notif for unread notifs
    router.post("/check-unread", async (req, res) => {
        const sendReminderForUnreadNotifs = async () => {
            const oneWeekAgo = new Date()
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            //get all unread notifs older than 7 days
            const { data: unreadNotifs, error } = await supabase
                .from("notifications")
                .select("id, user_id, title, created_at")
                .eq("status", "unread")
                .lt("created_at", oneWeekAgo.toISOString())

            if (error) {
                console.error("Error fetching old unread notifications:", error.message)
                return
            }

            //group by user
            const userMap = new Map();
            unreadNotifs.forEach((notif) => {
                if (!userMap.has(notif.user_id)) {
                    userMap.set(notif.user_id, []);
                }
                userMap.get(notif.user_id).push(notif)
            })

            //for each user send email
            for (const [user_id, notifs] of userMap.entries()) {
                const { data: email, error } = await supabase
                    .from("profiles")
                    .select("email")
                    .eq("user_id", user_id)
                    .maybeSingle()
                
                if (error) {
                    console.error(`Error fetching email for ${user_id}:`, error.message)
                }
                const { data: prefs, error: prefError } = await supabase
                    .from("user_preferences")
                    .select("email_notifications")
                    .eq("user_id", user_id)
                    .maybeSingle()
                
                if (prefError) {
                    console.error(`Preference fetch failed for ${user_id}:`, prefError)
                }

                if (prefs?.email_notifications) {
                    try {
                        await sendEmail({
                            to: email,
                            subject: "You have unread notifications!",
                            text: `You have ${notifs.length} unread notifications. Log back in to check them out!`
                        });

                        console.log(`Email sent to user ${user_id} for unread notifs`)
                    } catch (emailErr) {
                        console.error(`Failed to send email to ${user_id}:`, emailErr)
                    }
                }
            }

        }
        //call function
        try {
            await sendReminderForUnreadNotifs();
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ error: "Failed to process unread check" })
        }
    })
    //add notif if opp hasnt been marked as complete
    return router
}
module.exports = createNotificationTriggerRoutes;