#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const uploadSchema = require("./lib/schema");
const uploadFunctions = require("./lib/functions");
const uploadRoles = require("./lib/roles");
const uploadIndexes = require("./lib/indexes");
require("dotenv").config();

const argv = yargs
	.option("override", {
		alias: "o",
		description: "Override the schema, this will delete all your data in the database.",
		type: "boolean"
	})
	.option("yes", {
		alias: "y",
		description: "Answer yes to all potential prompts.",
		type: "boolean"
	})
	.argv;

const cwd = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(cwd, ".fauna.json"), "utf8"));

const defaultRolesDir = path.join("fauna", "roles");
const defaultFnsDir = path.join("fauna", "functions");
const defaultIndexesDir = path.join("fauna", "indexes");
const defaultSecret = "FAUNADB_SECRET";
const{
	schemaPath = "./models/schema.gql",
	secretEnv = defaultSecret,
	fnsDir = defaultFnsDir,
	rolesDir = defaultRolesDir,
	indexesDir = defaultIndexesDir
} = config;
const secret = process.env[secretEnv];

(async () => {
	// Upload schema
	await uploadSchema(schemaPath, secret, argv.override);
	if(argv.override) return;
	
	console.log();

	// Upload indexes
	await uploadIndexes(indexesDir, secret);

	// Upload functions
	await uploadFunctions(fnsDir, secret);

	// Upload roles
	await uploadRoles(rolesDir, secret);
})();
