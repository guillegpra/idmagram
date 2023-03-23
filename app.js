const express = require("express");
// const mysql = require("mysql");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

/* --------- Connection to database --------- */
const { connection } = require("./database-config");

/* --------- Passport --------- */
const initializePassport = require("./passport-config");
const { urlencoded } = require("body-parser");
initializePassport(
    passport, 
    username =>  {
        console.log("getUserByUsername");
        console.log("username: " + username);
        const query = 'SELECT * FROM users WHERE username = ?';
        return connection.query(query, [username], (err, result) => {
            if (err != null) {
                console.log("Error performing query: " + err);
                return null;
            }
            console.log("Query result: " + JSON.stringify(result[0]));
            console.log("sending user with pwd " + result[0].pwd);
            return result[0];
        });
    }, 
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

const PORT = 8000;

/* --------- Express --------- */
const app = express();

app.set("view engine", "ejs");
// app.set("views", "pages");

app.use(express.static('static')); // for static content
app.use(flash());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true })); // solution for missing credentials

/* --------- Validation configuration --------- */
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const validationObject = [
    check("username").trim().escape(),
    check("email").trim().isEmail().escape(),
    check("password").trim().escape()
];

/* --------- Register an user --------- */
app.get("/register", (req, res) => {
    // register webpage
    res.render("register", {
        title: "Create an account",
        error_message: ""
    });
});

app.post("/register", urlencodedParser, validationObject, async (req, res) => {
    console.log(req.body);

    // Validate content received
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        console.log("Errors detected in form");
        return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10); // encrypt password

    // Perfom query
    const query = "INSERT INTO users (username, email, pwd, full_name) VALUES (?, ?, ?, ?)";
    connection.query(
        query,
        [req.body.username, req.body.email, hashedPassword, req.body.full_name],
        (err, result) => {
            console.log("Query results: " + result);
            if (err) {
                console.log("Error performing query: " + err);
                // Inform user and let them try again
                res.render("register", {
                    title: "Create an account",
                    error_message: "&#9432; Either the username or email already exists in our database. Use another one."
                });
            }
            else {
                console.log(result);
                console.log("User created");
                // Inform user and take them to log in page
                res.render("login", {
                    title: "Log in",
                    success_message: "User created successfully! Please log in."
                });
            }
        }
    );
});

/* --------- Log in --------- */
app.get("/login", (_req, res) => {
    // login webpage
    res.render("login", {
        title: "Log in",
        success_message: ""
    });
});

app.post("/login", passport.authenticate('local', {
    successRedirect: "/", // go to main page
    failureRedirect: "/login", // let them try again
    failureFlash: true
}));

/* --------- Log out --------- */
app.get("/logout", (req, res) => {
    // logout webpage
});

/* --------- Upload --------- */
app.get("/upload", (req, res) => {
    // upload photo webpage
    res.render("upload", {
        title: "Upload a photo"
    });
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

/* --------- Views --------- */
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

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    
    res.render("login", {
        title: "Log in",
        success_message: ""
    });
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    
    next();
}

app.listen(PORT, () => {
    console.log("App running in http://localhost:" + PORT);
});
