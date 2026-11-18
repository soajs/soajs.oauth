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
	const {MongoClient} = require("mongodb");
	const client = new MongoClient("mongodb://127.0.0.1:27017");
	client.connect().then(async () => {
		const coll = client.db("core_provision").collection("oauth_token");
		for (const d of docs()) {
			await coll.replaceOne({"token": d.token}, d, {"upsert": true});
		}
	}).then(() => client.close().then(() => cb()), (e) => client.close().then(() => cb(e)));
}

module.exports = {insert};
