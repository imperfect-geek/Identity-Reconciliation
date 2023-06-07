const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const helmet = require("helmet")
const routes = require("./app/routes")
require("dotenv").config()

app = express()

app.use(cors())
app.use(helmet())
app.use(morgan('dev'));
app.use(express.json())
app.use(routes)


app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}!`))