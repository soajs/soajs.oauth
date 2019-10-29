/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/index.js');
const assert = require('assert');
const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const uracDriver = require("soajs.urac.driver");
const sinon = require('sinon');

let user = {
	_id: "5c8d0c505653de3985aa0ffd",
	locked: true,
	username: "owner",
	password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
	firstName: "owner3",
	lastName: "owner",
	email: "me@localhost.com",
	ts: 1552747600152,
	status: "active",
	profile: {},
	groups: [
		"owner"
	],
	config: {
		packages: {},
		keys: {},
		allowedTenants: []
	},
	tenant: {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "DBTN",
		pin: {
			code: "1235",
			allowed: true
		}
	}
};
let user2 = {
	_id: "ID",
	userId: "testUserID",
	loginMode: "oauth",
	password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
	tId: "5c0e74ba9acc3c5a84a51259",
	keys: null
};

describe("Unit test for: BL - oauth", () => {
	let stubDriver;
	let soajs = {
		"meta": core.meta,
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
			},
			get: () => {
				return {
					"coreDB": {
						"provision": {
							"name": "core_provision",
							"prefix": "",
							"servers": [
								{
									"host": "127.0.0.1",
									"port": 27017
								}
							],
							"credentials": null,
							"URLParam": {
								"poolSize": 5,
								"autoReconnect": true
							}
						}
					}
				};
			}
		},
		"config": {
			"errors": {
				400: "Business logic required data are missing.",
				401: "Unable to log in the user. User not found.",
				403: "User does not have access to this tenant",
				
				406: "Missing Tenant secret",
				
				413: "Problem with the provided password.",
				
				450: "You do not have privileges to enable pin login",
				451: "Pin login is not available for this account",
				
				600: "Error in generating oAUth Token.",
				601: "Model not found.",
				602: "Model error: "
			}
		},
		"tenant": {
			"id": "5c0e74ba9acc3c5a84a51259",
			"code": "DBTN",
			"application": {
				"product": "DSBRD",
				"package": "DSBRD_GUEST"
			}
		},
		"servicesConfig": {
			"urac": {
				"hashIterations": 1024,
				"seedLength": 32,
				"tokenExpiryTTL": 172800000,
				"validateJoin": true
			},
		},
		"log": {
			error: () => {
				console.log();
			},
			debug: () => {
				console.log();
			}
		}
	};
	
	beforeEach((done) => {
		let localConfig = helper.requireModule("config.js");
		BL.init(soajs, localConfig, () => {
			done();
		});
	});
	
	afterEach((done) => {
		sinon.restore();
		done();
	});
	
	it("authorization", (done) => {
		let options = {
			"provision": {
				"getTenantOauth": (input, cb) => {
					return cb(null, {
						"secret": "this is a secret",
						"pin": {
							"DSBRD": {
								"enabled": false
							}
						},
						"disabled": 0,
						"type": 2,
						"loginMode": "urac"
					});
				}
			}
		};
		
		let notValidOptions = {
			"provision": {
				"getTenantOauth": (input, cb) => {
					return cb(null, {
						"pin": {
							"DSBRD": {
								"enabled": false
							}
						},
						"disabled": 0,
						"type": 2,
						"loginMode": "urac"
					});
				}
			}
		};
		
		BL.authorization(soajs, null, notValidOptions, (err) => {
			assert.ok(err);
			
			BL.authorization(soajs, null, options, (err, record) => {
				assert.ok(record);
				done();
			});
		});
	});
	
	it("getUserRecordByPin", (done) => {
		let options = {
			"provision": {
				"getTenantOauth": (input, cb) => {
					return cb(null, {
						"secret": "this is a secret",
						"pin": {
							"DSBRD": {
								"enabled": false
							}
						},
						"disabled": 0,
						"type": 2,
						"loginMode": "urac"
					});
				}
			}
		};
		let notValidOptions = {
			"provision": {
				"getTenantOauth": (input, cb) => {
					return cb(null, {
						"pin": {
							"DSBRD": {
								"enabled": false
							}
						},
						"disabled": 0,
						"type": 2,
					});
				}
			}
		};
		
		stubDriver = sinon.stub(uracDriver, 'loginByPin').yields(null, user);
		
		BL.getUserRecordByPin(soajs, null, options, (err) => {
			assert.ok(err);
			assert.deepEqual(err.code, 400);
			
			let data = {
				"pin": "1235"
			};
			
			BL.getUserRecordByPin(soajs, data, notValidOptions, (err) => {
				assert.ok(err);
				
				let data = {
					"pin": "1235"
				};
				
				BL.getUserRecordByPin(soajs, data, options, (err, record) => {
					assert.ok(record);
					assert.deepEqual(record.id, '5c8d0c505653de3985aa0ffd');
					done();
				});
			});
		});
	});
	
	it("getUserRecord", (done) => {
		let options = {
			"provision": {
				"getTenantOauth": (input, cb) => {
					return cb(null, {
						"secret": "this is a secret",
						"pin": {
							"DSBRD": {
								"enabled": true
							}
						},
						"disabled": 0,
						"type": 2,
						"loginMode": "urac"
					});
				}
			}
		};
		let oauthOptions = {
			"provision": {
				"getTenantOauth": (input, cb) => {
					return cb(null, {
						"secret": "this is a secret",
						"pin": {
							"DSBRD": {
								"enabled": true
							}
						},
						"disabled": 0,
						"type": 2,
						"loginMode": "oauth"
					});
				}
			}
		};
		let notValidOptions = {
			"provision": {
				"getTenantOauth": (input, cb) => {
					return cb(null, {
						"pin": {
							"DSBRD": {
								"enabled": false
							}
						},
						"disabled": 0,
						"type": 2,
					});
				}
			}
		};
		
		stubDriver = sinon.stub(uracDriver, 'login').yields(null, user);
		
		BL.getUserRecord(soajs, null, options, (err) => {
			assert.ok(err);
			assert.deepEqual(err.code, 400);
			
			let data = {
				"username": "owner",
				"password": "password"
			};
			
			BL.getUserRecord(soajs, data, notValidOptions, (err) => {
				assert.ok(err);
				
				let data = {
					"username": "owner",
					"password": "password"
				};
				
				BL.getUserRecord(soajs, data, options, (err, record) => {
					assert.ok(record);
					assert.deepEqual(record.id, '5c8d0c505653de3985aa0ffd');
					assert.deepEqual(record.username, 'owner');
					assert.deepEqual(record.email, 'me@localhost.com');
					
					
					BL.oauth.modelObj = {
						closeConnection: () => {
						},
						getUser: (data, cb) => {
							return cb(null, user2);
						}
					};
					
					let data = {
						"username": "testUserID",
						"password": "password"
					};
					
					BL.getUserRecord(soajs, data, oauthOptions, (err, record) => {
						assert.ok(record);
						done();
					});
				});
			});
		});
	});
	
	it.skip("passportLogin", (done) => {
		let req = {
			"soajs": {
				"inputmaskData": {
					"strategy": 'facebook'
				},
				"servicesConfig": {
					"urac": {
						"passportLogin": {
							"facebook": {
								"clientID": 'FACEBOOK_CLIENT_ID',
								"clientSecret": 'FACEBOOK_CLIENT_SECRET',
								"callbackURL": "http://local-widget.com/urac/login/success?mode=facebook"
							}
						}
					},
				},
			}
		};
		BL.passportLogin(req, {}, null, (err, record) => {
			console.log(record, err);
			assert.ok(record);
			done();
		});
	});
	
});