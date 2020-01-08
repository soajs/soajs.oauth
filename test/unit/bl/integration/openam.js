/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../../helper.js");
const driver = helper.requireModule('./bl/integration/openam.js');
const integrationLib = helper.requireModule('./bl/integration/lib.js');
const assert = require('assert');
const nock = require("nock");

describe("Unit test for: openam - integration", () => {
	let soajs = {
		"servicesConfig": {},
		"log": {
			"error": (msg) => {
				console.log(msg);
			},
			"debug": (msg) => {
				console.log(msg);
			}
		}
	};
	before((done) => {
		integrationLib.loadDrivers();
		done();
	});
	
	it("test - openamLogin - error config", function (done) {
		driver.login(soajs, {}, (error) => {
			assert.equal(error.code, "420");
			done();
		});
	});
	it("test - openamLogin - error OpenAM connection", function (done) {
		soajs.servicesConfig.openam = {
			"attributesURL": "https://test.com/openam/identity/json/attributes",
			"attributesMap": [
				{"field": 'sAMAccountName', "mapTo": 'id'},
				{"field": 'sAMAccountName', "mapTo": 'username'},
				{"field": 'mail', "mapTo": 'email'},
				{"field": 'givenname', "mapTo": 'firstName'},
				{"field": 'sn', "mapTo": 'lastName'}
			],
			"timeout": 5000
		};
		let input = {
			"token": "123456"
		};
		nock('https://test.com')
			.post('/openam/identity/json/attributes')
			.query(true) // any params sent
			.replyWithError('something awful happened');
		
		driver.login(soajs, input, (error) => {
			assert.equal(error.code, "710");
			done();
		});
	});
	it("test - openamLogin - Error in body.parse", function (done) {
		soajs.servicesConfig.openam = {
			"attributesURL": "https://test.com/openam/identity/json/attributes",
			"attributesMap": [
				{"field": 'sAMAccountName', "mapTo": 'id'},
				{"field": 'sAMAccountName', "mapTo": 'username'},
				{"field": 'mail', "mapTo": 'email'},
				{"field": 'givenname', "mapTo": 'firstName'},
				{"field": 'sn', "mapTo": 'lastName'}
			],
			"timeout": 5000
		};
		let input = {
			"token": "123456"
		};
		let mockedReply = ''; // sending a string instead of an object
		nock('https://test.com')
			.post('/openam/identity/json/attributes')
			.query(true) // any params sent
			.reply(200, mockedReply);
		
		driver.login(soajs, input, (error) => {
			assert.equal(error.code, "713");
			done();
		});
	});
	it("test - openamLogin", function (done) {
		soajs.servicesConfig.openam = {
			"attributesURL": "https://test.com/openam/identity/json/attributes",
			"attributesMap": [
				{"field": 'sAMAccountName', "mapTo": 'id'},
				{"field": 'sAMAccountName', "mapTo": 'username'},
				{"field": 'mail', "mapTo": 'email'},
				{"field": 'givenname', "mapTo": 'firstName'},
				{"field": 'sn', "mapTo": 'lastName'}
			],
			"timeout": 5000
		};
		let input = {
			"token": "123456"
		};
		let mockedReply = {
			attributes: [
				{name: 'sAMAccountName', values: ['etienz']},
				{name: 'mail', values: ['mail@mail.com']},
				{name: 'givenname', values: ['antoine']},
				{name: 'sn', values: ['hage']}
			]
		};
		nock('https://test.com')
			.post('/openam/identity/json/attributes')
			.query(true) // any params sent
			.reply(200, mockedReply);
		
		driver.login(soajs, input, (error, record) => {
			assert.equal(record.lastName, 'hage');
			done();
		});
	});
});