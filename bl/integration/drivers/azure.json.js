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
	 * Initialize Azure strategy
	 
	 identityMetadata: 'https://login.microsoftonline.com/' + test_parameters.tenantID + '/.well-known/openid-configuration',
	 clientID: test_parameters.clientID,
	 validateIssuer: true,
	 issuer: ['https://sts.windows.net/' + test_parameters.tenantID + '/'],
	 passReqToCallback: false,
	 
	 responseType: 'code id_token',
	 responseMode: 'form_post',
	 redirectUrl: 'http://localhost:3000/auth/openid/return',
	 allowHttpForRedirectUrl: true,
	 clientSecret: test_parameters.clientSecret,
	 scope: null,
	 loggingLevel: null,
	 nonceLifetime: null,
	 
	 */
	"init": (req, config, cb) => {
		let data = {
			strategy: require('passport-azure-ad').BearerStrategy, // BearerStrategy, OIDCStrategy
			authentication: 'azure',
			configAuth: {
				// Required
				// 'https://login.microsoftonline.com/<your_tenant_name>.onmicrosoft.com/v2.0/.well-known/openid-configuration',
				// or 'https://login.microsoftonline.com/<your_tenant_guid>/v2.0/.well-known/openid-configuration'
				// or you can use the common endpoint
				// 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration'
				identityMetadata: config.identityMetadata,
				
				// Required
				clientID: config.clientID,
				
				// Required.
				// If you are using the common endpoint, you should either set `validateIssuer` to false, or provide a value for `issuer`.
				validateIssuer: config.validateIssuer || true,
				
				// Required if you are using common endpoint and setting `validateIssuer` to true.
				// For tenant-specific endpoint, this field is optional, we will use the issuer from the metadata by default.
				issuer: config.issuer || null,
				
				// Required.
				// Set to true if you use `function(req, token, done)` as the verify callback.
				// Set to false if you use `function(req, token)` as the verify callback.
				passReqToCallback: config.passReqToCallback || true,
				
				// Optional, default value is clientID
				audience: config.audience || null,
				
				// Optional. Default value is false.
				// Set to true if you accept access_token whose `aud` claim contains multiple values.
				allowMultiAudiencesInToken: config.allowMultiAudiencesInToken || false,
				
				// Optional. 'error', 'warn' or 'info'
				loggingLevel: config.loggingLevel || 'info',
				
			}
		};
		
		// Optional.
		if (config.clientSecret) {
			data.configAuth.clientSecret = config.clientSecret;
		}
		// Optional.
		if (config.skipUserProfile) {
			data.configAuth.skipUserProfile = config.skipUserProfile;
		}
		// Optional.
		if (config.responseType) {
			data.configAuth.responseType = config.responseType;
		}
		// Optional.
		if (config.responseMode) {
			data.configAuth.responseMode = config.responseMode;
		}
		// Optional.
		if (config.scope) {
			data.configAuth.scope = config.scope;
		}
		if (config.tenantIdOrName) {
			data.configAuth.tenantIdOrName = config.tenantIdOrName;
		}
		if (config.redirect_uri) {
			data.configAuth.redirect_uri = config.redirect_uri;
		}
		if (config.resource) {
			data.configAuth.resource = config.resource;
		}
		
		// Required to be true to use B2C
		if (config.isB2C) {
			data.configAuth.isB2C = config.isB2C;
		}
		// Required to use B2C
		if (config.policyName) {
			data.configAuth.policyName = config.policyName;
		}
		// Optional.
		if (config.loggingNoPII) {
			data.configAuth.loggingNoPII = config.loggingNoPII;
		}
		// Optional.
		if (config.clockSkew) {
			data.configAuth.clockSkew = config.clockSkew;
		}
		return cb(null, data);
	},
	
	/**
	 * Map azure user returned from API to SOAJS profile correspondingly
	 *
	 */
	"mapProfile": (user, cb) => {
		let email = '';
		if (user.profile.emails && user.profile.emails.length !== 0) {
			email = user.profile.emails[0].value;
		}
		let profile = {
			firstName: user.profile.name.givenName,
			lastName: user.profile.name.familyName,
			email: email,
			password: '',
			username: user.profile.id,
			id: user.profile.id
		};
		return cb(null, profile);
	},
	
	/**
	 * Update the request object before authenticating (inapplicable for azure)
	 *
	 */
	"preAuthenticate": (req, cb) => {
		return cb(null);
	},
	
	/**
	 * Custom update passport configuration before authenticating
	 *
	 */
	"updateConfig": (config, cb) => {
		return cb(null, config);
	}
};

module.exports = lib;