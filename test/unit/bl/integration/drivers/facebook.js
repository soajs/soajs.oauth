/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../../../helper.js");
const driver = helper.requireModule('./bl/integration/drivers/facebook.js');
const assert = require('assert');

describe("Unit test for: driver - facebook", () => {
	let req = {
		"soajs": {
			"inputmaskData": {
				"strategy": "facebook"
			},
			"servicesConfig": {
				"oauth": {
					"passportLogin": {
						"facebook": {
							"clientID": "331502413866510",
							"clientSecret": "1a07a7eb9c9884dc5d148106ede830b2",
							"callbackURL": "http://local-widget.com/urac/login/success?mode=facebook"
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
				"_json":
					{
						"first_name": "tony",
						"last_name": "hage",
						"email": "antoine@soajs.org"
					},
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