'use strict';

let tenent = {
	_id: "5db990da1799605e8d4d7cbc",
	type: "product",
	code: "TETE",
	name: "test tenant",
	description: null,
	oauth: {
		secret: "this is a secret",
		redirectURI: "http://domain.com",
		grants: [
			"password",
			"refresh_token"
		],
		disabled: 0,
		type: 2,
		loginMode: "oauth"
	},
	applications: [
		{
			"product": "TPROD",
			"package": "TPROD_EXA3",
			"appId": "30d2cb5fc04ce51e06000002",
			"description": "this is a description for app for test tenant for test product and basic package, and with example03 in acl",
			"_TTL": 86400000, // 24 hours
			"keys": [
				{
					"key": "695d3456de70fddc9e1e60a6d85b97d3",
					"extKeys": [
						{
							"expDate": new Date().getTime() + 86400000,
							"extKey": "aa39b5490c4a4ed0e56d7ec1232a428f7ad78ebb7347db3fc9875cb10c2bce39bbf8aabacf9e00420afb580b15698c04ce10d659d1972ebc53e76b6bbae0c113bee1e23062800bc830e4c329ca913fefebd1f1222295cf2eb5486224044b4d0c",
							"device": {},
							"geo": {}
						}
					],
					"config": {
						"dashboard": {
							"oauth": {
								"loginMode": 'oauth',
								"roaming": {
									"whitelistips": [
										"192.168.1.1",
										"127.0.0.1",
										"10.10.2.1"
									]
								}
							}
						}
					}
				}
			]
		}
	]
};

module.exports = tenent;