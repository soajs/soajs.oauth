'use strict';
var soajs = require('soajs');

var config = require('./config.js');
var Hasher = require("./hasher.js");

var userCollectionName = "oauth_urac";
var tokenCollectionName = "oauth_token";
var Mongo = soajs.mongo;
var mongo = null;

var service = new soajs.server.service({
	"oauth": true,
    "security": true,
    "oauthService" : {
        "name" : config.serviceName,
        "tokenApi" : "/token"
    },
	"config": config
});

service.init(function () {
    function checkForMongo(req) {
        if (!mongo) {
            mongo = new Mongo(req.soajs.registry.coreDB.provision);
        }
    }

    function login(req, cb) {
        checkForMongo(req);
        mongo.findOne(userCollectionName, {'userId': req.soajs.inputmaskData['username']}, function (err, record) {
            if (record) {
                var hashConfig = {
                    "hashIterations": req.soajs.registry.serviceConfig.oauth.hashIterations || config.hashIterations,
                    "seedLength": req.soajs.registry.serviceConfig.oauth.seedLength || config.seedLength
                };
                var hasher = new Hasher(hashConfig);
                hasher.compare(req.soajs.inputmaskData.password, record.password, function (err, result) {
                    if (err) {
                        return cb(400);
                    }

                    if (!result) {
                        return cb(401);
                    }

                    delete record.password;
                    if (record.tId) {
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
        login(req, function (err, record) {
            if (err) {
                return res.jsonp(req.soajs.buildResponse({"code": err, "msg": config.errors[err]}));
            }
            else {
                var tokenRecord = {};
                checkForMongo(req);
                service.oauth.model["getUser"] = function (username, password, callback) {
                    callback(false, {"id": record._id.toString()});
                };
                service.oauth.model["saveAccessToken"] = function (accessToken, clientId, expires, userId, callback) {
                    tokenRecord.oauthAccessToken = {
                        accessToken: accessToken,
                        clientId: clientId,
                        userId: userId,
                        expires: expires
                    };

                    if (req.soajs.registry.serviceConfig.oauth.grants.indexOf('refresh_token') >= 0) {
                        callback(false);
                    } else {
                        mongo.insert(tokenCollectionName, tokenRecord, function (err, data) {
                            callback(false);
                        });
                    }
                };
                service.oauth.model["saveRefreshToken"] = function (refreshToken, clientId, expires, userId, callback) {
                    tokenRecord.oauthRefreshToken = {
                        refreshToken: refreshToken,
                        clientId: clientId,
                        userId: userId,
                        expires: expires
                    };
                    mongo.insert(tokenCollectionName, tokenRecord, function (err, data) {
                        callback(false);
                    });
                };
                return next();
            }
        });
    }, service.oauth.grant());

    service.get("/kill", function (req, res) {
        checkForMongo(req);
        var criteria = {"oauthAccessToken.accessToken": req.soajs.inputmaskData.access_token};
        mongo.remove(tokenCollectionName, criteria, function (err) {
	        if(err){
		        req.soajs.log.error(err);
		        return res.jsonp(req.soajs.buildResponse({code: 400, msg: config.errors[404]}));
	        }
            return res.jsonp(req.soajs.buildResponse(null, true));
        });
    });

    service.start();
});