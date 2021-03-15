// @ts-ignore
import { Client, query } from "faunadb";
import fetch from "cross-fetch";
import { secret, apiEndpoint } from "./env";

const parts = apiEndpoint.replace("//", "").split(":");
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

export const q = query;
export default client;