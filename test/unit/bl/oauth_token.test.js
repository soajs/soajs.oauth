/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/oauth_token.js');
const assert = require('assert');


describe("Unit test for: BL - oauth", () => {
	let soajs = {
		config: {
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
		tenant: {
			id: "5c0e74ba9acc3c5a84a51259",
			main: {
				id: "5d8387fd1873f9079b863da0"
			},
			application: {
				product: "TPROD",
				package: "TPROD_TEST",
			}
		},
		log: {
			error: () => {
				console.log();
			}
		}
	};
	before((done) => {
		done();
	});
	
	after((done) => {
		done();
	});
	
	it("deleteAccessToken", (done) => {
		function MODEL() {
			console.log("oauth model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		MODEL.prototype.delete = (data, cb) => {
			if (data && data.error) {
				let error = new Error("OAuth: deleteAccessToken - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, 1);
			}
		};
		BL.model = MODEL;
		
		BL.deleteAccessToken(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {code: 400, msg: 'Business logic required data are missing.'});
			
			let data = {
				error: true
			};
			
			BL.deleteAccessToken(soajs, data, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 602);
				
				let data = {
					token: 'a64374dc0928ac5da3b1dc7e9bb7cd7a60684eba',
				};
				
				BL.deleteAccessToken(soajs, data, null, (error, record) => {
					assert.deepEqual(record, 0);
					done();
				});
			});
		});
	});
	
	it("deleteRefreshToken", (done) => {
		function MODEL() {
			console.log("oauth model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		MODEL.prototype.delete = (data, cb) => {
			if (data && data.error) {
				let error = new Error("OAuth: deleteRefreshToken - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, 1);
			}
		};
		BL.model = MODEL;
		
		BL.deleteRefreshToken(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {code: 400, msg: 'Business logic required data are missing.'});
			
			let data = {
				error: true
			};
			
			BL.deleteRefreshToken(soajs, data, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 602);
				
				let data = {
					token: 'ddfd5eb42417b480471b4cec06381244658ffc7a',
				};
				
				BL.deleteRefreshToken(soajs, data, null, (error, record) => {
					assert.ok(record);
					done();
				});
			});
		});
	});
	
	it("deleteAllUserRestrictedTokens", (done) => {
		let captured = null;
		function MODEL() {
		}
		MODEL.prototype.closeConnection = () => {
		};
		MODEL.prototype.delete = (data, cb) => {
			captured = data;
			if (data && data.user && data.user.id === "mongoError") {
				return cb(new Error("OAuth: deleteAllUserRestrictedTokens - mongo error."), null);
			}
			return cb(null, 2);
		};
		//NOTE: this one asserts the condition the model is handed, so it needs mp.getModel to
		//		return the stub. put the real modelObj back afterwards, the tests around it use it.
		let realModelObj = BL.modelObj;
		let restore = () => {
			BL.modelObj = realModelObj;
		};
		BL.model = MODEL;
		BL.modelObj = new MODEL();

		BL.deleteAllUserRestrictedTokens(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);

			BL.deleteAllUserRestrictedTokens(soajs, {userId: "mongoError"}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 602);

				BL.deleteAllUserRestrictedTokens(soajs, {userId: "5db2c7414e261a23f8ec2bee"}, null, (error, count) => {
					assert.ifError(error);
					assert.deepEqual(count, 2);
					// the predicate must be restrictedTo, never the tenant login mode
					assert.deepEqual(captured.restricted, true);
					assert.deepEqual(captured.user.id, "5db2c7414e261a23f8ec2bee");
					assert.ok(!Object.hasOwnProperty.call(captured.user, "loginMode"));
					restore();
					done();
				});
			});
		});
	});

	it("deleteAllClientTokens", (done) => {
		function MODEL() {
			console.log("oauth model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		MODEL.prototype.delete = (data, cb) => {
			if (data && data.error) {
				let error = new Error("OAuth: deleteAllClientTokens - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, 1);
			}
		};
		BL.model = MODEL;
		
		BL.deleteAllClientTokens(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {code: 400, msg: 'Business logic required data are missing.'});
			
			let data = {
				error: true
			};
			
			BL.deleteAllClientTokens(soajs, data, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 602);
				
				let data = {
					clientId: 'clientID',
				};
				
				BL.deleteAllClientTokens(soajs, data, null, (error, record) => {
					assert.deepEqual(record, 0);
					done();
				});
			});
		});
	});
	
	it("deleteAllUserTokens", (done) => {
		function MODEL() {
			console.log("oauth model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		MODEL.prototype.delete = (data, cb) => {
			if (data && data.userId && data.userId === 'error') {
				let error = new Error("OAuth: deleteAllUserTokens - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, 1);
			}
		};
		BL.model = MODEL;
		
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
		
		BL.deleteAllUserTokens(soajs, null, options, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {code: 400, msg: 'Business logic required data are missing.'});
			
			let data = {
				userId: 'userId',
			};
			
			BL.deleteAllUserTokens(soajs, data, options, (error, record) => {
				assert.deepEqual(record, 0);
				done();
			});
		});
	});

	it("deleteAllUserDeviceTokens", (done) => {
		function MODEL() {
			console.log("oauth model");
		}

		MODEL.prototype.closeConnection = () => {
		};
		MODEL.prototype.delete = (data, cb) => {
			if (data && data.userId && data.userId === 'error') {
				let error = new Error("OAuth: deleteAllUserDeviceTokens - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, 1);
			}
		};
		BL.model = MODEL;

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

		BL.deleteAllUserDeviceTokens(soajs, null, options, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {code: 400, msg: 'Business logic required data are missing.'});

			let data = {
				userId: 'userId',
				deviceId: 'device-id'
			};

			BL.deleteAllUserDeviceTokens(soajs, data, options, (error, record) => {
				assert.deepEqual(record, 0);
				done();
			});
		});
	});
});
