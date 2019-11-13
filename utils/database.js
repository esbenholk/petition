var spicedPg = require("spiced-pg");
var database = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

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

module.exports.createUserDetails = function createUserDetails(
    age,
    city,
    url,
    user_profiles_id
) {
    return database.query(
        `INSERT INTO user_profiles (age, city, url, user_profiles_id) VALUES ($1, $2, $3, $4)`,
        [age, city, url, user_profiles_id]
    );
};
