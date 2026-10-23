/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../../../helper.js");
const assert = require('assert');

//NOTE: soajs.urac.driver links a login to an existing account by email only when emailVerified is true
describe("Unit test for: drivers - which emails are provider verified", () => {

	// maps the input with the driver and checks the email and the flag
	let expect = (name, input, email, emailVerified) => {
		return (done) => {
			helper.requireModule('./bl/integration/drivers/' + name + '.js').mapProfile(input, (error, profile) => {
				try {
					assert.ifError(error);
					if (email !== undefined) {
						assert.strictEqual(profile.email, email);
					}
					assert.strictEqual(profile.emailVerified, emailVerified);
					done();
				} catch (e) {
					done(e);
				}
			});
		};
	};
	let google = (emails) => {
		return { "profile": { "name": { "givenName": "a", "familyName": "b" }, "emails": emails, "id": "1" } };
	};

	it("google: verified when google says so",
		expect('google', google([{ "value": "a@x.com", "verified": true }]), "a@x.com", true));

	it("google: not verified when google says it is not",
		expect('google', google([{ "value": "a@x.com", "verified": false }]), "a@x.com", false));

	it("google: not verified when google does not say",
		expect('google', google([{ "value": "a@x.com" }]), "a@x.com", false));

	it("google: no email, not verified",
		expect('google', google([]), '', false));

	it("github: the address made from the username is not verified",
		expect('github', { "profile": { "username": "victim", "id": "1" } }, "victim@github.com", false));

	it("twitter: not verified",
		expect('twitter', { "profile": { "username": "victim", "displayName": "v", "id": "1" } }, "victim@twitter.com", false));

	it("azure: the email claim is not verified",
		expect('azure', { "profile": { "email": "victim@example.com", "oid": "1", "given_name": "a", "family_name": "b" } }, "victim@example.com", false));

	it("facebook: not verified",
		expect('facebook', { "profile": { "id": "1", "_json": { "email": "victim@example.com", "first_name": "a", "last_name": "b" } } }, "victim@example.com", false));

	it("linkedin: not verified",
		expect('linkedin', { "profile": { "id": "1", "name": { "givenName": "a", "familyName": "b" }, "emails": [{ "value": "victim@example.com" }] } }, "victim@example.com", false));

	it("ldap: the deployment's own directory is trusted",
		expect('ldap', { "dn": "cn=a", "cn": "a", "sn": "b", "mail": "a@corp.com" }, "a@corp.com", true));

	it("openam: the deployment's own identity provider is trusted",
		expect('openam', {
			"attributesMap": [{ "field": "mail", "mapTo": "email" }],
			"userRecord": { "attributes": [{ "name": "mail", "values": ["a@corp.com"] }] }
		}, "a@corp.com", true));
});
