'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const soajs = require('soajs');

let config = require('./config.js');
config.packagejson = require("./package.json");

const bl = require("./bl/index.js");

const service = new soajs.server.service(config);

const provision = require("soajs").provision;
const oauthserver = require('oauth2-server');

function run(serviceStartCb) {
	service.init(() => {
		bl.init(service, config, (error) => {
			if (error) {
				throw new Error('Failed starting service');
			}
			
			if (!service.oauth) {
				let reg = service.registry.get();
				let oauthOptions = {
					model: provision.oauthModel
				};
				
				//grants check
				if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.grants) {
					oauthOptions.grants = reg.serviceConfig.oauth.grants;
				} else {
					service.log.debug("Unable to find grants entry in registry, defaulting to", config.oauthServer.grants);
					oauthOptions.grants = config.oauthServer.grants;
				}
				
				//debug check
				if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.debug) {
					oauthOptions.debug = reg.serviceConfig.oauth.debug;
				} else {
					service.log.debug("Unable to find debug entry in registry, defaulting to", config.oauthServer.debug);
					oauthOptions.debug = config.oauthServer.debug;
				}
				
				//accessTokenLifetime check
				if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.accessTokenLifetime) {
					oauthOptions.accessTokenLifetime = reg.serviceConfig.oauth.accessTokenLifetime;
				} else {
					service.log.debug("Unable to find accessTokenLifetime entry in registry, defaulting to", config.oauthServer.accessTokenLifetime);
					oauthOptions.accessTokenLifetime = config.oauthServer.accessTokenLifetime;
				}
				
				//refreshTokenLifetime check
				if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.refreshTokenLifetime) {
					oauthOptions.refreshTokenLifetime = reg.serviceConfig.oauth.refreshTokenLifetime;
				} else {
					service.log.debug("Unable to find refreshTokenLifetime entry in registry, defaulting to", config.oauthServer.refreshTokenLifetime);
					oauthOptions.refreshTokenLifetime = config.oauthServer.refreshTokenLifetime;
				}
				service.oauth = oauthserver(oauthOptions);
				
				let dbConfig = reg.coreDB.provision;
				if (reg.coreDB.oauth) {
					dbConfig = {
						"provision": reg.coreDB.provision,
						"oauth": reg.coreDB.oauth
					};
				}
				provision.init(dbConfig, service.log);
				provision.loadProvision(function (loaded) {
					if (loaded) {
						service.log.info("Service provision loaded.");
					}
				});
				service.appMaintenance.get("/loadProvision", function (req, res) {
					provision.loadProvision(function (loaded) {
						let response = service.maintenanceResponse(req);
						response.result = loaded;
						res.jsonp(response);
					});
				});
			}
			
			service.get('/roaming', (req, res) => {
				if (req.soajs.servicesConfig.oauth &&
					req.soajs.servicesConfig.oauth.roaming &&
					req.soajs.servicesConfig.oauth.roaming.whitelistips &&
					Array.isArray(req.soajs.servicesConfig.oauth.roaming.whitelistips)) {
					
					let clientIp = req.getClientIP();
					let whitelistips = req.soajs.servicesConfig.oauth.roaming.whitelistips;
					
					if (whitelistips.includes(clientIp)) {
						let inject = req.headers.soajsinjectobj;
						res.set('soajsinjectobj', inject);
						return res.json(req.soajs.buildResponse(null, true));
					}
				}
				let error = {code: 404, msg: config.errors[404]};
				return res.json(req.soajs.buildResponse(error, null));
			});
			
			service.get('/available/login', (req, res) => {
				let data = {
					"thirdparty": [],
					"local": {
						"available": true
					}
				};
				if (req.soajs.servicesConfig.oauth) {
					if (req.soajs.servicesConfig.oauth.local) {
						let local = req.soajs.servicesConfig.oauth.local;
						if (local.hasOwnProperty("available")) {
							data.local.available = !!local.available;
						}
						if (local.whitelist && Array.isArray(local.whitelist) && local.whitelist.length > 0) {
							data.local.available = true;
						}
					}
					if (req.soajs.servicesConfig.oauth.passportLogin) {
						let passportLogin = req.soajs.servicesConfig.oauth.passportLogin;
						for (let strategy in passportLogin) {
							if (passportLogin.hasOwnProperty(strategy)) {
								data.thirdparty.push(strategy);
							}
						}
					}
					if (req.soajs.servicesConfig.oauth.openam) {
						data.thirdparty.push("openam");
					}
					if (req.soajs.servicesConfig.oauth.ldapServer) {
						data.thirdparty.push("ldap");
					}
					return res.json(req.soajs.buildResponse(null, data));
				} else {
					return res.json(req.soajs.buildResponse(null, data));
				}
				
			});
			
			service.get('/passport/login/:strategy', (req, res) => {
				bl.passportLogin(req, res, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.get('/passport/validate/:strategy', (req, res) => {
				bl.passportValidate(req, res, {"provision": provision}, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.post('/openam/login', (req, res) => {
				bl.openam(req, req.soajs.inputmaskData, {"provision": provision}, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.post('/ldap/login', (req, res) => {
				bl.ldap(req, req.soajs.inputmaskData, {"provision": provision}, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.get("/authorization", (req, res) => {
				bl.authorization(req.soajs, req.soajs.inputmaskData, {"provision": provision}, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.post("/token", (req, res, next) => {
				let allowed = true;
				if (req.soajs.servicesConfig.oauth && req.soajs.servicesConfig.oauth.local) {
					let local = req.soajs.servicesConfig.oauth.local;
					if (local.hasOwnProperty("available")) {
						allowed = !!local.available;
					}
					if (!allowed && local.whitelist && Array.isArray(local.whitelist) && local.whitelist.length > 0) {
						if (local.whitelist.includes(req.soajs.inputmaskData.username)) {
							allowed = true;
						}
					}
				}
				if (!allowed) {
					let errCode = 414;
					return res.json(req.soajs.buildResponse({"code": errCode, "msg": config.errors[errCode]}, null));
				}
				
				//rewrite headers content-type so that oauth.grant works
				req.headers['content-type'] = 'application/x-www-form-urlencoded';
				
				service.oauth.model.getUser = (username, password, callback) => {
					bl.getUserRecord(req.soajs, req.soajs.inputmaskData, {"provision": provision}, (error, record) => {
						return callback(error, record);
					});
				};
				
				if (!req.headers.authorization) {
					bl.authorization(req.soajs, req.soajs.inputmaskData, {"provision": provision}, (error, data) => {
						if (error) {
							return res.json(req.soajs.buildResponse(error, data));
						} else {
							req.headers.authorization = data;
							next();
						}
					});
				} else {
					next();
				}
			}, service.oauth.grant());
			
			service.post("/pin", (req, res, next) => {
				//rewrite headers content-type so that oauth.grant works
				req.headers['content-type'] = 'application/x-www-form-urlencoded';
				
				// we should set password and username for oauth to work
				// we should also remove access_token since the request passed the gateway
				// we should add authorization to be able to generate a new access token
				//      or set req.body.client_id, req.body.client_secret instead
				req.body = req.body || {};
				req.body.username = "NA";
				req.body.password = "NA";
				if (req.query.access_token) {
					delete req.query.access_token;
				}
				service.oauth.model.getUser = (username, password, callback) => {
					bl.getUserRecordByPin(req.soajs, req.soajs.inputmaskData, {"provision": provision}, (error, record) => {
						return callback(error, record);
					});
				};
				
				bl.authorization(req.soajs, req.soajs.inputmaskData, {"provision": provision}, (error, data) => {
					if (error) {
						return res.json(req.soajs.buildResponse(error, data));
					} else {
						req.headers.authorization = data;
						next();
					}
				});
			}, service.oauth.grant());
			
			service.delete("/accessToken/:token", (req, res) => {
				bl.oauth_token.deleteAccessToken(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.delete("/refreshToken/:token", (req, res) => {
				bl.oauth_token.deleteRefreshToken(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.delete("/tokens/user/:userId", (req, res) => {
				bl.oauth_token.deleteAllUserTokens(req.soajs, req.soajs.inputmaskData, {"provision": provision}, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.delete("/tokens/tenant/:clientId", (req, res) => {
				bl.oauth_token.deleteAllClientTokens(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.start(serviceStartCb);
		});
	});
}

module.exports = {
	"runService": (serviceStartCb) => {
		if (serviceStartCb && typeof serviceStartCb === "function") {
			run(serviceStartCb);
		} else {
			run(null);
		}
	}
};
