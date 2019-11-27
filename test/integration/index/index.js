"use strict";

describe("starting index integration tests", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("loading index integration tests", (done) => {
		// GET
		require("./get/authorization.test.js");
		require("./get/roaming.test.js");
		
		//POST
		require("./post/createAccessToken.test.js");
		require("./post/createAccessTokenPin.test.js");
		
		//PUT

		
		done();
	});
	
});