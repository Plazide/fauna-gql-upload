# Upload access providers

To upload your access provider configuration, you need a `fauna/providers` directory containing `.ts`/`.js` files that hold your configuration information.

These files look like the following example:

```js
import { query as q } from "faunadb";

export default {
  name: "auth0",
  issuer: "https://<your-auth0-domain>.auth0.com",
  jwks_uri: "https://<your-auth0-domain>.auth0.com/.well-known/jwks.json",
  roles: [ q.Role("user") ]
}
```

The issuer domain can be found in your Auth0 dashboard, and the `jwks_uri` is simply that domain with `/.well-known/jwks.json` appended.

When uploading the access provider, an audience url will be logged to the console. This audience URL should be used in the *identifier* field when creating a new API in the Auth0 dashboard. Refer to [Setting up SSO authentication in Fauna with Auth0](https://fauna.com/blog/setting-up-sso-authentication-in-fauna-with-auth0#set-up-an-auth0-api) by [Brecht De Rooms](https://twitter.com/databrecht) for more in depth instructions.