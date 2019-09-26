'use strict';

const async = require("async");
const fs = require("fs");
const soajsCoreModules = require('soajs');

let soajsUtils = soajsCoreModules.utils;
let Auth = soajsCoreModules.authorization;

const uracDriver = require("soajs.urac.driver");

let SSOT = {};
let model = process.env.SOAJS_SERVICE_MODEL || "mongo";

const BLs = ["oauth"];

function checkUserTenantAccessPin(record, tenantObj) {
	if (record && record.tenant && tenantObj && tenantObj.id) {
		if (record.tenant.id === tenantObj.id) {
			return record.tenant;
		}
		if (record.config && record.config.allowedTenants) {
			for (let i = 0; i < record.config.allowedTenants.length; i++) {
				if (record.config.allowedTenants[i].tenant && (record.config.allowedTenants[i].tenant.id === tenantObj.id)) {
					return record.config.allowedTenants[i].tenant;
				}
			}
		}
	}
	return null;
}

let bl = {
	init: init,
	oauth: null,
	
	"passportLogin": (req, res, options, cb) => {
		uracDriver.passportLibInit(req, function (error, passport) {
			if (error) {
				return cb(error, null);
			}
			uracDriver.passportLibInitAuth(req, res, passport);
		});
	},
	
	"passportValidate": (req, res, options, cb) => {
		uracDriver.passportLibInit(req, function (error, passport) {
			if (error) {
				return cb(error, null);
			}
			uracDriver.passportLibAuthenticate(req, res, passport, function (error, user) {
				if (error) {
					return cb(error, null);
				}
				user.id = user._id.toString();
				options.provision.generateSaveAccessRefreshToken(user, req, function (err, accessData) {
					if (err) {
						return cb(bl.oauth.handleError(req.soajs, 600, err));
					}
					
					let mode = req.soajs.inputmaskData.strategy;
					delete user.password;
					
					let returnRecord = soajsUtils.cloneObj(user);
					returnRecord.socialLogin = {};
					returnRecord.socialLogin = user.socialId[mode];
					returnRecord.socialLogin.strategy = mode;
					
					delete returnRecord.socialId;
					
					if (returnRecord.config && returnRecord.config.packages) {
						delete returnRecord.config.packages;
					}
					if (returnRecord.config && returnRecord.config.keys) {
						delete returnRecord.config.keys;
					}
					returnRecord._id = user._id;
					returnRecord.accessTokens = accessData;
					
					return cb(null, returnRecord);
				});
			});
		});
	},
	
	"openam": (req, inputmaskData, options, cb) => {
		let data = {
			'token': inputmaskData.token
		};
		uracDriver.openamLogin(req.soajs, data, function (error, data) {
			if (error) {
				return cb(error, null);
			}
			options.provision.generateSaveAccessRefreshToken(data, req, function (err, accessData) {
				if (err) {
					return cb(bl.oauth.handleError(req.soajs, 600, err));
				}
				data.accessTokens = accessData;
				return cb(null, data);
			});
		});
	},
	
	"ldap": (req, inputmaskData, options, cb) => {
		let data = {
			'username': inputmaskData.username,
			'password': inputmaskData.password
		};
		
		uracDriver.ldapLogin(req.soajs, data, function (error, data) {
			if (error) {
				return cb(error, null);
			}
			
			options.provision.generateSaveAccessRefreshToken(data, req, function (err, accessData) {
				if (err) {
					return cb(bl.oauth.handleError(req.soajs, 600, err));
				}
				data.accessTokens = accessData;
				return cb(null, data);
			});
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
				return cb(bl.oauth.handleError(soajs, 406, err));
			}
		});
	},
	
	"getUserRecordByPin": (soajs, inputmaskData, options, cb) => {
		options.provision.getTenantOauth(soajs.tenant.id, (err, tenantOauth) => {
			soajs.tenantOauth = tenantOauth;
			let loginMode = bl.oauth.localConfig.loginMode;
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
						record.loginMode = loginMode;
						record.id = record._id.toString();
					}
					return cb(null, record);
				});
			}
			else {
				let error = bl.oauth.handleError(soajs, 451, null);
				error = new Error(error.msg);
				return cb(error);
			}
		});
	},
	
	"getUserRecord": (soajs, inputmaskData, options, cb) => {
		options.provision.getTenantOauth(soajs.tenant.id, (err, tenantOauth) => {
			soajs.tenantOauth = tenantOauth;
			
			let loginMode = bl.oauth.localConfig.loginMode;
			if (soajs && soajs.tenantOauth && soajs.tenantOauth.loginMode) {
				loginMode = soajs.tenantOauth.loginMode;
			}
			
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
						let error = bl.oauth.handleError(soajs, 450, null);
						error = new Error(error.msg);
						return cb(error);
					}
				}
				else {
					return cb(null, record);
				}
			};
			
			let getLocal = () => {
				let data = {
					'username': inputmaskData.username,
					'loginMode': loginMode
				};
				bl.oauth.getUser(soajs, data, options, (error, record) => {
					if (error) {
						error = new Error(error.msg);
						return cb(error);
					}
					return pinCheck(record);
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
					return pinCheck(record);
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
		return cb(null);
	});
}

module.exports = bl;
