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

let SSOT = {};
let model = process.env.SOAJS_SERVICE_MODEL || "mongo";

const BLs = ["oauth_token", "oauth_urac"];

let bl = {
	init: init,
	oauth_urac: null,
	oauth_token: null,
	
	"passportLogin": (req, res, options, cb) => {
		passport.init(req.soajs, (error, _passport) => {
			if (error) {
				return cb(error, null);
			}
			passport.login(req, res, _passport, (error) => {
				if (error) {
					return cb(error, null);
				}
			});
		});
	},
	
	"passportValidate": (req, res, options, cb) => {
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
			}
			else {
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
					}
					return cb(null, record);
				});
			}
			else {
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
					}
					return pinCheck(record, soajs, cb);
				});
			}
			else {
				getLocal();
			}
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
			return cb({name: blName, model: typeModel});
		}
	};
	async.each(BLs, fillModels, function (err) {
		if (err) {
			service.log.error(`Requested model not found. make sure you have a model for ${err.name} @ ${err.model}`);
			return cb({"code": 601, "msg": localConfig.errors[601]});
		}
		integrationLib.loadDrivers(service);
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
}

function thirdpartySaveAndGrantAccess(req, input, options, cb) {
	let mode = req.soajs.inputmaskData.strategy;
	if (req.soajs.servicesConfig && req.soajs.servicesConfig.oauth && req.soajs.servicesConfig.oauth.passportLogin && req.soajs.servicesConfig.oauth.passportLogin[mode]) {
		let config = req.soajs.servicesConfig.oauth.passportLogin[mode];
		if (config.groups && Array.isArray(config.groups)) {
			input.user.groups = config.groups;
		}
	}
	if (input && input.user.email) {
		input.email = input.user.email.toLowerCase();
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
