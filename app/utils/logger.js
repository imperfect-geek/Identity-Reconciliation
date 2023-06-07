const winston = require("winston")
const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ level: "error" ,filename: '../logs/error.log' }),
        new winston.transports.Console({ level: "error" })
    ]
});

module.exports = logger