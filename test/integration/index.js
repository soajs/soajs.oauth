"use strict";
const imported = require("../data/import.js");
let helper = require("../helper.js");

describe("starting OAUTH integration tests", () => {
	
	let oauth, controller;
	
	before((done) => {
		let rootPath = process.cwd();
		imported(rootPath + "/test/data/soajs_profile.js", rootPath + "/test/data/integration/", (err, msg) => {
			if (err) {
				console.log(err);
			}
			if (msg) {
				console.log(msg);
			}
			console.log("Starting Controller and OAUTH service");
			controller = require("soajs.controller");
			setTimeout(function () {
				oauth = helper.requireModule('./index');
				setTimeout(function () {
					done();
				}, 5000);
			}, 1000);
		});
	});
	
	it("loading tests", (done) => {
		require('./index/index');
		require('./oauth/index');
		done();
	});
	
	it("loading ldap test", (done) => {
		require('./ldap/index.js');
		done();
	});
});