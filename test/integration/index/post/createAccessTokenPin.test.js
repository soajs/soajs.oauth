"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let createTokenPinSchema = require("../schemas/createTokenPin.js");

describe("Testing create access token with pin API", () => {
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("Success - will create authorization token pin", (done) => {
		let params = {
			body: {
				pin: '1235',
				grant_type: 'password'
			}
		};
		requester('/pin', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.token_type);
			assert.deepEqual(body.token_type, 'bearer');
			assert.ok(body.access_token);
			assert.ok(body.expires_in);
			assert.ok(body.refresh_token);
			let check = validator.validate(body, createTokenPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not create authorization token pin- No data", (done) => {
		let params = {
		};
		requester('/pin', 'post', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [ { code: 172, message: 'Missing required field: grant_type' } ]);
			done();
		});
	});
});