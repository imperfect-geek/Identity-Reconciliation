const knex = require("../utils/connection")
const validator = require("validator")
const logger = require("../utils/logger")
const CreateContactsTable = require("../models/contacts.model")

const identify = async (req, res, next) => {
    //validations of request body
    const { email = "", phoneNumber = 0 } = req.body
    try {
        const emailCheck = validator.isEmail(email)
        const phoneNumberCheck = validator.isInt(phoneNumber.toString(), { gt: 99999, lt: 10000000000 })

        if (!(emailCheck || phoneNumberCheck))
            throw new Error("Invalid Input!")
        //initializing new record and final result
        const newContact = { "linkedId": null, "linkPrecedence": "primary", "email": null, "phoneNumber": null }
        const output = {
            "primaryContactId": null,
            "emails": new Set(),
            "phoneNumbers": new Set(),
            "secondaryContactIds": []
        }
        if (emailCheck) newContact["email"] = email
        if (phoneNumberCheck) newContact["phoneNumber"] = phoneNumber

        //checking for existence of table
        const tableCheck = await knex.schema.hasTable("Contacts")
        if (!tableCheck) {
            await knex.raw(CreateContactsTable)
        }
        let matches = null;

        if (emailCheck && phoneNumberCheck) {
            matches = await knex('Contacts')
                .select('id', 'email', 'phoneNumber', 'linkedId')
                .where(function () {
                    this.where('email', email).orWhere('phoneNumber', phoneNumber);
                })
                .orderBy('createdAt', 'asc')
        } else if (emailCheck) {
            //matches the oldest record with given email
            const currentOldestMatch = await knex('Contacts')
                .select('id', 'email', 'phoneNumber', 'linkedId')
                .where(function () {
                    this.where('email', email);
                })
                .orderBy('createdAt', 'asc').first()
            let idToBeMatched = null;
            if (currentOldestMatch.linkedId == null) idToBeMatched = currentOldestMatch.id
            else idToBeMatched = currentOldestMatch.linkedId

            //finding all entries related to primary contact of the oldest record
            matches = await knex('Contacts')
                .select('id', 'email', 'phoneNumber', 'linkedId')
                .where(function () {
                    this.where('id', idToBeMatched).orWhere('linkedId', idToBeMatched);
                })
                .orderBy('createdAt', 'asc')

        } else if (phoneNumberCheck) {
            //matches the oldest record with given phoneNumber
            const currentOldestMatch = await knex('Contacts')
                .select('id', 'email', 'phoneNumber', 'linkedId')
                .where(function () {
                    this.where('phoneNumber', phoneNumber);
                })
                .orderBy('createdAt', 'asc').first()
            let idToBeMatched = null;
            if (currentOldestMatch.linkedId == null) idToBeMatched = currentOldestMatch.id
            else idToBeMatched = currentOldestMatch.linkedId

            //finding all entries related to primary contact of the oldest record
            matches = await knex('Contacts')
                .select('id', 'email', 'phoneNumber', 'linkedId')
                .where(function () {
                    this.where('id', idToBeMatched).orWhere('linkedId', idToBeMatched);
                })
                .orderBy('createdAt', 'asc')
        }
        /*
        There can be two cases:-
        1.) There are record/s matching either with phone number or email or both
        2.) The contact is entirely new
        */
        if (matches.length > 0) {
            //oldest record becomes the primary contact
            const primary = matches[0]

            //array of records in which linkedId doesn't match with primary contact's id
            const idsToUpdate = []
            newContact["linkedId"] = primary.id
            newContact["linkPrecedence"] = "secondary"
            output["primaryContactId"] = primary.id

            //flags to check whether the given email/phoneNumber is a new info
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
                    output["phoneNumbers"].add(contact["phoneNumber"].toString())
                }
            }

            //handling "Can primary contacts turn into secondary?" situation
            await knex('Contacts')
                .whereIn('id', idsToUpdate)
                .update({
                    linkedId: primary.id,
                    linkPrecedence: 'secondary',
                })


            //deciding whether to insert record or not
            if (emailCheck && phoneNumberCheck && !(emailFlag && phoneNumberFlag)) {
                const [newId] = await knex('Contacts')
                    .insert(newContact)
                output["secondaryContactIds"].push(newId)
            }
            else if (emailCheck && !emailFlag) {
                const [newId] = await knex('Contacts')
                    .insert(newContact)
                output["secondaryContactIds"].push(newId)
            }
            else if (phoneNumberCheck && !phoneNumberFlag) {
                const [newId] = await knex('Contacts')
                    .insert(newContact)
                output["secondaryContactIds"].push(newId)
            }
        }
        else {
            const [newId] = await knex('Contacts')
                .insert(newContact)
            output["primaryContactId"] = newId

        }
        if (emailCheck) output["emails"].add(email)
        if (phoneNumberCheck) output["phoneNumbers"].add(phoneNumber.toString())

        //converting set() to array before converting it to json
        output["emails"] = [...output["emails"]]
        output["phoneNumbers"] = [...output["phoneNumbers"]]
        res.status(200).json({
            "contact": output
        })
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