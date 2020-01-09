'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const driverConfig = require('./../../config.js');
const lib = require("./lib.js");
const ActiveDirectory = require('activedirectory');

let main = {
	
	"login": (soajs, data, cb) => {
		let username = data.username;
		let password = data.password;
		let ldapServer;
		
		if (soajs.servicesConfig && soajs.servicesConfig.oauth && soajs.servicesConfig.oauth.ldapServer) {
			ldapServer = soajs.servicesConfig.oauth.ldapServer;
		}
		else {
			return cb({"code": 420, "msg": driverConfig.errors[420]});
		}
		let host = ldapServer.host;
		let port = ldapServer.port;
		let baseDN = ldapServer.baseDN.replace(new RegExp(' ', 'g'), '');
		let adminUser = ldapServer.adminUser.replace(new RegExp(' ', 'g'), '');
		let adminPassword = ldapServer.adminPassword;
		let url = host + ":" + port;
		
		let filter = 'uid=' + username;
		let fullFilter = 'uid=' + username + ',' + baseDN;
		
		let ad = new ActiveDirectory({
			url: url,
			baseDN: baseDN,
			username: adminUser,
			password: adminPassword
		});
		
		ad.authenticate(fullFilter, password, (err, auth) => {
			if (err) {
				soajs.log.error(err);
				if (err.code && err.code === 'ECONNREFUSED') {
					soajs.log.error("Connection Refused!");
					return cb({"code": 700, "msg": driverConfig.errors[700]});
				}
				if (err.lde_message) {
					if (err.lde_message.includes('Incorrect DN given')) { // invalid admin username
						soajs.log.error("Incorrect DN given!");
						return cb({"code": 701, "msg": driverConfig.errors[701]});
					}
					
					if (err.lde_message.includes('INVALID_CREDENTIALS') && err.lde_message.includes(adminUser)) { // invalid admin credentials (wrong admin password)
						soajs.log.error("Invalid Admin Credentials");
						return cb({"code": 702, "msg": driverConfig.errors[702]});
					}
					
					if (err.lde_message.includes('INVALID_CREDENTIALS') && err.lde_message.includes(filter)) { // invalid user credentials (wrong user password)
						soajs.log.error("Invalid User Credentials");
						let obj = {"code": 703, "msg": driverConfig.errors[703]};
						return cb(obj);
					}
				}
				
				return cb({"code": 704, "msg": driverConfig.errors[704]});
			}
			
			if (auth) {
				soajs.log.debug('Authenticated!');
				
				ad.find(filter, (err, user) => {
					// since the user is authenticated, no error can be generated in this find call
					// since we are searching using the filter => we will have one result
					
					let driver = lib.getDriver("ldap");
					if (!driver) {
						return cb(new Error("Unable to get driver: ldap"));
					}
					if (!user || (user && !user.other)) {
						return cb({"code": 412, "msg": driverConfig.errors[412]});
					}
					driver.mapProfile(user.other[0], (err, profile) => {
						if (err) {
							soajs.log.error(err);
							return cb({"code": 411, "msg": driverConfig.errors[411] + " - " + err.message});
						}
						if (!profile) {
							return cb({"code": 412, "msg": driverConfig.errors[412]});
						}
						cb(null, profile);
					});
				});
			}
			else {
				soajs.log.error("Authentication failed.");
				return cb({"code": 705, "msg": driverConfig.errors[705]});
			}
		});
	}
};

module.exports = main;