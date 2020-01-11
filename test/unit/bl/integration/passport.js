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
				"oauth": {
					"passportLogin": {
						"facebook": {
							"groups": ["maingroup"],
							"clientID": "331502413866510",
							"clientSecret": "1a07a7eb9c9884dc5d148106ede830b2",
							"callbackURL": "http://local-widget.com/urac/login/success?mode=facebook"
						}
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
		driver.init(req.soajs, (error) => {
			assert.ok(error);
			assert.equal(error.code, "422");
			done();
		});
	});
	it("test - init - error servicesConfig", (done) => {
		req.soajs.inputmaskData.strategy = "facebook";
		req.soajs.servicesConfig.oauth = {"passportLogin": {}};
		driver.init(req.soajs, (error) => {
			assert.ok(error.code, "420");
			done();
		});
	});
	it("test - init", (done) => {
		req.soajs.inputmaskData.strategy = "facebook";
		req.soajs.servicesConfig.oauth = {
			"passportLogin": {
				"facebook": {
					"groups": ["maingroup"],
					"clientID": "331502413866510",
					"clientSecret": "1a07a7eb9c9884dc5d148106ede830b2",
					"callbackURL": "http://local-widget.com/urac/login/success?mode=facebook"
				}
			}
		};
		driver.init(req.soajs, (error, passport) => {
			assert.ok(passport);
			done();
		});
	});
	it("test - login - error", (done) => {
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
		driver.login(req, res, passport, (error) => {
			assert.ok(error);
			assert.equal(error.code, "422");
			done();
		});
	});
	it("test - login", (done) => {
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
		driver.login(req, res, passport, () => {
			done();
		});
	});
	it("test - validate - error", (done) => {
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
		driver.validate(req, res, passport, (error) => {
			assert.ok(error);
			assert.equal(error.code, "422");
			done();
		});
	});
	it("test - validate", (done) => {
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
		driver.validate(req, res, passport, () => {
			done();
		});
	});
});