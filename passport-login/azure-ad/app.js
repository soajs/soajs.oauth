'use strict';

const express = require('express');
const bodyParser = require('body-parser');

let props = require('./config/props');
let db = require('./config/database');

let tasksRoutes = require('./routes/index');
let app = express();

let bodyParserJSON = bodyParser.json();
let bodyParserURLEncoded = bodyParser.urlencoded({extended: true});

let router = express.Router();

const passport = require('passport');
const OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;
let config = require('./config/config');

db();

app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);

app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization");
	next();
});

let users = [];
let owner = null;

let findById = function (id, cb) {
	for (let i = 0, len = users.length; i < len; i++) {
		let user = users[i];
		if (user.sub === id) {
			console.log('Found user: ', user);
			return cb(null, user);
		}
	}
	return cb(null, null);
};

let options = {
	identityMetadata: config.credentials.identityMetadata,
	issuer: config.credentials.issuer,
	audience: config.credentials.audience,
	validateIssuer: config.credentials.validateIssuer,
	passReqToCallback: config.credentials.passReqToCallback,
	loggingLevel: config.credentials.loggingLevel,
	clientID: config.credentials.clientID,
	returnURL: config.credentials.returnURL,
	clientSecret: config.credentials.clientSecret,
	skipUserProfile: config.credentials.skipUserProfile,
	responseType: config.credentials.responseType,
	responseMode: config.credentials.responseMode,
	scope: config.credentials.scope,
};

const bearerStrategy = new OIDCBearerStrategy(options,
	function (token, done) {
		console.log(token, 'was the token retreived');
		if (!token.oid)
			done(new Error('oid is not found in token'));
		else {
			owner = token.oid;
			done(null, token);
		}
	}
);

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/loginazure')
}

app.use(passport.initialize()); // Starts passport
app.use(passport.session()); // Provides session support

passport.use(bearerStrategy);

app.get('/account', ensureAuthenticated, function (req, res) {
	res.render('account', {user: req.user});
});

app.get('/loginazure',
	passport.authenticate('oauth-bearer', {
		session: false
	}),
	(req, res) => {
		console.log('Login');
		res.redirect('/');
	});

router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

app.use('/api', router);

tasksRoutes(router);

app.listen(props.PORT, (req, res) => {
	console.log(`Server is running on ${props.PORT} port.`);
});