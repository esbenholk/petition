const express = require("express");
const app = express();
const databaseActions = require("./utils/database");
const hb = require("express-handlebars");
app.engine("handlebars", hb()); //handlebars is construction languae
app.set("view engine", "handlebars"); //handlebar is templating language
app.use(express.static("./views"));
app.use(express.static("./public"));
app.use(express.static("./utils"));

app.get("/petition", (req, res) => {
    res.render("petition", {
        //will look for a directory called views
        layout: "main"
    });
});

app.post("/signature", (req, res) => {
    console.log(req.body);
    // let body = "";
    // req.on("data", chunk => {
    //     body += chunk; //the body is delivered in packets/chunks that we seperately push into a variable that we instruct only to log after the data listener is done
    // }).on("end", () => {
    //     console.log(body);
    // });
    console.log("posting");
    res.redirect("signatures");
});

app.get("/signatures", (req, res) => {
    res.render("signatures", {
        //will look for a directory called views
        layout: "main"
    });
});

app.listen(8080, () => console.log("awake"));
