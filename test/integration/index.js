"use strict";
const imported = require("../data/import.js");
let helper = require("../helper.js");

describe("starting OAUTH integration tests", () => {
	
	let controller, service;
	
	before((done) => {
		let rootPath = process.cwd();
		process.env.SOAJS_IMPORTER_DROPDB = true;
		imported.runPath(rootPath + "/test/data/soajs_profile.js", rootPath + "/test/data/integration/", true, null, (err, msg) => {
			if (err) {
				console.log(err);
			}
			if (msg) {
				console.log(msg);
			}
			console.log("Starting Controller ...");
			controller = require("soajs.controller/_index.js");
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
	
	it.skip("loading ldap test", (done) => {
		require('./ldap/index.js');
		done();
	});
});