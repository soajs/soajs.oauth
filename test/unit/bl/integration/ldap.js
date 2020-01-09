/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../../helper.js");
const driver = helper.requireModule('./bl/integration/ldap.js');
const integrationLib = helper.requireModule('./bl/integration/lib.js');
const assert = require('assert');

describe("Unit test for: ldap - integration", () => {
	let soajs = {
		"servicesConfig": {
			"oauth": {}
		},
		"log": {
			"error": (msg) => {
				console.log(msg);
			},
			"debug": (msg) => {
				console.log(msg);
			}
		}
	};
	before((done) => {
		integrationLib.loadDrivers();
		done();
	});
	it("test - ldapLogin - error config", (done) => {
		driver.login(soajs, {}, (error) => {
			assert.equal(error.code, "420");
			done();
		});
	});
});