require('dotenv').config();
const mdb_connection = {
    host : process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user : process.env.DATABASE_USERNAME,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE_DATABASE
};

module.exports = require('knex')({
    client: 'mysql',
    connection: mdb_connection,
});