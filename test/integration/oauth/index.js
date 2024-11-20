"use strict";

describe("starting oauth integration tests", () => {
	
	before((done) => {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("loading oauth integration tests", (done) => {
		//DELETE
		require('./delete/deleteUserTokens.test');
		require('./delete/deleteRefreshToken.test');
		require('./delete/deleteAccessToken.test');
		require('./delete/deleteTenantToken.test');
		require("./post/autologin.test.js");
		
		done();
	});
	
});