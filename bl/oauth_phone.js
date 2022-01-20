'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */


const lib = {
	"message": require("../lib/message.js")
};
const uracDriver = require("soajs.urac.driver");

let bl = {
	"modelObj": null,
	"model": null,
	"soajs_service": null,
	"localConfig": null,
	
	"handleError": (soajs, errCode, err) => {
		if (err) {
			soajs.log.error(err.message);
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
	
	"login": (soajs, inputmaskData, options, cb) => {
		let data = {
			'username': inputmaskData.phone
		};
		uracDriver.getRecord(soajs, data, function (error, record) {
			if (error || !record) {
				error = new Error(error.msg);
				return cb(bl.handleError(soajs, 413, error));
			}
			let data = {
				"user": record,
				"phone": inputmaskData.phone,
				"agent": inputmaskData.agent,
				"geo": inputmaskData.geo || null,
				"tokenExpiryTTL": 2 * 24 * 3600000,
				"service": "loginPhone"
			};
			if (soajs.servicesConfig && soajs.servicesConfig.oauth && soajs.servicesConfig.oauth.tokenExpiryTTL) {
				data.tokenExpiryTTL = soajs.servicesConfig.oauth.tokenExpiryTTL;
			} else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.oauth && soajs.registry.custom.oauth.value && soajs.registry.custom.oauth.value.tokenExpiryTTL) {
				data.tokenExpiryTTL = soajs.registry.custom.oauth.value.tokenExpiryTTL;
			}
			
			let modelObj = bl.mp.getModel(soajs, options);
			modelObj.addCode(data, (error, codeRecord) => {
				bl.mp.closeModel(soajs, modelObj);
				if (error || !codeRecord) {
					return cb(bl.handleError(soajs, 413, error));
				}
				if (soajs.registry && soajs.registry.custom && soajs.registry.custom.oauth && soajs.registry.custom.oauth.value && soajs.registry.custom.oauth.value.skipSMS) {
					return cb(null, codeRecord);
				} else {
					lib.message.send(soajs, data.service, data.user, codeRecord, function (error) {
						if (error) {
							soajs.log.info(data.service + ': No SMS was sent: ' + error.message);
							return cb(bl.handleError(soajs, 413, error));
						}
						return cb(null, true);
					});
				}
			});
		});
	},
	
	"loginValidate": (req, inputmaskData, options, cb) => {
		let data = {
			"code": inputmaskData.code,
			"status": "active",
			"service": "loginPhone"
		};
		let modelObj = bl.mp.getModel(req.soajs, options);
		modelObj.getCode(data, (error, codeRecord) => {
			bl.mp.closeModel(req.soajs, modelObj);
			if (error || !codeRecord) {
				console.log(req.soajs.servicesConfig.oauth.demoAccount)
				console.log(inputmaskData)
				if (req.soajs.servicesConfig &&
					req.soajs.servicesConfig.oauth &&
					req.soajs.servicesConfig.oauth.demoAccount &&
					req.soajs.servicesConfig.oauth.demoAccount.phone === inputmaskData.phone &&
					req.soajs.servicesConfig.oauth.demoAccount.code === inputmaskData.code) {
					let data = {
						'username': inputmaskData.phone
					};
					uracDriver.getRecord(req.soajs, data, function (error, record) {
						if (error || !record) {
							error = new Error(error.msg);
							return cb(bl.handleError(req.soajs, 413, error));
						}
						options.provision.generateSaveAccessRefreshToken(record, req, (err, accessData) => {
							if (err) {
								return cb(bl.handleError(req.soajs, 600, err));
							}
							return cb(null, accessData);
						});
					});
				} else {
					return cb(bl.handleError(req.soajs, 413, error));
				}
			}
			if (new Date(codeRecord.expires).getTime() < new Date().getTime()) {
				return cb(bl.handleError(req.soajs, 599, null));
			}
			const agent = req.get('user-agent');
			if (codeRecord.agent !== agent) {
				return cb(bl.handleError(req.soajs, 413, new Error("Agent mismatch " + agent)));
			}
			if (codeRecord.phone !== inputmaskData.phone) {
				return cb(bl.handleError(req.soajs, 413, new Error("Phone mismatch")));
			}
			let data = {
				"code": inputmaskData.code,
				"status": "used"
			};
			modelObj.updateStatus(data, () => {
				// no need to do anything here.
			});
			options.provision.generateSaveAccessRefreshToken(codeRecord.user, req, (err, accessData) => {
				if (err) {
					return cb(bl.handleError(req.soajs, 600, err));
				}
				return cb(null, accessData);
			});
		});
	}
};

module.exports = bl;
