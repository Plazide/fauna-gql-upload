import getConfig from "./getConfig";
import dotenv from "dotenv";

const config = getConfig();
dotenv.config({
  path: config.envPath
});

function getSecret(){
	const { secretEnv } = config;
	const secret = process.env[secretEnv];
	if(!secret) throw new Error(`Can not read secret from environment variable ${secretEnv}`);

	return secret;
}

const secret = getSecret();

export default secret;