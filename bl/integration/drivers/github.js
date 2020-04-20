'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */
const passport = require("passport");
let Strategy = require('passport-github2').Strategy;
let authentication = "github";

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
		let config = {"scope": ['user:email', 'profile']};
		return cb(null, authentication, config);
	},
	
	"getValidateConfig": (cb) => {
		let config = null;
		return cb(null, authentication, config);
	},
	
	"mapProfile": (soajsResponse, cb) => {
		let profile = {
			firstName: soajsResponse.profile.username,
			lastName: '',
			email: soajsResponse.profile.username + '@github.com',
			username: soajsResponse.profile.username + '_' + soajsResponse.profile.id,
			id: soajsResponse.profile.id,
			originalProfile: {},
			accessToken: soajsResponse.accessToken,
			refreshToken: soajsResponse.refreshToken
		};
		return cb(null, profile);
	}
};

module.exports = lib;