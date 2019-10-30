"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let createTokenSchema = require("../schemas/createToken.js");

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
	
	it("Success - will not create authorization token - user has pin allowed false", (done) => {
		let params = {
			"noaccesstoken": true,
			"body": {
				"username": 'owner2',
				"password": 'password',
				"grant_type": 'password'
			}
		};
		requester('/token', 'post', params, (error, body) => {
			console.log(error)
			console.log(body)
			done();
		});
	});
	
	it("Fails - will not create authorization token - No data", (done) => {
		let params = {};
		requester('/token', 'post', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{code: 172, message: 'Missing required field: grant_type'}]);
			done();
		});
	});
});