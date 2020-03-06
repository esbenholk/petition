const express = require("express");
const app = express();

const databaseActions = require("./utils/database");
// const querystring = require("querystring");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./utils/bcrypt");
const csurf = require("csurf");

app.engine("handlebars", hb()); //handlebars is construction languae
app.set("view engine", "handlebars"); //handlebar is templating language
app.use(express.static("./views"));
app.use(express.static("./public"));
app.use(express.static("./utils"));

app.get("/", (req, res) => {
    res.render("frontpage", {
        layout: "main"
    });
});
app.get("/tarotcards", (req, res) => {
    res.render("tarotcards", {
        layout: "main"
    });
});
app.get("/documentation", (req, res) => {
    res.render("documentation", {
        layout: "main"
    });
});
app.get("/merch", (req, res) => {
    res.render("documentation", {
        layout: "main"
    });
});

// app.use((request, response, next) => {
//     if (request.url != "/register" && request.url != "/login") {
//         response.render("frontpage", {
//             layout: "main"
//         });
//     } else {
//         console.log("redirecting through url");
//         response.redirect("/");
//     }
// });

app.listen(process.env.PORT || 8080, () => console.log("awake"));
