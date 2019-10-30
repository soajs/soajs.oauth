"use strict";
const imported = require("../data/import.js");

describe("Starting OAUTH Unit test", () => {
	
	before((done) => {
		console.log ("Import unit test data for oauth");
		let rootPath = process.cwd();
		imported(rootPath + "/test/data/soajs_profile.js", rootPath + "/test/data/unit/", (err, msg) => {
			if (err) {
				console.log(err);
			}
			if (msg) {
				console.log(msg);
			}
			done();
		});
	});
	
	it("Testing all models", (done) => {
		require('./model/mongo/oauth.test');
		done();
	});
	
	it("Testing all bls", (done) => {
		require('./bl/index.test');
		require('./bl/oauth.test');
		done();
	});
	
	after((done) => {
		done();
	});
});