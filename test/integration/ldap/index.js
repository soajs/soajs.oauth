/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../helper.js");
const driver = helper.requireModule('./bl/integration/ldap.js');
const integrationLib = helper.requireModule('./bl/integration/lib.js');
const assert = require('assert');

describe("Integration test for: ldap", () => {
	let soajs = {
		"meta": core.meta,
		"tenant": {
			"code": "TES0",
			"id": "5c0e74ba9acc3c5a84a51259"
		},
		"servicesConfig": {
			"oauth": {}
		},
		"registry": {
			"tenantMetaDB": {
				"urac": {
					"prefix": "",
					"cluster": "test_cluster",
					"name": "#TENANT_NAME#_urac",
					"servers": [
						{
							"host": "127.0.0.1",
							"port": 27017
						}
					],
					"credentials": null,
					"streaming": {
						"batchSize": 1000
					},
					"URLParam": {
						"bufferMaxEntries": 0
					},
					"timeConnected": 1552747598093
				}
			}
		},
		"log": {
			"error": (msg) => {
				console.log(msg);
			},
			"debug": (msg) => {
				console.log(msg);
			}
		},
		"config": helper.requireModule("./config.js")
	};
	
	// initiate the server with the following configuration
	// the test cases are simulated vice versa, since the service configuration is static
	let serverConfig = {
		host: '127.0.0.1',
		port: 10389,
		baseDN: 'ou=users,ou=system',
		adminUser: 'uid=admin, ou=system',
		adminPassword: 'secret'
	};
	// wrong admin password
	let serverConfig2 = {
		host: '127.0.0.1',
		port: 10389,
		baseDN: 'ou=users,ou=system',
		adminUser: 'uid=admin, ou=system',
		adminPassword: 'secret2'
	};
	// wrong admin user
	let serverConfig3 = {
		host: '127.0.0.1',
		port: 10389,
		baseDN: 'ou=users,ou=system',
		adminUser: 'uid=admin2, ou=system',
		adminPassword: 'secret'
	};
	
	
	before((done) => {
		integrationLib.loadDrivers();
		done();
	});
	
	it("test - ldapLogin - with the correct credentials", (done) => {
		soajs.servicesConfig.oauth.ldapServer = {
			host: 'ldap://127.0.0.1',
			port: 10389,
			baseDN: 'ou=users,ou=system',
			adminUser: 'uid=admin, ou=system',
			adminPassword: 'secret'
		};
		let ldapServer = require('./ldapServer.js');
		ldapServer.startServer(serverConfig, (server) => {
			let data = {
				"username": "owner",
				"password": "password"
			};
			driver.login(soajs, data, (error, record) => {
				assert.equal(record.email, 'antoine@soajs.org');
				ldapServer.killServer(server);
				done();
			});
		});
	});
	it("test - ldapLogin - with the wrong password", (done) => {
		soajs.servicesConfig.oauth.ldapServer = {
			host: 'ldap://127.0.0.1',
			port: 10389,
			baseDN: 'ou=users,ou=system',
			adminUser: 'uid=admin, ou=system',
			adminPassword: 'secret'
		};
		let ldapServer = require('./ldapServer.js');
		ldapServer.startServer(serverConfig, (server) => {
			let data = {
				"username": "owner",
				"password": "passw"
			};
			driver.login(soajs, data, (error) => {
				assert.equal(error.code, '703');
				ldapServer.killServer(server);
				done();
			});
		});
	});
	it("test - ldapLogin - with the wrong adminPassword in provision information", (done) => {
		soajs.servicesConfig.oauth.ldapServer = {
			host: 'ldap://127.0.0.1',
			port: 10389,
			baseDN: 'ou=users,ou=system',
			adminUser: 'uid=admin, ou=system',
			adminPassword: 'secret'
		};
		let ldapServer = require('./ldapServer.js');
		ldapServer.startServer(serverConfig2, (server) => {
			let data = {
				"username": "owner",
				"password": "password"
			};
			driver.login(soajs, data, (error) => {
				assert.equal(error.code, '702');
				ldapServer.killServer(server);
				done();
			});
		});
	});
	it("test - ldapLogin - with the wrong adminUser in provision information", (done) => {
		soajs.servicesConfig.oauth.ldapServer = {
			host: 'ldap://127.0.0.1',
			port: 10389,
			baseDN: 'ou=users,ou=system',
			adminUser: 'uid=admin, ou=system',
			adminPassword: 'secret'
		};
		let ldapServer = require('./ldapServer.js');
		ldapServer.startServer(serverConfig3, (server) => {
			let data = {
				"username": "owner",
				"password": "password"
			};
			driver.login(soajs, data, (error) => {
				assert.equal(error.code, '701');
				ldapServer.killServer(server);
				done();
			});
		});
	});
	it("test - ldapLogin - with no ldap ON", (done) => {
		soajs.servicesConfig.oauth.ldapServer = {
			host: 'ldap://127.0.0.1',
			port: 10389,
			baseDN: 'ou=users,ou=system',
			adminUser: 'uid=admin, ou=system',
			adminPassword: 'secret'
		};
		let data = {
			"username": "owner",
			"password": "password"
		};
		driver.login(soajs, data, (error) => {
			assert.equal(error.code, '700');
			done();
		});
	});
});