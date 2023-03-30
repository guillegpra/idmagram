const express = require("express");
// const mysql = require("mysql");
const router = require("./routes/routes");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const sessionStore = require("./config/sessionstore")(session);

/* --------- Connection to database --------- */
const { connection } = require("./config/database-config");

const PORT = 8000;

/* --------- Passport --------- */
const initializePassport = require("./config/passport-config");
//const { urlencoded } = require("body-parser");

initializePassport(
    passport,
    // username => {
    //     console.log("getUserByUsername");
    //     console.log("username: " + username);
    //     const query = 'SELECT * FROM users WHERE username = ?';
    //     return connection.query(query, [username], (err, result) => {
    //         if (err != null) {
    //             console.log("Error performing query: " + err);
    //             return null;
    //         }
    //         console.log("Query result: " + JSON.stringify(result[0]));
    //         console.log("sending user with pwd " + result[0].pwd);
    //         return result[0];
    //     });
    // },
    id => {
        console.log("id: " + id);
        const query = 'SELECT * FROM users WHERE id = "' + id + '";';
        return connection.query(query, (err, result) => {
            if (err != null) {
                console.log("Error performing query: " + err);
                return;
            }

            console.log("Query result: " + JSON.stringify(result[0]));
            return result[0];
        });
    }
);

/* --------- Express --------- */
const app = express();

app.set("view engine", "ejs");
// app.set("views", "pages");

app.use(express.static('static')); // for static content

app.use(flash());

// session
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

sessionStore.onReady().then(() => {
    console.log("MySQLStore ready");
}).catch(error => {
    console.error(error);
});

// passport
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true })); // solution for missing credentials error in login 

// file upload
app.use(
    fileUpload({
        limits: {
            fileSize: 2000000, // Around 2MB
        },
        abortOnLimit: true,
        limitHandler: fileTooBig,
    })
);
const acceptedTypes = ["image/gif", "image/jpeg", "image/png"];

function fileTooBig(_req, res, _next) {
    res.render("upload", {
        title: "Upload a photo",
        messages: { error: "Filesize too large." },
    });
}

/* --------- Routes configuration --------- */
router(app, passport, acceptedTypes);

app.listen(PORT, () => {
    console.log("App running in http://localhost:" + PORT);
});
