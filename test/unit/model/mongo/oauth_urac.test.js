"use strict";
const helper = require("../../../helper.js");
const Model = helper.requireModule('./model/mongo/oauth_urac.js');
const assert = require('assert');

describe("Starting OAUTH model Unit test", () => {
	let modelObj;
	let service = {
		config: {
			"errors": {},
		},
		log: {
			error: () => {
				console.log();
			},
			debug: () => {
				console.log();
			}
		},
		registry: {
			get: () => {
				return {
					coreDB: {
						provision: {
							"name": "core_provision",
							"prefix": '',
							"servers": [
								{
									"host": "127.0.0.1",
									"port": 27017
								}
							],
							"credentials": null,
							"URLParam": {
							}
						}
					}
				};
			}
		}
	};
	
	describe("Testing oauth no instance", () => {
		before((done) => {
			modelObj = new Model(service);
			done();
		});
		
		afterEach((done) => {
			done();
		});
	});
	
	describe("Testing oauth with db config", () => {
		before((done) => {
			modelObj = new Model(service, {
				"name": "core_provision",
				"prefix": '',
				"servers": [
					{
						"host": "127.0.0.1",
						"port": 27017
					}
				],
				"credentials": null,
				"URLParam": {
					"useUnifiedTopology": true
				}
			}, null);
			done();
		});
		
		afterEach((done) => {
			done();
		});
		
		it("Success - validateId", (done) => {
			modelObj.validateId('5d7bad57b06cdd344d81b5ed', (err, id) => {
				assert.ok(id);
				done();
			});
		});
		
		it("Fails -  null validateId", (done) => {
			modelObj.validateId(null, (err, id) => {
				assert.ok(err);
				assert.deepEqual(id, null);
				done();
			});
		});
		
		it("Fails - validateId", (done) => {
			modelObj.validateId(123, (err, id) => {
				assert.ok(err);
				assert.deepEqual(id, null);
				done();
			});
		});
		
		it("Success - getUser", (done) => {
			let data = {
				username: 'testUserID'
			};
			modelObj.getUser(data, (err, record) => {
				assert.ok(record);
				assert.deepEqual(record.userId, 'testUserID');
				done();
			});
		});
		
		it("Fails - getUser - Null data", (done) => {
			modelObj.getUser(null, (err) => {
				assert.ok(err);
				assert.deepEqual(err, new Error("(username is required."));
				done();
			});
		});
		
		it("Fails - getUser - empty data", (done) => {
			modelObj.getUser({}, (err) => {
				assert.ok(err);
				assert.deepEqual(err, new Error("(username is required."));
				done();
			});
		});
		
		it("Success - closeConnection", (done) => {
			modelObj.closeConnection();
			done();
		});
	});
});
