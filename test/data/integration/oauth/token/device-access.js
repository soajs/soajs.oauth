'use strict';

let token = {
	_id: "5db2c7414e261a23f8ec2bef",
	type: "accessToken",
	token: "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
	clientId: "5c0e74ba9acc3c5a84a51259",
	user: {
		_id: "5db2c7414e261a23f8ec2bee",
		username: "device",
		firstName: "Device",
		lastName: "user",
		email: "device@test.com",
		status: "active",
		config: {
		},
		"ts": new Date().getTime(),
		tenant: {
			id: "5c0e74ba9acc3c5a84a51259",
			code: "DBTN",
			pin: {
				code: "9430",
				allowed: true
			}
		},
		groups: ["devop"],
		lastLogin: new Date().getTime(),
		loginMode: "urac",
		id: "5db2c7414e261a23f8ec2bee",
		agent: "okhttp/4.12.0",
		deviceId: "device-abc"
	},
	env: "dashboard",
	expires: new Date((new Date().getFullYear()) + 2, 0, 1)
};

module.exports = token;
