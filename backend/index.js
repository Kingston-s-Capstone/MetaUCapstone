const express = require("express")
const cors = require('cors');
const profileRoutes = require('./routes/profiles');
const internshipsRoutes = require('./routes/internships');
const recommendationRoutes = require('./routes/recommendation')
const scholarshipRoutes = require('./routes/scholarships')

const app = express()
const PORT = 4000

app.use(express.json())
app.use(cors())

app.use("/api/profiles", profileRoutes)
app.use("/api/internships", internshipsRoutes)
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/scholarships', scholarshipRoutes)


app.get('/', (req, res)=> {
    res.send('UpliftED API is running')
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})