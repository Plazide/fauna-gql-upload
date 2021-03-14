import getConfig from "./getConfig";
import dotenv from "dotenv";
import { status } from "./logger";

const config = getConfig();
dotenv.config({
  path: config.envPath
});

function getSecret(){
	const { secretEnv } = config;
	const secret = process.env[secretEnv];
	
	if(!secret){
		status(`Can not read secret from environment variable "${secretEnv}".\nIf your environment file is not called ".env", you need to specify the name of it with "envPath" in ".fauna.json".\nIf you are using a different name than "FAUNADB_SECRET" for the environment variable, you need to specify that name with "secretEnv" in ".fauna.json"\n\n`, "error");

		throw new Error("Could not read secret. More info above.");
	} 

	return secret;
}

const secret = getSecret();

export default secret;