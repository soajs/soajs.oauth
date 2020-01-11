/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../../../helper.js");
const driver = helper.requireModule('./bl/integration/drivers/github.js');
const assert = require('assert');

describe("Unit test for: driver - github", () => {
	let req = {
		"soajs": {
			"inputmaskData": {
				"strategy": "github"
			},
			"servicesConfig": {
				"oauth": {
					"passportLogin": {
						"github": {
							"groups": ["maingroup"],
							"clientID": "79729863675e2513ae44",
							"clientSecret": "3f37cea1cff3e2ead1a11d96f9961e27293739e4",
							"callbackURL": "http://local-widget.com/urac/login/success?mode=github"
						}
					}
				}
			}
		}
	};
	it("test - init", (done) => {
		let mode = req.soajs.inputmaskData.strategy;
		let config = req.soajs.servicesConfig.oauth.passportLogin[mode];
		driver.init(config, (error, data) => {
			assert.ok(data);
			done();
		});
	});
	it("test - mapProfile", (done) => {
		let user = {
			"profile": {
				"username": "ahage",
				"id": "123456789"
			}
		};
		driver.mapProfile(user, (error, profile) => {
			assert.ok(profile);
			assert.equal(profile.email, "ahage@github.com");
			done();
		});
	});
	it("test - getLoginConfig", (done) => {
		driver.getLoginConfig((error, authentication) => {
			assert.ok(authentication);
			done();
		});
	});
	it("test - getValidateConfig", (done) => {
		driver.getValidateConfig((error, authentication) => {
			assert.ok(authentication);
			done();
		});
	});
});