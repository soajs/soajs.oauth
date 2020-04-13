'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

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
					"hashIterations": bl.localConfig.hashIterations
				};
				if (soajs.servicesConfig && soajs.servicesConfig.hashIterations) {
					hashConfig = {
						"hashIterations": soajs.servicesConfig.hashIterations
					};
				}
				coreHasher.init(hashConfig);
				//NOTE: oauth user does not use optionalAlgorithm, so no need to do coreHasher.update
				coreHasher.compare(inputmaskData.password, record.password, function (err, result) {
					if (err || !result) {
						return cb(bl.handleError(soajs, 413, err));
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
	}
};

module.exports = bl;