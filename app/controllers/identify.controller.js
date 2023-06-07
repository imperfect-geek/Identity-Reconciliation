const knex = require("../utils/connection")
const validator = require("validator")
const logger = require("../utils/logger")
const CreateContactsTable = require("../models/contacts.model")

const identify = async (req, res, next) => {
    //validations of request body
    const { email = "", phoneNumber = 0 } = req.body
    const emailCheck = validator.isEmail(email)
    const phoneNumberCheck = validator.isInt(phoneNumber, { gt: 99999, lt: 10000000000 })

    try {
        if (emailCheck || phoneNumberCheck) {
            //initializing new record and final result
            const newContact = { "linkedId": null, "linkPrecedence": "primary", "email": null, "phoneNumber": null }
            const output = {
                "primaryContactId": null,
                "emails": new Set(),
                "phoneNumbers": new Set(),
                "secondaryContactIds": []
            }
            if (email.length > 0 && emailCheck) newContact["email"] = email
            if (phoneNumber > 0 && phoneNumberCheck) newContact["phoneNumber"] = parseInt(phoneNumber)

            //checking for existence of table
            const tableCheck = await knex.schema.hasTable("Contacts")
            if (!tableCheck) {
                await knex.raw(CreateContactsTable)
            }

            let matches = await knex('Contacts')
                .select('id', 'email', 'phoneNumber', 'linkedId')
                .where(function () {
                    this.where('email', email).orWhere('phoneNumber', phoneNumber);
                })
                .orderBy('createdAt', 'asc')
            /*
            There can be three cases:-
            1.) There are more than records matching either with phone number or email
            2.) There is only one matching record with phone number or email
            3.) The contact is entirely new
            */
            if (matches.length > 1) {
                const primary = matches[0] //oldest record becomes the primary contact
                newContact["linkedId"] = primary.id
                newContact["linkPrecedence"] = "secondary"
                const idsToUpdate = []
                output["primaryContactId"] = primary.id
                let emailFlag = false, phoneNumberFlag = false
                for (let contact of matches) {

                    if (contact.id != primary.id) {
                        output["secondaryContactIds"].push(contact["id"])
                        if (contact.linkedId != primary.id)
                            idsToUpdate.push(contact.id)
                    }

                    if (contact["email"]) {
                        if (contact["email"] === email) emailFlag = true
                        output["emails"].add(contact["email"])
                    }

                    if (contact["phoneNumber"]) {
                        if (contact["phoneNumber"] == phoneNumber) phoneNumberFlag = true
                        output["phoneNumbers"].add(contact["phoneNumber"])
                    }
                }

                await knex('Contacts')
                    .whereIn('id', idsToUpdate)
                    .update({
                        linkedId: primary.id,
                        linkPrecedence: 'secondary',
                    })
                if (!(emailFlag && phoneNumberFlag)) {
                    const [newId] = await knex('Contacts')
                        .insert(newContact)
                    output["secondaryContactIds"].push(newId)
                }
            } else if (matches.length == 1) {
                const primary = matches[0]
                newContact["linkedId"] = primary.id
                newContact["linkPrecedence"] = "secondary"
                const [newId] = await knex('Contacts')
                    .insert(newContact)
                output["secondaryContactIds"].push(newId)
                output["primaryContactId"] = primary.id

                if (primary["email"])
                    output["emails"].add(primary["email"])
                if (primary["phoneNumber"])
                    output["phoneNumbers"].add(primary["phoneNumber"])

            } else {
                const [newId] = await knex('Contacts')
                    .insert(newContact)
                output["primaryContactId"] = newId

            }
            if (email.length > 0) output["emails"].add(email)
            if (parseInt(phoneNumber) > 0) output["phoneNumbers"].add(phoneNumber)

            //converting set() to array before converting it to json
            output["emails"] = [...output["emails"]]
            output["phoneNumbers"] = [...output["phoneNumbers"]]
            res.status(200).json({
                "contact": output
            })
        }
        else {
            throw new Error("Invalid Input!")
        }
    } catch (error) {
        logger.error(error.message)
        res.status(400).json({
            "error": error.message
        })
    } finally {
        next()
    }
}

module.exports = identify