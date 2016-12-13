'use strict';
var soajs = require('soajs');

var config = require('./config.js');
var Hasher = require("./hasher.js");

var userCollectionName = "oauth_urac";
var tokenCollectionName = "oauth_token";
var Mongo = soajs.mongo;
var mongo = null;

var service = new soajs.server.service(config);

service.init(function () {
	function checkForMongo(req) {
		if (!mongo) {
			mongo = new Mongo(req.soajs.registry.coreDB.provision);
		}
	}
	
	function checkIfError(soajs, res, data, cb) {
		if (data.error) {
			if (typeof (data.error) === 'object' && data.error.message) {
				soajs.log.error(data.error);
			}
			
			return res.jsonp(soajs.buildResponse({"code": data.code, "msg": data.config.errors[data.code]}));
		} else {
			if (cb) return cb();
		}
	}
	
	function login(req, cb) {
		checkForMongo(req);
		mongo.findOne(userCollectionName, {'userId': req.soajs.inputmaskData['username']}, function (err, record) {
			if (record) {
				var hashConfig = {
					"hashIterations": config.hashIterations,
					"seedLength": config.seedLength
				};
				
				if (req.soajs.registry.serviceConfig.oauth) {
					if (req.soajs.registry.serviceConfig.oauth.hashIterations && req.soajs.registry.serviceConfig.oauth.seedLength) {
						hashConfig = {
							"hashIterations": req.soajs.registry.serviceConfig.oauth.hashIterations,
							"seedLength": req.soajs.registry.serviceConfig.oauth.seedLength
						};
					}
				}
				var hasher = new Hasher(hashConfig);
				hasher.compare(req.soajs.inputmaskData.password, record.password, function (err, result) {
					if (err) {
						return cb(400);
					}
					
					if (!result) {
						return cb(401);
					}
					
					delete record.password;
					if (record.tId && req.soajs.tenant) {
						if (record.tId.toString() !== req.soajs.tenant.id) {
							return cb(403);
						}
					}
					//TODO: keys here
					return cb(null, record);
				});
			}
			else {
				return cb(401);
			}
		});
	}
	
	service.post("/token", function (req, res, next) {
		service.oauth.model["getUser"] = function (username, password, callback) {
			login(req, function (errCode, record) {
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
	}, service.oauth.grant());
	
	service.delete("/accessToken/:token", function (req, res) {
		checkForMongo(req);
		var criteria = {"token": req.soajs.inputmaskData.token, "type": "accessToken"};
		mongo.remove(tokenCollectionName, criteria, function (err, result) {
			checkIfError(req.soajs, res, {config: config, error: err, code: 404}, function () {
				return res.jsonp(req.soajs.buildResponse(null, result.result));
			});
		});
	});
	service.delete("/refreshToken/:token", function (req, res) {
		checkForMongo(req);
		var criteria = {"token": req.soajs.inputmaskData.token, "type": "refreshToken"};
		mongo.remove(tokenCollectionName, criteria, function (err, result) {
			checkIfError(req.soajs, res, {config: config, error: err, code: 404}, function () {
				return res.jsonp(req.soajs.buildResponse(null, result.result));
			});
		});
	});
	service.delete("/tokens/:client", function (req, res) {
		checkForMongo(req);
		var criteria = {"clientId": req.soajs.inputmaskData.client};
		mongo.remove(tokenCollectionName, criteria, function (err, result) {
			checkIfError(req.soajs, res, {config: config, error: err, code: 404}, function () {
				return res.jsonp(req.soajs.buildResponse(null, result.result));
			});
		});
	});
	
	service.start();
});
