'use strict';
const soajsCore = require('soajs');
const config = require('./config.js');
config.packagejson = require("./package.json");
const service = new soajsCore.server.service(config);

const provision = require("soajs").provision;
const oauthserver = require('oauth2-server');

const BLModule = require('./lib/oauth.js');

/**
 * Initialize the Business Logic model
 */
function initBLModel(req, res, cb) {
    let modelName = config.model;
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

function checkUserTenantAccessPin(record, tenantObj) {
    if (record && record.tenant && tenantObj && tenantObj.id) {
        if (record.tenant.id === tenantObj.id) {
            return record.tenant;
        }
        if (record.config && record.config.allowedTenants) {
            for (let i = 0; i < record.config.allowedTenants.length; i++) {
                if (record.config.allowedTenants[i].tenant && (record.config.allowedTenants[i].tenant.id === tenantObj.id)) {
                    return record.config.allowedTenants[i].tenant;
                }
            }
        }
    }
    return null;
}

service.init(function () {

    if (!service.oauth) {
        let reg = service.registry.get();
        let oauthOptions = {
	        model: provision.oauthModel
        };
        //grants check
	    if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.grants){
		    oauthOptions.grants = reg.serviceConfig.oauth.grants;
	    }
	    else {
		    service.log.debug("Unable to find grants entry in registry, defaulting to", config.oauthServer.grants);
		    oauthOptions.grants = config.oauthServer.grants;
	    }
	
	    //debug check
	    if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.debug){
		    oauthOptions.debug = reg.serviceConfig.oauth.debug;
	    }
	    else {
		    service.log.debug("Unable to find debug entry in registry, defaulting to", config.oauthServer.debug);
		    oauthOptions.debug = config.oauthServer.debug;
	    }
	    
	    //accessTokenLifetime check
	    if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.accessTokenLifetime){
		    oauthOptions.accessTokenLifetime = reg.serviceConfig.oauth.accessTokenLifetime;
	    }
	    else {
		    service.log.debug("Unable to find accessTokenLifetime entry in registry, defaulting to", config.oauthServer.accessTokenLifetime);
		    oauthOptions.accessTokenLifetime = config.oauthServer.accessTokenLifetime;
	    }
	    
	    //refreshTokenLifetime check
	    if (reg.serviceConfig && reg.serviceConfig.oauth && reg.serviceConfig.oauth.refreshTokenLifetime){
		    oauthOptions.refreshTokenLifetime = reg.serviceConfig.oauth.refreshTokenLifetime;
	    }
	    else {
		    service.log.debug("Unable to find refreshTokenLifetime entry in registry, defaulting to", config.oauthServer.refreshTokenLifetime);
		    oauthOptions.grants = config.oauthServer.refreshTokenLifetime;
	    }
        service.oauth = oauthserver(oauthOptions);
        provision.init(reg.coreDB.provision, service.log);
        provision.loadProvision(function (loaded) {
            if (loaded)
                service.log.info("Service provision loaded.");
        });
        service.appMaintenance.get("/loadProvision", function (req, res) {
            provision.loadProvision(function (loaded) {
                let response = service.maintenanceResponse(req);
                response['result'] = loaded;
                res.jsonp(response);
            });
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
            provision.getTenantOauth(req.soajs.tenant.id, (err, tenantOauth) => {
                req.soajs.tenantOauth = tenantOauth;
                BLInstance.generateAuthValue(req, function (error, data) {
                    return res.json(req.soajs.buildResponse(error, data));
                });
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

            provision.getTenantOauth(req.soajs.tenant.id, (err, tenantOauth) => {
                req.soajs.tenantOauth = tenantOauth;

                service.oauth.model["getUser"] = function (username, password, callback) {
                    BLInstance.getUserRecord(req, function (error, record) {
                        if (error) {
                            if (!error.code)
                                error = new Error(config.errors[error]);
                            else if (error.msg)
                                error = new Error(error.msg);
                            return callback(error);
                        }

                        if (record) {
                            record.id = record._id.toString();
                        }

                        let product = null;
                        if (req.soajs.tenant && req.soajs.tenant.application)
                            product = req.soajs.tenant.application.product;

                        if (product && record.loginMode === 'urac' && req.soajs.tenantOauth.pin && req.soajs.tenantOauth.pin[product] && req.soajs.tenantOauth.pin[product].enabled) {
                            record.pinLocked = true;
                            let userTenant = checkUserTenantAccessPin(record, req.soajs.tenant);
                            if (userTenant && userTenant.pin && userTenant.pin.allowed)
                                return callback(false, record);
                            else {
                                let error = new Error(config.errors[450]);
                                return callback(error);
                            }
                        }
                        else
                            return callback(false, record);
                    });
                };

                if (!req.headers.authorization) {
                    BLInstance.generateAuthValue(req, function (error, data) {
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
            });

        });
    }, service.oauth.grant());


    service.post("/pin", function (req, res, next) {
        req.headers['content-type'] = 'application/x-www-form-urlencoded';
        initBLModel(req, res, function (BLInstance) {
            req.soajs.config = config;

            // we should set password and username for oauth to work
            // we should also remove access_token since the request passed the gateway
            // we should add authorization to be able to generate a new access token
            //      or set req.body.client_id, req.body.client_secret instead
            req.body = req.body || {};
            req.body.username = "NA";
            req.body.password = "NA";
            if (req.query.access_token)
                delete req.query.access_token;

            provision.getTenantOauth(req.soajs.tenant.id, (err, tenantOauth) => {
                req.soajs.tenantOauth = tenantOauth;

                service.oauth.model["getUser"] = function (username, password, callback) {
                    BLInstance.getUserRecordByPin(req, function (error, record) {
                        if (error) {
                            if (!error.code)
                                error = new Error(config.errors[error]);
                            else if (error.msg)
                                error = new Error(error.msg);
                            return callback(error);
                        }
                        if (record) {
                            record.id = record._id.toString();
                        }
                        return callback(false, record);
                    });
                };

                BLInstance.generateAuthValue(req, function (error, data) {
                    if (error) {
                        return res.json(req.soajs.buildResponse(error, data));
                    }
                    else {
                        req.headers.authorization = data;
                        next();
                    }
                });
            });
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

            provision.getTenantOauth(req.soajs.tenant.id, (err, tenantOauth) => {
                req.soajs.tenantOauth = tenantOauth;
                BLInstance.deleteAllTokens(req, function (error, data) {
                    return res.json(req.soajs.buildResponse(error, data));
                });
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
