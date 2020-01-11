/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../../../helper.js");
const driver = helper.requireModule('./bl/integration/drivers/twitter.js');
const assert = require('assert');

describe("Unit test for: driver - twitter", () => {
	let req = {
		"session": {},
		"soajs": {
			"inputmaskData": {
				"strategy": "twitter",
				"oauth_token": "TTTTT",
				"oauth_verifier": "VVVVV"
			},
			"servicesConfig": {
				"oauth": {
					"passportLogin": {
						"twitter": {
							"groups": ["maingroup"],
							"clientID": "qywH8YMduIsKA2RRlUkS50kCZ",
							"clientSecret": "aodnXVCBijQcS8sJrcLM3ULgCl9VEoqqwu00XgamRUv5qm8bF1",
							"callbackURL": "http://local-widget.com/urac/login/success",
							"userProfileURL": "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
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
				"displayName": "antoine",
				"username": "ahage",
				"id": "123456789"
			}
		};
		driver.mapProfile(user, (error, profile) => {
			assert.ok(profile);
			assert.equal(profile.email, "ahage@twitter.com");
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
	it("test - preAuthenticate", (done) => {
		driver.preAuthenticate(req, () => {
			assert.equal(req.session['oauth:twitter'].oauth_token, "TTTTT");
			done();
		});
	});
});