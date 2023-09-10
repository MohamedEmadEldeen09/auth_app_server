
const {createPool} = require('mysql2');
require('dotenv').config();
const db = createPool({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    connectionLimit:10,
    database:process.env.DATABASE_NAME
})

db.getConnection(()=>{
    console.log("connected to the database successfully");
})

module.exports = db.promise()