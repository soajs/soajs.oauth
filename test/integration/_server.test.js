"use strict";
var assert = require('assert');
var shell = require('shelljs');
var helper = require("../helper.js");
var sampleData = require("soajs.mongodb.data/modules/oauth");
var oauthService, controller;

var soajs = require('soajs');
var Mongo = soajs.mongo;
var dbConfig = require("./db.config.test.js");

var oauthConfig = dbConfig();
oauthConfig.name = "core_provision";
var mongo = new Mongo(oauthConfig);
var servicesCollName = 'services';

function updateSeriveRecord(cb) {
    console.log('Updated oauth service record ...');
    var criteria = {name: 'oauth'};
    mongo.findOne(servicesCollName, criteria, function (error, record) {
        assert.ifError(error);
        assert.ok(record);

        for (var version in record.versions) {
            record.versions[version].extKeyRequired = false;
        }

        mongo.save(servicesCollName, record, function (error) {
            assert.ifError(error)
            return cb();
        });
    });
}

describe("importing sample data", function () {

    it("do import", function (done) {
        shell.pushd(sampleData.dir);
        shell.exec("chmod +x " + sampleData.shell, function (code) {
            assert.equal(code, 0);
            shell.exec(sampleData.shell, function (code) {
                assert.equal(code, 0);
                shell.popd();
                done();
            });
        });
    });

    after(function (done) {
        console.log('Test data imported.');
        updateSeriveRecord(function () {
            console.log('Starting services ...')
            controller = require("soajs.controller");
            setTimeout(function () {
                oauthService = helper.requireModule('./index');
                setTimeout(function () {
                    require("./soajs.oauth.test.js");
                    done();
                }, 1000);
            }, 1000);
        });
    });
});
