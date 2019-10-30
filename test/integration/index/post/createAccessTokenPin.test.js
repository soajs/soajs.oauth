"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let createTokenPinSchema = require("../schemas/createTokenPin.js");

let extKey = 'e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18';

describe("Testing create access token with pin API", () => {
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	let accessToken;
	
	it("Success - will create authorization token pin - main tenant owner 2 user", (done) => {
		let params = {
			"noaccesstoken": true,
			"body": {
				pin: '1239',
				grant_type: 'password'
			}
		};
		requester('/pin', 'post', params, (error, body) => {
			console.log(error)
			console.log(body)
			done();
		});
	});
	
	it("Success - will create authorization token pin - main tenant user", (done) => {
		let params = {
			"body": {
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
	
	it("Success - will create authorization token", (done) => {
		let params = {
			"noaccesstoken": true,
			"headers": {
				key: extKey
			},
			"body": {
				username: 'johnd',
				password: 'password',
				grant_type: 'password'
			}
		};
		requester('/token', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			process.exit(2);
			assert.ok(body.token_type);
			assert.deepEqual(body.token_type, 'bearer');
			assert.ok(body.access_token);
			accessToken = body.access_token;
			assert.ok(body.expires_in);
			assert.ok(body.refresh_token);
			done();
		});
	});
	
	it("Success - will create authorization token pin - sub tenant - user sub 1", (done) => {
		let params = {
			"noaccesstoken": true,
			headers: {
				key: extKey,
				access_token: accessToken
			},
			body: {
				pin: '5678',
				grant_type: 'password'
			}
		};
		requester('/pin', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			console.log(body.errors, 'erora')
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
	
	it.skip("Success - will create authorization token pin - sub tenant - user 2", (done) => {
		let params = {
			headers: {
				key: 'e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18',
				access_token: accessToken
			},
			body: {
				pin: '1932',
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
		let params = {};
		requester('/pin', 'post', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{code: 172, message: 'Missing required field: grant_type'}]);
			done();
		});
	});
});