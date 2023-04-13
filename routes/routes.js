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

// Auxiliary passport functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.render("login", {
        title: "Log in",
        success_message: "",
        messages: { error: "Please log in to like or comment a photo." }
    });
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }

    next();
}

// Routes
module.exports = function (app, passport, acceptedTypes) {
    /* ------------------ Register an user ------------------ */
    app.get("/register", checkNotAuthenticated, (req, res) => {
        var title = (req.query.title !== undefined) ? req.query.title : "Create an account";
        var error_message = (req.query.error_message !== undefined) ? req.query.serror_message : "";

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
                if (err) {
                    console.log("Error performing query: " + err);

                    // Inform user and let them try again
                    res.render("register", {
                        title: "Create an account",
                        error_message: "&#9432; Either the username or email already exists in our database. Use another one."
                    });
                }
                else {
                    console.log("User created");

                    // Inform user and take them to log in page
                    var success_message = encodeURIComponent("User created successfully! Please log in.");
                    res.redirect("login?success_message=" + success_message);
                }
            }
        );
    });

    /* ------------------ Log in ------------------ */
    app.get("/login", checkNotAuthenticated, (req, res) => {
        var title = (req.query.title !== undefined) ? req.query.title : "Log in";
        var success_message = (req.query.success_message !== undefined) ? req.query.success_message : "";

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

    /* ------------------ Log out ------------------ */
    app.post("/logout", checkAuthenticated, (req, res) => {
        req.logout(err => {
            if (err) {
                console.log(err);
                return;
            }

            console.log("Logged out correctly");
            // redirect to log-in page
            res.render("login", {
                title: "Log in",
                success_message: "Logged out correctly. Log in again to comment and like pictures."
            });
        });
    });

    /* ------------------ Upload a picture ------------------ */
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
                    if (error) {
                        console.log("Error inserting photo in database: " + error);
                    }
                    else {
                        console.log("Photo uploaded");
                    }
                }
            );

            res.redirect("/"); // take them to homepage, where their photo will be posted
        }

        else { // not an accepted format
            // reload the page and inform the user
            res.render("upload", {
                title: "Upload a photo",
                username: req.user.username,
                messages: { error: "Please choose an image in the supported formats." },
            });
        }
    });

    /* ------------------ Comment a photo ------------------ */
    app.post("/comment", checkAuthenticated, (req, res) => {
        // comment routine
        const query = "INSERT INTO comments (user_id, photo_id, content) VALUES (?, ?, ?)"
        connection.query(query, [req.user.id, req.body.photo_id, req.body.comment], (err, _result) => {
            if (err) {
                console.log("Error performing query: " + err);
                return;
            }

            // send json to update the page accordingly
            res.json({
                success: true,
                message: "Comment added",
                username: req.user.username,
                content: req.body.comment
            });
        });
    });

    /* ------------------ Like a photo ------------------ */
    app.post("/like", checkAuthenticated, (req, res) => {
        // check if user has liked the picture 
        const query = "SELECT user_id FROM likes WHERE photo_id = " + req.body.photo_id;
        connection.query(query, (err, result) => {
            if (err) {
                console.log("Error performing query: " + err);
                return;
            }

            // search in the resulting array
            var found = false; var i = 0;
            while (i < result.length && !found) {
                found = (result[i].user_id === req.user.id);
                i++;
            }

            if (found) {
                // remove like from database
                const q = `DELETE FROM likes WHERE user_id = ${req.user.id} AND photo_id = ${req.body.photo_id}`;
                connection.query(q, (error, _result) => {
                    if (error) {
                        console.log("Error performing query: " + error);
                        return;
                    }

                    // inform the user that the like has been removed
                    res.json({ success: true, message: "Like removed" });
                });
            }
            else { // the user hasn't liked the picture yet
                // store like in database
                const q = "INSERT INTO likes (user_id, photo_id) VALUES (?, ?)";
                connection.query(q, [req.user.id, req.body.photo_id], (error, _result) => {
                    if (error) {
                        console.log("Error performing query: " + error);
                        return;
                    }

                    // inform the user that the like has been added
                    res.json({ success: true, message: "Like added" });
                });
            }

        });

    });

    /* ------------------ Homepage ------------------ */
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
                let number_likes = []; // number of likes of each photo
                let liked = []; // boolean to check if the user has liked each photo
                let comments = []; // comments on each photo

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

                // create array of promises to check if the logged-in user has liked each photo
                const likedPromises = photos.map(element => {
                    const q = "SELECT user_id FROM likes WHERE photo_id = " + element.id;
                    return new Promise((resolve, reject) => {
                        connection.query(q, (error, response) => {
                            if (error !== null) {
                                console.log("Error performing query: " + error);
                                reject(error);
                            }
                            else {
                                if (!req.isAuthenticated()) {
                                    resolve(false); // if the user isn't logged-in, we store false
                                }
                                else {
                                    // search in array
                                    var found = false; var i = 0;
                                    while (i < response.length && !found) {
                                        found = (response[i].user_id === req.user.id);
                                        i++;
                                    }
                                    resolve(found); // store if the user has liked that photo
                                }

                            }
                        });
                    });
                });

                // create array of promises for the comments of each photo
                const commentsPromises = photos.map(element => {
                    const q =
                        `SELECT comments.content, comments.date_upload, users.username 
                        FROM comments, users 
                        WHERE comments.user_id = users.id 
                        AND comments.photo_id = ${element.id}
                        ORDER BY comments.date_upload ASC`;
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

                        // wait for likedPromises
                        return Promise.all(likedPromises);
                    })
                    .then(results => {
                        liked = results;
                        console.log(liked);

                        // wait for commentsPromises
                        return Promise.all(commentsPromises);
                    })
                    .then(results => {
                        comments = results;

                        // show index.ejs page
                        res.render("index", {
                            title: "Idmagram",
                            username: username,
                            photos: photos,
                            number_likes: number_likes,
                            liked: liked,
                            comments: comments
                        });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
        });
    });

}
