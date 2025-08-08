const cron = require("node-cron");
const axios = require("axios");

function initializeCronJobs() {
    //run once every day at 11am
    cron.schedule("0 11 * * * ", async () => {
        try { 
            console.log("Running daily deadline check");

            const response =  await axios.post(`${process.env.BACKEND_URL}/check-deadlines`, null, {
                headers: {
                    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                }
            });

            console.log("Deadline check response:", response.data);
        } catch (err) {
            console.error("Cron job failed:", err.message);
        }
    })

    //run once every day at 10am
    cron.schedule(" 0 10 * * *", async () => {
        console.log("Running daily inactive user emaill check")

        try {
            const response = await axios.post(`${process.env.BACKEND_URL}/check-inactive-users`);
            console.log("Inactive user check response:", response.data)
        } catch (error) {
            console.error("Inactive user check failed", error.response?.data || error.message)
        }
    })

    cron.schedule("0 11 * * * ", async () => {
        console.log("Running unread notifs check");
        try {
            const response = axios.post(`${process.env.BACKEND_URL}/check-unread`)
            console.log("Unread notifs check response:", response.data)
        } catch (error) {
            console.error("Unread notifs check error:", error.message)
        }
    })

    //daily digest cron job
    cron.schedule("0 12 * * *", async () => {
        console.log("Running daily digest cron at 12pm")

        try{
            const response = await axios.post(`${process.env.BACKEND_URL}/send-digest`)
            console.log("Digest sent:", response.data);
        } catch (error) {
            console.error("Error sending digest:", error.message)
        }
    })
}

module.exports = initializeCronJobs