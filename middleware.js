const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const databaseActions = require("./utils/database");

app.use(
    cookieSession({
        secret: `jennifer aniston is a god`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

module.exports.requirelogin = function(request, response, next) {
    if (
        !request.session.key &&
        request.url != "/reister" &&
        request.url != "/login"
    ) {
        next();
    } else {
        response.redirect("/register");
    }
};

module.exports.requireNoSignature = function(req, res, next) {
    if (req.session.signed == "signed") {
        res.redirect("/superfans");
    } else {
        next();
    }
};
