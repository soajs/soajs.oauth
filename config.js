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
		"port": { "type": "maintenance" },
		"commands": [
			{ "label": "Reload Provision", "path": "/loadProvision", "icon": "fas fa-download" },
			{ "label": "Reload Registry", "path": "/reloadRegistry", "icon": "fas fa-undo" },
			{ "label": "Resource Info", "path": "/resourceInfo", "icon": "fas fa-info" }
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
		415: "You are not allowed to mint a token for another user",
		416: "The minted user record is missing a required field",
		417: "A reserved field was supplied in claims",

		420: "Missing service key configuration for third party integration",
		421: "Service key configuration for third party integration is not complete",
		422: "Unable to get driver: ",
		423: "Error getting driver configuration",

		450: "You do not have privileges to enable pin login",
		451: "Pin login is not available for this account",

		599: "Token has expired.",

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
					"l": "Cross-env roaming: echo the gateway context header; requires IP whitelisting",
					"group": "Tokenization user"
				}
			},

			"/available/login": {
				"_apiInfo": {
					"l": "List the tenant's enabled login methods: local login and third-party providers",
					"group": "Guest"
				}
			},

			"/authorization": {
				"_apiInfo": {
					"l": "Get the Basic auth header (tenant id + tenant oauth secret) for the token APIs",
					"group": "Guest"
				}
			},

			"/passport/login/:strategy": {
				"_apiInfo": {
					"l": "Start third-party login: redirect to the provider's sign-in page",
					"group": "Third party login"
				},
				"strategy": {
					"source": ['params.strategy'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["facebook", "google", "twitter", "github", "azure", "linkedin"],
						"description": "Third-party provider to sign in with; must be configured for the tenant (see /available/login)"
					}
				}
			},

			"/passport/validate/:strategy": {
				"_apiInfo": {
					"l": "Third-party login callback: verify with provider, save user, return tokens",
					"group": "Third party login"
				},
				"strategy": {
					"source": ['params.strategy'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["facebook", "google", "twitter", "github", "azure", "linkedin"],
						"description": "Provider returning to this callback; same value used on /passport/login"
					}
				},
				"oauth_token": {
					"source": ['query.oauth_token'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "OAuth 1.0a request token sent back by Twitter on the callback; other providers ignore it"
					}
				},
				"oauth_verifier": {
					"source": ['query.oauth_verifier'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "OAuth 1.0a verifier sent back by Twitter on the callback; other providers ignore it"
					}
				}
			}

		},

		"post": {
			"/openam/login": {
				"_apiInfo": {
					"l": "Log in with an OpenAM SSO token: verify it, save the user, return tokens",
					"group": "Third party login"
				},
				"token": {
					"source": ['body.token'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "OpenAM SSO token (subjectid), checked against the tenant's OpenAM attributes URL"
					}
				}
			},
			"/ldap/login": {
				"_apiInfo": {
					"l": "Log in with LDAP credentials: bind, save the user, return tokens",
					"group": "Third party login"
				},
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "LDAP uid of the user"
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

			"/token/phone": {
				"_apiInfo": {
					"l": "Send a 6-digit login code by SMS or WhatsApp to the user with this phone",
					"group": "Guest"
				},
				"phone": {
					"source": ['body.phone'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "Phone number on the user's urac record; the code is sent here"
					}
				},
				"type": {
					"source": ["body.type"],
					"default": "sms",
					"validation": {
						"type": "string",
						"enum": ["sms", "whatsapp"],
						"description": "Delivery channel for the code: sms or whatsapp (Twilio)"
					}
				}
			},
			"/token/phone/code": {
				"_apiInfo": {
					"l": "Exchange a phone login code for access and refresh tokens",
					"group": "Guest"
				},
				"code": {
					"source": ['body.code'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "6-digit code received after POST /token/phone"
					}
				},
				"phone": {
					"source": ['body.phone'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "Same phone number used to request the code"
					}
				},
				"unique": {
					"source": ['body.unique'],
					"default": false,
					"validation": {
						"type": "boolean",
						"description": "If true, revoke the user's existing tokens before issuing new ones"
					}
				}
			},

			"/token/auto/:id": {
				"_apiInfo": {
					"l": "Issue access and refresh tokens for a user id, no password (internal)",
					"group": "Internal"
				},
				"id": {
					"source": ['params.id'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "urac user _id to issue tokens for"
					}
				},
				"unique": {
					"source": ['body.unique'],
					"default": false,
					"validation": {
						"type": "boolean",
						"description": "If true, revoke the user's existing tokens before issuing new ones"
					}
				}
			},

			"/restricted/token/auto/:id": {
				"_apiInfo": {
					"l": "Mint a restricted access token for a user id; no refresh token (internal)",
					"group": "Internal"
				},
				"id": {
					"source": ['params.id'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "urac user _id to mint the token for; must match the caller when called with a user token"
					}
				},
				"restrictedTo": {
					"source": ['body.restrictedTo'],
					"required": true,
					"validation": {
						"type": "object",
						"additionalProperties": false,
						"required": ["tenant"],
						"properties": {
							"tenant": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
							"product": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
							"package": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
							"key": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
							"env": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
							"agent": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] }
						},
						"description": "Where the token may be used, enforced by the gateway: tenant (required), product, package, key, env, agent; each a string or list"
					}
				},
				"deviceId": {
					"source": ['body.deviceId'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "Binds the token to this device-id header; calls with another device-id are refused"
					}
				},
				"agent": {
					"source": ['body.agent'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "User-Agent recorded on the token for reference; not enforced (use restrictedTo.agent)"
					}
				},
				"ttl": {
					"source": ['body.ttl'],
					"required": false,
					"validation": {
						"type": "integer",
						"minimum": 60,
						"description": "Token lifetime in seconds (min 60); defaults to the registry access token lifetime"
					}
				},
				"loginMode": {
					"source": ['body.loginMode'],
					"required": false,
					"validation": {
						"type": "string",
						"enum": ["oauth", "urac"],
						"description": "oauth (default): the gateway uses the user stored on the token. urac: the gateway reloads the user on every call, so status and groups apply at once; the user is found under restrictedTo.tenant when it names one tenant, and must be at home or invited there"
					}
				}
			},

			"/restricted/token/guest": {
				"_apiInfo": {
					"l": "Mint a restricted access token for a guest with no user record; no refresh",
					"group": "Internal"
				},
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "Name the guest is known by; stored as the token user's username, no account lookup"
					}
				},
				"tenant": {
					"source": ['body.tenant'],
					"required": true,
					"validation": {
						"type": "object",
						"required": ["id"],
						"properties": {
							"id": { "type": "string" },
							"code": { "type": "string" }
						},
						"description": "Tenant of the guest, {id, code}; becomes the token user's tenant"
					}
				},
				"claims": {
					"source": ['body.claims'],
					"required": false,
					"validation": {
						"type": "object",
						"additionalProperties": true,
						"description": "Extra fields merged onto the token's user record; reserved fields (_id, id, username, tenant, loginMode, guest, restrictedTo, deviceId, agent) are rejected"
					}
				},
				"restrictedTo": {
					"source": ['body.restrictedTo'],
					"required": true,
					"validation": {
						"type": "object",
						"additionalProperties": false,
						"required": ["tenant"],
						"properties": {
							"tenant": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
							"product": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
							"package": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
							"key": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
							"env": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
							"agent": { "oneOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] }
						},
						"description": "Where the token may be used, enforced by the gateway: tenant (required), product, package, key, env, agent; each a string or list"
					}
				},
				"deviceId": {
					"source": ['body.deviceId'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "Binds the token to this device-id header; calls with another device-id are refused"
					}
				},
				"agent": {
					"source": ['body.agent'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "User-Agent recorded on the token for reference; not enforced (use restrictedTo.agent)"
					}
				},
				"ttl": {
					"source": ['body.ttl'],
					"required": false,
					"validation": {
						"type": "integer",
						"minimum": 60,
						"description": "Token lifetime in seconds (min 60); defaults to the registry access token lifetime"
					}
				}
			},

			"/token": {
				"_apiInfo": {
					"l": "Log in (username/email + password) or refresh; returns access+refresh tokens",
					"group": "Guest"
				},
				"username": {
					"source": ['body.username'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "Username or email; required when grant_type is password"
					}
				},
				"password": {
					"source": ['body.password'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "Required when grant_type is password"
					}
				},
				"grant_type": {
					"source": ['body.grant_type'],
					"required": false,
					"default": "password",
					"validation": {
						"type": "string",
						"enum": ["refresh_token", "password"],
						"description": "password to log in with username/password; refresh_token to exchange a refresh token"
					}
				},
				"refresh_token": {
					"source": ['body.refresh_token'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "Refresh token from an earlier login; required when grant_type is refresh_token"
					}
				}
			},
			"/token/email": {
				"_apiInfo": {
					"l": "Log in with email or username and password; returns access+refresh tokens",
					"group": "Guest"
				},
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "Username or email address"
					}
				},
				"password": {
					"source": ['body.password'],
					"required": true,
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
						"enum": ["password"],
						"description": "Only password is accepted"
					}
				}
			},
			"/refresh/token": {
				"_apiInfo": {
					"l": "Exchange a refresh token for new access and refresh tokens; old one deleted",
					"group": "Guest"
				},
				"refresh_token": {
					"source": ['body.refresh_token'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "Refresh token from an earlier login; it is deleted once used"
					}
				}
			},
			"/pin": {
				"_apiInfo": {
					"l": "Log in with a PIN; returns access and refresh tokens (urac login mode only)",
					"group": "Tokenization"
				},
				"pin": {
					"source": ['body.pin'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "The user's PIN; matched against users of the current tenant"
					}
				},
				"grant_type": {
					"source": ['body.grant_type'],
					"required": false,
					"default": "password",
					"validation": {
						"type": "string",
						"enum": ["refresh_token", "password"],
						"description": "password to log in with the PIN; refresh_token to exchange a refresh token"
					}
				},
				"refresh_token": {
					"source": ['body.refresh_token'],
					"required": false,
					"validation": {
						"type": "string",
						"description": "Refresh token from an earlier login; required when grant_type is refresh_token"
					}
				}
			}
		},

		"delete": {
			"/accessToken/:token": {
				"_apiInfo": {
					"l": "Revoke one access token by its value",
					"group": "Tokenization"
				},
				"token": {
					"source": ['params.token'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "Access token value to revoke"
					}
				}
			},
			"/refreshToken/:token": {
				"_apiInfo": {
					"l": "Revoke one refresh token by its value",
					"group": "Tokenization"
				},
				"token": {
					"source": ['params.token'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "Refresh token value to revoke"
					}
				}
			},
			"/tokens/user/:userId": {
				"_apiInfo": {
					"l": "Revoke all of a user's access and refresh tokens, for every client",
					"group": "User Tokenization"
				},
				"userId": {
					"source": ['params.userId'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "urac user id (token user.id) whose tokens are revoked"
					}
				}
			},
			"/tokens/user/:userId/device/:deviceId": {
				"_apiInfo": {
					"l": "Revoke all of a user's access and refresh tokens on one device, every client",
					"group": "User Tokenization"
				},
				"userId": {
					"source": ['params.userId'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "urac user id (token user.id) whose tokens are revoked"
					}
				},
				"deviceId": {
					"source": ['params.deviceId'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "device-id header value recorded on the tokens at login"
					}
				}
			},
			"/restricted/tokens/user/:userId": {
				"_apiInfo": {
					"l": "Revoke all restricted tokens of a user; ordinary sessions are kept",
					"group": "User Tokenization"
				},
				"userId": {
					"source": ['params.userId'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "urac user id whose restricted tokens are revoked"
					}
				}
			},
			"/tokens/tenant/:clientId": {
				"_apiInfo": {
					"l": "Revoke all access and refresh tokens issued to a tenant (OAuth client id)",
					"group": "Cient Tokenization"
				},
				"clientId": {
					"source": ['params.clientId'],
					"required": true,
					"validation": {
						"type": "string",
						"description": "Tenant id the tokens were issued to (OAuth client id)"
					}
				}
			}
		}
	}
};
