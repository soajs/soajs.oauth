'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const request = require('request');
const driverConfig = require('./../../config.js');
const lib = require("./lib.js");

let main = {
	"login": (soajs, data, cb) => {
		let token = data.token;
		let openam;
		
		if (soajs.servicesConfig && soajs.servicesConfig.oauth && soajs.servicesConfig.oauth.openam) {
			openam = soajs.servicesConfig.oauth.openam;
		}
		else {
			return cb({"code": 420, "msg": driverConfig.errors[420]});
		}
		
		let openamAttributesURL = openam.attributesURL;
		let openamAttributesMap = openam.attributesMap;
		let openamTimeout = openam.timeout || 10000;
		
		request.post(openamAttributesURL, {
			"form": {"subjectid": token},
			"timeout": openamTimeout
		}, (error, response, body) => {
			let userRecord;
			
			if (error) {
				soajs.log.error(error);
				return cb({"code": 710, "msg": driverConfig.errors[710]});
			}
			
			if (!response || response.statusCode !== 200) {
				soajs.log.error("OpenAM token invalid!");
				return cb({"code": 711, "msg": driverConfig.errors[711]});
			}
			
			try {
				userRecord = JSON.parse(body);
			} catch (err) {
				soajs.log.error("OpenAM response invalid!");
				return cb({"code": 713, "msg": driverConfig.errors[713]});
			}
			
			soajs.log.debug('Authenticated!');
			
			let driver = lib.getDriver("openam");
			if (!driver) {
				return cb(new Error("Unable to get driver: openam"));
			}
			let user = {
				"userRecord": userRecord,
				"attributesMap": openamAttributesMap
			};
			driver.mapProfile(user, (err, profile) => {
				if (err) {
					soajs.log.error(err);
					return cb({"code": 411, "msg": driverConfig.errors[411] + " - " + err.message});
				}
				if (!profile) {
					return cb({"code": 412, "msg": driverConfig.errors[412]});
				}
				cb(null, profile);
			});
		});
	}
};

module.exports = main;