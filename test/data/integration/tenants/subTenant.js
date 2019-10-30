'use strict';

let lib = {
	_id: "5da6d6280067e20d5fe67667",
	type: "client",
	code: "SOME",
	name: "some",
	description: "new",
	oauth: {
		secret: "this is a secret",
		redirectURI: "http://domain.com",
		pin: {
			TPROD: {
				enabled: true
			}
		},
		disabled: 0,
		type: 2,
		loginMode: "urac"
	},
	applications: [
		{
			product: "TPROD",
			package: "TPROD_BASIC",
			appId: "5da6e4fcf7d97b11363e08ff",
			description: null,
			_TTL: 21600000,
			keys: [
				{
					key: "be9f309c1e9f72456f68dfef48ede9d2",
					extKeys: [
						{
							extKey: "e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18",
							device: {
							
							},
							geo: {
							
							},
							env: "DASHBOARD",
							dashboardAccess: false,
							label: "extsub"
						}
					],
					config: {
						dashboard: {
							commonFields: {
								mail: {
									from: "me@localhost.com",
									transport: {
										type: "sendmail",
										options: {
										
										}
									}
								}
							},
							urac: {
								hashIterations: 1024,
								seedLength: 32,
								link: {
									addUser: "http://dashboard.soajs.org:80/#/setNewPassword",
									changeEmail: "http://dashboard.soajs.org:80/#/changeEmail/validate",
									forgotPassword: "http://dashboard.soajs.org:80/#/resetPassword",
									join: "http://dashboard.soajs.org:80/#/join/validate"
								},
								tokenExpiryTTL: 172800000,
								validateJoin: true,
								mail: {
									join: {
										subject: "Welcome to SOAJS",
										path: "undefined/soajs/node_modules/soajs.urac/mail/urac/join.tmpl"
									},
									forgotPassword: {
										subject: "Reset Your Password at SOAJS",
										path: "undefined/soajs/node_modules/soajs.urac/mail/urac/forgotPassword.tmpl"
									},
									addUser: {
										subject: "Account Created at SOAJS",
										path: "undefined/soajs/node_modules/soajs.urac/mail/urac/addUser.tmpl"
									},
									changeUserStatus: {
										subject: "Account Status changed at SOAJS",
										path: "undefined/soajs/node_modules/soajs.urac/mail/urac/changeUserStatus.tmpl"
									},
									changeEmail: {
										subject: "Change Account Email at SOAJS",
										path: "undefined/soajs/node_modules/soajs.urac/mail/urac/changeEmail.tmpl"
									}
								}
							},
							oauth: {
								loginMode: "urac"
							}
						}
					}
				}
			]
		}
	],
	tenant: {
		_id: "5c0e74ba9acc3c5a84a51259",
		code: "DBTN"
	}
};

module.exports = lib;
