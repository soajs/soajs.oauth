

"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let deleteRefreshTokenSchema = require('../schemas/deleteRefreshToken');

describe("Testing delete refresh token API", () => {
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it('Fails - refresh token not found', (done) => {
		let params = {
			qs:{
				access_token: '44a5399dcce96325fadfab908e614bf00e6fe967'
			}
		};
		requester('/refreshToken/notFound', 'delete', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.data, {ok: 1, n: 0});
			let check = validator.validate(body, deleteRefreshTokenSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it('Success - refresh token found and deleted', (done) => {
		let params = {
			qs:{
				access_token: '44a5399dcce96325fadfab908e614bf00e6fe967'
			}
		};
		
		let token = 'ddfd5eb42417b480471b4cec06381244658ffc7a';
		
		requester('/refreshToken/' + token, 'delete', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.data, {ok: 1, n: 1});
			let check = validator.validate(body, deleteRefreshTokenSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});





