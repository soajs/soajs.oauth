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
const async = require('async');

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
	let stubDriverError;
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
						"useUnifiedTopology": true
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
								"useUnifiedTopology": true
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
			"oauth": {}
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
	
	before((done) => {
		BL.init(soajs, soajs.config, () => {
			done();
		});
	});
	
	afterEach((done) => {
		sinon.restore();
		done();
	});
	
	after((done) => {
		BL.init(soajs, soajs.config, () => {
			done();
		});
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
					
					
					BL.oauth_urac.modelObj = {
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
	
	it("Fails - getUserRecord", (done) => {
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
		stubDriverError = sinon.stub(uracDriver, 'login').yields(true, null);
		
		let data = {
			"username": "owner",
			"password": "password"
		};
		
		BL.getUserRecord(soajs, data, options, (err) => {
			assert.ok(err);
			done();
		});
		
	});
	
	it("restrictedGuestLogin - mints a token for a guest", (done) => {
		let stored = null;
		let options = {
			"provision": {
				"generateSaveAccessToken": (record, req, ttl, cb) => {
					stored = record;
					return cb(null, {
						"token_type": "bearer",
						"access_token": "a token",
						"expires_in": ttl || 7200
					});
				}
			}
		};
		let inputmaskData = {
			"username": "guest@localhost.com",
			"tenant": {
				"id": "5c0e74ba9acc3c5a84a51259",
				"code": "DBTN"
			},
			"claims": {
				"displayName": "A Guest",
				"meetingId": "meeting-1"
			},
			"deviceId": "web-device-1",
			"agent": "a browser user agent",
			"ttl": 900,
			"restrictedTo": {
				"tenant": "5c0e74ba9acc3c5a84a51260",
				"product": "PRODWEB"
			}
		};

		BL.restrictedGuestLogin({ "soajs": soajs }, inputmaskData, options, (err, data) => {
			assert.ifError(err);
			assert.ok(data);
			assert.deepEqual(data.access_token, "a token");
			assert.deepEqual(data.expires_in, 900);
			assert.ok(!data.refresh_token);

			assert.ok(stored);
			assert.deepEqual(stored.username, "guest@localhost.com");
			assert.deepEqual(stored.tenant.id, "5c0e74ba9acc3c5a84a51259");
			assert.deepEqual(stored.loginMode, "oauth");
			assert.deepEqual(stored.guest, true);
			assert.deepEqual(stored.displayName, "A Guest");
			assert.deepEqual(stored.meetingId, "meeting-1");
			assert.deepEqual(stored.deviceId, "web-device-1");
			assert.deepEqual(stored.agent, "a browser user agent");
			assert.deepEqual(stored.id, stored._id.toString());
			done();
		});
	});

	it("restrictedGuestLogin - the restriction round trips onto the record", (done) => {
		let stored = null;
		let options = {
			"provision": {
				"generateSaveAccessToken": (record, req, ttl, cb) => {
					stored = record;
					return cb(null, { "access_token": "a token" });
				}
			}
		};
		let restrictedTo = {
			"tenant": ["5c0e74ba9acc3c5a84a51260", "5c0e74ba9acc3c5a84a51261"],
			"product": "PRODWEB",
			"env": "dev"
		};
		let inputmaskData = {
			"username": "guest@localhost.com",
			"tenant": { "id": "5c0e74ba9acc3c5a84a51259" },
			"restrictedTo": restrictedTo
		};

		BL.restrictedGuestLogin({ "soajs": soajs }, inputmaskData, options, (err) => {
			assert.ifError(err);
			assert.deepEqual(stored.restrictedTo, restrictedTo);
			done();
		});
	});

	it("restrictedGuestLogin - the _id is generated and not caller controllable", (done) => {
		let ids = [];
		let options = {
			"provision": {
				"generateSaveAccessToken": (record, req, ttl, cb) => {
					ids.push(record._id.toString());
					return cb(null, { "access_token": "a token" });
				}
			}
		};
		let inputmaskData = {
			"username": "guest@localhost.com",
			"tenant": { "id": "5c0e74ba9acc3c5a84a51259" },
			"restrictedTo": { "tenant": "5c0e74ba9acc3c5a84a51260" }
		};

		BL.restrictedGuestLogin({ "soajs": soajs }, inputmaskData, options, (err) => {
			assert.ifError(err);
			BL.restrictedGuestLogin({ "soajs": soajs }, inputmaskData, options, (err) => {
				assert.ifError(err);
				assert.deepEqual(ids.length, 2);
				assert.ok(ids[0] !== ids[1]);
				assert.ok(/^[0-9a-f]{24}$/.test(ids[0]));
				done();
			});
		});
	});

	it("Fails - restrictedGuestLogin - a reserved field in claims", (done) => {
		let minted = false;
		let options = {
			"provision": {
				"generateSaveAccessToken": (record, req, ttl, cb) => {
					minted = true;
					return cb(null, { "access_token": "a token" });
				}
			}
		};
		let reserved = ["_id", "id", "username", "tenant", "loginMode", "guest", "restrictedTo", "deviceId", "agent"];

		async.eachSeries(reserved, (field, next) => {
			let claims = {};
			claims[field] = "whatever the caller wants";
			let inputmaskData = {
				"username": "guest@localhost.com",
				"tenant": { "id": "5c0e74ba9acc3c5a84a51259" },
				"claims": claims,
				"restrictedTo": { "tenant": "5c0e74ba9acc3c5a84a51260" }
			};

			BL.restrictedGuestLogin({ "soajs": soajs }, inputmaskData, options, (err) => {
				assert.ok(err);
				assert.deepEqual(err.code, 417, "expected 417 for claims." + field);
				return next();
			});
		}, () => {
			assert.deepEqual(minted, false);
			done();
		});
	});

	it("Fails - restrictedGuestLogin - claims cannot override guest", (done) => {
		let stored = null;
		let options = {
			"provision": {
				"generateSaveAccessToken": (record, req, ttl, cb) => {
					stored = record;
					return cb(null, { "access_token": "a token" });
				}
			}
		};
		let inputmaskData = {
			"username": "guest@localhost.com",
			"tenant": { "id": "5c0e74ba9acc3c5a84a51259" },
			"claims": { "guest": false, "loginMode": "urac" },
			"restrictedTo": { "tenant": "5c0e74ba9acc3c5a84a51260" }
		};

		BL.restrictedGuestLogin({ "soajs": soajs }, inputmaskData, options, (err) => {
			assert.ok(err);
			assert.deepEqual(err.code, 417);
			assert.deepEqual(stored, null);

			//NOTE: the mint sets guest itself, on a record built from claims it did accept.
			//		nothing a caller sends can turn it off, either by being rejected above or by
			//		being merged before the fields the mint sets.
			inputmaskData.claims = { "displayName": "A Guest" };
			BL.restrictedGuestLogin({ "soajs": soajs }, inputmaskData, options, (err) => {
				assert.ifError(err);
				assert.deepEqual(stored.guest, true);
				assert.deepEqual(stored.loginMode, "oauth");
				assert.deepEqual(stored.displayName, "A Guest");
				done();
			});
		});
	});

	it("Fails - restrictedGuestLogin - no inputmaskData", (done) => {
		BL.restrictedGuestLogin({ "soajs": soajs }, null, {}, (err) => {
			assert.ok(err);
			assert.deepEqual(err.code, 400);
			done();
		});
	});

	it("Fails - restrictedGuestLogin - a tenant with no id", (done) => {
		let minted = false;
		let options = {
			"provision": {
				"generateSaveAccessToken": (record, req, ttl, cb) => {
					minted = true;
					return cb(null, { "access_token": "a token" });
				}
			}
		};
		let inputmaskData = {
			"username": "guest@localhost.com",
			"tenant": { "code": "DBTN" },
			"restrictedTo": { "tenant": "5c0e74ba9acc3c5a84a51260" }
		};

		BL.restrictedGuestLogin({ "soajs": soajs }, inputmaskData, options, (err) => {
			assert.ok(err);
			assert.deepEqual(err.code, 416);
			assert.deepEqual(minted, false);

			//NOTE: username is asserted the same way, a record without it falls to the generic
			//		branch of getProfile and the service receives the whole record under profile.
			delete inputmaskData.username;
			inputmaskData.tenant = { "id": "5c0e74ba9acc3c5a84a51259" };

			BL.restrictedGuestLogin({ "soajs": soajs }, inputmaskData, options, (err) => {
				assert.ok(err);
				assert.deepEqual(err.code, 416);
				assert.deepEqual(minted, false);
				done();
			});
		});
	});

	it("Fails - getUserRecordByPin", (done) => {
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
		stubDriverError = sinon.stub(uracDriver, 'loginByPin').yields(true, null);
		
		let data = {
			"username": "owner",
			"password": "password"
		};
		
		BL.getUserRecordByPin(soajs, data, options, (err) => {
			assert.ok(err);
			done();
		});
		
	});
	
});
