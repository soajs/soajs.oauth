/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */
'use strict';

function startServer(serverConfig, callback) {
	
	// let serverConfig = {
	// 	host: '127.0.0.1',
	// 	port: 10389,
	// 	baseDN: 'ou=users,ou=system',
	// 	adminUser: 'uid=admin, ou=system',
	// 	adminPassword: 'secret'
	// };
	
	let host = serverConfig.host;
	let port = serverConfig.port;
	let baseDN = serverConfig.baseDN;
	let adminUser = serverConfig.adminUser;
	let adminPassword = serverConfig.adminPassword;
	
	let userExample = {
		userName: 'owner',
		userPass: 'password',
		userCn: 'Antoine Hage',
		userSn: 'Hage',
		userMail: 'antoine@soajs.org'
	};
	
	let userName = userExample.userName;
	let userPass = userExample.userPass;
	let userCn = userExample.userCn;
	let userSn = userExample.userSn;
	let userMail = userExample.userMail;
	
	let ldap = require('ldapjs');
	
	let server = ldap.createServer();
	
	server.bind('ou=system', function (req, res, next) {
		if (req.dn.toString() !== adminUser) {
			let error = {
				message: 'Incorrect DN given : invalid admin user'
			};
			return next(error);
		}
		res.end();
		return next();
	});
	
	server.bind(adminUser, function (req, res, next) {
		// console.log('Admin authentication reached ...' + req.dn.toString());
		if (req.dn.toString().replace(new RegExp(' ', 'g'), '') !== adminUser.replace(new RegExp(' ', 'g'), '') || req.credentials !== adminPassword) {
			let error = {
				message: 'INVALID_CREDENTIALS for admin ' + req.dn.toString().replace(new RegExp(' ', 'g'), '')
			};
			return next(error);
			// return next(new ldap.InvalidCredentialsError());
		}
		res.end();
		return next();
	});
	
	server.bind(baseDN, function (req, res, next) {
		// console.log('User authentication reached ...');
		if (req.dn.toString() !== 'uid=' + userName + ', ou=users, ou=system' || req.credentials !== userPass) {
			let error = {
				message: 'INVALID_CREDENTIALS for user ' + req.dn.toString()
			};
			return next(error);
			
		} else {
			res.end();
			return next();
		}
	});
	
	server.search(baseDN, function (req, res) {
		// console.log('User search reached ...');
		if (req.filter.toString() === '(uid=' + userName + ')') {
			let obj = {
				dn: 'uid=' + userName + ', ou=users, ou=system',  // string, not DN object
				attributes: {
					cn: [userCn],
					sn: [userSn],
					mail: [userMail],
					objectclass: ['person', 'top']
				}
			};
			res.send(obj);
		}
		
		res.end();
	});
	
	server.listen(port, host, function () {
		console.log('LDAP server listening at', server.url);
		return callback(server);
	});
	
}

function killServer(server) {
	console.log("killing server ....");
	server.close();
}

module.exports = {
	startServer: startServer,
	killServer: killServer
};