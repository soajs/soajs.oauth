
/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/index.js');


describe("Unit test for: BLs", () => {
	
	let soajs = {
		config: {
			"errors": {
				400: "Business logic required data are missing.",
				401: "Unable to log in the user. User not found.",
				403: "User does not have access to this tenant",
				
				406: "Missing Tenant secret",
				
				413: "Problem with the provided password.",
				
				450: "You do not have privileges to enable pin login",
				451: "Pin login is not available for this account",
				
				600: "Error in generating oAUth Token.",
				601: "Model not found.",
				602: "Model error: "
			},
			hashIterations: 1024,
			seedLength: 32,
			loginMode: "oauth",
			
			oauthService: {
				name: "oauth",
				tokenApi: "/token",
				authorizationApi: "/authorization"
			},
			
			oauthServer: {
				grants: [
					"password",
					"refresh_token"
				],
				debug: false,
				accessTokenLifetime: 7200,
				refreshTokenLifetime: 1209600
			},
			
		},
		
		log: {
			error: () => {
				console.log();
			},
			debug: () => {
				console.log();
			}
		},
		registry: {
			get: () => {
				return {
					"coreDB": {
						"provision": {
							"name": "core_provision",
							"prefix": "",
							"servers": [
								{
									"host": "127.0.0.1",
									"port": 27017
								}
							],
							"credentials": null,
							"URLParam": {
								"poolSize": 5,
								"autoReconnect": true
							}
						}
					}
				};
			}
		}
	};
	
	describe("Unit test index init", () => {
		it("Success - init", (done) => {
			BL.init(soajs, soajs.config, () => {
				done();
			});
		});
	});
	
});