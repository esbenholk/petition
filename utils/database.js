var spicedPg = require("spiced-pg");
var database = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//database queeries. we will use this module to facilitate all of our commands to the psql database

module.exports.getSubscribers = function getSubscribers() {
    return database.query("SELECT * FROM subscribers");
};

module.exports.createSubscribers = function createSubscribers(
    name,
    age,
    city,
    message
) {
    return database.query(
        `INSERT INTO subscribers (name, age, city, message) VALUES ($1, $2, $3, $4)`,
        [name, age, city, message]
    );
};
