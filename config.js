'use strict';

module.exports = {
	"serviceName": "oauth",
	"hashIterations": 1024,
	"seedLength": 32,
	"errors": {
		400: "Problem with the provided password.",
		401: "Unable to log in the user. User not found.",
		402: "User does not have access to this product",
		403: "User does not have access to this tenant"
	},
	"schema": {
		"/token": {
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