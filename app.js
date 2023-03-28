const express = require("express");
// const mysql = require("mysql");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const sharp = require("sharp");
const fs = require("fs");

/* --------- Connection to database --------- */
const { connection } = require("./database-config");

/* --------- Passport --------- */
const initializePassport = require("./passport-config");
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

const PORT = 8000;

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
    saveUninitialized: false
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

/* --------- Validation configuration --------- */
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const validationObject = [
    check("username").trim().escape(),
    check("email").trim().isEmail().escape(),
    check("password").trim().escape()
];

/* --------- Register an user --------- */
app.get("/register", (req, res) => {
    var title = (req.query.title !== undefined) ? req.query.title : "Create an account";
    var error_message = (req.query.error_message !== undefined) ? req.query.serror_message: "";

    // register webpage
    res.render("register", {
        title: title,
        error_message: error_message
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
                var success_message = encodeURIComponent("User created successfully! Please log in.");
                res.redirect("login?success_message=" + success_message);
            }
        }
    );
});

/* --------- Log in --------- */
app.get("/login", (req, res) => {
    var title = (req.query.title !== undefined) ? req.query.title : "Log in";
    var success_message = (req.query.success_message !== undefined) ? req.query.success_message: "";

    // login webpage
    res.render("login", {
        title: title,
        success_message: success_message
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
    var title = (req.query.title !== undefined) ? req.query.title : "Upload a photo";

    // upload photo webpage
    res.render("upload", {
        title: title
    });
});

app.post("/upload", async (req, res) => {
    // upload photo routine
    const photo = req.files.photo;

    if (acceptedTypes.indexOf(photo.mimetype) > -1) {
        const imageDestinationPath = __dirname + "/static/imgs/" + photo.name;
        const resizedImagePath = __dirname + "/static/imgs/resized/" + photo.name;

        console.log(photo);

        // move photo to server
        await photo.mv(imageDestinationPath);
        await sharp(imageDestinationPath).resize(750).toFile(resizedImagePath);
        fs.unlink(imageDestinationPath, function (err) {
            if (err) throw err;
            console.log(imageDestinationPath + " deleted");
        });

        // TODO: include user_id from session data (maybe move it into the then block)
        const query = "INSERT INTO photos (caption, alt_text, photo_path) VALUES (?, ?, ?)";
        connection.query(
            query,
            [req.body.caption, req.body.alt_text, "/imgs/resized/" + photo.name],
            (error, result) => {
                console.log("Query results: " + result);
                if (error) {
                    console.log("Error inserting photo in database: " + error);
                }
                else {
                    console.log(result);
                    console.log("Photo uploaded");
                }
            }
        );

        res.render("photo", {
            title: "Photo",
            image: "/imgs/resized/" + photo.name,
            image_name: photo.name,
            caption: req.body.caption
        });
    }

    else {
        res.render("upload", {
            title: "Upload a photo",
            messages: { error: "Please choose an image in the supported formats." },
        });
    }
});

function fileTooBig(_req, res, _next) {
    res.render("upload", {
        title: "Upload a photo",
        messages: { error: "Filesize too large." },
    });
}

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
    res.render("index", {
        title: "Idmagram"
    });

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
