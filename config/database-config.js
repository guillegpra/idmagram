const mysql = require("mysql");

/* --------- Connection to database --------- */
const connection = mysql.createConnection({
    host: "localhost",
    database: "image_sharing_app",
    user: "root",
    password: "root"
});

// const connection = mysql.createConnection({
//     host: "mysql.scss.tcd.ie",
//     database: "garcag_2223_db",
//     user: "garcag",
//     password: "ahFai3yu"
// });

connection.connect(function(err) {
    if (err) {
        console.log("Error connecting to database: " + err);
    }
    else {
        console.log("Connected to database");
    }
}); 

module.exports = { connection };
