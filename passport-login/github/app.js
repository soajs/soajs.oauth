'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

let bodyParserJSON = bodyParser.json();
let bodyParserURLEncoded = bodyParser.urlencoded({extended: true});

let app = express();

let props = require('./config/props');
let config = require('./config/config');
let db = require('./config/database');

db();

app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);
app.use(cookieParser('a secret'));
app.use(session({secret: 'secret session'}));

app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization");
	next();
});

app.use(passport.initialize()); // Starts passport
app.use(passport.session()); // Provides session support

passport.use(new GitHubStrategy({
		clientID: config.credentials.clientID,
		clientSecret: config.credentials.clientSecret,
		callbackURL: config.credentials.callbackURL
	},
	function (accessToken, refreshToken, profile) {
	//save user in db
		console.log(accessToken, refreshToken, profile);
	}
));

app.get('/', function (req, res) {
	res.redirect('/login');
});

app.get('/login', function (req, res) {
	console.log(req.cookies);
	
	res.cookie('acookie', 'this is a cookie');
	
	res.send('\
<head>\
  <title>test</title>\
</head>\
<body>\
  <a href="./auth">Login</a>\
</body>\
');
});

app.get('/auth', passport.authenticate('github'));

app.get('/account', passport.authenticate('github', {failureRedirect: '/login'}), function (req, res) {
	// Successful authentication, redirect home.
	res.redirect('/');
});

app.listen(props.PORT, (req, res) => {
	console.log(`Server is running on ${props.PORT} port.`);
});