/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../../../helper.js");
const driver = helper.requireModule('./bl/integration/drivers/azure.js');
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
							"groups": ["maingroup"],
							"clientID": "ffsdsdddf-esdd-4347-sdd3a-ec9fdsdse4a",
							"clientSecret": "sdSpS8FLeUvc0UBs_z8m4f89",
							"callbackURL": "http://local-widget.com/urac/login/success",
							"tenant": "soajs.onmicrosoft.com",
							"useCommonEndpoint": "https://login.microsoftonline.com/dddd-fd08-4fa0-dddd-8e43dddd12273e79"
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
				"given_name": "antoine",
				"family_name": "hage",
				"email": "antoine@soajs.org",
				"oid": "123456789"
			}
		};
		driver.mapProfile(user, (error, profile) => {
			assert.ok(profile);
			assert.equal(profile.email, "antoine@soajs.org");
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