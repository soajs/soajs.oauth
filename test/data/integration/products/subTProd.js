'use strict';

let lib = {
	"code" : "TPROD",
	"name" : "Test Product",
	"description" : "This is a product with multiple services and versions, version is sanitized",
	"console": false,
	"scope": {
		"acl": {
			"dashboard": {
				"oauth": {
					"1": {
						"access": true,
						"apisPermission": "restricted",
						"delete": [{
							"group": "Tokenization",
							"apis": {
								"/refreshToken/:token": {
									"access": true
								},
								"/accessToken/:token": {
									"access": true
								}
							}
						}, {
							"group": "User Tokenization",
							"apis": {
								"/tokens/user/:userId": {
									"access": true
								}
							}
						}, {
							"group": "Cient Tokenization",
							"apis": {
								"/tokens/tenant/:clientId": {
									"access": true
								}
							}
						}],
						"post": [{
							"group": "Tokenization",
							"apis": {
								"/pin": {
									"access": true
								}
							}
						}, {
							"group": "Guest",
							"apis": {
								"/token": {
									"access": false
								}
							}
						}],
						"get": [{
							"group": "Guest",
							"apis": {
								"/authorization": {
									"access": false
								}
							}
						}]
					}
				}
			}
		}
	},
	"packages" : [
		{
			"code" : "TPROD_BASIC",
			"name" : "basic package",
			"description" : "this is a description for test product basic package",
			"acl" : {
				"dashboard": {
					"oauth": [{
						"version": "1",
						"get": ["Guest"],
						"post": ["Guest", "Tokenization"],
						"delete": ["Tokenization"]
					}]
				}
			},
			"_TTL" : 86400000 // 24 hours
		},
		{
			"code" : "TPROD_EXA3",
			"name" : "example03 package",
			"description" : "this is a description for test product example03 package",
			"acl" : {
				"dashboard": {
					"oauth": [{
						"version": "1",
						"get": ["Guest"],
						"post": ["Guest", "Tokenization"],
						"delete": ["Tokenization", "User Tokenization", "Cient Tokenization"]
					}]
				}
			},
			"_TTL" : 86400000 // 24 hours
		}
	]
};

module.exports = lib;