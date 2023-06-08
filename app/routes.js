const express = require("express");
const app = express();
const router = new express.Router();
app.use(router);

router.get("/", (req, res) => {
    res.send("<H1>Welcome to Solution</H1>")
})


const identify = require("./controllers/identify.controller")
router.post("/identify", identify, (req, res) => {
    console.log("User has been Identified!")
})

module.exports = router