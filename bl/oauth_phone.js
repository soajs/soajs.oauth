'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */


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
				"geo": inputmaskData.geo,
				"tokenExpiryTTL": 2 * 24 * 3600000,
				"service": "loginPhone"
			};
			let modelObj = bl.mp.getModel(soajs, options);
			modelObj.addCode(data, (error, codeRecord) => {
				bl.mp.closeModel(soajs, modelObj);
				if (error || !codeRecord) {
					return cb(bl.handleError(soajs, 413, error));
				}
				//TODO send code by sms with twilio
				
				return cb(null, codeRecord);
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
			console.log("codeRecord",codeRecord);
			if (error || !codeRecord) {
				return cb(bl.handleError(req.soajs, 413, error));
			}
			if (new Date(codeRecord.expires).getTime() < new Date().getTime()) {
				return cb(bl.handleError(req.soajs, 599, null));
			}
			const agent = req.get('user-agent');
			const geo = req.get('x-forwarded-for');
			if (codeRecord.agent !== agent) {
				return cb(bl.handleError(req.soajs, 413, new Error("Agent mismatch")));
			}
			if (codeRecord.geo !== geo) {
				return cb(bl.handleError(req.soajs, 413, new Error("GEO mismatch")));
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
