const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { connection } = require("./database-config");

function initialize(passport, /* getUserByUsername, */ getUserById) {
    const authenticateUser = async (username, password, done) => {

        const query = 'SELECT * FROM users WHERE username = ?';
        connection.query(query, [username], async (err, result) => {
            if (err !== null) {
                console.log("Error performing query: " + err);
                return;
            }

            // Query performed correctly 
            const user = result[0];

            if (user === undefined) { // user doesn't exist
                console.log("authentication error");
                return done(null, false, { message: "The username doesn't exist" });
            }

            try {
                if (await bcrypt.compare(password, user.pwd)) {
                    console.log("Logged in correctly");
                    return done(null, user);
                }
                else {
                    console.log("Error logging in");
                    return done(null, false, { message: "Password incorrect" });
                }
            } catch (error) {
                return done(error);
            }
        });

    };

    passport.use(new localStrategy(/* { usernameField: "username" }, */authenticateUser));
    passport.serializeUser((user, done) => { done(null, user.id) });
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });

}

module.exports = initialize;
