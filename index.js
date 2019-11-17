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

app.use(
    cookieSession({
        secret: `jenniferAniston`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
); //cookie session

app.use(express.urlencoded({ extended: false }));
app.use(csurf());

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/register", (req, res) => {
    if (req.session.key > 0) {
        res.redirect("/petition");
    } else {
        res.render("registration", {
            layout: "main"
        });
    }
}); ///register re-route

app.get("/login", (req, res) => {
    if (!req.session.key) {
        res.render("login", {
            layout: "main"
        });
    } else {
        res.redirect("/petition");
    }
});

app.post("/register", (req, res) => {
    let pbody = req.body;
    hash(pbody.password).then(hashedPassword => {
        console.log("this is what is passed to hash!!!!", pbody.password);
        console.log("and this is the hash!!!!!!", hashedPassword);
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
    // });
});

app.post("/login", (req, res) => {
    let pbody = req.body;
    console.log("what email do we use", pbody);
    databaseActions
        .getLoginDetails(pbody.email)
        .then(userDetails => {
            console.log("from searching with email!", userDetails);
            let password = pbody.password;
            let hashedDBPassword = userDetails.rows[0].password;
            // compare(password, userDetails.rows[0].password);

            console.log(
                "password, and hashedpasswordfromdb",
                password,
                hashedDBPassword
            );
            compare(password, hashedDBPassword).then(match => {
                console.log("match", match);
                if (match === true) {
                    req.session.key = userDetails.rows[0].id;
                    console.log(req.session.key);
                    res.redirect("/petition");
                } else {
                    res.render("login", {
                        layout: "main",
                        error: "woops that the wrong login"
                    });
                }
            });
        })
        .catch(err => {
            console.log("not retrieving password from email", err);
            res.render("login", {
                layout: "main",
                error: "woops that the wrong login"
            });
        });
});

app.use((request, response, next) => {
    if (
        request.session.key > 0 &&
        request.url != "/reister" &&
        request.url != "/login"
    ) {
        next();
    } else {
        response.redirect("/register");
    }
});
// app.use(requirelogin);

app.get("/updateprofile", (req, res) => {
    databaseActions
        .getUserDetails(req.session.key)
        .then(results => {
            console.log(
                "the stored details of the user",
                results.rows[0].password
            );
            res.render("./profileupdate", {
                layout: "main",
                firstname: results.rows[0].firstname,
                lastname: results.rows[0].lastname,
                email: results.rows[0].email,
                age: results.rows[0].age,
                city: results.rows[0].city,
                url: results.rows[0].url,
                licenseage: 2019 - results.rows[0].age
            });
        })
        .catch(err => {
            console.log("joint query in database doesnt work,", err);
        });
});

app.post("/signature", (req, res) => {
    let pbody = req.body;
    // console.log(pbody.signature);
    databaseActions
        .createSubscribers(
            `${pbody.message}. `,
            pbody.signature,
            req.session.key
        )
        .then(id => {
            // req.session.key = id.rows[0].id;

            req.session.signed = "signed";
            res.redirect("thankyou");
        })
        .catch(err => {
            res.render("./petition", {
                layout: "main",
                error: "u didnt write your message :)"
            });
        });
}); //signing petition

app.post("/updateprofile", (req, res) => {
    let pbody = req.body;
    console.log("UPDATE PROFILE post BODY", req.body);
    databaseActions
        .getUserDetails(req.session.key)
        .then(results => {
            Promise.all([
                databaseActions.createUserDetails(
                    pbody.age,
                    pbody.city,
                    pbody.url,
                    req.session.key
                ),
                databaseActions.updateRegistration(
                    pbody.firstName,
                    pbody.lastName,
                    pbody.email,
                    req.session.key,
                    results.rows[0].password
                )
            ]);
        })
        .then(results => {
            res.redirect("/petition");
        })
        .catch(err => console.log("doesnt update database", err));
});

app.post("/updatepassword", (req, res) => {
    databaseActions.getUserDetails(req.session.key).then(details => {
        hash(req.body.password).then(hashedPassword => {
            console.log("key", req.session.key);
            databaseActions
                .updatePassword(
                    details.rows[0].firstname,
                    details.rows[0].lastname,
                    details.rows[0].email,
                    hashedPassword,
                    req.session.key
                )
                .then(res.redirect("/petition"))
                .catch(err => console.log("couldnt update password", err));
        });
    });

    //
});
app.get("/thankyou", (req, res) => {
    Promise.all([
        databaseActions.getSubscribers("signature", req.session.key),
        databaseActions.writeLetter(),
        databaseActions.getUserName(req.session.key),
        databaseActions.getUserDetails(req.session.key)
    ])
        .then(results => {
            console.log("in thankyou", results);
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
                letter: letter,
                email: results[3].rows[0].email,
                age: results[3].rows[0].age,
                city: results[3].rows[0].city,
                url: results[3].rows[0].url
            });
        })
        .catch(err => console.log("didnt getSubscribers", err));
}); //thank you and list of signatures

app.get("/logout", (req, res) => {
    req.session.key = null;
    req.session.signed = null;
    console.log(req.session.key);
    res.redirect("/thankyou");
});

app.get("/superfans", (req, res) => {
    databaseActions
        .getUserDetails(req.session.key)
        .then(results => {
            res.render("superfans", {
                layout: "main",
                name:
                    results.rows[0].firstname + " " + results.rows[0].lastname,
                email: results.rows[0].email,
                age: results.rows[0].age,
                city: results.rows[0].city,
                url: results.rows[0].url
            });
        })
        .catch(err => {
            console.log("user details not rendered");
            res.redirect("/thankyou");
        });
});

app.get("/petition", (req, res) => {
    // if (req.session.signed == "signed") {
    //     res.redirect("/thankyou");
    // } else {
    Promise.all([
        databaseActions.writeLetter(),
        databaseActions.getUserName(req.session.key),
        databaseActions.getUserDetails(req.session.key)
    ])

        .then(results => {
            console.log("details in petition", results[2].rows);
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
            console.log("usermenudetails", results[2].rows[0]);
            res.render("petition", {
                layout: "main",
                letter: letter,
                name: name,
                email: results[2].rows[0].email,
                age: results[2].rows[0].age,
                city: results[2].rows[0].city,
                url: results[2].rows[0].url
            });
        })
        .catch(err => console.log("letter unavailable"));
    // }
}); //sending petition with letter

app.get("/allsignatures", (req, res) => {
    if (req.session.signed == "signed") {
        Promise.all([
            databaseActions.getNames(),
            databaseActions.getUserDetails(req.session.key)
        ]).then(results => {
            res.render("allsignatures", {
                layout: "main",
                name:
                    results[1].rows[0].firstname +
                    " " +
                    results[1].rows[0].lastname,
                email: results[1].rows[0].email,
                age: results[1].rows[0].age,
                city: results[1].rows[0].city,
                url: results[1].rows[0].url,
                co_signers: results[0].rows
            });
        });
    } else {
        console.log("how did u even get here?");
    }
});

app.get("/allsignatures/:city", (req, res) => {
    if (req.session.signed == "signed") {
        let identifier = req.params.city;
        let functionsArray = [
            databaseActions.getNames(),
            databaseActions.getUserDetails(req.session.key)
        ];
        if (typeof req.params.city == "number") {
            functionsArray.push(databaseActions.getNamesfromAge(identifier));
        } else {
            functionsArray.push(databaseActions.getNamesfromCity(identifier));
        }
        Promise.all(functionsArray).then(results => {
            console.log("gets names from city in promise all", results[2]);
            res.render("allsignatures", {
                layout: "main",
                name:
                    results[1].rows[0].firstname +
                    " " +
                    results[1].rows[0].lastname,
                email: results[1].rows[0].email,
                age: results[1].rows[0].age,
                city: results[1].rows[0].city,
                url: results[1].rows[0].url,
                co_signers: results[0].rows,
                city_specific_co_signers: results[2].rows,
                searchcity: req.params.city
            });
        });
    } else {
        console.log("how did u even get here?");
    }
});

app.get("/deletesignature", (req, res) => {
    if (req.session.signed != "signed") {
        res.redirect("/petition");
    } else {
        Promise.all([
            databaseActions.getUserName(req.session.key),
            databaseActions.getUserDetails(req.session.key),
            databaseActions.deletesignature(req.session.key)
        ])
            .then(results => {
                let name = "";
                for (let i = 0; i < results[0].rows.length; i++) {
                    name += results[0].rows[i].firstname;
                    name += " ";
                    name += results[0].rows[i].lastname;
                }
                req.session.signed = null;
                res.render("deletesignature", {
                    layout: "main",
                    text:
                        "u deleted your signature and message to miss Jennifer Aniston",
                    image: "anistongifshocked.gif",
                    name: name,
                    email: results[1].rows[0].email,
                    age: results[1].rows[0].age,
                    city: results[1].rows[0].city,
                    url: results[1].rows[0].url
                });
            })
            .catch(err => console.log("unable to delete signature"));
    }
});
app.listen(process.env.PORT || 8080, () => console.log("awake"));

//////remember to create usercatalogue for "co-signers"
/////style style style
////csurf
