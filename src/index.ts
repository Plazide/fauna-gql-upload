#!/usr/bin/env node
import yargs from "yargs";
import getConfig from "./util/getConfig";

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
	ensurePackage("faunadb")
	const uploadSchema = (await import("./lib/schema")).default;
	const uploadResources = (await import("./lib/resources")).default;

	// Upload schema
	await uploadSchema(schemaPath, argv.override);
	console.log();

	// Upload indexes
	await uploadResources(indexesDir, "indexes");

	// Upload functions without their role property.
	// This solves a problem where the fauna would throw an invalid reference error
	// when referencing user defined roles before they exist.
	await uploadResources(fnsDir, "functions", { fnsWithRoles: false });

	// Upload roles
	await uploadResources(rolesDir, "roles");

	// Upload functions with roles
	await uploadResources(fnsDir, "functions", { fnsWithRoles: true })

	// Upload data
	await uploadResources(dataDir, "data");

	// If the codegen is specified
	if(codegen){
		ensurePackage("graphql");

		const runCodegen = (await import("./lib/codegen")).default;
		runCodegen()
	}
		
})();

function ensurePackage(name: string){
	try{
		require(name);
	}catch(err){
		throw `Missing required peer dependency "${name}".
			
Run "yarn add -D ${name}" to install it with yarn,
or "npm i --save-dev ${name}" to install with npm.
			`
	}
}
