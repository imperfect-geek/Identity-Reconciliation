const { HOST, DB_PORT, USER, PWD, DB } = process.env

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: HOST,
        port: DB_PORT,
        user: USER,
        password: PWD,
        database: DB
    }
});

module.exports = knex