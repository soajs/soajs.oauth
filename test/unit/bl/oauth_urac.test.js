/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/oauth_urac.js');
const assert = require('assert');

let user = {
	_id: "22d2cb5fc04ce51e06000001",
	userId: "testUserID",
	password: "$2a$04$MobjLIVPLB9Q7hb95QaFoe9ppcwAkvHiksPK57HFmXy09Z8LU6mri",
	tId: "5c0e74ba9acc3c5a84a51259",
	keys: null
};


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
	
	it("getUser", (done) => {
		function MODEL() {
			console.log("oauth model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		MODEL.prototype.getUser = (data, cb) => {
			if (data && data.error) {
				let error = new Error("OAuth: getUser - mongo error.");
				return cb(error, null);
			} else if (data && data.username && data.username === 'notFound') {
				return cb(null, null);
			} else {
				return cb(null, user);
			}
		};
		BL.model = MODEL;
		
		BL.getUser(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {code: 400, msg: 'Business logic required data are missing.'});
			
			let data = {
				username: 'notFound'
			};
			
			BL.getUser(soajs, data, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 401);
				
				let data = {
					error: true
				};
				
				BL.getUser(soajs, data, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 602);
					
					let data = {
						username: 'testUserID',
						password: 'password'
					};
					
					BL.getUser(soajs, data, null, (error, record) => {
						assert.ok(record);
						assert.deepEqual(record.id, '22d2cb5fc04ce51e06000001');
						assert.deepEqual(record.userId, 'testUserID');
						assert.deepEqual(record.tId, '5c0e74ba9acc3c5a84a51259');
						
						let data = {
							username: 'testUserID',
							password: 'notCorrect'
						};
						
						BL.getUser(soajs, data, null, (error) => {
							assert.ok(error);
							assert.deepEqual(error.code, 413);
							done();
						});
					});
				});
			});
		});
	});
});