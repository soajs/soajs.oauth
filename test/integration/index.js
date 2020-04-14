"use strict";
const imported = require("../data/import.js");
let helper = require("../helper.js");

describe("starting OAUTH integration tests", () => {
	
	let controller, service;
	
	before((done) => {
		let rootPath = process.cwd();
		imported(rootPath + "/test/data/soajs_profile.js", rootPath + "/test/data/integration/", (err, msg) => {
			if (err) {
				console.log(err);
			}
			if (msg) {
				console.log(msg);
			}
			console.log("Starting Controller ...");
			let c_path = require.resolve("soajs.controller");
			c_path = c_path.replace("/index.js", "/_index.js");
			controller = require(c_path);
			controller.runService(() => {
				console.log("Starting OAUTH ...");
				service = helper.requireModule('./_index.js');
				service.runService(() => {
					setTimeout(function () {
						done();
					}, 5000);
				});
			});
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