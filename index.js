#!/usr/bin/env node
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const cwd = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(cwd, ".fauna.json"), "utf8"));

const defaultSecret = "FAUNADB_SECRET";
const{ schemaPath = "./models/schema.gql", secretEnv = defaultSecret } = config;

const secret = process.env[secretEnv];
const schema = path.join(cwd, schemaPath);
const data = fs.createReadStream(schema);

fetch("https://graphql.fauna.com/import", {
	method: "POST",
	headers: {
		"Authorization": `Bearer ${secret}`,
		"Content-Type": "text/plain"
	},
	body: data
}).then( async res => {
	if(!res.ok){
		const result = await res.text();
		console.error("Error:", result);
		console.log();
		console.log("Search for this error on Google:", encodeURI(`https://google.com/search?q=faunadb graphql ${result}`));
	}

	if(res.ok)
		console.log("Successfully updated schema!!!");
}).catch(err => {
	throw err;
});
