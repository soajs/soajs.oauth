'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */
const passport = require("passport");
let Strategy = require('passport-google-oauth20').Strategy;
let authentication = "google";

let lib = {
	"init": (config, cb) => {
		if (!config || !config.clientID || !config.clientSecret || !config.callbackURL) {
			return cb(new Error("Github passport configuration is not complete."));
		}
		passport.use(new Strategy({
				"clientID": config.clientID,
				"clientSecret": config.clientSecret.trim(),
				"callbackURL": config.callbackURL
			},
			(accessToken, refreshToken, profile, done) => {
				
				console.log("------------- GOOGLE");
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
		let config = {"scope": ['email profile']};
		return cb(null, authentication, config);
	},
	
	"getValidateConfig": (cb) => {
		let config = null;
		return cb(null, authentication, config);
	},
	
	"mapProfile": (soajsResponse, cb) => {
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
			originalProfile: soajsResponse.profile._json,
			accessToken: soajsResponse.accessToken,
			refreshToken: soajsResponse.refreshToken
		};
		return cb(null, profile);
	}
};

module.exports = lib;