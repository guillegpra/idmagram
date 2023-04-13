const mysql = require("mysql");

/* --------- Connection to database --------- */
const connection = mysql.createConnection({
    host: "localhost",
    database: "image_sharing_app",
    user: "root",
    password: "root"
});

connection.connect(function(err) {
    if (err) {
        console.log("Error connecting to database: " + err);
    }
    else {
        console.log("Connected to database");
    }
}); 

module.exports = { connection };
