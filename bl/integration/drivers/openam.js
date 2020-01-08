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
	 * Map OpenAM user attributes returned to SOAJS profile correspondingly
	 *
	 */
	'mapProfile': (data, cb) => {
		
		let profile = {
			password: '',
			groups: []
		};
		
		data.attributesMap.forEach((param) => {
			
			let attributes = data.userRecord.attributes;
			
			if (Array.isArray(attributes)) {
				attributes.filter((attr) => {
					return attr.name === param.field;
				}).forEach((attr) => {
					profile[param.mapTo] = attr.values[0];
				});
			}
			
			if (profile[param.mapTo] == null) {
				profile[param.mapTo] = '';
			}
		});
		
		return cb(null, profile);
	}
};

module.exports = lib;