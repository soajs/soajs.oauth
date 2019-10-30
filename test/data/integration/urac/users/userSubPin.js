'use strict';
let user = {
	_id: "5da721b6c257840b3fe44377",
	locked: true,
	username: "johnd",
	password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
	firstName: "John",
	lastName: "Doe",
	email: "john@localhost.com",
	ts: 1552747600152.0,
	status: "active",
	profile: {
	
	},
	groups: [
	],
	config: {
		packages: {
		
		},
		allowedTenants: [
			{
				tenant: {
					id: "5da6d6280067e20d5fe67667",
					code: "SOME",
					pin: {
						code: "5678",
						allowed: true
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
			code: "9923",
			allowed: true
		}
	},
};

module.exports = user;