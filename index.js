'use strict';
var soajsCore = require('soajs');
var config = require('./config.js');
var service = new soajsCore.server.service(config);

var BLModule = require('./lib/oauth.js');

/**
 * Initialize the Business Logic model
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Callback Function} cb
 */
function initBLModel(req, res, cb) {
	var modelName = config.model;
	if (req.soajs.servicesConfig && req.soajs.servicesConfig.model) {
		modelName = req.soajs.servicesConfig.model;
	}
	if (process.env.SOAJS_TEST && req.soajs.inputmaskData.model) {
		modelName = req.soajs.inputmaskData.model;
	}
	BLModule.init(modelName, function (error, BL) {
		if (error) {
			req.soajs.log.error(error);
			return res.json(req.soajs.buildResponse({"code": 601, "msg": config.errors[601]}));
		}
		else {
			return cb(BL);
		}
	});
}


service.init(function () {

    if (!service.oauth) {
        var coreModules = require("soajs").core;
        var provision = coreModules.provision;
        var oauthserver = require('oauth2-server');
        var reg = service.registry.get();
        service.oauth = oauthserver({
            model: provision.oauthModel,
            grants: reg.serviceConfig.oauth.grants,
            debug: reg.serviceConfig.oauth.debug,
            accessTokenLifetime: reg.serviceConfig.oauth.accessTokenLifetime,
            refreshTokenLifetime: reg.serviceConfig.oauth.refreshTokenLifetime
        });
        provision.init(reg.coreDB.provision, service.log);
        provision.loadProvision(function (loaded) {
            if (loaded)
                service.log.info("Service provision loaded.");
        });
    }

	/**
	 * Generate Authorization based on model provided from input and tenant id from request
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/authorization", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.generateAuthValue(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});

	/**
	 * Generate Access & Refresh Tokens for the user
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/token", function (req, res, next) {
		//rewrite headers content-type so that oauth.grant works
		req.headers['content-type'] = 'application/x-www-form-urlencoded';
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			service.oauth.model["getUser"] = function (username, password, callback) {
				BLInstance.getUserRecord(req, function (errCode, record) {
					if (errCode) {
						var error = new Error(config.errors[errCode]);
						return callback(error);
					}

					if (record) {
						record.id = record._id.toString();
					}
					return callback(false, record);
				});
			};

			next();
		});
	}, service.oauth.grant());

	/**
	 * Delete Access token for the user
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.delete("/accessToken/:token", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.deleteAccessToken(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});

	/**
	 * Delete Refresh Token for the user
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.delete("/refreshToken/:token", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.deleteRefreshToken(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});

	/**
	 * Delete all tokens for the User
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.delete("/tokens/user/:userId", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.deleteAllTokens(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});

	/**
	 * Delete all tokens for the client
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.delete("/tokens/tenant/:clientId", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.deauthorize(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});

	service.start();
});
