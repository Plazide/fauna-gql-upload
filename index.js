#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const uploadSchema = require("./lib/schema");
const uploadFunctions = require("./lib/functions");
require("dotenv").config();

const cwd = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(cwd, ".fauna.json"), "utf8"));

const defaultSecret = "FAUNADB_SECRET";
const{ schemaPath = "./models/schema.gql", secretEnv = defaultSecret } = config;
const fnsDir = path.join(cwd, "fauna", "functions");
const fnsFiles = fs.readdirSync(fnsDir);

const fns = fnsFiles.map( file => {
	return require(path.join(fnsDir, file));
});

const secret = process.env[secretEnv];

(async () => {
	await uploadSchema(schemaPath, secret);
	console.log();
	await uploadFunctions(fns, secret);
})();
