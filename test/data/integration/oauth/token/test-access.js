'use strict';

let token = {
	_id: "5db2c7414e261a23f8ec2bea",
	type: "accessToken",
	token: "2179a61307af23e481ea60684086409a66755ecd",
	clientId: "5c0e74ba9acc3c5a84a51259",
	user: {
		_id: "5db2c7414e261a23f8ec2be9",
		username: "test",
		password: "$2a$12$rOcMlX2AAW2hwc5W8Y3B3OJ68QSmAKh.ZJmwZ8.oSWeQuYsWgmfVe",
		firstName: "Test",
		lastName: "test",
		email: "test@test.com",
		status: "active",
		config: {
		},
		"ts": new Date().getTime(),
		tenant: {
			id: "5c0e74ba9acc3c5a84a51259",
			code: "DBTN",
			pin: {
				code: "9429",
				allowed: true
			}
		},
		groups: ["devop"],
		lastLogin: new Date().getTime(),
		loginMode: "urac",
		id: "5db2c7414e261a23f8ec2be9"
	},
	env: "dashboard",
	expires: new Date((new Date().getFullYear()) + 2, 0, 1)
};

module.exports = token;