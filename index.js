const express = require("express");
const app = express();
const databaseActions = require("./utils/database");
const querystring = require("querystring");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./utils/bcrypt");
// const csurf = require("csurf");
app.engine("handlebars", hb()); //handlebars is construction languae
app.set("view engine", "handlebars"); //handlebar is templating language
app.use(express.static("./views"));
app.use(express.static("./public"));
app.use(express.static("./utils"));

app.use(
    cookieSession({
        secret: `jennifer aniston is a god`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
); //cookie session

app.get("/register", (req, res) => {
    if (req.session.key) {
        res.redirect("/petition");
    } else {
        res.render("registration", {
            layout: "main"
        });
    }
}); ///register re-route
// app.use(csurf());
// app.use(function(req, res, next) {
//     res.locals.csrfToken = req.csrfToken();
//     next();
// });

app.get("/login", (req, res) => {
    if (req.session.key > 0) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "main"
        });
    }
});

app.post("/register", (req, res) => {
    //register post request
    let body = "";
    req.on("data", chunk => {
        body += chunk;
    }).on("end", () => {
        let pbody = querystring.parse(body);
        // console.log(pbody);
        hash(pbody.password).then(hashedPassword => {
            databaseActions
                .register(
                    pbody.firstName,
                    pbody.lastName,
                    pbody.email,
                    hashedPassword
                )
                .then(result => {
                    req.session.key = result.rows[0].id;
                    res.redirect("/updateprofile");
                })
                .catch(err => {
                    console.log("error with registration and hashing", err);
                    res.render("./registration", {
                        layout: "main",
                        error: "the email is already registered"
                    });
                });
        });
    });
});
app.get("/updateprofile", (req, res) => {
    console.log(req.session.key);
    databaseActions
        .getUserDetails(req.session.key)
        .then(results => {
            res.render("./profileupdate", {
                layout: "main",
                firstname: results.rows[0].firstname,
                lastname: results.rows[0].lastname,
                email: results.rows[0].email
            });
        })
        .catch(err => {
            console.log("error in getting profile data for update");
        });
});
app.post("/login", (req, res) => {
    let body = "";
    req.on("data", chunk => {
        body += chunk;
    }).on("end", () => {
        let pbody = querystring.parse(body);
        console.log(pbody.email);
        databaseActions
            .getLoginDetails(pbody.email)
            .then(userDetails => {
                if (compare(pbody.password, userDetails.rows[0].password)) {
                    console.log("succesful login", userDetails.rows[0].id);
                    req.session.key = userDetails.rows[0].id;
                    res.redirect("/petition");
                }
            })
            .catch(err => {
                console.log("not retrieving password from email", err);
            });
    });
});

app.use((request, response, next) => {
    console.log("session key", request.session.key);
    if (request.session.key) {
        next();
    } else {
        console.log("access denied");
        response.redirect("/register");
    }
}); //middleware check for sessioncookkie

app.get("/petition", (req, res) => {
    Promise.all([
        databaseActions.writeLetter(),
        databaseActions.getUserName(req.session.key)
    ])

        .then(results => {
            console.log(results);
            let letter = "";
            for (let i = 0; i < results[0].rows.length; i++) {
                letter += results[0].rows[i].message;
            }
            let name = "";
            for (let i = 0; i < results[1].rows.length; i++) {
                name += results[1].rows[i].firstname;
                name += " ";
                name += results[1].rows[i].lastname;
            }
            console.log("name", name);
            res.render("petition", {
                layout: "main",
                letter: letter,
                name: name
            });
        })
        .catch(err => console.log("letter unavailable"));
}); //sending petition with letter

app.post("/signature", (req, res) => {
    let body = "";
    req.on("data", chunk => {
        body += chunk;
    }).on("end", () => {
        let pbody = querystring.parse(body);
        databaseActions
            .createSubscribers(pbody.message, pbody.signature, req.session.key)
            .then(id => {
                // req.session.key = id.rows[0].id;
                res.redirect("thankyou");
            })
            .catch(err => {
                res.render("/petition", {
                    layout: "main",
                    error: "u didnt write your message :)"
                });
                console.log("u didnt fill out everything");
            });
    });
}); //signing petition

app.get("/signatures", (req, res) => {
    console.log("session key in GET request signature", req.session.key);
    Promise.all([
        databaseActions.getSubscribers("signature", req.session.key),
        databaseActions.writeLetter(),
        databaseActions.getUserName(req.session.key)
        // ,databaseActions.getNames()
    ])
        .then(results => {
            let name = "";
            for (let i = 0; i < results[2].rows.length; i++) {
                name += results[2].rows[i].firstname;
                name += " ";
                name += results[2].rows[i].lastname;
            }

            let letter = "";
            for (let i = 0; i < results[1].rows.length; i++) {
                letter += results[1].rows[i].message;
            }
            res.render("signatures", {
                layout: "main",
                signature: results[0].rows[0].signature,
                name: name,
                letter: letter
            });
        })
        .catch(err => console.log("didnt getSubscribers", err));
}); //thank you and list of signatures

app.get("/superfans", (req, res) => {
    res.render("superfans", {
        layout: "main"
    });
});

app.listen(process.env.PORT || 8080, () => console.log("awake"));
