const cron = require("node-cron");
const axios = require("axios");

function initializeCronJobs() {
    //run once every day at 11am
    cron.schedule("0 11 * * * ", async () => {
        try { 
            console.log("Running daily deadline check");

            const response =  await axios.post("http://localhost:4000/check-deadlines", null, {
                headers: {
                    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                }
            });

            console.log("Deadline check response:", response.data);
        } catch (err) {
            console.error("Cron job failed:", err.message);
        }
    })

    cron.schedule(" * 10 * * *", async () => {
        console.log("Running daily inactive user emaill check")

        try {
            const response = await axios.post("http://localhost:4000/check-inactive-users");
            console.log("Inactive user check response:", response.data)
        } catch (error) {
            console.error("Inactive user check failed", error.response?.data || error.message)
        }
    })
}

module.exports = initializeCronJobs