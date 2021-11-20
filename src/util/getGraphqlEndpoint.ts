import { graphqlEndpoint, secret } from "./env";
import getConfig from "./getConfig";
import fetch from "node-fetch";

const regionMap = new Map([
	["eu", "https://graphql.eu.fauna.com"],
	["us", "https://graphql.us.fauna.com"],
	["classic", "https://graphql.fauna.com"],
	["preview", "https://graphql.fauna-preview.com"]
])

export default async function getGraphqlEndpoint(){
	// Env var has top priority.
	if(graphqlEndpoint) return graphqlEndpoint;

	// Config option has second priority.
	const config = getConfig();
	if(config.region) return regionMap.get(config.region);

	/* If neither env var nor config option is specified,
	try to find the correct endpoint by checking each one
	and return the first one that doesn't result in an error. */
	return findValidEndpoint();	
}

async function findValidEndpoint(){
	const endpoints: string[] = [];

	regionMap.forEach( (value) => {
		endpoints.push(value);
	})

	// Send requests to all known endpoints.
	const results = await Promise.allSettled(endpoints.map( async endpoint => {
		return fetch(`${endpoint}/graphql`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${secret}`,
				"Content-Type": "text/plain"
			}
		})
	}));

	// Find index of correct endpoint.
	const index: number = await new Promise( resolve => {
		results.forEach( async (result, index) => {
			if(result.status !== "fulfilled") return;
	
			/* Every request will return an error message, the status code is always
			200. Requests to incorrect endpoints will return the 
			"Invalid database secret." error. 
			Requests to an accepted endpoint will return a longer error message. 
			I choose to check the negative case here, because I suspect it is less likely to change. This implementation can probably be improved and pull requests for doing so would be much appreciated. */
			const res = await result.value.json();
			const message = res.errors[0].message;
			const regex = /^Invalid database secret/i;
			const ok = !regex.test(message);
			
			if(ok) resolve(index);
		});
	})
	const endpoint = endpoints[index];

	return endpoint;
}