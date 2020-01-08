'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const fs = require("fs");
const path = require('path');

let drivers = {};

let main = {
	"loadDrivers": function (soajs, filePath, cb) {
		//load all drivers
		filePath = filePath || "./drivers/";
		fs.readdir(filePath, (error, files) => {
			if (error) {
				soajs.log.error("Unable to read drivers folder @ " + filePath + ", aborting ...");
				return cb(error);
			}
			if (files && files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					let onePath = files[i];
					let filename = path.basename(onePath);
					if (filename.indexOf(".js") === (filename.length - 3)) {
						let driver = filename.substr(filename.indexOf(".js"));
						soajs.log.debug("A driver for [" + driver + "] found and loaded.");
						drivers[driver] = require(filePath + onePath);
					}
				}
			}
			return cb();
		});
	},
	/**
	 * Return the driver based on the strategy requested
	 *
	 */
	"getDriver": function (driver) {
		if (drivers[driver]) {
			return drivers[driver];
		} else {
			return null;
		}
	}
};

module.exports = main;