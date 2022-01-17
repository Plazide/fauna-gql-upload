// @ts-ignore
import { Client, query } from "faunadb";
import fetch from "cross-fetch";
import { secret } from "./env";
import getEndpoint from "./getEndpoint"

async function getClient(){
	const { api } = await getEndpoint();
	const parts = api.replace("//", "").split(":");
	const scheme = parts[0];
	const domain = parts[1];
	const port = parts[2];
	
	const client = new Client({
		secret,
		fetch,
		scheme,
		domain,
		port: port ? parseInt(port) : null
	});

	return client;
}

export const q = query;
export default getClient;