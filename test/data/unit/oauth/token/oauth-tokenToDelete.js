'use strict';

let token = { //this token is only to test delete in model
	_id: "5da6d5dfd3109a0d5b616ca3",
	type: "refreshToken",
	token: "a64374dc0928ac5da3b1dc7e9bb7cd7a60684eba",
	clientId: "5c0e74ba9acc3c5a84a51259",
	user: {
		_id: "5d77a756da1b2e0b4d6dbccf",
		locked: true,
		username: "owner",
		firstName: "owner",
		lastName: "owner",
		email: "me@localhost.com",
		ts: 1568122710943.0,
		status: "active",
		profile: {
		
		},
		groups: [
			"owner"
		],
		config: {
			packages: {
			
			},
			keys: {
			
			}
		},
		tenant: {
			id: "5c0e74ba9acc3c5a84a51259",
			code: "DBTN"
		},
		lastLogin: 1571214238256.0,
		groupsConfig: {
			allowedPackages: {
				DSBRD: [
					"DSBRD_OWNER"
				]
			},
			allowedEnvironments: {
			
			}
		},
		loginMode: "urac",
		id: "5d77a756da1b2e0b4d6dbccf"
	},
	env: "dashboard",
	expires: "2019-10-30T09:33:35.242Z"
};

module.exports = token;