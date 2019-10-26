

"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let deleteUserTokensSchema = require('../schemas/deleteUserTokens');

describe("Testing delete user tokens API", () => {
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it('Fails - user tokens not found', (done) => {
		let params = {
			qs:{
				access_token: '44a5399dcce96325fadfab908e614bf00e6fe967'
			}
		};
		requester('/tokens/user/notFound', 'delete', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			console.log(body, body.errors)
			assert.deepEqual(body.data, {ok: 1, n: 0});
			let check = validator.validate(body, deleteUserTokensSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it.skip('Success - user found and tokens deleted', (done) => {
		let params = {
			qs:{
				access_token: '44a5399dcce96325fadfab908e614bf00e6fe967'
			}
		};
		
		let userId = '5db2c7414e261a23f8ec2be9';
		
		requester('/tokens/user/' + userId, 'delete', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.data, {ok: 1, n: 1});
			let check = validator.validate(body, deleteUserTokensSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});





