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
        service.oauth.model["getUser"] = function (username, password, callback) {
            login(req, function (errCode, record) {
                if (errCode) {
                    var error = new Error(config.errors[errCode])
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
        var criteria = {"token": req.soajs.inputmaskData.token, "type": "accessToken"}
        mongo.remove(tokenCollectionName, criteria, function (err, result) {
            if (err) {
                req.soajs.log.error(err);
                return res.jsonp(req.soajs.buildResponse({code: 400, msg: config.errors[404]}));
            }
            return res.jsonp(req.soajs.buildResponse(null, result.result));
        });
    });
    service.delete("/refreshToken/:token", function (req, res) {
        checkForMongo(req);
        var criteria = {"token": req.soajs.inputmaskData.token, "type": "refreshToken"}
        mongo.remove(tokenCollectionName, criteria, function (err, result) {
            if (err) {
                req.soajs.log.error(err);
                return res.jsonp(req.soajs.buildResponse({code: 400, msg: config.errors[404]}));
            }
            return res.jsonp(req.soajs.buildResponse(null, result.result));
        });
    });
    service.delete("/tokens/:client", function (req, res) {
        checkForMongo(req);
        var criteria = {"clientId": req.soajs.inputmaskData.client};
        mongo.remove(tokenCollectionName, criteria, function (err, result) {
            if (err) {
                req.soajs.log.error(err);
                return res.jsonp(req.soajs.buildResponse({code: 400, msg: config.errors[404]}));
            }
            return res.jsonp(req.soajs.buildResponse(null, result.result));
        });
    });

    service.start();
})
;