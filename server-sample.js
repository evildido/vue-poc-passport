var express = require('express')
var path = require('path')
var passport = require('passport')
var Strategy = require('passport-facebook').Strategy

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
  clientID: 'clientID',
  clientSecret: 'clientSecret',
  callbackURL: 'http://localhost:3000/login/facebook/return'
},
  function (accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile)
  }))


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})

// Create a new Express application.
var app = express()

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'))
app.use(require('cookie-parser')())
app.use(require('body-parser').urlencoded({
  extended: true
}))
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, 'client')))

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize())
app.use(passport.session())

app.get('/login/facebook', function(req, res, next) {
  req.session.url = req.query.url;
  next();
}, passport.authenticate('facebook'));

app.get('/login/facebook/return', passport.authenticate(
  'facebook',
  {failureRedirect: '/#/'}
), function (req, res) {
  res.redirect('/#' + req.session.url || '/#/');
  delete req.session.url;
});

app.get('/me',
  function (req, res) {
    if (!req.user) {
      res.json({ logged: false })
    }
    else {
      res.json({
        logged: true,
        user: req.user
      })
    }
  })

app.listen(3000)