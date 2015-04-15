"use strict";
var assert = require('assert');
var request = require("request");
var soajs = require('soajs');
var shell = require('shelljs');

var helper = require("../helper.js");
var controller = null;
var oauthService = null;
var config = null;

var sampleData = require("soajs.mongodb.data/modules/oauth");

var extKey = 'aa39b5490c4a4ed0e56d7ec1232a428f771e8bb83cfcee16de14f735d0f5da587d5968ec4f785e38570902fd24e0b522b46cb171872d1ea038e88328e7d973ff47d9392f72b2d49566209eb88eb60aed8534a965cf30072c39565bd8d72f68ac';
var Authorization = 'Basic MTBkMmNiNWZjMDRjZTUxZTA2MDAwMDAxOnNoaGggdGhpcyBpcyBhIHNlY3JldA==';
var oAuthParams = {
	url: 'http://127.0.0.1:4000/oauth/token',
	method: "POST",
	body: 'username=oauthuser&password=oauthpassword&grant_type=password',
	json: true,
	headers: {
		'accept': '*/*',
		'content-type': 'application/x-www-form-urlencoded',
		"Authorization": Authorization,
		'key': extKey
	}
};
var token = null;

function executeMyRequest(params, apiPath, method, cb) {
	requester(apiPath, method, params, function(error, body) {
		assert.ifError(error);
		assert.ok(body);
		return cb(body);
	});

	function requester(apiName, method, params, cb) {
		var options = {
			uri: 'http://localhost:4000/oauth/' + apiName,
			headers: {
				'Content-Type': 'application/json',
				key: extKey
			},
			json: true
		};

		if(params.headers) {
			for(var h in params.headers) {
				if(params.headers.hasOwnProperty(h)) {
					options.headers[h] = params.headers.h;
				}
			}
		}

		if(params.form) {
			options.body = params.form;
		}

		if(params.qs) {
			options.qs = params.qs;
		}
		request[method](options, function(error, response, body) {
			assert.ifError(error);
			assert.ok(body);
			return cb(null, body);
		});
	}
}

describe("importing sample data", function() {

	it("do import", function(done) {
		shell.pushd(sampleData.dir);
		shell.exec("chmod +x " + sampleData.shell, function(code) {
			assert.equal(code, 0);
			shell.exec(sampleData.shell, function(code) {
				assert.equal(code, 0);
				shell.popd();
				done();
			});
		});
	});

	after(function(done) {
		console.log('test data imported.');
		controller = require("soajs.controller");
		oauthService = helper.requireModule('./index');
		done();
	});
});

describe("OAUTH TESTS", function() {

	before(function(done) {
		console.log('starting tests ....');
		setTimeout(function() {
			done();
		}, 2000);
	});
	describe("get Token tests", function() {
		it('success - login', function(done) {
			function callback(error, response, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.access_token);
				token = body.access_token;
				done();
			}

			request(oAuthParams, callback);
		});
		it('fail - missing params', function(done) {
			var params = oAuthParams;
			params.body = 'username=oauthuser';
			function callback(error, response, body) {
				assert.ok(body);
				assert.ok(body.errors);
				console.log(body);
				assert.equal(body.errors.details[0].code, 172);
				done();
			}

			request(oAuthParams, callback);
		});
		it('fail - wrong password', function(done) {
			var params = oAuthParams;
			params.body = 'username=oauthuser&password=oauthpass&grant_type=password';
			function callback(error, response, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.errors);
				console.log(body);
				assert.deepEqual(body.errors.details[0], {"code": 401, "message": "Unable to log in the user. User not found."});
				done();
			}

			request(oAuthParams, callback);
		});

	});

	describe("kill token tests", function() {
		it('fail - missing params', function(done) {
			var params = {
				qs: {}
			};
			executeMyRequest(params, 'kill', 'get', function(body) {
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: access_token"});
				done();
			});
		});
		it('success ', function(done) {
			var params = {
				qs: {
					"access_token": token
				}
			};
			executeMyRequest(params, 'kill', 'get', function(body) {
				console.log(body);
				assert.ok(body);
				assert.equal(body.data, 'kill token happened');
				done();
			});
		});

	});

});