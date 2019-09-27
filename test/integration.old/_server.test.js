"use strict";
var assert = require('assert');
var shell = require('shelljs');
var helper = require("./helper.js");
var sampleData = require("soajs.mongodb.data/modules/oauth");
var oauthService, controller;

describe("importing sample data", function () {
	
	it("do import", function (done) {
		shell.pushd(sampleData.dir);
		shell.exec("chmod +x " + sampleData.shell, function (code) {
			assert.equal(code, 0);
			shell.exec(sampleData.shell, function (code) {
				assert.equal(code, 0);
				shell.popd();
				console.log('Test data imported.');
				done();
			});
		});
	});

	it("Start Services", function (done) {
		console.log('Starting services ...');
		controller = require("soajs.controller");
		setTimeout(function () {
			oauthService = helper.requireModule('./index');
			setTimeout(function () {
				done();
			}, 1500);
		}, 1000);
	});

	it("Reload controller registry", function (done) {
		var params = {
			"uri": "http://127.0.0.1:5000/reloadRegistry",
			"headers": {
				"content-type": "application/json"
			},
			"json": true
		};
		helper.requester("get", params, function (error, response) {
			assert.ifError(error);
			assert.ok(response);
			done();
		});
	});

	after(function (done) {
		setTimeout(function () {
			require("./soajs.oauth.test.js");
			done();
		}, 500);
	});
});