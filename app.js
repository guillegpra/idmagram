const express = require("express");
const mysql = require("mysql");
// const session = require("express-session");
// const path = require("path");

const PORT = 8000;

// Create connection
const connection = mysql.createConnection({
    host: "localhost",
    database: "image_sharing_app",
    user: "root",
    password: "your_new_password"
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

const app = express();

app.set("view engine", "ejs");
// app.set("views", "pages");

/* ------- Register an user ------- */
app.get("/register", (req, res) => {
    // register webpage
});

app.post("/register", (req, res) => {
    // register the new user and redirect them to the log-in page
});

/* ------- Log in ------- */
app.get("/login", (_req, res) => {
    // login webpage
    res.render("login", {
        title: "Log in"
    });
});

app.post("/login", (req, res) => {
    // log in routine
    // check user and pwd in database and if correct, go to main page
    // if not correct, display message and let them try again
});

/* ------- Log out ------- */
app.get("/logout", (req, res) => {
    // logout webpage
});

/* ------- Upload ------- */
app.get("/upload", (req, res) => {
    // upload photo webpage
});

app.post("/upload", (req, res) => {
    // upload photo routine
});

// maybe routines for commenting/liking??
app.post("/comment", (req, res) => {
    // comment routine
});

app.post("/like", (req, res) => {
    // like routine
});

/* ------- Views ------- */
app.get("/", (req, res) => {
    // home page

    // it will allow you to browse the images
    // loop through the photos in the database (we loop on the 
    // EJS template)
});

app.get("/users/:id", (req, res) => {
    // user's page
});

app.get("/photos/:id", (req, res) => {
    // photo's webpage
    // let all users see the photo, the user who posted it, the date
    // it was posted, its comments and the number of likes
    
    // allow logged-in users to comment and like 
    // only let them like if they haven't liked yet

    // who posted it
    // SELECT username FROM users JOIN photos ON photos.user_id = users.id AND photos.id = whatever;
    
    // the date it was posted
    // SELECT date_upload FROM photos WHERE id = whatever;

    // the number of likes
    // SELECT COUNT(id) AS number_likes FROM likes WHERE photo_id = whatever;

    // the number of comments
    // SELECT COUNT(id) AS number_comments FROM comments WHERE photo_id = whatever;
});

app.listen(PORT, () => {
    console.log("App running in http://localhost:" + PORT);
});
