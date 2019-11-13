var spicedPg = require("spiced-pg");
var database = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

//database queeries. we will use this module to facilitate all of our commands to the psql database

/////SELECTING TOTAL INFORMATIONS
module.exports.getNames = function getNames() {
    return database.query(`SELECT (firstname, lastname) FROM registration`);
}; ////getting names of co-signers
module.exports.writeLetter = function writeLetter() {
    return database.query(`SELECT message FROM subscribers`);
}; ///taking all messages for letter

///SELECTING USER SPECIFIC INFORMATION
module.exports.getUserName = function getUserName(identifier) {
    return database.query(
        `SELECT firstname, lastname FROM registration WHERE id=$1`,
        [identifier]
    );
}; ////getting username from registration for multipurpose
module.exports.getSubscribers = function getSubscribers(value, identifier) {
    return database.query(`SELECT ${value} FROM subscribers WHERE user_id=$1`, [
        identifier
    ]);
}; //get signature from subscribers to create thank you notice

module.exports.getLoginDetails = function getLoginDetails(identifier) {
    return database.query(`SELECT * FROM registration WHERE email = $1`, [
        identifier
    ]);
}; //get password to compare in login
module.exports.getUserDetails = function getUserDetails(identifier) {
    return database.query(
        `SELECT * FROM registration LEFT OUTER JOIN user_profiles ON registration.id = user_profiles.user_profiles_id WHERE registration.id = $1`,
        [identifier]
    );
}; //gets all user details using req.session.key as identifier for user

//////PUTTING IN DATA queries
module.exports.createSubscribers = function createSubscribers(
    message,
    signature,
    user_id
) {
    ///putting signature and message into subscribers(where letter is created)
    return database.query(
        `INSERT INTO subscribers (message, signature, user_id) VALUES ($1, $2, $3) RETURNING id`,
        [message, signature, user_id]
    );
};
module.exports.register = function registerUser(
    firstname,
    lastname,
    email,
    hashedPassword
) {
    ///putting user into registration
    return database.query(
        `INSERT INTO registration (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [firstname, lastname, email, hashedPassword]
    );
};

module.exports.updateRegistration = function updateRegistration(
    firstname,
    lastname,
    email,
    hashedPassword,
    id
) {
    /// updated registration table using Conflict with ID=session.key
    return database.query(
        `INSERT INTO registration (firstname, lastname, email, password, id) VALUES ($1, $2, $3, $4, $5) on CONFLICT (id) DO UPDATE SET firstname = $1, lastname = $2, email= $3, password=$4`,
        [firstname, lastname, email, hashedPassword, id]
    );
};

module.exports.createUserDetails = function createUserDetails(
    age,
    city,
    url,
    user_profiles_id
) {
    //create/update user description in new table user_profiles
    return database.query(
        `INSERT INTO user_profiles (age, city, url, user_profiles_id) VALUES ($1, $2, $3, $4) on CONFLICT (user_profiles_id) DO UPDATE SET age = $1, city = $2, url = $3`,
        [age, city, url, user_profiles_id]
    );
};
