const express = require("express")

app = express()

app.get("/", (req, res) => {
    res.send("Welcome to Solution")
})

app.listen(3000, () => "Server running on port 3000!")