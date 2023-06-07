const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
require("dotenv").config()

app = express()

app.use(helmet())
app.use(morgan('dev'));
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Welcome to Solution")
})

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}!`))