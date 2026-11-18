"use strict";

/**
 * Records the OAuth contract (test/contract/oauth-contract.json) from the running code: the
 * gateway (soajs.controller in node_modules) and this oauth service, on the integration data in
 * the local MongoDB (127.0.0.1:27017, dropped and imported). It was run on oauth2-server 2.4.1
 * before the token routes moved to soajs.oauth2; the contract test compares with it.
 *
 *   node test/contract/record.js
 */

// as the Gruntfile's integration run (env:mochaTest)
Object.assign(process.env, {
	"SOAJS_SRVIP": "127.0.0.1", "SOAJS_TEST": "true", "SOAJS_ENV": "DASHBOARD",
	"SOAJS_DEPLOY_MANUAL": "true", "SOAJS_REGISTRY_API": "127.0.0.1:11000",
	"APP_DIR_FOR_CODE_COVERAGE": process.env.APP_DIR_FOR_CODE_COVERAGE || "../"
});
const fs = require("fs");
const path = require("path");
const imported = require("../data/import.js");
const contract = require("./cases.js");
const runner = require("./runner.js");
const tokens = require("./tokens.js");

const root = path.join(__dirname, "../..");
process.env.SOAJS_IMPORTER_DROPDB = true;
imported.runPath(root + "/test/data/soajs_profile.js", root + "/test/data/integration/", true, null, (err) => {
	if (err) {
		console.log(err);
	}
	tokens.insert((error) => {
		if (error) {
			throw error;
		}
		require("soajs.controller/_index.js").runService(() => {
			require(root + "/_index.js").runService(() => {
				setTimeout(() => {
					runner.run(contract.cases, (error, results) => {
						if (error) {
							throw error;
						}
						const file = path.join(__dirname, "oauth-contract.json");
						fs.writeFileSync(file, JSON.stringify(results, null, "\t") + "\n");
						console.log("recorded " + Object.keys(results).length + " answers in " + file);
						process.exit(0);
					});
				}, 5000);
			});
		});
	});
});
