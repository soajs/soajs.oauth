"use strict";
const imported = require("../data/import.js");

describe("Starting OAUTH Unit test", () => {
	
	before((done) => {
		console.log("Import unit test data for oauth");
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
		require('./model/mongo/oauth_token.test');
		require('./model/mongo/oauth_urac.test');
		done();
	});
	
	it("Testing all bls", (done) => {
		require('./bl/index.test');
		require('./bl/oauth_token.test');
		require('./bl/oauth_urac.test');
		done();
	});
	
	it("Testing all integrations", (done) => {
		require('./bl/integration/openam.js');
		require('./bl/integration/ldap.js');
		require('./bl/integration/passport.js');
		done();
	});
	
	it("Testing all integration drivers", (done) => {
		require('./bl/integration/drivers/azure.js');
		require('./bl/integration/drivers/facebook.js');
		require('./bl/integration/drivers/github.js');
		require('./bl/integration/drivers/google.js');
		require('./bl/integration/drivers/twitter.js');
		done();
	});
	
	after((done) => {
		done();
	});
});