"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let createTokenSchema = require("../schemas/createToken.js");

describe("Testing auto login API", () => {
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
				"unique": true
			}
		};
		requester('/token/auto/5c8d0c505653de3985aa0ffd', 'post', params, (error, body) => {
			assert.ifError(error);
			body = body.data;
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
});
