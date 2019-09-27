"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const colName_token = "oauth_token";
const colName_user = "oauth_urac";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function Oauth(service, options, mongoCore) {
	let __self = this;
	
	if (mongoCore) {
		__self.mongoCore = mongoCore;
	}
	if (!__self.mongoCore) {
		if (options && options.dbConfig) {
			__self.mongoCore = new Mongo(options.dbConfig);
		} else {
			let registry = service.registry.get();
			__self.mongoCore = new Mongo(registry.coreDB.provision);
		}
	}
	let index = "default";
	if (options && options.index) {
		index = options.index;
	}
	if (indexing && !indexing[index]) {
		indexing[index] = true;
		
		
		service.log.debug("Oauth: Indexes for " + index + " Updated!");
	}
}

Oauth.prototype.getUser = function (data, cb) {
	let __self = this;
	
	if (!data || !data.username) {
		let error = new Error("(username is required.");
		return cb(error, null);
	}
	
	let condition = {
		'userId': data.username
	};
	
	__self.mongoCore.findOne(colName_user, condition, null, null, (err, record) => {
		return cb(err, record);
	});
};

Oauth.prototype.delete = function (data, cb) {
	let __self = this;
	
	if (!data || !((data.token && data.type) || data.clientId || (data.user || !(data.user.id && data.user.loginMode)))) {
		let error = new Error("(token and type) or clientId or user[id, loginMode] is required.");
		return cb(error, null);
	}
	
	let condition = {};
	
	if (data.user) {
		condition["userId.loginMode"] = data.user.loginMode;
		condition["userId.id"] = data.user.id;
	} else if (data.clientId) {
		condition.clientId = data.clientId;
	} else {
		condition.token = data.token;
		condition.type = data.type;
	}
	__self.mongoCore.remove(colName_token, condition, (err, count) => {
		return cb(err, count);
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
