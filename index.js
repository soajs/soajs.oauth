'use strict';

const soajs = require('soajs');

let config = require('./config.js');
config.packagejson = require("./package.json");

const bl = require("./bl/index.js");

const service = new soajs.server.service(config);

const provision = require("soajs").provision;
const oauthserver = require('oauth2-server');

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
			}
			else {
				service.log.debug("Unable to find grants entry in registry, defaulting to", config.oauthServer.grants);
				oauthOptions.grants = config.oauthServer.grants;
			}
			
			//debug check
			if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.debug) {
				oauthOptions.debug = reg.serviceConfig.oauth.debug;
			}
			else {
				service.log.debug("Unable to find debug entry in registry, defaulting to", config.oauthServer.debug);
				oauthOptions.debug = config.oauthServer.debug;
			}
			
			//accessTokenLifetime check
			if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.accessTokenLifetime) {
				oauthOptions.accessTokenLifetime = reg.serviceConfig.oauth.accessTokenLifetime;
			}
			else {
				service.log.debug("Unable to find accessTokenLifetime entry in registry, defaulting to", config.oauthServer.accessTokenLifetime);
				oauthOptions.accessTokenLifetime = config.oauthServer.accessTokenLifetime;
			}
			
			//refreshTokenLifetime check
			if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.refreshTokenLifetime) {
				oauthOptions.refreshTokenLifetime = reg.serviceConfig.oauth.refreshTokenLifetime;
			}
			else {
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
					}
					else {
						req.headers.authorization = data;
						next();
					}
				});
			}
			else {
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
				bl.getUserRecordByPin(req.soajs, req.soajs.inputmaskData, null, (error, record) => {
					return callback(error, record);
				});
			};
			
			bl.authorization(req.soajs, req.soajs.inputmaskData, {"provision": provision}, (error, data) => {
				if (error) {
					return res.json(req.soajs.buildResponse(error, data));
				}
				else {
					req.headers.authorization = data;
					next();
				}
			});
		}, service.oauth.grant());
		
		service.delete("/accessToken/:token", (req, res) => {
			bl.oauth.deleteAccessToken(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
		
		service.delete("/refreshToken/:token", (req, res) => {
			bl.oauth.deleteRefreshToken(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
		
		service.delete("/tokens/user/:userId", (req, res) => {
			bl.oauth.deleteAllUserTokens(req.soajs, req.soajs.inputmaskData, {"provision": provision}, (error, data) => {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
		
		service.delete("/tokens/tenant/:clientId", (req, res) => {
			bl.oauth.deleteAllClientTokens(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
		
		service.start();
	});
});
