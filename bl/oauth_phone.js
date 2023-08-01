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
		console.log("data", data);
		uracDriver.getRecord(soajs, data, function (error, record) {
			console.log("record", record);
			if (error || !record) {
				error = new Error(error.msg);
				return cb(bl.handleError(soajs, 413, error));
			}
			if (
				soajs.registry &&
				soajs.registry.custom &&
				soajs.registry.custom.oauth &&
				soajs.registry.custom.oauth.value &&
				soajs.registry.custom.oauth.value.demoAccount) {
				console.log(soajs.registry.custom.oauth.value.demoAccount);
				let demoPhones = [];
				if (soajs.registry.custom.oauth.value.demoAccount.phones && Array.isArray(soajs.registry.custom.oauth.value.demoAccount.phones)) {
					demoPhones = soajs.registry.custom.oauth.value.demoAccount.phones;
				}
				if (soajs.registry.custom.oauth.value.demoAccount.phone) {
					demoPhones.push(soajs.registry.custom.oauth.value.demoAccount.phone);
				}
				console.log(demoPhones);
				if (demoPhones.includes(inputmaskData.phone)) {
					return cb(null, true);
				}
			}
			let data = {
				"user": record,
				"type": inputmaskData.type,
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
							soajs.log.info(data.service + ': No ' + codeRecord.type + ' sent: ' + error.message);
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
				if (
					req.soajs.registry &&
					req.soajs.registry.custom &&
					req.soajs.registry.custom.oauth &&
					req.soajs.registry.custom.oauth.value &&
					req.soajs.registry.custom.oauth.value.demoAccount &&
					req.soajs.registry.custom.oauth.value.demoAccount.code === inputmaskData.code) {
					let demoPhones = [];
					if (req.soajs.registry.custom.oauth.value.demoAccount.phones && Array.isArray(req.soajs.registry.custom.oauth.value.demoAccount.phones)) {
						demoPhones = req.soajs.registry.custom.oauth.value.demoAccount.phones;
					}
					if (req.soajs.registry.custom.oauth.value.demoAccount.phone) {
						demoPhones.push(req.soajs.registry.custom.oauth.value.demoAccount.phone);
					}
					if (demoPhones.includes(inputmaskData.phone)) {
						// if (
						// 	req.soajs.registry &&
						// 	req.soajs.registry.custom &&
						// 	req.soajs.registry.custom.oauth &&
						// 	req.soajs.registry.custom.oauth.value &&
						// 	req.soajs.registry.custom.oauth.value.demoAccount &&
						// 	req.soajs.registry.custom.oauth.value.demoAccount.phone === inputmaskData.phone &&
						// 	req.soajs.registry.custom.oauth.value.demoAccount.code === inputmaskData.code) {

						let data = {
							'username': inputmaskData.phone
						};
						uracDriver.getRecord(req.soajs, data, function (error, record) {
							if (error || !record) {
								error = new Error(error.msg);
								return cb(bl.handleError(req.soajs, 413, error));
							}
							options.provision.getTenantOauth(req.soajs.tenant.id, (err, tenantOauth) => {
								req.soajs.tenantOauth = tenantOauth;

								let loginMode = bl.localConfig.loginMode;
								if (req.soajs.tenantOauth && req.soajs.tenantOauth.loginMode) {
									loginMode = req.soajs.tenantOauth.loginMode;
								}

								if (record) {
									record.loginMode = loginMode;
									record.id = record._id.toString();
								}
								options.provision.generateSaveAccessRefreshToken(record, req, (err, accessData) => {
									if (err) {
										return cb(bl.handleError(req.soajs, 600, err));
									}
									return cb(null, accessData);
								});
							});
						});
					} else {
						return cb(bl.handleError(req.soajs, 413, error));
					}
				} else {
					return cb(bl.handleError(req.soajs, 413, error));
				}
			} else {
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
				options.provision.getTenantOauth(req.soajs.tenant.id, (err, tenantOauth) => {
					req.soajs.tenantOauth = tenantOauth;

					let loginMode = bl.localConfig.loginMode;
					if (req.soajs.tenantOauth && req.soajs.tenantOauth.loginMode) {
						loginMode = req.soajs.tenantOauth.loginMode;
					}

					if (codeRecord.user) {
						codeRecord.user.loginMode = loginMode;
						codeRecord.user.id = codeRecord.user._id.toString();
					}
					options.provision.generateSaveAccessRefreshToken(codeRecord.user, req, (err, accessData) => {
						if (err) {
							return cb(bl.handleError(req.soajs, 600, err));
						}
						return cb(null, accessData);
					});
				});
			}
		});
	}
};

module.exports = bl;
