# soajs.oauth
[![Build Status](https://travis-ci.org/soajs/soajs.oauth.svg?branch=master)](https://travis-ci.org/soajs/soajs.oauth)
[![Coverage Status](https://coveralls.io/repos/soajs/soajs.oauth/badge.png)](https://coveralls.io/r/soajs/soajs.oauth)

SOAJS oAuth is a service that integrates with [oAuth 2.0](http://www.oauth.org).
The service simply validates, refreshes and kills access tokens generated via oAuth 2.0.

SOAJS oAuth is used to protect other services from public access.
Protected services are only accessible if the access_token generated by oAuth is provided as a parameter.


##Installation

```sh
$ npm install soajs.oauth
$ cd soajs.oauth
$ node.
```

---

##Features
Once Installed and running, the oAuth service offers 2 APIs:

1. Token
2. Kill

Login to oAuth and provide the credentials needed, then copy the access_token from the returned response.<br>
```bash
$ CURL -X POST http://localhost:4000/oauth/token -d 'username=oauthuser&password=oauthpass&grant_type=password'
```

Response:
```json
{
  "token_type": "bearer",
  "access_token": "e58751473112bca2ed939e0445e55b0f7921f544",
  "expires_in": 3600,
  "refresh_token": "bb09a2f5582425c4ef9440dcce5885cbbe743047"
}
```

Use this access_token in all consequent requests that will be made to the protected service.
```bash
$ CURL -X GET -H "key:%someKeyValue%" "http://localhost:4000/example02/buildName?firstName=John&lastName=Smith&access_token=e58751473112bca2ed939e0445e55b0f7921f544"
```

Logout from oAuth by invoking the below API and the access_token will be killed.
```bash
$ CURL -X GET http://localhost:4000/oauth/kill -d 'access_token=someOAuthAcessToken'
```

---

More information is available on SOAJS website section for [oAuth](http://www.soajs.org/#/documentation/oAuth).