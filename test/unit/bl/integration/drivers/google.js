/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../../../helper.js");
const driver = helper.requireModule('./bl/integration/drivers/google.js');
const assert = require('assert');

describe("Unit test for: driver - google", () => {
	let req = {
		"soajs": {
			"inputmaskData": {
				"strategy": "google"
			},
			"servicesConfig": {
				"oauth": {
					"passportLogin": {
						"google": {
							"clientID": "393278808961-7qahk8kadr2jhbo05o84pbp5tc774a1l.apps.googleusercontent.com",
							"clientSecret": "sdSpS8FLeUvc0UBs_z8m4f89",
							"callbackURL": "http://local-widget.com/urac/login/success"
						}
					}
				}
			}
		}
	};
	it("test - init", (done) => {
		let mode = req.soajs.inputmaskData.strategy;
		let config = req.soajs.servicesConfig.oauth.passportLogin[mode];
		driver.init(req, config, (error, data) => {
			assert.ok(data);
			done();
		});
	});
	it("test - mapProfile", (done) => {
		let user = {
			"profile": {
				"name": {
					"givenName": "antoine",
					"familyName": "hage"
				},
				"emails": [{"value": "antoine@soajs.org"}],
				"id": "123456789"
			}
		};
		driver.mapProfile(user, (error, profile) => {
			assert.ok(profile);
			assert.equal(profile.email, "antoine@soajs.org");
			done();
		});
	});
	it("test - preAuthenticate", (done) => {
		driver.preAuthenticate(req, () => {
			done();
		});
	});
	it("test - updateConfig", (done) => {
		driver.updateConfig({"conf": "1"}, (error, config) => {
			assert.equal(config.conf, "1");
			done();
		});
	});
});