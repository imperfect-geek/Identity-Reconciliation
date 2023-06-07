const knex = require("knex")
const validator = require("validator")

identify = (req, res, next) => {
    const { email, phoneNumber } = req.body
    const emailCheck = validator.isEmail(email)
    const phoneNumberCheck = validator.isInt(phoneNumber, { gt: 99999, lt: 10000000000 })

    if (emailCheck || phoneNumberCheck) {

    }
    else {
        throw new Error("")
    }

}