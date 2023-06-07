require("dotenv").config()
const { DB_HOST, DB_PORT, DB_USER, DB_PWD, DB } = process.env

const knex = require('knex')({
    client: 'mysql2',
    pool: { min: 2, max: 10 },
    connection: {
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PWD,
        database: DB
    },
    migrations: {
        directory: '../models'
    }
});

console.log("Succesfully connected to Database!")

module.exports = knex