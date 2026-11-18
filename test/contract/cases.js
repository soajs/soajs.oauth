"use strict";

/**
 * The requests of the OAuth contract: every answer of the token routes that clients may see,
 * success and each error, sent through the gateway (127.0.0.1:10000) to the oauth service.
 *
 * A case is {name, method, path, headers, form | json, before(state) -> case changes, save(body, state)}.
 * Values a case needs from an earlier answer (a refresh token) are read from state.
 */

// the integration data's keys (test values)
const KEY = '3d90163cf9d6b3076ad26aa5ed58556348069258e5c6c941ee0f18448b570ad1c5c790e2d2a1989680c55f4904e2005ff5f8e71606e4aa641e67882f4210ebbc5460ff305dcb36e6ec2a2299cf0448ef60b9e38f41950ec251c1cf41f05f3ce9';
const KEY2 = 'aa39b5490c4a4ed0e56d7ec1232a428f7ad78ebb7347db3fc9875cb10c2bce39bbf8aabacf9e00420afb580b15698c04ce10d659d1972ebc53e76b6bbae0c113bee1e23062800bc830e4c329ca913fefebd1f1222295cf2eb5486224044b4d0c';
const OWNER_ACCESS = "44a5399dcce96325fadfab908e614bf00e6fe967";
const EXPIRED_ACCESS = "7425a8ae4048d194f6390b64f45eb9525523a014";
// refresh tokens inserted by record.js for the contract (test values)
const EXPIRED_REFRESH = "c0ffee00000000000000000000000000000000e1";
const OTHER_CLIENT_REFRESH = "c0ffee00000000000000000000000000000000e2";
const NULL_EXPIRES_REFRESH = "c0ffee00000000000000000000000000000000e3";
const STRING_EXPIRES_REFRESH = "c0ffee00000000000000000000000000000000e4";
const NO_EXPIRES_REFRESH = "c0ffee00000000000000000000000000000000e5";
const OWNER = "5c8d0c505653de3985aa0ffd";

const basic = (id, secret) => "Basic " + Buffer.from(id + ":" + secret).toString("base64");
const TENANT = "5c0e74ba9acc3c5a84a51259";

const cases = [
	// POST /oauth/token, grant password
	{"name": "token password json", "path": "/oauth/token", "headers": {"key": KEY, "device-id": "1111111111"}, "json": {"username": "owner", "password": "password", "grant_type": "password"}, "save": "owner"},
	{"name": "token password form", "path": "/oauth/token", "headers": {"key": KEY}, "form": {"username": "owner", "password": "password", "grant_type": "password"}},
	{"name": "token default grant_type", "path": "/oauth/token", "headers": {"key": KEY}, "json": {"username": "owner", "password": "password"}},
	{"name": "token wrong password", "path": "/oauth/token", "headers": {"key": KEY}, "json": {"username": "owner", "password": "wrong", "grant_type": "password"}},
	{"name": "token unknown user", "path": "/oauth/token", "headers": {"key": KEY}, "json": {"username": "nobody", "password": "password", "grant_type": "password"}},
	{"name": "token pin login not allowed", "path": "/oauth/token", "headers": {"key": KEY}, "json": {"username": "owner2", "password": "password", "grant_type": "password"}},
	{"name": "token missing password", "path": "/oauth/token", "headers": {"key": KEY}, "json": {"username": "owner", "grant_type": "password"}},
	{"name": "token missing username", "path": "/oauth/token", "headers": {"key": KEY}, "json": {"password": "password", "grant_type": "password"}},
	{"name": "token grant client_credentials", "path": "/oauth/token", "headers": {"key": KEY}, "json": {"username": "owner", "password": "password", "grant_type": "client_credentials"}},
	{"name": "token grant PASSWORD", "path": "/oauth/token", "headers": {"key": KEY}, "json": {"username": "owner", "password": "password", "grant_type": "PASSWORD"}},
	{"name": "token grant unknown", "path": "/oauth/token", "headers": {"key": KEY}, "json": {"username": "owner", "password": "password", "grant_type": "magic"}},
	{"name": "token basic wrong secret", "path": "/oauth/token", "headers": {"key": KEY, "authorization": basic(TENANT, "wrong secret")}, "json": {"username": "owner", "password": "password", "grant_type": "password"}},
	{"name": "token basic bad client id", "path": "/oauth/token", "headers": {"key": KEY, "authorization": basic("bad id!", "x")}, "json": {"username": "owner", "password": "password", "grant_type": "password"}},
	{"name": "token basic no secret", "path": "/oauth/token", "headers": {"key": KEY, "authorization": "Basic " + Buffer.from(TENANT).toString("base64")}, "json": {"username": "owner", "password": "password", "grant_type": "password"}},
	{"name": "token basic unknown client", "path": "/oauth/token", "headers": {"key": KEY, "authorization": basic("5c0e74ba9acc3c5a84a51250", "x")}, "json": {"username": "owner", "password": "password", "grant_type": "password"}},
	{"name": "token body credentials wrong secret", "path": "/oauth/token", "headers": {"key": KEY}, "json": {"username": "owner", "password": "password", "grant_type": "password", "client_id": TENANT, "client_secret": "wrong"}},
	{"name": "token no key", "path": "/oauth/token", "headers": {}, "json": {"username": "owner", "password": "password", "grant_type": "password"}},

	// POST /oauth/token/email
	{"name": "token email", "path": "/oauth/token/email", "headers": {"key": KEY2}, "json": {"username": "user2", "password": "password"}, "save": "email"},
	{"name": "token email wrong password", "path": "/oauth/token/email", "headers": {"key": KEY2}, "json": {"username": "user2", "password": "wrong"}},

	// POST /oauth/refresh/token
	{"name": "refresh", "path": "/oauth/refresh/token", "headers": {"key": KEY2}, "json": (s) => ({"refresh_token": s.email.refresh_token}), "save": "refreshed"},
	{"name": "refresh reused", "path": "/oauth/refresh/token", "headers": {"key": KEY2}, "json": (s) => ({"refresh_token": s.email.refresh_token})},
	{"name": "refresh the new token", "path": "/oauth/refresh/token", "headers": {"key": KEY2}, "json": (s) => ({"refresh_token": s.refreshed.refresh_token})},
	{"name": "refresh missing token", "path": "/oauth/refresh/token", "headers": {"key": KEY2}, "json": {}},
	{"name": "refresh unknown token", "path": "/oauth/refresh/token", "headers": {"key": KEY2}, "json": {"refresh_token": "0000000000000000000000000000000000000000"}},
	{"name": "refresh expired token", "before": EXPIRED_REFRESH, "path": "/oauth/refresh/token", "headers": {"key": KEY}, "json": {"refresh_token": EXPIRED_REFRESH}},
	{"name": "refresh other client token", "path": "/oauth/refresh/token", "headers": {"key": KEY}, "json": {"refresh_token": OTHER_CLIENT_REFRESH}},
	{"name": "refresh other device", "path": "/oauth/refresh/token", "headers": {"key": KEY, "device-id": "2222222222"}, "json": (s) => ({"refresh_token": s.owner.refresh_token})},
	{"name": "refresh same device", "path": "/oauth/refresh/token", "headers": {"key": KEY, "device-id": "1111111111"}, "json": (s) => ({"refresh_token": s.owner.refresh_token})},
	// two refreshes with the same refresh token at the same time
	{"name": "token email for concurrent refresh", "path": "/oauth/token/email", "headers": {"key": KEY2}, "json": {"username": "user2", "password": "password"}, "save": "concurrent"},
	{"name": "refresh concurrent", "parallel": 2, "path": "/oauth/refresh/token", "headers": {"key": KEY2}, "json": (s) => ({"refresh_token": s.concurrent.refresh_token})},
	{"name": "token grant refresh_token", "path": "/oauth/token", "headers": {"key": KEY2}, "json": {"grant_type": "refresh_token", "refresh_token": "0000000000000000000000000000000000000001"}},

	// refresh tokens whose expires cannot be read
	{"name": "refresh expires null", "path": "/oauth/refresh/token", "headers": {"key": KEY}, "json": {"refresh_token": NULL_EXPIRES_REFRESH}},
	{"name": "refresh expires string", "path": "/oauth/refresh/token", "headers": {"key": KEY}, "json": {"refresh_token": STRING_EXPIRES_REFRESH}},
	{"name": "refresh without expires", "path": "/oauth/refresh/token", "headers": {"key": KEY}, "json": {"refresh_token": NO_EXPIRES_REFRESH}},

	// POST /oauth/pin
	{"name": "pin no access token", "path": "/oauth/pin", "headers": {"key": KEY}, "json": {"pin": "1235", "grant_type": "password"}},
	{"name": "pin", "path": "/oauth/pin", "headers": {"key": KEY, "access_token": OWNER_ACCESS}, "json": {"pin": "1235", "grant_type": "password"}},
	{"name": "pin wrong pin", "path": "/oauth/pin", "headers": {"key": KEY, "access_token": OWNER_ACCESS}, "json": {"pin": "9999", "grant_type": "password"}},
	{"name": "pin expired access token", "path": "/oauth/pin", "headers": {"key": KEY, "access_token": EXPIRED_ACCESS}, "json": {"pin": "1235", "grant_type": "password"}},
	{"name": "pin invalid access token", "path": "/oauth/pin", "headers": {"key": KEY, "access_token": "0000000000000000000000000000000000000002"}, "json": {"pin": "1235", "grant_type": "password"}},

	// the internal routes services call (they share the model and the token storage); last, as they
	// issue and revoke tokens
	{"name": "auto token", "path": "/oauth/token/auto/" + OWNER, "headers": {"key": KEY}, "json": {"unique": false}, "save": "auto"},
	{"name": "auto token unknown user", "path": "/oauth/token/auto/5c8d0c505653de3985aa0000", "headers": {"key": KEY}, "json": {}},
	{"name": "auto token bad id", "path": "/oauth/token/auto/nope", "headers": {"key": KEY}, "json": {}},
	{"name": "restricted token", "path": "/oauth/restricted/token/auto/" + OWNER, "headers": {"key": KEY, "access_token": OWNER_ACCESS}, "json": {"restrictedTo": {"tenant": TENANT}}},
	{"name": "restricted token unknown user", "path": "/oauth/restricted/token/auto/5c8d0c505653de3985aa0000", "headers": {"key": KEY, "access_token": OWNER_ACCESS}, "json": {"restrictedTo": {"tenant": TENANT}}},
	{"name": "restricted token bad id", "path": "/oauth/restricted/token/auto/nope", "headers": {"key": KEY, "access_token": OWNER_ACCESS}, "json": {"restrictedTo": {"tenant": TENANT}}},
	{"name": "restricted token missing restrictedTo", "path": "/oauth/restricted/token/auto/" + OWNER, "headers": {"key": KEY, "access_token": OWNER_ACCESS}, "json": {}},
	{"name": "revoke restricted tokens of a user", "method": "DELETE", "path": "/oauth/restricted/tokens/user/" + OWNER, "headers": {"key": KEY, "access_token": OWNER_ACCESS}},
	{"name": "revoke restricted tokens unknown user", "method": "DELETE", "path": "/oauth/restricted/tokens/user/5c8d0c505653de3985aa0000", "headers": {"key": KEY, "access_token": OWNER_ACCESS}},
	{"name": "revoke access token", "method": "DELETE", "path": (s) => "/oauth/accessToken/" + s.auto.data.access_token, "headers": {"key": KEY, "access_token": OWNER_ACCESS}},
	{"name": "revoke access token again", "method": "DELETE", "path": (s) => "/oauth/accessToken/" + s.auto.data.access_token, "headers": {"key": KEY, "access_token": OWNER_ACCESS}},
	{"name": "revoke access token unknown", "method": "DELETE", "path": "/oauth/accessToken/notFound", "headers": {"key": KEY, "access_token": OWNER_ACCESS}},
	{"name": "revoke access token missing", "method": "DELETE", "path": "/oauth/accessToken/", "headers": {"key": KEY, "access_token": OWNER_ACCESS}},
	{"name": "auto token unique", "path": "/oauth/token/auto/" + OWNER, "headers": {"key": KEY}, "json": {"unique": true}}
];

module.exports = {cases, EXPIRED_REFRESH, OTHER_CLIENT_REFRESH, NULL_EXPIRES_REFRESH, STRING_EXPIRES_REFRESH, NO_EXPIRES_REFRESH, TENANT};
