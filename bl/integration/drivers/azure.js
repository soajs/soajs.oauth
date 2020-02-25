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
			return cb(new Error("Azure passport configuration is not complete."));
		}
		let options = {
			"clientID": config.clientID,
			"clientSecret": config.clientSecret.trim(),
			"callbackURL": config.callbackURL
		};
		if (config.useCommonEndpoint) {
			options.useCommonEndpoint = config.useCommonEndpoint;
		}
		if (config.tenant) {
			options.tenant = config.tenant;
		}
		if (config.resource) {
			options.resource = config.resource;
		}
		passport.use(new Strategy(options,
			(accessToken, refreshToken, params, profile, done) => {
				
				if (params && params.id_token){
					profile = jwt.decode(params.id_token);
				}
				
				console.log("------------- AZURE");
				console.log(profile);
				
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
			firstName: soajsResponse.profile.given_name,
			lastName: soajsResponse.profile.family_name,
			email: soajsResponse.profile.email || soajsResponse.profile.upn,
			username: soajsResponse.profile.oid,
			id: soajsResponse.profile.oid,
			originalProfile: soajsResponse.profile,
			accessToken: soajsResponse.accessToken,
			refreshToken: soajsResponse.refreshToken
		};
		return cb(null, profile);
	}
};

module.exports = lib;