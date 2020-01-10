'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

// http://www.passportjs.org/packages/passport-office365-oauth2/

const jwt = require('jsonwebtoken');

let lib = {
	/**
	 * Initialize facebook strategy
	 *
	 */
	"init": (req, config, cb) => {
		let data = {
			strategy: require('passport-azure-ad-oauth2').Strategy,
			authentication: 'office365',
			configAuth: {
				clientID: config.clientID,
				clientSecret: config.clientSecret.trim(),
				callbackURL: config.callbackURL,
				resource: config.resource || '00000002-0000-0000-c000-000000000000',
				tenant: config.tenant || 'contoso.onmicrosoft.com'
			}
		};
		return cb(null, data);
	},
	
	/**
	 * Map office365 user returned from API to SOAJS profile correspondingly
	 *
	 */
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
	},
	
	/**
	 * Update the request object before authenticating (inapplicable for office365)
	 *
	 */
	"preAuthenticate": (req, cb) => {
		return cb(null);
	},
	
	/**
	 * Custom update passport configuration before authenticating (inapplicable for office365)
	 *
	 */
	"updateConfig": (config, cb) => {
		return cb(null, config);
	}
};

module.exports = lib;