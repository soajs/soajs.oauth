"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let deleteUserTokensSchema = require('../schemas/deleteUserTokens');

describe("Testing delete user device tokens API", () => {
	before(function (done) {
		done();
	});

	afterEach((done) => {
		console.log("=======================================");
		done();
	});

	let userId = '5db2c7414e261a23f8ec2bee';

	it('Fails - user tokens not found', (done) => {
		let params = {
			qs: {
				access_token: '44a5399dcce96325fadfab908e614bf00e6fe967'
			}
		};
		requester('/tokens/user/notFound/device/device-abc', 'delete', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.data, 0);
			let check = validator.validate(body, deleteUserTokensSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it('Fails - user found but device does not match', (done) => {
		let params = {
			qs: {
				access_token: '44a5399dcce96325fadfab908e614bf00e6fe967'
			}
		};
		requester('/tokens/user/' + userId + '/device/wrong-device', 'delete', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.data, 0);
			let check = validator.validate(body, deleteUserTokensSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it('Success - user and device found and tokens deleted', (done) => {
		let params = {
			qs: {
				access_token: '44a5399dcce96325fadfab908e614bf00e6fe967'
			}
		};
		requester('/tokens/user/' + userId + '/device/device-abc', 'delete', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.data, 1);
			let check = validator.validate(body, deleteUserTokensSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});
