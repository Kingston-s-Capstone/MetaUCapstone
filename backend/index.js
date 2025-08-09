const express = require("express")
const http = require("http")
const cors = require('cors');
const profileRoutes = require('./routes/profiles');
const internshipsRoutes = require('./routes/internships');
const recommendationRoutes = require('./routes/recommendation')
const scholarshipRoutes = require('./routes/scholarships')
const notificationRoutes = require("./routes/notifications")
const createNotificationTriggerRoutes = require("./routes/notificationTrigger")
const initializeSocket = require("./socketServer")
const initializeCronJobs = require("./cronJobs")
const chatbotRoute = require("./routes/chatbot");

const app = express()
const server = http.createServer(app);
const { io, emitToUser } = initializeSocket(server)
const PORT = process.env.PORT || 4000
app.set("emitToUser", emitToUser)
app.use(express.json())
app.use(cors({
    origin: "https://uplifted-j4977q20v-kingkd22s-projects.vercel.app",
    credentials: true
}))
const notificationTriggersRoutes = createNotificationTriggerRoutes(emitToUser)

app.use("/api/profiles", profileRoutes)
app.use("/api/internships", internshipsRoutes)
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/scholarships', scholarshipRoutes)
app.use("/api/notifications", notificationRoutes)
app.use(notificationTriggersRoutes)
app.use("/api/chatbot", chatbotRoute)


app.get('/', (req, res)=> {
    res.send('UpliftED API is running')
})
app.get('/healthz', (req,res)=>res.send('ok'));


initializeCronJobs()
server.listen(PORT, () => {
    console.log(`Server is running on`, PORT)
})