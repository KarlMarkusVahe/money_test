const mysql = require("mysql");

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "parool",
    database: "money_test2"
})

module.exports = db