'use strict';
var soajsCore = require('soajs');
var config = require('./config.js');
var service = new soajsCore.server.service(config);

var BLModule = require('./lib/oauth.js');

function initBLModel(req, res, cb) {
	var modelName = config.model;
	if (req.soajs.servicesConfig && req.soajs.servicesConfig.model) {
		modelName = req.soajs.servicesConfig.model
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
	
	service.get("/authorization", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.generateAuthValue(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/token", function (req, res, next) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			service.oauth.model["getUser"] = function (username, password, callback) {
				BLInstance.createToken(req, function (errCode, record) {
					if (errCode) {
						var error = new Error(config.errors[errCode]);
						return callback(error);
					}
					else {
						return callback(false, {"id": record._id.toString()});
					}
				});
			};
			next();
		});
		
	}, service.oauth.grant());
	
	service.delete("/accessToken/:token", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.deleteAccessToken(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.delete("/refreshToken/:token", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.deleteRefreshToken(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.delete("/tokens/:client", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.deleteAllTokens(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.start();
});
