'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const driverConfig = require('./../../config.js');
const lib = require("./lib.js");

let main = {
	/**
	 * Initialize passport based on the strategy requested
	 *
	 */
	"init": (req, cb) => {
		let passport = require("passport");
		let mode = req.soajs.inputmaskData.strategy;
		let driver = lib.getDriver(mode);
		if (!driver) {
			return cb(new Error("Unable to get driver: " + mode));
		}
		if (!req.soajs.servicesConfig || !req.soajs.servicesConfig.oauth || !req.soajs.servicesConfig.oauth.passportLogin || !req.soajs.servicesConfig.oauth.passportLogin[mode]) {
			return cb({"code": 420, "msg": driverConfig.errors[420]});
		}
		let config = req.soajs.servicesConfig.oauth.passportLogin[mode];
		driver.init(req, config, (error, data) => {
			// now we have the strategy, configuration , and authentication method defined
			let myStrategy = new data.strategy(data.configAuth, () => {//(accessToken, refreshToken, profile, done) {
				let accessToken = null;
				let refreshToken = null;
				let params = null;
				let profile = null;
				let done = arguments[arguments.length - 1];
				switch (arguments.length) {
					case 2: //controller, cb
						accessToken = arguments[0];
						break;
					case 3:
						accessToken = arguments[0];
						refreshToken = arguments[1];
						break;
					case 4: //facebook, twitter, github, google
						accessToken = arguments[0];
						refreshToken = arguments[1];
						profile = arguments[2];
						break;
					case 5: //office365
						accessToken = arguments[0];
						refreshToken = arguments[1];
						params = arguments[2];
						profile = arguments[3];
						break;
				}
				done(null, {
					"profile": profile,
					"params": params,
					"refreshToken": refreshToken,
					"accessToken": accessToken
				});
			});
			passport.use(myStrategy);
			return cb(null, passport);
		});
	},
	
	/**
	 * Authenticate through passport
	 *
	 */
	"initAuth": (req, res, passport, cb) => {
		let authentication = req.soajs.inputmaskData.strategy;
		if (authentication === "azure") {
			authentication = 'oauth-bearer';
		} else if (authentication === "'office365'") {
			authentication = 'azure_ad_oauth2';
		}
		let config = {session: false};
		let driver = lib.getDriver(req.soajs.inputmaskData.strategy);
		if (!driver) {
			return cb(new Error("Unable to get driver: " + req.soajs.inputmaskData.strategy));
		}
		driver.updateConfig(config, (error, config) => {
			passport.authenticate(authentication, config)(req, res);
		});
	},
	
	/**
	 * Get driver, do what is needed before authenticating, and authenticate
	 *
	 * @param req
	 * @param res
	 * @param passport
	 * @param cb
	 */
	"passportLibAuthenticate": (req, res, passport, cb) => {
		let authentication = req.soajs.inputmaskData.strategy;
		let driver = lib.getDriver(req.soajs.inputmaskData.strategy);
		if (!driver) {
			return cb(new Error("Unable to get driver: " + req.soajs.inputmaskData.strategy));
		}
		driver.preAuthenticate(req, () => {
			passport.authenticate(authentication, {session: false}, (err, user) => {
				if (err) {
					req.soajs.log.error(err);
					return cb({"code": 720, "msg": driverConfig.errors[720]});
				}
				if (!user) {
					cb({"code": 403, "msg": driverConfig.errors[403]});
				}
				driver.mapProfile(user, (err, profile) => {
					if (err) {
						req.soajs.log.error(err);
						return cb({"code": 411, "msg": driverConfig.errors[411] + " - " + err.message});
					}
					if (!profile) {
						return cb({"code": 412, "msg": driverConfig.errors[412]});
					}
					cb(null, profile);
				});
			})(req, res);
		});
	}
};

module.exports = main;