const express = require("express");
const mysql = require("mysql");
// const session = require("express-session");
// const path = require("path");

const PORT = 8000;

// Create connection
const connection = mysql.createConnection({
    host: "mysql.scss.tcd.ie", // macneill.scss.tcd.ie?
    // database: "garcag_2223_db",
    user: "garcag",
    password: "ahFai3yu"
});

connection.connect(function(err) {
    if (err) {
        console.log("Error connecting to database: " + err);
    }
    else {
        console.log("Connected to database");
    }
});

const app = express();

app.get("/", (req, res) => {
    // home page
});

app.get("/users/:id", (req, res) => {
    // user's page
});

app.get("/photos/:id", (req, res) => {
    // photo's webpage
});

app.get("/register", (req, res) => {
    // register webpage
});

app.get("/login", (_req, res) => {
    // login webpage
    res.render("pages/login", {
        title: "Log in",
        message: ""
    });
});

app.post("/login", (req, res) => {
    // log in routine
});

app.get("/logout", (req, res) => {
    // logout webpage
});

app.get("/upload", (req, res) => {
    // upload photo webpage
});

app.post("/upload", (req, res) => {
    // upload photo routine
});

app.listen(PORT, () => {
    console.log("App running in http://localhost:" + PORT);
});