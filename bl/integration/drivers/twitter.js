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
			return cb(new Error("Twitter passport configuration is not complete."));
		}
		let options = {
			"consumerKey": config.clientID,
			"consumerSecret": config.clientSecret.trim(),
			"callbackURL": config.callbackURL,
			"includeEmail": true
		};
		if (config.userProfileURL) {
			options.userProfileURL = config.userProfileURL;
		}
		passport.use(new Strategy(options,
			(accessToken, refreshToken, profile, done) => {
				
				let soajsResponse = {
					"profile": profile,
					"refreshToken": refreshToken,
					"accessToken": accessToken
				};
				return done(null, soajsResponse);
			}));
		return cb(null, passport);
	},
	/*
	{"result":true,"data":{"firstName":"soajs","lastName":"","email":"soajsorg@twitter.com","mode":"twitter","access":{"token_type":"bearer","access_token":"67bcc8231627f6325f7a8b7316f8cdceeb32e7b3","expires_in":7200,"refresh_token":"2a4a21773aa49a91f10cc217942a7f65412006b6"}}}¬
	 */
	"mapProfile": (soajsResponse, cb) => {
		if (soajsResponse.profile._raw) {
			delete soajsResponse.profile._raw;
		}
		let email = soajsResponse.profile.username + '@twitter.com';
		if (soajsResponse.profile.emails) {
			email = soajsResponse.profile.emails[0].value;
		}
		let profile = {
			firstName: soajsResponse.profile.displayName,
			lastName: '',
			email: email,
			username: soajsResponse.profile.username + '_' + soajsResponse.profile.id,
			id: soajsResponse.profile.id,
			originalProfile: soajsResponse.profile,
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