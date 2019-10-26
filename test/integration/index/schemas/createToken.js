/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

let createTokenSchema = {
	"type": "object",
	"required": true,
	"additionalProperties": false,
	"properties": {
		"token_type": {
			"type": "string",
			"required": false
		},
		"access_token": {
			"type": "string",
			"required": false
		},
		"expires_in": {
			"type": "number",
			"required": false
		},
		"refresh_token": {
			"type": "string",
			"required": false
		},
		"errors": {
			"type": "object",
			"required": false,
			"properties": {
				"codes": {
					"type": "array",
					"required": true
				},
				"details": {
					"type": "array",
					"required": true
				}
			}
		}
	}
};

module.exports = createTokenSchema;