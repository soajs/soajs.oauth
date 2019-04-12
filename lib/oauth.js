'use strict';
const fs = require("fs");
const userCollectionName = "oauth_urac";
const tokenCollectionName = "oauth_token";
let uracDriver = require("soajs.urac.driver");

const soajsCoreModules = require('soajs');
let coreHasher = soajsCoreModules.hasher;

let Auth = soajsCoreModules.authorization;

function checkIfError(req, mainCb, data, cb) {
    if (data.error) {
        if (typeof (data.error) === 'object' && data.error.message) {
            req.soajs.log.error(data.error);
        }
        return mainCb({"code": data.code, "msg": req.soajs.config.errors[data.code]});
    }
    else {
        return cb();
    }
}

let libProduct = {
    "model": null,

    "getUserRecordByPin": function (req, cb) {
        let config = req.soajs.config;

        let loginMode = config.loginMode;
        if (req.soajs.tenantOauth && req.soajs.tenantOauth.loginMode) {
            loginMode = req.soajs.tenantOauth.loginMode;
        }
        if (loginMode === 'urac') {
            let data = {
                'pin': req.soajs.inputmaskData['pin']
            };
            uracDriver.loginByPin(req.soajs, data, function (errCode, record) {
                if (errCode) {
                    return cb(errCode);
                }

                if (record) {
                    record.loginMode = loginMode;
                }
                return cb(null, record);
            });
        }
        else
            return cb(451);
    },

    /**
     * Get the user record from the database, and validate password
     */
    "getUserRecord": function (req, cb) {
        let config = req.soajs.config;

        let loginMode = config.loginMode;
        if (req.soajs.tenantOauth && req.soajs.tenantOauth.loginMode) {
            loginMode = req.soajs.tenantOauth.loginMode;
        }

        function getLocal() {
            let condition = {'userId': req.soajs.inputmaskData['username']};
            let combo = {
                collection: userCollectionName,
                condition: condition
            };
            libProduct.model.findEntry(req.soajs, combo, function (err, record) {
                if (record) {
                    let hashConfig = {
                        "hashIterations": config.hashIterations,
                        "seedLength": config.seedLength
                    };
                    if (req.soajs.servicesConfig && req.soajs.servicesConfig.oauth) {
                        if (req.soajs.servicesConfig.oauth.hashIterations && req.soajs.servicesConfig.oauth.seedLength) {
                            hashConfig = {
                                "hashIterations": req.soajs.servicesConfig.oauth.hashIterations,
                                "seedLength": req.soajs.servicesConfig.oauth.seedLength
                            };
                        }
                    }
                    coreHasher.init(hashConfig);
                    coreHasher.compare(req.soajs.inputmaskData.password, record.password, function (err, result) {
                        if (err || !result) {
                            return cb(413);
                        }

                        delete record.password;
                        if (record.tId && req.soajs.tenant) {
                            if (record.tId.toString() !== req.soajs.tenant.id) {
                                return cb(403);
                            }
                        }
                        //TODO: keys here
                        if (record) {
                            record.loginMode = loginMode;
                        }

                        return cb(null, record);
                    });
                }
                else {
                    req.soajs.log.error("Username " + req.soajs.inputmaskData['username'] + " not found");
                    return cb(401);
                }
            });
        }

        if (loginMode === 'urac') {
            let data = {
                'username': req.soajs.inputmaskData['username'],
                'password': req.soajs.inputmaskData['password']
            };
            uracDriver.login(req.soajs, data, function (errCode, record) {
                if (errCode) {
                    return cb(errCode);
                }

                if (record) {
                    record.loginMode = loginMode;
                }
                return cb(null, record);
            });
        }
        else {
            getLocal();
        }

    },

    /**
     * Delete All tokens of a user
     */
    "deleteAllTokens": function (req, cb) {
        let config = req.soajs.config;

        let loginMode = config.loginMode;
        if (req.soajs.tenantOauth && req.soajs.tenantOauth.loginMode) {
            loginMode = req.soajs.tenantOauth.loginMode;
        }

        let criteria = {
            "userId.loginMode": loginMode,
            "userId.id": req.soajs.inputmaskData.userId
        };
        let combo = {
            collection: tokenCollectionName,
            condition: criteria
        };

        libProduct.model.removeEntry(req.soajs, combo, function (error, result) {
            let data = {config: req.soajs.config, error: error, code: 404};
            checkIfError(req, cb, data, function () {
                return cb(null, result.result);
            });
        });
    },

    /**
     * Delete All tokens of a client
     */
    "deauthorize": function (req, cb) {
        let criteria = {
            "clientId": req.soajs.inputmaskData.clientId
        };
        let combo = {
            collection: tokenCollectionName,
            condition: criteria
        };
        libProduct.model.removeEntry(req.soajs, combo, function (error, result) {
            let data = {config: req.soajs.config, error: error, code: 404};
            checkIfError(req, cb, data, function () {
                return cb(null, result.result);
            });
        });
    },

    /**
     * Delete one refresh token
     */
    "deleteRefreshToken": function (req, cb) {
        let criteria = {
            "token": req.soajs.inputmaskData.token,
            "type": "refreshToken"
        };
        let combo = {
            collection: tokenCollectionName,
            condition: criteria
        };
        libProduct.model.removeEntry(req.soajs, combo, function (error, result) {
            let data = {config: req.soajs.config, error: error, code: 404};
            checkIfError(req, cb, data, function () {
                return cb(null, result.result);
            });
        });
    },

    /**
     * Delete one access token
     */
    "deleteAccessToken": function (req, cb) {
        let criteria = {
            "token": req.soajs.inputmaskData.token,
            "type": "accessToken"
        };
        let combo = {
            collection: tokenCollectionName,
            condition: criteria
        };
        libProduct.model.removeEntry(req.soajs, combo, function (error, result) {
            let data = {config: req.soajs.config, error: error, code: 404};
            checkIfError(req, cb, data, function () {
                return cb(null, result.result);
            });
        });
    },

    /**
     * Generate the the authorization value
     */
    "generateAuthValue": function (req, cb) {
        if (req.soajs && req.soajs.tenantOauth && req.soajs.tenantOauth.secret && req.soajs.tenant && req.soajs.tenant.id) {
            let secret = req.soajs.tenantOauth.secret;
            let tenantId = req.soajs.tenant.id.toString();

            let basic = Auth.generate(tenantId, secret);
            return cb(null, basic);
        }
        else
            return cb({"code": 406, "msg": req.soajs.config.errors[406]});
    }
};

module.exports = {
    "init": function (modelName, cb) {
        let modelPath = __dirname + "/../model/" + modelName + ".js";
        return requireModel(modelPath, cb);

        /**
         * checks if model file exists, requires it and returns it.
         * @param filePath
         * @param cb
         */
        function requireModel(filePath, cb) {
            //check if file exist. if not return error
            fs.exists(filePath, function (exists) {
                if (!exists) {
                    return cb(new Error("Requested Model Not Found!"));
                }

                libProduct.model = require(filePath);
                return cb(null, libProduct);
            });
        }
    }
};