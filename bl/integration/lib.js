'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

let drivers = {};

let main = {
	"loadDrivers": function () {
		//load all drivers
		let filePath = "./drivers/";
		let availableDrivers = ["facebook", "github", "google", "twitter", "office365", "openam", "ldap"];
		
		for (let i = 0; i < availableDrivers.length; i++) {
			let driver = availableDrivers[i];
			drivers[driver] = require(filePath + driver + ".js");
		}
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