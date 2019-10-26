"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
// let getGroupSchema = require("../schemas/getGroup.js");

describe("Testing authorization API", () => {
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
});
