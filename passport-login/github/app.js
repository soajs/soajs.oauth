'use strict';

const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

let app = express();
let config = require('./config/config');

passport.use(new GitHubStrategy({
		clientID: config.credentials.clientID,
		clientSecret: config.credentials.clientSecret,
		callbackURL: config.credentials.callbackURL
	},
	function (accessToken, refreshToken, profile, cb) {
		//save user in db
		console.log(accessToken, refreshToken, profile);
		return cb(null, profile);
	}
));

passport.serializeUser(function(user, cb) {
	cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
	cb(null, obj);
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/',
	function(req, res) {
		res.render('home', { user: req.user });
	});

app.get('/login',
	function(req, res){
		res.render('login');
	});

app.get('/login/github',
	passport.authenticate('github', {scope: ['profile']}));

app.get('/return',
	passport.authenticate('github', { failureRedirect: '/login' }),
	function(req, res) {
		res.redirect('/');
	});

app.get('/profile',
	require('connect-ensure-login').ensureLoggedIn(),
	function(req, res){
		res.render('profile', { user: req.user });
	});

app.listen(process.env['PORT'] || 8080, (req, res) => {
	console.log(`Console running on port ${process.env['PORT'] || 8080}`)
});