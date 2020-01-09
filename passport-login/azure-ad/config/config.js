exports.credentials = {
	identityMetadata: 'https://login.microsoftonline.com/5a2fab2e-fd08-4fa0-9b4f-8e4312273e79/.well-known/openid-configuration', // This is customized for your tenant.
	// You may use the common endpoint for multi-tenant scenarios
	// if you do, make sure you set validateIssuer to false and specify an audience
	// as you won't get this from the Identity Metadata
	//
	// identityMetadata: 'https://login.microsoftonline.com/common/.well-known/openid-configuration',
	// validateIssuer: true, // if you have validation on, you cannot have users from multiple tenants sign in
	clientID: '866fe1d8-5307-4d7b-8d11-17b5dc195b62',
	issuer: 'https://login.microsoftonline.com/5a2fab2e-fd08-4fa0-9b4f-8e4312273e79/v2.0',
	passReqToCallback: false,
	audience: '866fe1d8-5307-4d7b-8d11-17b5dc195b62',
	loggingLevel: 'info', // valid are 'info', 'warn', 'error'. Error always goes to stderr in Unix.
	clientSecret: 'q5CrboDuhy-ZkS_JpT/?4PvLKsnItS34', // if you are doing code or id_token code
	
	// skipUserProfile: true, // for AzureAD should be set to true.
	// responseType: 'id_token code', // for login only flows use id_token. For accessing resources use `id_token code`
	// responseMode: 'query', // For login only flows we should have token passed back to us in a POST
	// scope: ['email', 'profile'],
	
	tenantIdOrName: '5a2fab2e-fd08-4fa0-9b4f-8e4312273e79',
	redirect_uri: 'https://localhost:3000/account',
	resource: '00000003-0000-0000-c000-000000000000',
	mongoose_auth_local: 'mongodb://localhost/test',
};