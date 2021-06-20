'use strict';

const crypto = require('crypto');

const model = {
	generateToken: function (cb) {
		crypto.randomBytes(256, function (ex, buffer) {
			if (ex) {
				return cb(new Error('Error in encryption while generating a token'));
			}
			
			let token = crypto
				.createHash('sha1')
				.update(buffer)
				.digest('hex');
			
			cb(null, token);
		});
	},
	generateAccessToken: function (client, user, scope, cb) {
		model.generateToken(cb);
	},
	generateRefreshToken: function (client, user, scope, cb) {
		model.generateToken(cb);
	},
	revokeToken: function (token, cb) {
		console.log("revokeToken")
		console.log(token)
		console.log("--------------")
		return cb(null, true);
	},
	getAccessToken: function (accessToken, cb) {
		return cb(null, {
			"accessToken": "475851f05a10e332a552a4b4e77b0f8b08a901f1",
			"accessTokenExpiresAt": new Date("2021-05-20T21:06:16.998Z"),
			"client": {
				"id": "11111"
			},
			"user": {
				"id": "222222"
			},
		});
	},
	getRefreshToken: function (refreshToken, cb) {
		return cb(null, {
			"refreshToken": "475851f05a10e332a552a4b4e77b0f8b08a901f2",
			"refreshTokenExpiresAt": new Date("2021-05-20T21:06:16.998Z"),
			"client": {
				"id": "11111"
			},
			"user": {
				"id": "222222"
			},
		});
	},
	saveToken: function (token, client, user, cb) {
		console.log("saveToken")
		console.log(token)
		console.log(client)
		console.log(user)
		console.log("--------------")
		return cb(null, {
			"accessToken": token.accessToken,
			"accessTokenExpiresAt": token.accessTokenExpiresAt,
			"refreshToken": token.refreshToken,
			"refreshTokenExpiresAt": token.refreshTokenExpiresAt,
			"client": {
				"id": "111111"
			},
			"user": {
				"id": "222222"
			},
		});
	},
	
	getClient: function (clientId, clientSecret, cb) {
		console.log("getClient")
		return cb(null, {
			"id": clientId,
			"redirectUris": [],
			"grants": [
				"password",
				"refresh_token"
			],
			"accessTokenLifetime": 7200,
			"refreshTokenLifetime": 1209600
		});
	},
	
	getUser: function (username, password, cb) {
		console.log("getUser")
		return cb(null, {
			id: "5cbf463189f92a011617b4bb",
			_id: "5cbf463189f92a011617b4bb",
			username: "rapha",
			firstName: "rapha",
			lastName: "hage",
			email: "rapha@fersancapital.com",
			status: "active",
			config: {
				allowedTenants: [
					{
						tenant: {
							id: "601c353b2382596ebc290d43",
							code: "VUJ3G",
							pin: {}
						},
						groups: [
							"owner"
						]
					}
				]
			},
			tenant: {
				id: "5fa08481cbbe0f66f5a449fc",
				code: "RETAL"
			},
			profile: {}
		});
	}
};


module.exports = model;