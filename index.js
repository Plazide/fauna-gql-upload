#!/usr/bin/env node
const path = require("path");
const yargs = require("yargs");
const getConfig = require("./util/getConfig");
const uploadSchema = require("./lib/schema");
const uploadResources = require("./lib/resources");
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

const config = getConfig();

const defaultRolesDir = path.join("fauna", "roles");
const defaultFnsDir = path.join("fauna", "functions");
const defaultIndexesDir = path.join("fauna", "indexes");

const{
	schemaPath = "./models/schema.gql",
	fnsDir = defaultFnsDir,
	rolesDir = defaultRolesDir,
	indexesDir = defaultIndexesDir
} = config;

(async () => {
	// Upload schema
	await uploadSchema(schemaPath, argv.override);
	console.log();

	// Upload indexes
	await uploadResources(indexesDir, "indexes");

	// Upload functions
	await uploadResources(fnsDir, "functions");

	// Upload roles
	await uploadResources(rolesDir, "roles");
})();
