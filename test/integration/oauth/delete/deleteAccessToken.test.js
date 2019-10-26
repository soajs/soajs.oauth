"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let deleteAccessTokenSchema = require('../schemas/deleteAccessToken');

describe("Testing delete access token API", () => {
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it('Fails - access token not found', (done) => {
		requester('/accessToken/notFound', 'delete', {}, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.data, {ok: 1, n: 0});
			let check = validator.validate(body, deleteAccessTokenSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it('Success - access token found and deleted', (done) => {
		let token = '44a5399dcce96325fadfab908e614bf00e6fe967';
		
		requester('/accessToken/' + token, 'delete', {}, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.data, {ok: 1, n: 1});
			let check = validator.validate(body, deleteAccessTokenSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});





