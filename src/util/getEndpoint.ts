import { graphqlEndpoint, apiEndpoint, secret } from "./env";
import getConfig from "./getConfig";
import fetch from "node-fetch";
import { status } from "./logger"

interface Endpoint{
	graphql: string;
	api: string;
}

const regionMap = new Map<string, Endpoint>([
	["eu", {
		graphql: "https://graphql.eu.fauna.com",
		api: "https://db.eu.fauna.com"
	}],
	["us", {
		graphql: "https://graphql.us.fauna.com",
		api: "https://db.us.fauna.com"
	}],
	["classic", {
		graphql: "https://graphql.fauna.com",
		api: "https://db.fauna.com"
	}],
	["preview", {
		graphql: "https://graphql.fauna-preview.com",
		api: "https://db.fauna-preview.com"
	}],
	["local", {
		graphql: "http://localhost:8084",
		api: "http://localhost:8443"
	}]
])

// This variable stores the potential return value of findValidEndpoint()
let establishedEndpoint: Endpoint;

// The parameter `_useSavedEndpoint` was added to make tests work. It should not be used by other package code.
export default async function getEndpoint(_useSavedEndpoint = true): Promise<Endpoint>{
	// If the findValidEndpoint() has already produced a value, just use that value instead of calling it again.
	if(establishedEndpoint && _useSavedEndpoint)
		return establishedEndpoint;

	// Env var has top priority.
	if(graphqlEndpoint && apiEndpoint) return {
		graphql: graphqlEndpoint,
		api: apiEndpoint
	};

	// Config option has second priority.
	const config = getConfig();
	if(config.region){
		const resultEndpoint = regionMap.get(config.region);
		if(resultEndpoint) return resultEndpoint;
	}

	/* If neither env var nor config option is specified,
	try to find the correct endpoint by checking each one
	and return the first one that doesn't result in an error. */
	const validEndpoint = await findValidEndpoint();
	if(!validEndpoint){
		throw new Error("Region could not be inferred. Please review your configuration and try again.");
	}

	return validEndpoint;
}

async function findValidEndpoint(){
	const endpoints: Endpoint[] = [];

	regionMap.forEach( (value) => {
		endpoints.push(value);
	})

	// Send requests to all known endpoints.
	const results = await Promise.allSettled(endpoints.map( async endpoint => {
		return fetch(`${endpoint.graphql}/graphql`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${secret}`,
				"Content-Type": "text/plain"
			}
		})
	}));

	// Find index of correct endpoint.
	try{
		const index: number = await new Promise( (resolve, reject) => {
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
				if(index === results.length - 1) reject("Could not find correct endpoint. Make sure your secret key is correct.");
			});
		});
	
		const endpoint = endpoints[index];
		const region = getRegionKey(endpoint);
		status(`Your database region was inferred from your secret key and was set to '${region}'. Use the 'region' option to set it explicitly.\nMore info: https://fgu-docs.com/configuration/config-file/\n`, "info");
	
		establishedEndpoint = endpoint;
		return endpoint;
	}catch{
		status("Could not infer endpoint.", "error")
		return null;
	}
	
}

function getRegionKey(endpoint: Endpoint){
	for(let [key, value] of regionMap.entries()){
		if(
			value.api == endpoint.api && 
			value.graphql === endpoint.graphql
		) return key;
	}
}