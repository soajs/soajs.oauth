'use strict';

const OAuth2Server = require('oauth2-server');
const Request = require('oauth2-server').Request;
const Response = require('oauth2-server').Response;
const express = require('express');
const bodyParser = require('body-parser');
const sApp = express();

const oauthOptions = {
	"accessTokenLifetime": 7200,
	"refreshTokenLifetime": 1209600,
	"model": require("./model")
};

const oauth = new OAuth2Server(oauthOptions);

function bearerToken(id, secret) {
	return "Basic " + new Buffer(id.toString() + ":" + secret.toString()).toString('base64');
}

function authenticateHandler(options) {
	return function (req, res, next) {
		let request = new Request(req);
		let response = new Response(res);
		return oauth.authenticate(request, response, options)
			.then(function (token) {
				console.log(token)
			})
			.catch(function (err) {
				console.log(err)
			});
	}
}

function tokenHandler(options) {
	return function (req, res, next) {
		let request = new Request(req);
		let response = new Response(res);
		return oauth.token(request, response, options)
			.then(function (token) {
				console.log(token)
			})
			.catch(function (err) {
				console.log(err)
			});
	}
}

sApp.use(bodyParser.json());
sApp.use(bodyParser.urlencoded({extended: false}));

sApp.post("/token", (req, res) => {
	req.headers['content-type'] = 'application/x-www-form-urlencoded';
	req.headers['authorization'] = bearerToken("11111", "secret");
	tokenHandler({})(req, res);
	res.json({});
});
sApp.get("/user", (req, res) => {
	authenticateHandler({"allowBearerTokensInQueryString": true})(req, res);
	res.json({});
});


sApp.listen("8089", () => console.log("service started on port 8089"));