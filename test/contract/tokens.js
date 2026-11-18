"use strict";

/**
 * Refresh tokens the contract needs besides the integration data: an expired one, and one issued
 * to another client. Written to the local test database before the cases run.
 */

const contract = require("./cases.js");
const owner = require("../data/integration/oauth/token/owner-refresh.js");

function docs() {
	const expired = JSON.parse(JSON.stringify(owner));
	delete expired._id;
	expired.token = contract.EXPIRED_REFRESH;
	expired.expires = new Date(Date.UTC(2020, 0, 1));
	const other = JSON.parse(JSON.stringify(owner));
	delete other._id;
	other.token = contract.OTHER_CLIENT_REFRESH;
	other.clientId = "5c0e74ba9acc3c5a84a51250";
	other.expires = new Date(Date.UTC(2099, 0, 1));
	return [expired, other];
}

function insert(cb) {
	const Mongo = require("soajs").mongo;
	const profile = JSON.parse(JSON.stringify(require("../data/soajs_profile.js")));
	// the import changes the shared profile's name; the tokens live in core_provision
	profile.name = "core_provision";
	const mongo = new Mongo(profile);
	let pending = docs();
	const next = (error) => {
		if (error || pending.length === 0) {
			mongo.closeDb();
			return cb(error);
		}
		const d = pending.shift();
		mongo.updateOne("oauth_token", {"token": d.token}, {"$set": d}, {"upsert": true}, (error) => next(error));
	};
	next();
}

module.exports = {insert};
