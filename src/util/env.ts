import getConfig from "./getConfig";
import dotenv from "dotenv";
import { status } from "./logger";

const config = getConfig();
dotenv.config({
  path: config.envPath
});

const { secretEnv, apiEndpointEnv, graphqlEndpointEnv } = config;
const apiEndpoint = process.env[apiEndpointEnv] || "https://db.fauna.com";
const graphqlEndpoint = process.env[graphqlEndpointEnv] || "https://graphql.fauna.com";

const secret = process.env[secretEnv];

if(!secret){
	status(`Can not read secret from environment variable "${secretEnv}".\nIf your environment file is not called ".env", you need to specify the name of it with "envPath" in ".fauna.json".\nIf you are using a different name than "FAUNADB_SECRET" for the environment variable, you need to specify that name with "secretEnv" in ".fauna.json"\n\n`, "error");

	throw new Error("Could not read secret. More info above.");
}

/** Provides access to values read from environment. If variables don't exist a default value will be used or an error will be thrown. */
export { secret, apiEndpoint, graphqlEndpoint };