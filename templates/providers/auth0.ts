/*
	This file contains an access provider. You can create more access providers by creating another file in the `providers/` directory and exporting a `ProviderResource`. Use the code below as a reference.

	TODO: Remember to remove or edit this provider before uploading to Fauna.
*/

import { query as q } from "faunadb";
import { ProviderResource } from "fauna-gql-upload";

const auth0: ProviderResource = {
	name: "auth0",
	issuer: "https://<your-auth0-domain>.auth0.com",
	jwks_uri: "https://<your-auth0-domain>.auth0.com/.well-known/jwks.json",
	roles: [ q.Role("user") ]
}

export default auth0;