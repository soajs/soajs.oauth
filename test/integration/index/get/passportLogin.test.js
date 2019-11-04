"use strict";
const assert = require('assert');
const requester = require('../../requester');
// let core = require('soajs').core;
// let validator = new core.validator.Validator();
// let getGroupSchema = require("../schemas/getGroup.js");

describe("Testing Passport Login API", () => {
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("Success - will login - Azure ", (done) => {
		let params = {
		};
		let strategy = 'azure';
		requester('/passport/login/' + strategy, 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			console.log(body, 'flag')
			// assert.ok(body.data);
			// let check = validator.validate(body, authorizationSchema);
			// assert.deepEqual(check.valid, true);
			// assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it.skip("Success - will validate the login - Azure ", (done) => {
		let params = {
			oauth_token: "",
			oauth_verifier: ""
		};
		let strategy = 'azure';
		requester('/passport/login/' + strategy, 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			// assert.ok(body.data);
			// let check = validator.validate(body, authorizationSchema);
			// assert.deepEqual(check.valid, true);
			// assert.deepEqual(check.errors, []);
			done();
		});
	});
});
