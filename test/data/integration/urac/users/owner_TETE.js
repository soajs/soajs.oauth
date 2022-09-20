'use strict';

let user = {
    _id: "5c8d0c505653de3985aa0ffd",
    locked: true,
    username: "owner",
    password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
    firstName: "owner3",
    lastName: "owner",
    email: "me@localhost.com",
    ts: 1552747600152,
    status: "active",
    profile: {},
    groups: [
        "owner"
    ],
    config: {
        packages: {},
        keys: {},
        allowedTenants: [
					{
						tenant: {
							id: "5db990da1799605e8d4d7cbc",
							code: "TETE"
						},
						groups: [
							'group1'
						]
					}]
    },
    tenant: {
			id: "5db990da1799605e8d4d7cbc",
			code: "TETE",
        pin: {
            code: "1235",
            allowed: true
        }
    }
};

module.exports = user;
