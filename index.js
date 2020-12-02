#!/usr/bin/env node
const path = require("path");
const yargs = require("yargs");
const getConfig = require("./util/getConfig");
const uploadSchema = require("./lib/schema");
const uploadResources = require("./lib/resources");
const runCodegen = require("./lib/codegen");
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

const {
	schemaPath,
	indexesDir,
	fnsDir,
	rolesDir,
	dataDir,
	codegen
} = getConfig();

(async () => {
	// Upload schema
	// await uploadSchema(schemaPath, argv.override);
	// console.log();

	// // Upload indexes
	// await uploadResources(indexesDir, "indexes");

	// // Upload functions without their role property.
	// // This solves a problem where the fauna would throw an invalid reference error
	// // when referencing user defined roles before they exist.
	// await uploadResources(fnsDir, "functions", { fnsWithRoles: false });

	// // Upload roles
	// await uploadResources(rolesDir, "roles");

	// // Upload functions with roles
	// await uploadResources(fnsDir, "functions", { fnsWithRoles: true })

	// // Upload data
	// await uploadResources(dataDir, "data");

	// If the codegen is specified
	if(codegen)
		runCodegen(codegen)
})();
