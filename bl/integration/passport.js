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
	"init": (soajs, cb) => {
		let mode = soajs.inputmaskData.strategy;
		console.log(mode)
		console.log(soajs.servicesConfig.oauth)
		let driver = lib.getDriver(mode);
		if (!driver) {
			return cb({"code": 422, "msg": driverConfig.errors[422] + mode});
		}
		if (!soajs.servicesConfig || !soajs.servicesConfig.oauth || !soajs.servicesConfig.oauth.passportLogin || !soajs.servicesConfig.oauth.passportLogin[mode]) {
			return cb({"code": 420, "msg": driverConfig.errors[420]});
		}
		let config = soajs.servicesConfig.oauth.passportLogin[mode];
		driver.init(config, (error, passport) => {
			if (error) {
				soajs.log.error(error);
				return cb({"code": 421, "msg": driverConfig.errors[421]});
			}
			return cb(null, passport);
		});
	},
	
	/**
	 * login through passport
	 *
	 */
	"login": (req, res, passport, cb) => {
		let mode = req.soajs.inputmaskData.strategy;
		let driver = lib.getDriver(mode);
		if (!driver) {
			return cb({"code": 422, "msg": driverConfig.errors[422] + mode});
		}
		driver.getLoginConfig((error, authentication, config) => {
			if (error || !authentication) {
				req.soajs.log.error(err);
				return cb({"code": 423, "msg": driverConfig.errors[423]});
			}
			if (!config) {
				config = {"session": false};
			}
			passport.authenticate(authentication, config)(req, res);
		});
	},
	
	/**
	 * Validate through passport
	 *
	 */
	"validate": (req, res, passport, cb) => {
		let mode = req.soajs.inputmaskData.strategy;
		let driver = lib.getDriver(mode);
		if (!driver) {
			return cb({"code": 422, "msg": driverConfig.errors[422] + mode});
		}
		driver.getValidateConfig((error, authentication, config) => {
			if (error || !authentication) {
				req.soajs.log.error(err);
				return cb({"code": 423, "msg": driverConfig.errors[423]});
			}
			if (!config) {
				config = {"session": false};
			}
			passport.authenticate(authentication, config, (err, soajsResponse) => {
				if (err) {
					req.soajs.log.error(err);
					return cb({"code": 720, "msg": driverConfig.errors[720]});
				}
				if (!soajsResponse) {
					cb({"code": 403, "msg": driverConfig.errors[403]});
				}
				driver.mapProfile(soajsResponse, (err, profile) => {
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