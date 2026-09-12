'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const async = require("async");
const fs = require("fs");
const soajsCoreModules = require('soajs');
let Auth = soajsCoreModules.authorization;

const integrationLib = require('./integration/lib.js');
const passport = require('./integration/passport.js');
const ldap = require('./integration/ldap.js');
const openam = require('./integration/openam.js');

const uracDriver = require("soajs.urac.driver");

//NOTE: no dbConfig, so this never connects. the driver exposes ObjectId as an instance
//		method and the model layer reaches it the same way, this is only here to mint the
//		_id of a guest record, which has no urac document behind it.
const idFactory = new soajsCoreModules.mongo();

//NOTE: claims is merged onto a record the gateway uses verbatim as req.soajs.urac. these are
//		the fields the mint sets itself and a caller must not be able to supply them at all.
const GUEST_RESERVED_CLAIMS = ["_id", "id", "username", "tenant", "loginMode", "guest", "restrictedTo", "deviceId", "agent"];

let SSOT = {};
let model = process.env.SOAJS_SERVICE_MODEL || "mongo";

const BLs = ["oauth_token", "oauth_urac", "oauth_phone"];

const driver_with_session = ["twitter", "linkedin"];

let bl = {
	init: init,
	oauth_urac: null,
	oauth_token: null,
	oauth_phone: null,

	"passportLogin": (req, res, options, cb, next) => {
		//Twitter require session, if session is off mimic it here
		if (!req.session && driver_with_session.includes(req.soajs.inputmaskData.strategy)) {
			req.session = {};
		}
		passport.init(req.soajs, (error, _passport) => {
			if (error) {
				return cb(error, null);
			}
			passport.login(req, res, _passport, (error) => {
				if (error) {
					return cb(error, null);
				}
			}, next);
		});
	},

	"passportValidate": (req, res, options, cb) => {
		//Twitter require session, if session is off mimic it here
		if (!req.session && req.soajs.inputmaskData.strategy === "twitter") {
			req.session = {};
		}
		passport.init(req.soajs, (error, _passport) => {
			if (error) {
				return cb(error, null);
			}
			passport.validate(req, res, _passport, (error, profile) => {
				if (error) {
					return cb(error, null);
				}
				//save the user
				let input = {
					"user": profile,
					"mode": req.soajs.inputmaskData.strategy
				};
				thirdpartySaveAndGrantAccess(req, input, options, cb);
			});
		});
	},

	"openam": (req, inputmaskData, options, cb) => {
		let data = {
			'token': inputmaskData.token
		};
		openam.login(req.soajs, data, function (error, profile) {
			if (error) {
				return cb(error, null);
			}
			//save the user
			let input = {
				"user": profile,
				"mode": "openam"
			};
			thirdpartySaveAndGrantAccess(req, input, options, cb);
		});
	},

	"ldap": (req, inputmaskData, options, cb) => {
		let data = {
			'username': inputmaskData.username,
			'password': inputmaskData.password
		};

		ldap.login(req.soajs, data, function (error, profile) {
			if (error) {
				return cb(error, null);
			}
			//save the user
			let input = {
				"user": profile,
				"mode": "ldap"
			};
			thirdpartySaveAndGrantAccess(req, input, options, cb);
		});
	},

	"authorization": (soajs, inputmaskData, options, cb) => {
		options.provision.getTenantOauth(soajs.tenant.id, (err, tenantOauth) => {

			soajs.tenantOauth = tenantOauth;

			if (soajs && soajs.tenantOauth && soajs.tenantOauth.secret && soajs.tenant && soajs.tenant.id) {
				let secret = soajs.tenantOauth.secret;
				let tenantId = soajs.tenant.id;

				let basic = Auth.generate(tenantId, secret);
				return cb(null, basic);
			} else {
				return cb(bl.oauth_urac.handleError(soajs, 406, err));
			}
		});
	},

	"getUserRecordByPin": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.oauth_urac.handleError(soajs, 400, null));
		}
		options.provision.getTenantOauth(soajs.tenant.id, (err, tenantOauth) => {
			soajs.tenantOauth = tenantOauth;
			let loginMode = bl.oauth_urac.localConfig.loginMode;
			if (soajs && soajs.tenantOauth && soajs.tenantOauth.loginMode) {
				loginMode = soajs.tenantOauth.loginMode;
			}

			if (loginMode === 'urac') {

				let data = {
					'pin': inputmaskData.pin
				};
				uracDriver.loginByPin(soajs, data, (error, record) => {
					if (error) {
						error = new Error(error.msg);
						return cb(error);
					}
					if (record) {
						record.pinLogin = true;
						record.loginMode = loginMode;
						record.id = record._id.toString();
						record.agent = options.agent || null;
						record.deviceId = options.deviceId || null;
					}
					return cb(null, record);
				});
			} else {
				let error = bl.oauth_urac.handleError(soajs, 451, null);
				error = new Error(error.msg);
				return cb(error);
			}
		});
	},

	"getUserRecord": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.oauth_urac.handleError(soajs, 400, null));
		}
		options.provision.getTenantOauth(soajs.tenant.id, (err, tenantOauth) => {
			soajs.tenantOauth = tenantOauth;

			let loginMode = bl.oauth_urac.localConfig.loginMode;
			if (soajs && soajs.tenantOauth && soajs.tenantOauth.loginMode) {
				loginMode = soajs.tenantOauth.loginMode;
			}
			/*
			let pinCheck = (record) => {
				let product = null;
				if (soajs.tenant && soajs.tenant.application) {
					product = soajs.tenant.application.product;
				}
				
				if (product && record.loginMode === 'urac' && soajs.tenantOauth.pin && soajs.tenantOauth.pin[product] && soajs.tenantOauth.pin[product].enabled) {
					record.pinLocked = true;
					let userTenant = checkUserTenantAccessPin(record, soajs.tenant);
					if (userTenant && userTenant.pin && userTenant.pin.allowed) {
						return cb(false, record);
					}
					else {
						let error = bl.oauth_urac.handleError(soajs, 450, null);
						error = new Error(error.msg);
						return cb(error);
					}
				}
				else {
					return cb(null, record);
				}
			};
			*/
			let getLocal = () => {
				let data = {
					'username': inputmaskData.username,
					'password': inputmaskData.password,
					'loginMode': loginMode
				};
				bl.oauth_urac.getUser(soajs, data, options, (error, record) => {
					if (error) {
						error = new Error(error.msg);
						return cb(error);
					}
					if (record) {
						record.agent = options.agent || null;
						record.deviceId = options.deviceId || null;
					}
					return pinCheck(record, soajs, cb);
				});
			};

			if (loginMode === 'urac') {
				let data = {
					'username': inputmaskData.username,
					'password': inputmaskData.password
				};
				uracDriver.login(soajs, data, function (error, record) {
					if (error) {
						error = new Error(error.msg);
						return cb(error);
					}
					if (record) {
						record.loginMode = loginMode;
						record.id = record._id.toString();
						record.agent = options.agent || null;
						record.deviceId = options.deviceId || null;
					}
					return pinCheck(record, soajs, cb);
				});
			} else {
				getLocal();
			}
		});
	},

	"autoLogin": (req, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.oauth_urac.handleError(req.soajs, 400, null));
		}

		let data = {
			'id': inputmaskData.id
		};
		uracDriver.getRecord(req.soajs, data, function (error, record) {
			if (error || !record) {
				error = new Error(error.msg);
				return cb(bl.oauth_urac.handleError(req.soajs, 413, error));
			}
			options.provision.getTenantOauth(req.soajs.tenant.id, (err, tenantOauth) => {
				req.soajs.tenantOauth = tenantOauth;
				let loginMode = bl.oauth_urac.localConfig.loginMode;
				if (req.soajs && req.soajs.tenantOauth && req.soajs.tenantOauth.loginMode) {
					loginMode = req.soajs.tenantOauth.loginMode;
				}

				if (record) {
					record.loginMode = loginMode;
					record.id = record._id.toString();
					record.agent = req.get('user-agent');
					record.deviceId = req.get('device-id');
				}

				if (inputmaskData.unique) {
					let data = {
						"user": {
							"id": record.id,
							"loginMode": record.loginMode,
							"clientId": req.soajs.tenant.id
						}
					};
					bl.oauth_phone.modelObj_token.delete(data, (err, deleteResponse) => {
						if (err) {
							return cb(bl.handleError(req.soajs, 600, err));
						}

						req.soajs.log.debug("Number of logged in session deleted", deleteResponse);
						options.provision.generateSaveAccessRefreshToken(record, req, (err, accessData) => {
							if (err) {
								return cb(bl.oauth_urac.handleError(req.soajs, 600, err));
							}
							return cb(null, accessData);
						});
					});
				} else {
					options.provision.generateSaveAccessRefreshToken(record, req, (err, accessData) => {
						if (err) {
							return cb(bl.oauth_urac.handleError(req.soajs, 600, err));
						}
						return cb(null, accessData);
					});
				}
			});
		});
	},

	/**
	 * Mints a restricted access token for a user, with no refresh token.
	 *
	 * NOTE: same shape as autoLogin, our backend sends the user id as :id. the differences are
	 *		all deliberate, see oauth/restricted-token-plan.md:
	 *		- deviceId and agent come from the body. on this call the headers belong to the
	 *		  calling microservice, which has no relation to the browser the token is for
	 *		- loginMode is forced to oauth so the gateway takes the user straight off the token,
	 *		  the web app is a different tenant and a urac lookup there would not find the user
	 *		- no refresh token, the token is short lived and the user re-authorizes instead
	 *		- no unique branch, its delete keys on user.id and clientId only and would take the
	 *		  user's ordinary mobile session with it
	 *
	 * @param req {Object}
	 * @param inputmaskData {Object}
	 * @param options {Object}
	 * @param cb {Function}
	 */
	"restrictedAutoLogin": (req, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.oauth_urac.handleError(req.soajs, 400, null));
		}

		//NOTE: a no-op when our backend calls with its own key, there is no urac user on the
		//		calling token. it only bites if this ever gets reached with a user's own token,
		//		where nothing else would stop that user minting for somebody else.
		let callerId = null;
		if (req.oauth && req.oauth.bearerToken && req.oauth.bearerToken.user) {
			callerId = req.oauth.bearerToken.user.id;
		}
		if (callerId && callerId !== inputmaskData.id) {
			return cb(bl.oauth_urac.handleError(req.soajs, 415, null));
		}

		let data = {
			'id': inputmaskData.id
		};
		uracDriver.getRecord(req.soajs, data, function (error, record) {
			if (error || !record) {
				error = new Error(error ? error.msg : "user not found");
				return cb(bl.oauth_urac.handleError(req.soajs, 413, error));
			}

			record.loginMode = "oauth";
			record.id = record._id.toString();
			record.agent = inputmaskData.agent || null;
			record.deviceId = inputmaskData.deviceId || null;
			record.restrictedTo = inputmaskData.restrictedTo;

			//NOTE: with loginMode oauth the gateway uses this record verbatim as the urac record,
			//		so whatever is missing here is missing for the life of the token. tenant in
			//		particular is read unguarded downstream and a record without it 500s the first
			//		request, fail the mint instead of handing back a token that cannot be used.
			let missing = ["id", "_id", "username", "tenant", "loginMode"].filter((field) => {
				return !record[field];
			});
			if (missing.length > 0 || !record.tenant.id) {
				req.soajs.log.error("Unable to mint a restricted token, the user record is missing: " + (missing.join(", ") || "tenant.id"));
				return cb(bl.oauth_urac.handleError(req.soajs, 416, null));
			}

			options.provision.generateSaveAccessToken(record, req, inputmaskData.ttl, (err, accessData) => {
				if (err) {
					return cb(bl.oauth_urac.handleError(req.soajs, 600, err));
				}
				return cb(null, accessData);
			});
		});
	},

	/**
	 * Mints a restricted access token for a guest, an identity with no urac record behind it.
	 *
	 * NOTE: same as restrictedAutoLogin with the urac lookup replaced by a record built from the
	 *		input, so 413 and 415 cannot happen here and are not wired in. everything below the
	 *		record build is identical, generateSaveAccessToken stores the record opaquely and
	 *		never inspects it.
	 *
	 * NOTE: this mints a token for an arbitrary identity, anything that can reach it can claim
	 *		to be anyone. it is group Internal and must never be granted in a package ACL, it is
	 *		reachable over interConnect only.
	 *
	 * @param req {Object}
	 * @param inputmaskData {Object}
	 * @param options {Object}
	 * @param cb {Function}
	 */
	"restrictedGuestLogin": (req, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.oauth_urac.handleError(req.soajs, 400, null));
		}

		//NOTE: rejected rather than dropped. merging claims first already keeps them from
		//		overriding anything, but a caller that sends one is asking for something it will
		//		not get, and silently minting a token that does not say what it asked for is worse
		//		than refusing.
		let claims = inputmaskData.claims || {};
		let reserved = GUEST_RESERVED_CLAIMS.filter((field) => {
			return Object.prototype.hasOwnProperty.call(claims, field);
		});
		if (reserved.length > 0) {
			req.soajs.log.error("Unable to mint a guest token, claims carries reserved fields: " + reserved.join(", "));
			return cb(bl.oauth_urac.handleError(req.soajs, 417, null));
		}

		//NOTE: the _id is generated here and is never taken from the body, a caller must not be
		//		able to choose the id services will key this identity on. claims is merged first
		//		so no key order in it can reach a field the mint sets.
		let _id = idFactory.ObjectId();
		let record = Object.assign({}, claims, {
			"_id": _id,
			"id": _id.toString(),
			"username": inputmaskData.username,
			"tenant": inputmaskData.tenant,
			"loginMode": "oauth",
			"guest": true,
			"agent": inputmaskData.agent || null,
			"deviceId": inputmaskData.deviceId || null,
			"restrictedTo": inputmaskData.restrictedTo
		});

		//NOTE: with loginMode oauth the gateway uses this record verbatim as the urac record,
		//		so whatever is missing here is missing for the life of the token. tenant in
		//		particular is read unguarded downstream and a record without it 500s the first
		//		request, fail the mint instead of handing back a token that cannot be used.
		let missing = ["id", "_id", "username", "tenant", "loginMode"].filter((field) => {
			return !record[field];
		});
		if (missing.length > 0 || !record.tenant.id) {
			req.soajs.log.error("Unable to mint a guest token, the record is missing: " + (missing.join(", ") || "tenant.id"));
			return cb(bl.oauth_urac.handleError(req.soajs, 416, null));
		}

		options.provision.generateSaveAccessToken(record, req, inputmaskData.ttl, (err, accessData) => {
			if (err) {
				return cb(bl.oauth_urac.handleError(req.soajs, 600, err));
			}
			return cb(null, accessData);
		});
	}
};

function init(service, localConfig, cb) {

	let fillModels = (blName, cb) => {
		let typeModel = __dirname + `/../model/${model}/${blName}.js`;

		if (fs.existsSync(typeModel)) {
			SSOT[`${blName}Model`] = require(typeModel);
			SSOT[`${blName}ModelObj`] = new SSOT[`${blName}Model`](service, null, null);
		}
		if (SSOT[`${blName}Model`]) {
			let temp = require(`./${blName}.js`);
			temp.modelObj = SSOT[`${blName}ModelObj`];
			temp.model = SSOT[`${blName}Model`];
			temp.soajs_service = service;
			temp.localConfig = localConfig;
			bl[blName] = temp;
			return cb(null);
		} else {
			return cb({ name: blName, model: typeModel });
		}
	};
	async.each(BLs, fillModels, function (err) {
		if (err) {
			service.log.error(`Requested model not found. make sure you have a model for ${err.name} @ ${err.model}`);
			return cb({ "code": 601, "msg": localConfig.errors[601] });
		}
		integrationLib.loadDrivers(service);
		bl.oauth_phone.modelObj_token = SSOT.oauth_tokenModelObj;
		return cb(null);

	});
}

function checkUserTenantAccessPin(record, tenantObj) {
	if (record && record.tenant && tenantObj && tenantObj.id) {
		if (record.tenant.id === tenantObj.id) {
			return record.tenant;
		}
	}
	return null;
}

function pinCheck(record, soajs, cb) {
	let product = null;
	if (soajs.tenant && soajs.tenant.application) {
		product = soajs.tenant.application.product;
	}
	if (soajs.tenant && soajs.tenant.key) {
		record.key = {
			"iKey": soajs.tenant.key.iKey,
			"eKey": soajs.tenant.key.eKey
		};
	}
	if (product && record.loginMode === 'urac' && soajs.tenantOauth.pin && soajs.tenantOauth.pin[product] && soajs.tenantOauth.pin[product].enabled) {
		record.pinLocked = true;
		let userTenant = checkUserTenantAccessPin(record, soajs.tenant);
		if (userTenant && userTenant.pin && userTenant.pin.allowed) {
			return cb(null, record);
		} else {
			let error = bl.oauth_urac.handleError(soajs, 450, null);
			error = new Error(error.msg);
			return cb(error);
		}
	} else {
		return cb(null, record);
	}
}

function thirdpartySaveAndGrantAccess(req, input, options, cb) {
	let mode = req.soajs.inputmaskData.strategy;
	if (req.soajs.servicesConfig && req.soajs.servicesConfig.oauth && req.soajs.servicesConfig.oauth.passportLogin && req.soajs.servicesConfig.oauth.passportLogin[mode]) {
		let config = req.soajs.servicesConfig.oauth.passportLogin[mode];
		if (config.groups && Array.isArray(config.groups)) {
			input.user.groups = config.groups;
		}
	}
	if (input && input.user && input.user.email) {
		input.user.email = input.user.email.toLowerCase();
	}
	uracDriver.saveUser(req.soajs, input, (error, user) => {
		if (error) {
			return cb(bl.oauth_urac.handleError(req.soajs, 602, error));
		}
		options.provision.getTenantOauth(req.soajs.tenant.id, (err, tenantOauth) => {
			req.soajs.tenantOauth = tenantOauth;

			let loginMode = bl.oauth_urac.localConfig.loginMode;
			if (req.soajs && req.soajs.tenantOauth && req.soajs.tenantOauth.loginMode) {
				loginMode = req.soajs.tenantOauth.loginMode;
			}

			if (user) {
				user.loginMode = loginMode;
				user.id = user._id.toString();
				user.agent = req.get('user-agent');
				user.deviceId = req.get('device-id');
			}
			pinCheck(user, req.soajs, (error, user) => {
				if (error) {
					return cb(error);
				}
				options.provision.generateSaveAccessRefreshToken(user, req, (err, accessData) => {
					if (err) {
						return cb(bl.oauth_urac.handleError(req.soajs, 600, err));
					}

					let returnRecord = {
						"firstName": user.firstName,
						"lastName": user.lastName,
						"email": user.email,
						"mode": input.mode,
						"access": accessData
					};

					return cb(null, returnRecord);
				});
			});
		});
	});
}

module.exports = bl;
