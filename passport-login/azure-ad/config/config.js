exports.credentials = {
	identityMetadata: 'https://login.microsoftonline.com/cff56d8f-f602-4afd-94e4-c95b76f1c81e/.well-known/openid-configuration', // This is customized for your tenant.
	// You may use the common endpoint for multi-tenant scenarios
	// if you do, make sure you set validateIssuer to false and specify an audience
	// as you won't get this from the Identity Metadata
	//
	// identityMetadata: 'https://login.microsoftonline.com/common/.well-known/openid-configuration',
	validateIssuer: true, // if you have validation on, you cannot have users from multiple tenants sign in
	passReqToCallback: false,
	mongoose_auth_local: 'mongodb://localhost/test',
	loggingLevel: 'info', // valid are 'info', 'warn', 'error'. Error always goes to stderr in Unix.
	clientID: '866fe1d8-5307-4d7b-8d11-17b5dc195b62',
	returnURL: '',
	clientSecret: 'q5CrboDuhy-ZkS_JpT/?4PvLKsnItS34', // if you are doing code or id_token code
	skipUserProfile: true, // for AzureAD should be set to true.
	responseType: 'id_token code', // for login only flows use id_token. For accessing resources use `id_token code`
	responseMode: 'query', // For login only flows we should have token passed back to us in a POST
	scope: ['email', 'profile'],
	audience: 'api://866fe1d8-5307-4d7b-8d11-17b5dc195b62',
	issuer: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
};