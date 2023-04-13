const express = require("express");
const router = require("./routes/routes");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const fileUpload = require("express-fileupload");

/* --------- Connection to database --------- */
const { connection } = require("./config/database-config");

const PORT = 8000;

/* --------- Passport --------- */
const initializePassport = require("./config/passport-config");

initializePassport(passport);

/* --------- Express --------- */
const app = express();

app.set("view engine", "ejs");

app.use(express.static('static')); // for static content

app.use(flash());

// session
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
}));

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
