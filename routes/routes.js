// const express = require("express");
// const router = express.Router();
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const fs = require("fs");

/* --------- Connection to database --------- */
const { connection } = require("../config/database-config");

/* --------- Validation configuration --------- */
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const validationObject = [
    check("username").trim().escape(),
    check("email").trim().isEmail().escape(),
    check("password").trim().escape()
];

// Auxiliary
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

function getNumberLikes(photo) {
    return new Promise(function(resolve, reject) {
        const q = "SELECT COUNT(id) AS number_likes FROM likes WHERE photo_id = " + photo.id;
        connection.query(q, (error, response) => {
            if (error !== null) {
                console.log("Error performing query: " + error);
                reject(error);
            }
            else {
                console.log("number " + response[0].number_likes)
                resolve(response[0].number_likes);
            }
        });
    });
}

function getComments(photo, callback) {
    const q = `SELECT comments.content, users.username 
                FROM comments, users 
                WHERE comments.user_id = users.id 
                AND comments.photo_id = ` + photo.id;
    connection.query(q, (err, response) => {
        if (err !== null) {
            console.log("Error performing query: " + err);
            return;
        }
        else {
            callback(response);
        }
    });
}

// Routes
module.exports = function(app, passport, acceptedTypes) {
    /* --------- Register an user --------- */
    app.get("/register", checkNotAuthenticated, (req, res) => {
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
    app.get("/login", checkNotAuthenticated, (req, res) => {
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
    app.post("/logout", checkAuthenticated, (req, res) => {
        // logout webpage
        req.logout(err => {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Logged out correctly");
            res.render("login", {
                title: "Log in",
                success_message: ""
            });
        });
    });

    /* --------- Upload --------- */
    app.get("/upload", checkAuthenticated, (req, res) => {
        var title = (req.query.title !== undefined) ? req.query.title : "Upload a photo";

        // upload photo webpage
        res.render("upload", {
            title: title,
            username: req.user.username
        });
    });

    app.post("/upload", async (req, res) => {
        // upload photo routine
        const photo = req.files.photo;

        if (acceptedTypes.indexOf(photo.mimetype) > -1) {
            const imageDestinationPath = "static/imgs/" + photo.name;
            const resizedImagePath = "static/imgs/resized/" + photo.name;

            console.log(photo);

            // move photo to server
            await photo.mv(imageDestinationPath);
            await sharp(imageDestinationPath).resize(750).toFile(resizedImagePath);
            fs.unlink(imageDestinationPath, function (err) {
                if (err) throw err;
                console.log(imageDestinationPath + " deleted");
            });

            // store photo information in database
            const query = "INSERT INTO photos (caption, alt_text, user_id, photo_path) VALUES (?, ?, ?, ?)";
            connection.query(
                query,
                [req.body.caption, req.body.alt_text, req.user.id, "/imgs/resized/" + photo.name],
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
                caption: req.body.caption,
                username: req.user.username
            });
        }

        else {
            res.render("upload", {
                title: "Upload a photo",
                username: req.user.username,
                messages: { error: "Please choose an image in the supported formats." },
            });
        }
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
        const username = (req.isAuthenticated()) ? req.user.username : null;

        // obtain photos
        const query =
            `SELECT photos.id, photos.caption, photos.alt_text, users.username, photos.photo_path, photos.date_upload
            FROM photos, users
            WHERE photos.user_id = users.id
            ORDER BY photos.date_upload DESC`;
        connection.query(query, (err, photos) => {
            if (err !== null) {
                console.log("Error performing query: " + err);
                return;
            }
            else {
                let number_likes = [];
                let comments = [];
                
                // create array of promises for the number of likes of each photo
                const numberLikesPromises = photos.map(element => {
                    const q = "SELECT COUNT(id) AS number_likes FROM likes WHERE photo_id = " + element.id;
                    return new Promise((resolve, reject) => {
                        connection.query(q, (error, response) => {
                            if (error !== null) {
                                console.log("Error performing query: " + error);
                                reject(error);
                            }
                            else {
                                console.log("number" + response[0].number_likes)
                                resolve(response[0].number_likes);
                            }
                        });
                    });
                });

                // create array of promises for the comments of each photo
                const commentsPromises = photos.map(element => {
                    const q = `SELECT comments.content, users.username 
                                FROM comments, users 
                                WHERE comments.user_id = users.id 
                                AND comments.photo_id = ` + element.id;
                    return new Promise((resolve, reject) => {
                        connection.query(q, (error, response) => {
                            if (error !== null) {
                                console.log("Error performing query: " + error);
                                reject(error);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    });
                });

                // wait for numberLikesPromises to resolve
                Promise.all(numberLikesPromises)
                    .then(results => {
                        number_likes = results;
            
                        // wait for commentsPromises
                        return Promise.all(commentsPromises);
                    })
                    .then(results => {
                        comments = results;
                        console.log(number_likes);
                        console.log(JSON.stringify(comments));
                        res.render("index", {
                            title: "Idmagram",
                            username: username,
                            photos: photos,
                            number_likes: number_likes,
                            comments: comments
                        });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
        });
    });

    app.get("/users/:id", (req, res) => {
        // user's page (not needed)
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
}
