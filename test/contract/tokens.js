"use strict";

/**
 * Refresh tokens the contract needs besides the integration data: an expired one, one issued to
 * another client, and three whose expires is null, a string or missing; and an expired access
 * token. Written to the local test database before the cases run; the expired ones just before
 * their case.
 */

const contract = require("./cases.js");
const owner = require("../data/integration/oauth/token/owner-refresh.js");
const ownerAccess = require("../data/integration/oauth/token/owner-access.js");

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
	const withExpires = (token, expires) => {
		const d = JSON.parse(JSON.stringify(owner));
		delete d._id;
		d.token = token;
		if (expires === undefined) {
			delete d.expires;
		} else {
			d.expires = expires;
		}
		return d;
	};
	const expiredAccess = JSON.parse(JSON.stringify(ownerAccess));
	delete expiredAccess._id;
	expiredAccess.token = contract.EXPIRED_ACCESS;
	expiredAccess.expires = new Date(Date.UTC(2020, 0, 1));
	return [expired, other, expiredAccess,
		withExpires(contract.NULL_EXPIRES_REFRESH, null),
		withExpires(contract.STRING_EXPIRES_REFRESH, "2099-01-01T00:00:00.000Z"),
		withExpires(contract.NO_EXPIRES_REFRESH, undefined)];
}

function write(list, cb) {
	const Mongo = require("soajs").mongo;
	const profile = JSON.parse(JSON.stringify(require("../data/soajs_profile.js")));
	// the import changes the shared profile's name; the tokens live in core_provision
	profile.name = "core_provision";
	const mongo = new Mongo(profile);
	let pending = (typeof list === "function" ? list(mongo) : list).slice();
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

// the tokens that do not expire by date, written before the cases run
function insert(cb) {
	write(docs().filter((d) => !expiredByDate(d)), cb);
}

// a token with a past date, written just before the case that uses it
function before(token, cb) {
	write(docs().filter((d) => d.token === token), cb);
}

// the integration data's tokens, written again after the cases: they issue and revoke tokens
// ("auto token unique" removes the owner's), and the integration tests that follow use them
function restore(cb) {
	const fs = require("fs");
	const dir = __dirname + "/../data/integration/oauth/token/";
	write((mongo) => fs.readdirSync(dir).map((file) => {
		const d = Object.assign({}, require(dir + file));
		d._id = mongo.ObjectId(String(d._id));
		if (d.user && d.user._id) {
			d.user = Object.assign({}, d.user, {"_id": mongo.ObjectId(String(d.user._id))});
		}
		return d;
	}), cb);
}

function expiredByDate(d) {
	return d.expires instanceof Date && d.expires.getTime() < Date.now();
}

module.exports = {insert, before, restore};
