"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let createTokenSchema = require("../schemas/createToken.js");

let extKey = 'aa39b5490c4a4ed0e56d7ec1232a428f7ad78ebb7347db3fc9875cb10c2bce39bbf8aabacf9e00420afb580b15698c04ce10d659d1972ebc53e76b6bbae0c113bee1e23062800bc830e4c329ca913fefebd1f1222295cf2eb5486224044b4d0c';

describe("Testing create access token API", () => {
	before(function (done) {
		done();
	});

	afterEach((done) => {
		console.log("=======================================");
		done();
	});

	it("Success - will create authorization token", (done) => {
		let params = {
			"noaccesstoken": true,
			"body": {
				"username": 'owner',
				"password": 'password',
				"grant_type": 'password'
			}
		};
		requester('/token', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.token_type);
			assert.deepEqual(body.token_type, 'bearer');
			assert.ok(body.access_token);
			assert.ok(body.expires_in);
			assert.ok(body.refresh_token);
			let check = validator.validate(body, createTokenSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Fails - will not create authorization token - user has pin allowed false", (done) => {
		let params = {
			"noaccesstoken": true,
			"body": {
				"username": 'owner2',
				"password": 'password',
				"grant_type": 'password'
			}
		};
		requester('/token', 'post', params, (error, body) => {
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 503,
				message: 'You do not have privileges to enable pin login'
			}]);
			done();
		});
	});

	it("Success - will create authorization token - oauth login", (done) => {
		let params = {
			"noaccesstoken": true,
			"headers": {
				"key": extKey
			},
			"body": {
				"username": 'user2',
				"password": 'password',
				"grant_type": 'password'
			}
		};
		requester('/token', 'post', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.token_type);
			assert.ok(body.access_token);
			assert.ok(body.expires_in);
			assert.ok(body.refresh_token);

			done();
		});
	});

	it("Success - will create authorization token & refresh it - /token/email /refresh/token", (done) => {
		let params = {
			"noaccesstoken": true,
			"headers": {
				"key": extKey
			},
			"body": {
				"username": 'user2',
				"password": 'password'
			}
		};
		requester('/token/email', 'post', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.token_type);
			assert.ok(body.access_token);
			assert.ok(body.expires_in);
			assert.ok(body.refresh_token);

			let params = {
				"noaccesstoken": true,
				"headers": {
					"key": extKey
				},
				"body": {
					"refresh_token": body.refresh_token,
				}
			};
			requester('/refresh/token', 'post', params, (error, body) => {
				assert.ok(body);
				assert.ok(body.token_type);
				assert.ok(body.access_token);
				assert.ok(body.expires_in);
				assert.ok(body.refresh_token);

				done();
			});
		});
	});

	it.skip("Fails - will not create authorization token - No data", (done) => {
		let params = {
			"noaccesstoken": true
		};
		requester('/token', 'post', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{ code: 172, message: 'Missing required field: grant_type' }]);
			done();
		});
	});
});
