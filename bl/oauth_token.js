'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */


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
	
	"deleteAccessToken": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let modelObj = bl.mp.getModel(soajs, options);
		let data = {
			"token": inputmaskData.token,
			"type": "accessToken"
		};
		modelObj.delete(data, (err, count) => {
			bl.mp.closeModel(soajs, modelObj);
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			return cb(null, count);
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
		modelObj.delete(data, (err, count) => {
			bl.mp.closeModel(soajs, modelObj);
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			return cb(null, count);
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
			modelObj.delete(data, (err, count) => {
				bl.mp.closeModel(soajs, modelObj);
				if (err) {
					return cb(bl.handleError(soajs, 602, err));
				}
				return cb(null, count);
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
		modelObj.delete(data, (err, count) => {
			bl.mp.closeModel(soajs, modelObj);
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			return cb(null, count);
		});
	}
	
};

module.exports = bl;