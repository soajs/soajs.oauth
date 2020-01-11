'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */
const passport = require("passport");
let Strategy = require('passport-azure-ad-oauth2').Strategy;
let authentication = "azure_ad_oauth2";

const jwt = require('jsonwebtoken');

let lib = {
	"init": (config, cb) => {
		if (!config || !config.clientID || !config.clientSecret || !config.callbackURL) {
			return cb(new Error("Github passport configuration is not complete."));
		}
		passport.use(new Strategy({
				"clientID": config.clientID,
				"clientSecret": config.clientSecret.trim(),
				"callbackURL": config.callbackURL,
				"resource": config.resource || '00000002-0000-0000-c000-000000000000',
				"tenant": config.tenant || 'contoso.onmicrosoft.com'
			},
			(accessToken, refreshToken, params, profile, done) => {
				
				console.log("------------- OFFICE365");
				console.log(accessToken, refreshToken, params, profile);
				
				let soajsResponse = {
					"profile": profile,
					"params": params,
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
	
	"mapProfile": (user, cb) => {
		let waadProfile = user.profile || jwt.decode(user.params.id_token);
		user.profile.id = waadProfile.upn;
		
		let profile = {
			firstName: "",
			lastName: "",
			email: "",
			username: "",
			id: user.profile.id,
			originalProfile: user.profile
		};
		return cb(null, profile);
	}
};

module.exports = lib;