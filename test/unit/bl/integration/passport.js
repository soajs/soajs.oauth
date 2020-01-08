/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../../helper.js");
const driver = helper.requireModule('./bl/integration/passport.js');
const integrationLib = helper.requireModule('./bl/integration/lib.js');
const assert = require('assert');

describe("Unit test for: lib - passport", () => {
	let req = {
		"soajs": {
			"inputmaskData": {
				"strategy": "facebook"
			},
			"servicesConfig": {
				"passportLogin": {
					"facebook": {
						"clientID": "331502413866510",
						"clientSecret": "1a07a7eb9c9884dc5d148106ede830b2",
						"callbackURL": "http://local-widget.com/urac/login/success?mode=facebook"
					}
				}
			},
			"config": helper.requireModule("./config.js")
		}
	};
	let res = {};
	
	before((done) => {
		integrationLib.loadDrivers();
		done();
	});
	
	it("test - init - error strategy", (done) => {
		req.soajs.inputmaskData.strategy = "wrongdriver";
		driver.init(req, (error) => {
			let index = error.message.indexOf("Unable to get driver:");
			assert.ok(index !== -1);
			done();
		});
	});
	it("test - init - error servicesConfig", (done) => {
		req.soajs.inputmaskData.strategy = "facebook";
		req.soajs.servicesConfig.passportLogin = {};
		driver.init(req, (error) => {
			assert.ok(error.code, "420");
			done();
		});
	});
	it("test - init", (done) => {
		req.soajs.inputmaskData.strategy = "facebook";
		req.soajs.servicesConfig.passportLogin = {
			"facebook": {
				"clientID": "331502413866510",
				"clientSecret": "1a07a7eb9c9884dc5d148106ede830b2",
				"callbackURL": "http://local-widget.com/urac/login/success?mode=facebook"
			}
		};
		driver.init(req, (error, passport) => {
			assert.ok(passport);
			done();
		});
	});
	it("test - initAuth - error", (done) => {
		req.soajs.inputmaskData.strategy = "wrongdriver";
		let passport = {
			"authenticate": (authentication, config) => {
				if (config) {
				
				}
				return (req, res) => {
					if (res) {
					
					}
					done();
				};
			}
		};
		driver.initAuth(req, res, passport, (error) => {
			let index = error.message.indexOf("Unable to get driver:");
			assert.ok(index !== -1);
			done();
		});
	});
	it("test - initAuth", (done) => {
		req.soajs.inputmaskData.strategy = "facebook";
		let passport = {
			"authenticate": (authentication, config) => {
				if (config) {
				
				}
				return (req, res) => {
					if (res) {
					
					}
					done();
				};
			}
		};
		driver.initAuth(req, res, passport, () => {
			done();
		});
	});
	
});