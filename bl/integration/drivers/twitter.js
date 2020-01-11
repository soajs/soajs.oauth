'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */
const passport = require("passport");
let Strategy = require('passport-twitter').Strategy;
let authentication = "twitter";

let lib = {
	"init": (config, cb) => {
		if (!config || !config.clientID || !config.clientSecret || !config.callbackURL) {
			return cb(new Error("Github passport configuration is not complete."));
		}
		passport.use(new Strategy({
				"consumerKey": config.clientID,
				"consumerSecret": config.clientSecret.trim(),
				"callbackURL": config.callbackURL,
				"userProfileURL": config.userProfileURL || "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
				"includeEmail": true
			},
			(accessToken, refreshToken, profile, done) => {
				
				console.log("------------- TWITTER");
				console.log(accessToken, refreshToken, profile);
				
				let soajsResponse = {
					"profile": profile,
					"refreshToken": refreshToken,
					"accessToken": accessToken
				};
				return done(null, soajsResponse);
			}));
		return cb(null, passport);
	},
	
	"mapProfile": (soajsResponse, cb) => {
		let profile = {
			firstName: soajsResponse.profile.displayName,
			lastName: '',
			email: soajsResponse.profile.username + '@twitter.com',
			username: soajsResponse.profile.username + '_' + soajsResponse.profile.id,
			id: soajsResponse.profile.id,
			originalProfile: {},
			accessToken: soajsResponse.accessToken,
			refreshToken: soajsResponse.refreshToken
		};
		return cb(null, profile);
	},
	
	"getLoginConfig": (cb) => {
		let config = null;
		return cb(null, authentication, config);
	},
	
	"getValidateConfig": (cb) => {
		let config = null;
		return cb(null, authentication, config);
	},
	
	"preAuthenticate": (req, cb) => {
		if (req.soajs.inputmaskData.oauth_token && req.soajs.inputmaskData.oauth_verifier) {
			let oauth_token = req.soajs.inputmaskData.oauth_token;
			let oauth_verifier = req.soajs.inputmaskData.oauth_verifier;
			
			req.session['oauth:twitter'] = {
				'oauth_token': oauth_token,
				'oauth_token_secret': oauth_verifier
			};
		}
		else {
			req.soajs.log.error('Missing query params');
		}
		return cb(null);
	}
};

module.exports = lib;