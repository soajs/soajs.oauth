"use strict";
//const assert = require('assert');
//const requester = require('../../requester');
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
	
	// it("Success - will login - Facebook ", (done) => {
	// 	let params = {};
	// 	let strategy = 'facebook'
	// 	requester('/passport/login/' + strategy, 'get', params, (error, body) => {
	// 		assert.ifError(error);
	// 		assert.ok(body);
	// 		assert.ok(body.data);
	// 		// let check = validator.validate(body, authorizationSchema);
	// 		// assert.deepEqual(check.valid, true);
	// 		// assert.deepEqual(check.errors, []);
	// 		done();
	// 	});
	// });
});
