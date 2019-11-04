let Tasks = require('../controller/index');
const passport = require('passport');
const OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;
let config = require('../config/config');

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

let oidcStrategy = new OIDCBearerStrategy(options,
	function (token, done) {
		console.log('verifying the user');
		console.log(token, 'was the token retreived');
		findById(token.sub, function (err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				// "Auto-registration"
				console.log('User was added automatically as they were new. Their sub is: ', token.sub);
				users.push(token);
				owner = token.sub;
				return done(null, token);
			}
			owner = token.sub;
			return done(null, user, token);
		});
	}
);

passport.use(oidcStrategy);

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/api/loginazure')
}

module.exports = function (router) {
	router.use(passport.initialize()); // Starts passport
	router.use(passport.session()); // Provides session support
	router.post('/task', Tasks.createTask);
	router.get('/task', Tasks.getTasks);
	router.put('/task/:id', Tasks.updateTask);
	router.delete('/task/:id', Tasks.removeTask);
	
	router.get('/account', ensureAuthenticated, function (req, res) {
		res.render('account', {user: req.user});
	});
	
	router.get('/loginazure',
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
};