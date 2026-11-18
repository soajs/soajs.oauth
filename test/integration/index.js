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
	
	// the OAuth contract (test/contract): the answers of the token routes, recorded on
	// oauth2-server 2.4.1, from the gateway and the service started above, before the other tests
	it("keeps the OAuth contract (token routes)", function (done) {
		this.timeout(120000);
		const fs = require("fs");
		const contract = require("../contract/cases.js");
		const runner = require("../contract/runner.js");
		require("../contract/tokens.js").insert((error) => {
			if (error) {
				return done(error);
			}
			runner.run(contract.cases, (error, results) => {
				if (error) {
					return done(error);
				}
				const recorded = JSON.parse(fs.readFileSync(__dirname + "/../contract/oauth-contract.json").toString());
				const diffs = Object.keys(recorded).filter((name) => JSON.stringify(recorded[name]) !== JSON.stringify(results[name]));
				for (const name of diffs) {
					console.log("CONTRACT DIFF " + name + "\n  recorded " + JSON.stringify(recorded[name]) + "\n  now      " + JSON.stringify(results[name]));
				}
				console.log("CONTRACT " + Object.keys(recorded).length + " answers, " + diffs.length + " different");
				done(diffs.length ? new Error("the OAuth contract changed: " + diffs.join(", ")) : undefined);
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