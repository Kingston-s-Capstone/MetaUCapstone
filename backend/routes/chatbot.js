const express = require("express")
const router = express.Router();
const requireAuth = require("../middleware/requireAuth")

router.post("/", requireAuth)

module.exports = router;