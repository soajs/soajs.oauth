'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

let lib = {
	/**
	 * Initialize Google strategy
	 *
	 */
	"init": (req, config, cb) => {
		let data = {
			strategy: require('passport-google-oauth').OAuth2Strategy, // OAuthStrategy, OAuth2Strategy
			authentication: 'google',
			configAuth: {
				clientID: config.clientID,
				clientSecret: config.clientSecret.trim(),
				callbackURL: config.callbackURL,
				accessType: 'offline',
				// approvalPrompt: 'force',
				scope: 'email'
			}
		};
		return cb(null, data);
	},
	
	/**
	 * Map Google user returned from API to SOAJS profile correspondingly
	 *
	 */
	"mapProfile": (user, cb) => {
		let email = '';
		if (user.profile.emails && user.profile.emails.length !== 0) {
			email = user.profile.emails[0].value;
		}
		let profile = {
			firstName: user.profile.name.givenName,
			lastName: user.profile.name.familyName,
			email: email,
			password: '',
			username: user.profile.id,
			id: user.profile.id
		};
		return cb(null, profile);
	},
	
	/**
	 * Update the request object before authenticating (inapplicable for Google)
	 *
	 */
	"preAuthenticate": (req, cb) => {
		return cb(null);
	},
	
	/**
	 * Custom update passport configuration before authenticating
	 *
	 */
	"updateConfig": (config, cb) => {
		config.scope = 'email'; // request email information
		config.accessType = 'offline';
		
		return cb(null, config);
	}
};

module.exports = lib;