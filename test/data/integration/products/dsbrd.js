'use strict';
let prod = {
	_id: "5512867be603d7e01ab1688d",
	code: "DSBRD",
	name: "Console UI Product",
	console: true,
	description: "This is the main Console UI Product.",
	scope: {
		acl: {
			dashboard: {
				oauth: {
					"1": {
						"access": true,
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
						"post": [
							{
								"group": "Tokenization",
								"apis": {
									"/pin": {
										"access": true
									}
								}
							},
							{
								"group": "Guest",
								"apis": {
									"/access/token": {
										"access": false
									},
									"/refresh/token": {
										"access": false
									},
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
	packages: [
		{
			code: "DSBRD_GUEST",
			name: "Guest",
			locked: true,
			description: "This package is used to provide anyone access to login and forgot password. Once logged in the package linked to the user tenant will take over thus providing the right access to the logged in user.",
			acl: {
				dashboard: {
					"oauth": [{
						"version": "1",
						"get": ["Guest"],
						"post": ["Guest", "Tokenization"],
						"delete": ["Tokenization"]
					}]
				}
			},
			_TTL: 604800000
		},
		{
			code: "DSBRD_OWNER",
			name: "Owner",
			description: "This package is used to provide owner level access. This means the user who has this package will have access to everything.",
			locked: true,
			acl: {
				dashboard: {
					"oauth": [{
						"version": "1",
						"get": ["Guest"],
						"post": ["Guest", "Tokenization"],
						"delete": ["Tokenization", "User Tokenization", "Cient Tokenization"]
					}]
				}
			},
			_TTL: 604800000
		}
	]
};

module.exports = prod;