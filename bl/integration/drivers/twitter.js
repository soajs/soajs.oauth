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
	 * Initialize Twitter strategy
	 *
	 */
	"init": (req, config, cb) => {
		let userProfileURL = "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true";
		if (config.userProfileURL) {
			userProfileURL = config.userProfileURL;
		}
		let data = {
			strategy: require('passport-twitter').Strategy,
			authentication: 'twitter',
			configAuth: {
				consumerKey: config.clientID,
				consumerSecret: config.clientSecret.trim(),
				callbackURL: config.callbackURL,
				userProfileURL: userProfileURL,
				includeEmail: true
			}
		};
		return cb(null, data);
	},
	
	/**
	 * Map Twitter user returned from API to SOAJS profile correspondingly
	 *
	 */
	"mapProfile": (user, cb) => {
		let profile = {
			firstName: user.profile.displayName,
			lastName: '',
			email: user.profile.username + '@twitter.com',
			password: '',
			username: user.profile.username + '_' + user.profile.id,
			id: user.profile.id
		};
		return cb(null, profile);
	},
	
	
	/**
	 * Update the request object before authenticating
	 *
	 */
	"preAuthenticate": (req, cb) => {
		if (req.soajs.inputmaskData.oauth_token && req.soajs.inputmaskData.oauth_verifier) {
			let oauth_token = req.soajs.inputmaskData.oauth_token;
			let oauth_verifier = req.soajs.inputmaskData.oauth_verifier;
			
			req.session['oauth:twitter'] = {
				'oauth_token': oauth_token,
				'oauth_token_secret': oauth_verifier
			};
		}
		else {
			req.soajs.log.error('Missing query params');
		}
		return cb(null);
	},
	
	/**
	 * Custom update passport configuration before authenticating (inapplicable for Twitter)
	 *
	 */
	"updateConfig": (config, cb) => {
		return cb(null, config);
	}
};

module.exports = lib;