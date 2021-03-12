// @ts-ignore
import { Client, query } from "faunadb";
import fetch from "cross-fetch";
import secret from "./secret";

const client = new Client({
	secret,
	fetch
});

export const q = query;
export default client;