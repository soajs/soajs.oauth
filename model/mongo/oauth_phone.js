"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const colName = "oauth_phone";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function Oauth_phone(service, options, mongoCore) {
	let __self = this;
	
	if (mongoCore) {
		__self.mongoCore = mongoCore;
	}
	if (!__self.mongoCore) {
		let registry = service.registry.get();
		//NOTE: this collection can scale out and exist in the env cluster
		if (options && options.dbConfig) {
			__self.mongoCore = new Mongo(options.dbConfig);
		} else if (registry.coreDB.oauth) {
			__self.mongoCore = new Mongo(registry.coreDB.oauth);
		} else {
			__self.mongoCore = new Mongo(registry.coreDB.provision);
		}
		
		let index = "default";
		if (options && options.index) {
			index = options.index;
		}
		if (indexing && !indexing[index]) {
			indexing[index] = true;
			__self.mongoCore.createIndex(colName, {expires: 1}, {expireAfterSeconds: 0}, (err) => {
				service.log.debug("Index: " + index + " created with error: " + err);
			});
			service.log.debug("Oauth phone: Indexes for " + index + " Updated!");
		}
	}
}

Oauth_phone.prototype.getCode = function (data, cb) {
	let __self = this;
	
	if (!data || !data.code) {
		let error = new Error("code, service and status are required.");
		return cb(error, null);
	}
	
	let condition = {
		'code': data.code,
		'status': data.status,
		'service': data.service
	};
	
	__self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
		return cb(err, record);
	});
};

Oauth_phone.prototype.addCode = function (data, cb) {
	let __self = this;
	
	const ts = new Date().getTime();
	const s = {
		'$set': {
			'code': Math.floor(100000 + Math.random() * 900000),
			'phone': data.phone,
			'user': data.user,
			'agent': data.agent,
			'expires': new Date(ts + data.tokenExpiryTTL),
			'status': 'active',
			'ts': ts,
			'service': data.service
		}
	};
	const condition = {
		'phone': data.phone,
		'service': data.service,
		'status': data.status
	};
	const options = {
		'upsert': true
	};
	console.log(condition);
	__self.mongoCore.updateOne(colName, condition, s, options, (err, record) => {
		if (!record || (record && !(record.nModified || record.upsertedCount))) {
			let error = new Error("code for [" + data.service + "] was not created.");
			return cb(error);
		}
		return cb(err, {'code': s.$set.code, 'ttl': data.tokenExpiryTTL});
	});
};

Oauth_phone.prototype.updateStatus = function (data, cb) {
	let __self = this;
	if (!data || !data.code || !data.status) {
		let error = new Error("status and code are required.");
		return cb(error, null);
	}
	let s = {
		'$set': {
			'status': data.status
		}
	};
	let condition = {
		'code': data.code
	};
	
	__self.mongoCore.updateOne(colName, condition, s, null, (err, record) => {
		if (!record || (record && !record.nModified)) {
			let error = new Error("status for code [" + data.code + "] was not update.");
			return cb(error);
		}
		return cb(err, record.nModified);
	});
};

Oauth_phone.prototype.closeConnection = function () {
	let __self = this;
	__self.mongoCore.closeDb();
};

module.exports = Oauth_phone;
