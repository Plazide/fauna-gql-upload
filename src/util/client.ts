import faunadb from "faunadb";
import fetch from "cross-fetch";
import secret from "./secret";

const client = new faunadb.Client({
	secret,
	fetch
});

export default client;