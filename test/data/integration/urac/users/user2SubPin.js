'use strict';

let user = {
	_id: "5da57ff8abd7b1027390ef45",
	locked: true,
	username: "subPin2",
	password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
	firstName: "pin",
	lastName: "service",
	email: "sub@pin2.com",
	ts: 1552747600152,
	status: "active",
	profile: {},
	groups: [
		"dev"
	],
	config: {
		packages: {
		
		},
		keys: {
		
		},
		allowedTenants: [
			{
				tenant: {
					id: "5da6d6280067e20d5fe67667",
					code: "SOME",
					pin: {
						code: "1932",
						allowed: false
					}
				},
				groups: [
					"devops"
				]
			}
		]
	},
	tenant: {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "DBTN",
		pin: {
			code: "1354",
			allowed: true
		}
	},
};

module.exports = user;