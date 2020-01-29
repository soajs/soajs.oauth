"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const colName = "oauth_token";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function Oauth(service, options, mongoCore) {
	let __self = this;
	
	if (mongoCore) {
		__self.mongoCore = mongoCore;
	}
	if (!__self.mongoCore) {
		let registry = service.registry.get();
		//NOTE: this collection can scale out and exist in the env cluster
		if (registry.coreDB.oauth) {
			__self.mongoCore = new Mongo(registry.coreDB.oauth);
		} else if (options && options.dbConfig) {
			__self.mongoCore = new Mongo(options.dbConfig);
		} else {
			__self.mongoCore = new Mongo(registry.coreDB.provision);
		}
	}
	let index = "default";
	if (options && options.index) {
		index = options.index;
	}
	if (indexing && !indexing[index]) {
		indexing[index] = true;
		
		__self.mongoCore.createIndex(colName, {'user.loginMode': 1, 'user.id': 1}, {}, (err, index) => {
			service.log.debug("Index: " + index + " created with error: " + err);
		});
		
		__self.mongoCore.createIndex(colName, {'clientId': 1}, {}, (err, index) => {
			service.log.debug("Index: " + index + " created with error: " + err);
		});
		
		service.log.debug("Oauth: Indexes for " + index + " Updated!");
	}
}

Oauth.prototype.delete = function (data, cb) {
	let __self = this;
	
	if (!data || !((data.token && data.type) || data.clientId || (data.user || (data.user && data.user.id && data.user.loginMode)))) {
		let error = new Error("(token and type) or clientId or user[id, loginMode] is required.");
		return cb(error, null);
	}
	
	let condition = {};
	
	if (data.user) {
		condition["user.loginMode"] = data.user.loginMode;
		condition["user.id"] = data.user.id;
	} else if (data.clientId) {
		condition.clientId = data.clientId;
	} else {
		condition.token = data.token;
		condition.type = data.type;
	}
	__self.mongoCore.deleteMany(colName, condition, (err, count) => {
		let response = 0;
		if (count && count.result) {
			response = count.result.n;
		}
		return cb(err, response);
	});
};

Oauth.prototype.validateId = function (id, cb) {
	let __self = this;
	
	if (!id) {
		let error = new Error("id is required.");
		return cb(error, null);
	}
	
	try {
		id = __self.mongoCore.ObjectId(id);
		return cb(null, id);
	} catch (e) {
		return cb(e, null);
	}
};

Oauth.prototype.closeConnection = function () {
	let __self = this;
	__self.mongoCore.closeDb();
};

module.exports = Oauth;
