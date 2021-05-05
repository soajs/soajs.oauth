'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */
const passport = require("passport");
let Strategy = require('passport-linkedin-oauth2').Strategy;
let authentication = "linkedin";

let lib = {
	"init": (config, cb) => {
		if (!config || !config.clientID || !config.clientSecret || !config.callbackURL) {
			return cb(new Error("Linkedin passport configuration is not complete."));
		}
		passport.use(new Strategy({
				"clientID": config.clientID,
				"clientSecret": config.clientSecret.trim(),
				"callbackURL": config.callbackURL,
				"scope": config.scope || ['r_emailaddress', 'r_liteprofile'],
				"state": config.hasOwnProperty("state") ? config.state : true
			},
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
			
			req.session['oauth:linkedin'] = {
				'oauth_token': oauth_token,
				'oauth_token_secret': oauth_verifier
			};
		} else {
			req.soajs.log.error('Missing query params');
		}
		return cb(null);
	},
	
	"mapProfile": (soajsResponse, cb) => {
		if (soajsResponse.profile && soajsResponse.profile._raw) {
			delete soajsResponse.profile._raw;
		}
		if (soajsResponse.profile && soajsResponse.profile._json) {
			delete soajsResponse.profile._json;
		}
		let email = '';
		if (soajsResponse.profile.emails && soajsResponse.profile.emails.length !== 0) {
			email = soajsResponse.profile.emails[0].value;
		}
		let profile = {
			firstName: soajsResponse.profile.name.givenName,
			lastName: soajsResponse.profile.name.familyName,
			email: email,
			username: soajsResponse.profile.id,
			id: soajsResponse.profile.id,
			originalProfile: soajsResponse.profile,
			accessToken: soajsResponse.accessToken,
			refreshToken: soajsResponse.refreshToken
		};
		return cb(null, profile);
	}
};

module.exports = lib;