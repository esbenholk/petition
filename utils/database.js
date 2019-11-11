var spicedPg = require("spiced-pg");
var database = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//database queeries. we will use this module to facilitate all of our commands to the psql database

module.exports.getNames = function getNames() {
    return database.query(`SELECT (firstname, lastname) FROM registration`);
};

module.exports.getSubscribers = function getSubscribers(value, identifier) {
    return database.query(`SELECT ${value} FROM subscribers WHERE user_id=$1`, [
        identifier
    ]);
}; //get signature

module.exports.getLoginDetails = function getLoginDetails(identifier) {
    return database.query(`SELECT * FROM registration WHERE email = $1`, [
        identifier
    ]);
}; //get password

module.exports.createSubscribers = function createSubscribers(
    message,
    signature,
    user_id
) {
    console.log("trying to post to database");
    return database.query(
        `INSERT INTO subscribers (message, signature, user_id) VALUES ($1, $2, $3) RETURNING id`,
        [message, signature, user_id]
    );
};

module.exports.writeLetter = function writeLetter() {
    return database.query(`SELECT message FROM subscribers`);
};

module.exports.register = function registerUser(
    firstname,
    lastname,
    email,
    hashedPassword
) {
    console.log("trying to register to database (register)");
    return database.query(
        `INSERT INTO registration (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [firstname, lastname, email, hashedPassword]
    );
};
