'use strict';

const soajsCoreModules = require('soajs');

let coreHasher = soajsCoreModules.hasher;

let bl = {
	"modelObj": null,
	"model": null,
	"soajs_service": null,
	"localConfig": null,
	
	"handleError": (soajs, errCode, err) => {
		if (err) {
			soajs.log.error(err);
		}
		return ({
			"code": errCode,
			"msg": bl.localConfig.errors[errCode] + ((err && errCode === 602) ? err.message : "")
		});
	},
	
	"mp": {
		"getModel": (soajs) => {
			let modelObj = bl.modelObj;
			if (soajs && soajs.tenant && soajs.tenant.type === "client" && soajs.tenant.dbConfig) {
				let options = {
					"dbConfig": soajs.tenant.dbConfig,
					"index": soajs.tenant.id
				};
				modelObj = new bl.model(bl.soajs_service, options, null);
			}
			return modelObj;
		},
		"closeModel": (soajs, modelObj) => {
			if (soajs && soajs.tenant && soajs.tenant.type === "client" && soajs.tenant.dbConfig) {
				modelObj.closeConnection();
			}
		}
	},
	
	"getUser": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		inputmaskData = inputmaskData || {};
		let modelObj = bl.mp.getModel(soajs, options);
		let data = {
			"username": inputmaskData.username
		};
		modelObj.getUser(data, (err, record) => {
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			if (record) {
				let hashConfig = {
					"hashIterations": bl.localConfig.hashIterations,
					"seedLength": bl.localConfig.seedLength
				};
				if (soajs.servicesConfig && soajs.servicesConfig.oauth) {
					if (soajs.servicesConfig.oauth.hashIterations && soajs.servicesConfig.oauth.seedLength) {
						hashConfig = {
							"hashIterations": soajs.servicesConfig.oauth.hashIterations,
							"seedLength": soajs.servicesConfig.oauth.seedLength
						};
					}
				}
				coreHasher.init(hashConfig);
				coreHasher.compare(soajs.inputmaskData.password, record.password, function (err, result) {
					if (err || !result) {
						return cb(bl.handleError(soajs, 413, null));
					}
					
					delete record.password;
					if (record.tId && soajs.tenant) {
						if (record.tId.toString() !== soajs.tenant.id) {
							return cb(bl.handleError(soajs, 403, null));
						}
					}
					if (record) {
						record.loginMode = inputmaskData.loginMode;
						record.id = record._id.toString();
					}
					return cb(null, record);
				});
			}
			else {
				return cb(bl.handleError(soajs, 401, null));
			}
		});
	},
	
	"deleteAccessToken": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let modelObj = bl.mp.getModel(soajs, options);
		let data = {
			"token": inputmaskData.token,
			"type": "accessToken"
		};
		modelObj.delete(data, (err, records) => {
			bl.mp.closeModel(soajs, modelObj);
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			return cb(null, records);
		});
	},
	
	"deleteRefreshToken": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let modelObj = bl.mp.getModel(soajs, options);
		let data = {
			"token": inputmaskData.token,
			"type": "refreshToken"
		};
		modelObj.delete(data, (err, records) => {
			bl.mp.closeModel(soajs, modelObj);
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			return cb(null, records);
		});
	},
	
	"deleteAllUserTokens": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		options.provision.getTenantOauth(soajs.tenant.id, (err, tenantOauth) => {
			soajs.tenantOauth = tenantOauth;
			
			let loginMode = bl.localConfig.loginMode;
			if (soajs && soajs.tenantOauth && soajs.tenantOauth.loginMode) {
				loginMode = soajs.tenantOauth.loginMode;
			}
			
			let data = {
				"user": {
					"loginMode": loginMode,
					"id": inputmaskData.userId
				}
			};
			let modelObj = bl.mp.getModel(soajs, options);
			modelObj.delete(data, (err, records) => {
				bl.mp.closeModel(soajs, modelObj);
				if (err) {
					return cb(bl.handleError(soajs, 602, err));
				}
				return cb(null, records);
			});
		});
	},
	
	"deleteAllClientTokens": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let modelObj = bl.mp.getModel(soajs, options);
		let data = {
			"clientId": inputmaskData.clientId
		};
		modelObj.delete(data, (err, records) => {
			bl.mp.closeModel(soajs, modelObj);
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			return cb(null, records);
		});
	}
	
	
};