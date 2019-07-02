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
    "maintenance": {
        "commands": [
            {"label": "Releoad Provision", "path": "/loadProvision", "icon": "provision"}
        ]
    },
    "oauthService": {
        "name": "oauth",
        "tokenApi": "/token",
        "authorizationApi": "/authorization"
    },
    "hashIterations": 1024,
    "seedLength": 32,
    "model": 'mongo',
    "loginMode": "oauth",
	"oauthServer" :{
		"grants": [
			"password",
			"refresh_token"
		],
		"debug": false,
		"accessTokenLifetime": 7200,
		"refreshTokenLifetime":1209600
	},
    "errors": {
        //400: "Problem with the provided password.",
        401: "Unable to log in the user. User not found.",
        403: "User does not have access to this tenant",
        404: "Error executing operation",
        //405: "Invalid Tenant id",
        406: "Missing Tenant secret",
        413: "Problem with the provided password.",
        450: "You do not have privileges to enable pin login",
        451: "Pin login is not available for this account",
        601: "Model not found"
    },
    "schema": {
        "commonFields": {
            "model": {
                "source": ['query.model'],
                "required": false,
                "default": "mongo",
                "validation": {
                    "type": "string",
                    "enum": ["memory", "mongo"]
                }
            }
        },

        "get": {
            "/authorization": {
                "_apiInfo": {
                    "l": "Get the authorization token",
                    "group": "Guest"
                },
                "commonFields": ["model"]
            }
        },

        "post": {
            "/token": {
                "_apiInfo": {
                    "l": "Create an access token",
                    "group": "Guest"
                },
                "username": {
                    "source": ['body.username'],
                    "required": false,
                    "validation": {
                        "type": "string"
                    }
                },
                "password": {
                    "source": ['body.password'],
                    "required": false,
                    "validation": {
                        "type": "string"
                    }
                },
                "grant_type": {
                    "source": ['body.grant_type'],
                    "required": true,
                    "validation": {
                        "type": "string",
                        "enum": ["refresh_token", "password"]
                    }
                },
                "refresh_token": {
                    "source": ['body.refresh_token'],
                    "required": false,
                    "validation": {
                        "type": "string"
                    }
                }
            },
            "/pin": {
                "_apiInfo": {
                    "l": "Create an access token with pin",
                    "group": "Tokenization"
                },
                "pin": {
                    "source": ['body.pin'],
                    "required": false,
                    "validation": {
                        "type": "string"
                    }
                },
                "grant_type": {
                    "source": ['body.grant_type'],
                    "required": true,
                    "validation": {
                        "type": "string",
                        "enum": ["refresh_token", "password"]
                    }
                },
                "refresh_token": {
                    "source": ['body.refresh_token'],
                    "required": false,
                    "validation": {
                        "type": "string"
                    }
                }
            }
        },

        "delete": {
            "/accessToken/:token": {
                "_apiInfo": {
                    "l": "Delete access token",
                    "group": "Tokenization"
                },
                "token": {
                    "source": ['params.token'],
                    "required": true,
                    "validation": {
                        "type": "string"
                    }
                }
            },
            "/refreshToken/:token": {
                "_apiInfo": {
                    "l": "Delete refresh token",
                    "group": "Tokenization"
                },
                "token": {
                    "source": ['params.token'],
                    "required": true,
                    "validation": {
                        "type": "string"
                    }
                }
            },
            "/tokens/user/:userId": {
                "_apiInfo": {
                    "l": "Delete all tokens for a given user",
                    "group": "User Tokenization"
                },
                "userId": {
                    "source": ['params.userId'],
                    "required": true,
                    "validation": {
                        "type": "string"
                    }
                }
            },
            "/tokens/tenant/:clientId": {
                "_apiInfo": {
                    "l": "Delete all tokens for this client (tenant)",
                    "group": "Cient Tokenization"
                },
                "clientId": {
                    "source": ['params.clientId'],
                    "required": true,
                    "validation": {
                        "type": "string"
                    }
                }
            }
        }
    }
};
