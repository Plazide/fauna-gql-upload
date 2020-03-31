#!/usr/bin/env node
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const cwd = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(cwd, ".fauna.json"), "utf8"));

const{ schemaPath = "./models/schema.gql", secretEnv } = config;

const schema = path.join(cwd, schemaPath);
const secret = process.env[secretEnv] || process.env.FAUNA_SECRET;
const data = fs.createReadStream(schema);

fetch("https://graphql.fauna.com/import", {
	method: "POST",
	headers: {
		"Authorization": `Bearer ${secret}`,
		"Content-Type": "text/plain"
	},
	body: data
}).then( res => {
	if(!res.ok)
		throw res.message;

	console.log("Successfully updated schema!!!");
});
