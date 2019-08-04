require("dotenv").config();

var express = require("express");
var passport = require("passport");
var Strategy = require("passport-github").Strategy;

// example github callback url
// http://127.0.0.1:3000/auth/github/callback
passport.use(
  new Strategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, cb) {
      var githubId = profile.id;
      console.log(githubId);
      var profileJson = profile._json;
      console.log(profileJson.email);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user));

var app = express();

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Define routes
app.get("/", function(req, res) {
  res.render("home", { user: req.user });
});

app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("github callback, redirect...");
    res.redirect("/");
  }
);

app.listen(process.env.PORT || 3000);
