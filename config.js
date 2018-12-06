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
            {"label": "Releoad Provision", "url": "/reloadProvision", "icon": "provision"}
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
    "errors": {
        400: "Problem with the provided password.",
        401: "Unable to log in the user. User not found.",
        403: "User does not have access to this tenant",
        404: "Error executing operation",
        405: "Invalid Tenant id",
        406: "Missing Tenant secret",
        413: "Problem with the provided password.",
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
                    "l": "Get the authorization value"
                },
                "commonFields": ["model"]
            }
        },

        "post": {
            "/token": {
                "_apiInfo": {
                    "l": "Create Token"
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
            }
        },

        "delete": {
            "/accessToken/:token": {
                "_apiInfo": {
                    "l": "Delete Access Token"
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
                    "l": "Delete Refresh Token"
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
                    "l": "Delete all Tokens for this User"
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
                    "l": "Delete all Tokens for this Client"
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
