'use strict';

/**
 * @license
 * Copyright Fersan Capital All Rights Reserved.
 *
 * Use of this source code is governed by the Fersan Capital license that can be
 * found in the LICENSE file at the root of this repository
 */

const handlebars = require("handlebars");
const soajsCore = require('soajs');

let lib = {

	"send": function (soajs, content, data, options, cb) {

		let mailConf = {};

		if (soajs.servicesConfig.mail) {
			if (soajs.servicesConfig.mail.transport) {
				mailConf.transport = soajs.servicesConfig.mail.transport;
			}
			if (soajs.servicesConfig.mail.from) {
				mailConf.from = soajs.servicesConfig.mail.from;
			}
		}
		if (soajs.registry && soajs.registry.custom && soajs.registry.custom.mail && soajs.registry.custom.mail.value) {
			if (!mailConf.from && soajs.registry.custom.mail.value.from) {
				mailConf.from = soajs.registry.custom.mail.value.from;
			}
			if (!mailConf.transport && soajs.registry.custom.mail.value.transport) {
				mailConf.transport = soajs.registry.custom.mail.value.transport;
			}
		}

		if (mailConf && mailConf.transport && mailConf.from) {
			let transportConfiguration = mailConf.transport;
			const template = handlebars.compile(content);

			let mailOptions = {
				'to': options.to,
				'from': mailConf.from,
				'subject': options.subject,
				'content': template(data)
			};
			let mailer = new (soajsCore.mail)(transportConfiguration);

			mailer.send(mailOptions, function (error) {
				return cb(error, data);
			});

		} else {
			let error = new Error("Mail configuration is missing!");
			return cb(error, data);
		}
	}
};

module.exports = lib;