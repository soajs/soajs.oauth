'use strict';

module.exports = {
	type: 'service',
	prerequisites: {
		cpu: '',
		memory: ''
	},
	"serviceVersion": 1,
	"serviceName": "oauth",
	"serviceGroup": "SOAJS Core Services",
	"servicePort": 4002,
	"requestTimeout": 30,
	"requestTimeoutRenewal": 5,
	"extKeyRequired": true,
	"oauth": true,
	"oauthService" : {
		"name" : config.serviceName,
		"tokenApi" : "/token"
	},
	"hashIterations": 1024,
	"seedLength": 32,
	"errors": {
		400: "Problem with the provided password.",
		401: "Unable to log in the user. User not found.",
		402: "User does not have access to this product",
		403: "User does not have access to this tenant",
		404: "Error executing operation"
	},
	"schema": {
		"/token": {
			"_apiInfo": {
				"l": "Create Token"
			},
			"username": {
				"source": ['body.username'],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"grant_type": {
				"source": ['body.grant_type'],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"password": {
				"source": ['body.password'],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		"/kill": {
			"_apiInfo": {
				"l": "Kill Token"
			},
			"access_token": {
				"source": ['query.access_token'],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		}
	}
};