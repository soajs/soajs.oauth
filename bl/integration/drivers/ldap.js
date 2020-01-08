'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

let lib = {
	/**
	 * Map LDAP user returned to SOAJS profile correspondingly
	 *
	 */
	"mapProfile": (record, cb) => {
		
		let profile = {
			id: record.dn,
			firstName: record.cn || "",
			lastName: record.sn || "",
			email: record.mail,
			password: '',
			username: record.dn,
			groups: [],
			originalProfile: record
		};
		
		return cb(null, profile);
	}
};

module.exports = lib;