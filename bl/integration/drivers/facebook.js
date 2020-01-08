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
	 * Initialize facebook strategy
	 *
	 */
	"init": (req, cb) => {
		let mode = req.soajs.inputmaskData.strategy;
		let data = {
			strategy: require('passport-facebook').Strategy,
			authentication: 'facebook',
			configAuth: {
				clientID: req.soajs.servicesConfig.passportLogin[mode].clientID,
				clientSecret: req.soajs.servicesConfig.passportLogin[mode].clientSecret.trim(),
				callbackURL: req.soajs.servicesConfig.passportLogin[mode].callbackURL,
				scope: 'email',
				profileFields: ['id', 'email', 'name']
			}
		};
		return cb(null, data);
	},
	
	/**
	 * Map facebook user returned from API to SOAJS profile correspondingly
	 *
	 */
	"mapProfile": (user, cb) => {
		let profile = {
			firstName: user.profile._json.first_name,
			lastName: user.profile._json.last_name,
			email: user.profile._json.email,
			username: user.profile.id,
			id: user.profile.id,
			originalProfile: user.profile._json
		};
		return cb(null, profile);
	},
	
	/**
	 * Update the request object before authenticating (inapplicable for facebook)
	 *
	 */
	"preAuthenticate": (req, cb) => {
		return cb(null);
	},
	
	/**
	 * Custom update passport configuration before authenticating (inapplicable for facebook)
	 *
	 */
	"updateConfig": (config, cb) => {
		return cb(null, config);
	}
};

module.exports = lib;