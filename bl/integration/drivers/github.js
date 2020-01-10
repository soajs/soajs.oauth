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
	 * Initialize GitHub strategy
	 *
	 */
	"init": (req, config, cb) => {
		let data = {
			strategy: require('passport-github2').Strategy,
			authentication: 'github',
			configAuth: {
				clientID: config.clientID,
				clientSecret: config.clientSecret.trim(),
				callbackURL: config.callbackURL
			}
		};
		return cb(null, data);
	},
	
	/**
	 * Map Github user returned from API to SOAJS profile correspondingly
	 *
	 */
	"mapProfile": (user, cb) => {
		let profile = {
			firstName: user.profile.username,
			lastName: '',
			email: user.profile.username + '@github.com',
			password: '',
			username: user.profile.username + '_' + user.profile.id,
			id: user.profile.id
		};
		return cb(null, profile);
	},
	
	/**
	 * Update the request object before authenticating (inapplicable for Github)
	 *
	 */
	"preAuthenticate": (req, cb) => {
		return cb(null);
	},
	
	/**
	 * Custom update passport configuration before authenticating (inapplicable for Github)
	 *
	 */
	"updateConfig": (config, cb) => {
		config.scope = ['user:email'];
		return cb(null, config);
	}
};

module.exports = lib;