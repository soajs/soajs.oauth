'use strict';

let token = {
    _id: "5cdc190fd52c82e0ddb1dcd6",
    type: "refreshToken",
    token: "ddfd5eb42417b480471b4cec06381244658ffc7a",
    clientId: "10d2cb5fc04ce51e06000001",
	user: {
		_id: "22d2cb5fc04ce51e06000001",
		userId: "testUserID",
		password: "$2a$04$MobjLIVPLB9Q7hb95QaFoe9ppcwAkvHiksPK57HFmXy09Z8LU6mri",
		firstName: "fadi",
		lastName: "nasr",
		email: "fadi@localhost.com",
		status: "active",
		config: {
			allowedTenants: []
		},
		ts: new Date().getTime(),
		tenant: {
			id: "10d2cb5fc04ce51e06000001",
			code: "TEST",
			pin: {
				code: "1235",
				allowed: true
			}
		},
		groups: ["devop"],
		lastLogin: new Date().getTime(),
		groupsConfig: {
			allowedPackages: {}
		},
		loginMode: "urac",
	},
    env: "dashboard",
    expires: new Date((new Date().getFullYear()) + 3, 0, 1)
};

module.exports = token;