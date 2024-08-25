const dotenv = require('dotenv');
dotenv.config({path:'./Config/config.env'});
const mysql = require('mysql');
const conn = mysql.createConnection({
    host : process.env.HOST,
    user : process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE,
})
module.exports = conn;