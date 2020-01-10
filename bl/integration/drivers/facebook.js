'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const passport = require("passport");
let Strategy = require('passport-facebook').Strategy;
let authentication = "facebook";

let lib = {
	"init": (config, cb) => {
		if (!config || !config.clientID || !config.clientSecret || !config.callbackURL) {
			return cb(new Error("Facebook passport configuration is not complete."));
		}
		passport.use(new Strategy({
				"clientID": config.clientID,
				"clientSecret": config.clientSecret.trim(),
				"callbackURL": config.callbackURL,
				"scope": config.scope || 'email',
				"profileFields": config.profileFields || ['id', 'email', 'name', 'displayName', 'gender']
			},
			(accessToken, refreshToken, profile, done) => {
				
				console.log("------------- FACEBOOK");
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
	
	"getLoginConfig": (cb) => {
		let config = null;
		return cb(null, authentication, config);
	},
	
	"getValidateConfig": (cb) => {
		let config = null;
		return cb(null, authentication, config);
	},
	
	"mapProfile": (soajsResponse, cb) => {
		let profile = {
			firstName: soajsResponse.profile._json.first_name,
			lastName: soajsResponse.profile._json.last_name,
			email: soajsResponse.profile._json.email,
			username: soajsResponse.profile.id,
			id: soajsResponse.profile.id,
			originalProfile: soajsResponse.profile._json,
			accessToken: soajsResponse.accessToken,
			refreshToken: soajsResponse.refreshToken
		};
		return cb(null, profile);
	}
};

module.exports = lib;