const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const hash = promisify(bcrypt.hash);
const genSalt = promisify(bcrypt.genSalt);

exports.hash = password => genSalt().then(salt => hash(password, salt));

exports.compare = promisify(bcrypt.compare); //takes 2 arguments: 1. the typed password, 2. the encrypted databasestored hash
//returns true if there is a match
