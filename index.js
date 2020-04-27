#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const uploadSchema = require("./lib/schema");
const uploadFunctions = require("./lib/functions");
const uploadRoles = require("./lib/roles");
require("dotenv").config();

const cwd = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(cwd, ".fauna.json"), "utf8"));

const defaultRolesDir = path.join("fauna", "roles");
const defaultFnsDir = path.join("fauna", "functions");
const defaultSecret = "FAUNADB_SECRET";
const{
	schemaPath = "./models/schema.gql",
	secretEnv = defaultSecret,
	fnsDir = defaultFnsDir,
	rolesDir = defaultRolesDir
} = config;
const secret = process.env[secretEnv];

(async () => {
	// Upload schema
	await uploadSchema(schemaPath, secret);
	console.log();

	// Upload functions
	await uploadFunctions(fnsDir, secret);
	console.log();

	// Upload roles
	await uploadRoles(rolesDir, secret);
})();
