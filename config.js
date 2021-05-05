'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

module.exports = {
	"type": 'service',
	'subType': 'soajs',
	"description": "SOAJS oAuth provides out of the box oAuth 2.0 functionality to validate, refresh and kill generated access tokens without the effort of writing any code.",
		"prerequisites": {
		"cpu": '',
		"memory": ''
	},
	"serviceVersion": 1,
	"serviceName": "oauth",
	"serviceGroup": "Gateway",
	"servicePort": 4002,
	"requestTimeout": 30,
	"requestTimeoutRenewal": 5,
	"extKeyRequired": true,
	"oauth": true,
	'awareness': false,
	"maintenance": {
		"readiness": "/heartbeat",
		"port": {"type": "maintenance"},
		"commands": [
			{"label": "Reload Provision", "path": "/loadProvision", "icon": "fas fa-download"},
			{"label": "Reload Registry", "path": "/reloadRegistry", "icon": "fas fa-undo"},
			{"label": "Resource Info", "path": "/resourceInfo", "icon": "fas fa-info"}
		]
	},
	"tags": ["authentication", "oauth2", "jwt", "multitenant"],
	"attributes": {
		"thirdparty": ["facebook", "google", "twitter", "github", "linkedin"],
		"active directory": ["LDAP", "Azure AD"]
	},
	"program": ["soajs"],
	"documentation": {
		"readme": "/README.md",
		"release": "/RELEASE.md"
	},
	
	//-------------------------------------
	"hashIterations": 12,
	"loginMode": "oauth",
	"oauthService": {
		"name": "oauth",
		"tokenApi": "/token",
		"authorizationApi": "/authorization"
	},
	"oauthServer": {
		"grants": [
			"password",
			"refresh_token"
		],
		"debug": false,
		"accessTokenLifetime": 7200,
		"refreshTokenLifetime": 1209600
	},
	
	"errors": {
		400: "Business logic required data are missing.",
		401: "Unable to log in. Credential error or mismatch",
		403: "User does not have access to this tenant",
		404: "Unable to roam the provided request",
		406: "Missing Tenant secret",
		
		411: "Third party integration mapProfile error",
		412: "Third party integration profile is empty",
		
		413: "Unable to log in. Credential error or mismatch",
		414: "Local login is not allowed",
		
		420: "Missing service key configuration for third party integration",
		421: "Service key configuration for third party integration is not complete",
		422: "Unable to get driver: ",
		423: "Error getting driver configuration",
		
		450: "You do not have privileges to enable pin login",
		451: "Pin login is not available for this account",
		
		600: "Error in generating oAUth Token.",
		601: "Model not found.",
		602: "Model error: ",
		
		700: "Unable to log in. Ldap connection refused!",
		701: "Unable to log in. Invalid ldap admin user.",
		702: "Unable to log in. Invalid ldap admin credentials.",
		703: "Unable to log in. Invalid ldap user credentials.",
		704: "Unable to log in. Ldap user not found.",
		705: "Unable to log in. Authentication failed.",
		
		710: "Unable to log in. OpenAM connection error.",
		711: "Unable to log in. OpenAM token invalid.",
		713: "Unable to log in. General error while parsing response",
		
		720: "Unable to authenticated with third party"
	},
	"schema": {
		"commonFields": {},
		
		"get": {
			"/roaming": {
				"_apiInfo": {
					"l": "Cross environment roaming, but requires IP whitelisting",
					"group": "Tokenization user"
				}
			},
			
			"/available/login": {
				"_apiInfo": {
					"l": "Get information about what third party login is available",
					"group": "Guest"
				}
			},
			
			"/authorization": {
				"_apiInfo": {
					"l": "Get the authorization token",
					"group": "Guest"
				}
			},
			
			"/passport/login/:strategy": {
				"_apiInfo": {
					"l": "Passport login",
					"group": "Third party login"
				},
				"strategy": {
					"source": ['params.strategy'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["facebook", "google", "twitter", "github", "azure", "linkedin"]
					}
				}
			},
			
			"/passport/validate/:strategy": {
				"_apiInfo": {
					"l": "Passport login validation",
					"group": "Third party login"
				},
				"strategy": {
					"source": ['params.strategy'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["facebook", "google", "twitter", "github", "azure", "linkedin"]
					}
				},
				"oauth_token": {
					"source": ['query.oauth_token'],
					"required": false,
					"validation": {
						"type": "string"
					}
				},
				"oauth_verifier": {
					"source": ['query.oauth_verifier'],
					"required": false,
					"validation": {
						"type": "string"
					}
				}
			}
			
		},
		
		"post": {
			"/openam/login": {
				"_apiInfo": {
					"l": "OpenAM login",
					"group": "Third party login"
				},
				"token": {
					"source": ['body.token'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			"/ldap/login": {
				"_apiInfo": {
					"l": "Ldap login",
					"group": "Third party login"
				},
				"username": {
					"source": ['body.username'],
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
					"required": false,
					"default": "password",
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
