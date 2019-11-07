'use strict';

const express = require('express');
const bodyParser = require('body-parser');

let props = require('./config/props');
let db = require('./config/database');

let tasksRoutes = require('./routes/index');
let app = express();

let bodyParserJSON = bodyParser.json();
let bodyParserURLEncoded = bodyParser.urlencoded({extended: true});
let cookieParser = require('cookie-parser');
let session = require('cookie-session');

let router = express.Router();

const passport = require('passport');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;
const AuthenticationContext = require('adal-node').AuthenticationContext;
const crypto = require('crypto');

const TokenRequest = require('./node_modules/adal-node/lib/token-request');

let config = require('./config/config');

const request = require('request');


db();

app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);
app.use(cookieParser('a deep secret'));
app.use(session({secret: '1234567890QWERTY'}));

app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization");
	next();
});

app.use(passport.initialize()); // Starts passport
app.use(passport.session()); // Provides session support

// passport.use(bearerStrategy);

let options = {
	identityMetadata: config.credentials.identityMetadata,
	issuer: config.credentials.issuer,
	audience: config.credentials.audience,
	validateIssuer: config.credentials.validateIssuer,
	passReqToCallback: config.credentials.passReqToCallback,
	loggingLevel: config.credentials.loggingLevel,
	clientID: config.credentials.clientID,
	clientSecret: config.credentials.clientSecret,
	skipUserProfile: config.credentials.skipUserProfile,
	responseType: config.credentials.responseType,
	responseMode: config.credentials.responseMode,
	scope: config.credentials.scope,
	tenantIdOrName: config.credentials.tenantIdOrName,
	redirect_uri: config.credentials.redirect_uri
};

passport.use(new BearerStrategy(options, function verify(req, iss, sub, profile, jwtClaims, accessToken, refreshToken, params, done) {
	if (!profile.id) {
		return done(new Error("No valid user auth ID"), null);
	}
	
	profile.initialRefreshToken = refreshToken;
	profile.oid = jwtClaims.oid;
	done(null, profile);
}));

// let uri = `https://login.microsoftonline.com/${options.tenantIdOrName}/oauth2/v2.0/authorize?response_type=code&client_id=${options.clientID}&redirect_uri=${options.redirect_uri}&scope=openid`;

let templateAuthzUrl = 'https://login.windows.net/' +
	config.credentials.tenantIdOrName +
	'/oauth2/authorize?response_type=code&client_id=' +
	config.credentials.clientID +
	'&redirect_uri=' +
	config.credentials.redirect_uri +
	'&state=<state>';

let authorityUrl = `https://login.microsoftonline.com/${options.tenantIdOrName}`;

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

function createAuthorizationUrl(state) {
	return templateAuthzUrl.replace('<state>', state);
}

app.get('/auth', (req, res) => {
	crypto.randomBytes(48, function (ex, buf) {
		let token = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
		
		res.cookie('authstate', token);
		let authorizationUrl = createAuthorizationUrl(token);
		
		res.redirect(authorizationUrl);
	});
});

app.get('/account', function (req, res) {
	if (req.cookies.authstate !== req.query.state) {
		res.send('error: state does not match');
	}
	
	let authContext = new AuthenticationContext(authorityUrl);
	
	authContext.acquireTokenWithAuthorizationCode(
		req.query.code,
		config.credentials.redirect_uri,
		config.credentials.resource,
		config.credentials.clientID,
		config.credentials.clientSecret,
		function (err, response) {
			let message = '';
			if (err) {
				message = 'error: ' + err.message + '\n';
			}
			message += 'response: ' + JSON.stringify(response);
			authContext.acquireTokenWithRefreshToken(response.refreshToken, config.credentials.clientID, config.credentials.clientSecret, config.credentials.resource, function (refreshErr, refreshResponse) {
				if (refreshErr) {
					message += 'refreshError: ' + refreshErr.message + '\n';
				}
				message += 'refreshResponse: ' + JSON.stringify(refreshResponse);
				
				res.send(message);
			});
		}
	);
});


///old

// const bearerStrategy = new BearerStrategy(options, function (token, done) {
// 	console.log(token, 'was the token retreived');
// 	if (!token.oid)
// 		done(new Error('oid is not found in token'));
// 	else {
// 		owner = token.oid;
// 		done(null, {}, token);
// 	}
// });

// function ensureAuthenticated(req, res, next) {
// 	if (req.isAuthenticated()) {
// 		return next();
// 	}
// 	res.redirect('/loginazure')
// }

// app.get('/account', ensureAuthenticated, function (req, res) {
// 	const requestToken = req.query;
//
// 	console.log(requestToken);
//
// 	res.render('account', {user: req.user});
// });

// app.get('/loginazure',
// 	passport.authenticate('oauth-bearer', {
// 		session: false
// 	}),
// 	(req, res) => {
// 		console.log('Login');
// 		res.redirect('/');
// 	});
//
// app.get('/logout', function (req, res) {
// 	req.logout();
// 	res.redirect('/');
// });

app.use('/api', router);

tasksRoutes(router);

app.listen(props.PORT, (req, res) => {
	console.log(`Server is running on ${props.PORT} port.`);
});