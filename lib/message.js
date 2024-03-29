'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const twilio = require('twilio');
const handlebars = require("handlebars");

let lib = {
	
	"send": function (soajs, service, data, options, cb) {
		
		let messageConfig = {};
		
		if (soajs.servicesConfig.sms) {
			if (soajs.servicesConfig.sms.twilio) {
				messageConfig.twilio = soajs.servicesConfig.sms.twilio;
			}
			if (soajs.servicesConfig.sms.from) {
				messageConfig.from = soajs.servicesConfig.sms.from;
			}
		}
		if (soajs.registry && soajs.registry.custom && soajs.registry.custom.sms && soajs.registry.custom.sms.value) {
			if (!messageConfig.from && soajs.registry.custom.sms.value.from) {
				messageConfig.from = soajs.registry.custom.sms.value.from;
			}
			if (!messageConfig.twilio && soajs.registry.custom.sms.value.twilio) {
				messageConfig.twilio = soajs.registry.custom.sms.value.twilio;
			}
		}
		if (messageConfig && messageConfig.from && messageConfig.twilio && messageConfig.twilio.accountSid && messageConfig.twilio.authToken) {
			let twilioConfiguration = messageConfig.twilio;
			let from = messageConfig.from;
			
			let ln = null; //means the default records at the root object of link and mail
			if (data.ln) {
				ln = data.ln.toLowerCase();
			}
			/**
			 * The below gives the option to have link && mail configured at different level per service, one at custom registry and one at provision
			 */
			let serviceSMSConf = {
				"link": null,
				"sms": null
			};
			if (soajs.servicesConfig.oauth && soajs.servicesConfig.oauth.sms && soajs.servicesConfig.oauth.sms[service]) {
				serviceSMSConf.sms = soajs.servicesConfig.oauth.sms[service];
			}
			if (soajs.servicesConfig.oauth && soajs.servicesConfig.oauth.link && soajs.servicesConfig.oauth.link[service]) {
				serviceSMSConf.link = soajs.servicesConfig.oauth.link[service];
			}
			if (soajs.registry && soajs.registry.custom && soajs.registry.custom.oauth && soajs.registry.custom.oauth.value) {
				let linkConf = soajs.registry.custom.oauth.value.link || null;
				let smsConf = soajs.registry.custom.oauth.value.sms || null;
				if (ln && soajs.registry.custom.oauth.value[ln]) {
					if (soajs.registry.custom.oauth.value[ln].link) {
						linkConf = soajs.registry.custom.oauth.value[ln].link;
					}
					if (soajs.registry.custom.oauth.value[ln].sms) {
						smsConf = soajs.registry.custom.oauth.value[ln].sms;
					}
				}
				if (!serviceSMSConf.link && linkConf && linkConf[service]) {
					serviceSMSConf.link = linkConf[service];
				}
				if (!serviceSMSConf.sms && smsConf && smsConf[service]) {
					serviceSMSConf.sms = smsConf[service];
				}
			}
			if (serviceSMSConf && serviceSMSConf.sms) {
				if (serviceSMSConf.link) {
					data.link = {
						[service]: serviceSMSConf.link
					};
				}
				if (options && options.ttl) {
					data.limit = options.ttl / (3600 * 1000);
				}
				if (options && options.code) {
					data.code = options.code;
				}
				if (!data.ts) {
					let ts = new Date();
					data.ts = ts.toString();
				}
				let smsOptions = {
					'to': data.phone,
					'from': from
				};
				if (smsOptions.to.charAt(0) !== "+") {
					smsOptions.to = "+" + smsOptions.to;
				}
				if (smsOptions.from.charAt(0) !== "+") {
					smsOptions.from = "+" + smsOptions.from;
				}
				if (options.type === "whatsapp") {
					smsOptions.to = "whatsapp:" + smsOptions.to;
					smsOptions.from = "whatsapp:" + smsOptions.from;
				}
				if (serviceSMSConf.sms.mediaUrl) {
					smsOptions.mediaUrl = serviceSMSConf.sms.mediaUrl;
				}
				if (serviceSMSConf.sms.content) {
					let template = handlebars.compile(serviceSMSConf.sms.content);
					smsOptions.body = template(data);
				} else {
					let error = new Error("oAuth SMS configuration is missing content for: " + service);
					return cb(error, data);
				}
				if (process.env.SOAJS_TEST) {
					console.log(smsOptions);
					return cb(null, data);
				}
				try {
					const client = twilio(twilioConfiguration.accountSid, twilioConfiguration.authToken);
					client.messages
						.create(smsOptions)
						.then((message) => {
							data.sid = message.sid;
							return cb(null, data);
						})
						.catch(error => {
							return cb(error, data);
						});
				} catch (error) {
					return cb(error, data);
				}
			} else {
				let error = new Error("oAuth SMS configuration is missing! for: " + service);
				return cb(error, data);
			}
		} else {
			let error = new Error("SMS configuration is missing [from && twilio]! for: " + service);
			return cb(error, data);
		}
	}
};

module.exports = lib;
