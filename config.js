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
    "extKeyRequired": false,
    "oauth": true,
    "oauthService": {
        "name": "oauth",
        "tokenApi": "/token"
    },
    "hashIterations": 1024,
    "seedLength": 32,
    "errors": {
        400: "Problem with the provided password.",
        401: "Unable to log in the user. User not found.",
        403: "User does not have access to this tenant",
        404: "Error executing operation"
    },
    "schema": {
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
            "/tokens/:client": {
                "_apiInfo": {
                    "l": "Delete all Tokens for this client"
                },
                "client": {
                    "source": ['params.client'],
                    "required": true,
                    "validation": {
                        "type": "string"
                    }
                }
            }
        }
    }
};