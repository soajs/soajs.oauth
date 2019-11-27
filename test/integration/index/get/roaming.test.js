"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let roamingSchema = require("../schemas/roaming.js");

describe("Testing Roaming API", () => {
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("Fails - no Roaming in tenant", (done) => {
		let params = {
		};
		requester('/roaming', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.errors.details, [ { code: 404, message: 'Unable to roam the provided request' } ]);
			let check = validator.validate(body, roamingSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - Roaming in tenant but ip is not found", (done) => {
		let params = {
			headers: {
				key: 'e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18'
			}
		};
		requester('/roaming', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.errors.details, [ { code: 404, message: 'Unable to roam the provided request' } ]);
			let check = validator.validate(body, roamingSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Success - Roaming in tenant", (done) => {
		let params = {
			headers: {
				key: 'aa39b5490c4a4ed0e56d7ec1232a428f7ad78ebb7347db3fc9875cb10c2bce39bbf8aabacf9e00420afb580b15698c04ce10d659d1972ebc53e76b6bbae0c113bee1e23062800bc830e4c329ca913fefebd1f1222295cf2eb5486224044b4d0c'
			}
		};
		requester('/roaming', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, roamingSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});