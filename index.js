#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const uploadSchema = require("./lib/schema");
const uploadFunctions = require("./lib/functions");
require("dotenv").config();

const cwd = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(cwd, ".fauna.json"), "utf8"));

const defaultFnsDir = path.join("fauna", "functions");
const defaultSecret = "FAUNADB_SECRET";
const{
	schemaPath = "./models/schema.gql",
	secretEnv = defaultSecret,
	fnsDir = defaultFnsDir
} = config;
const secret = process.env[secretEnv];

(async () => {
	// Upload schema
	await uploadSchema(schemaPath, secret);
	console.log();

	// Upload functions
	fs.readdir(fnsDir, async (err, fnsFiles) => {
		if(err) {
			console.log("Could not read functions directory...");
			console.log("❌  Ignoring functions");

			return;
		}

		const fns = fnsFiles.map( file => {
			try{
				const fn = require(path.join(cwd, fnsDir, file));

				return fn;
			}catch(err){
				console.error("❌  Could not read", file);

				return null;
			}
		}).filter( value => value !== null);

		await uploadFunctions(fns, secret);
	});
})();
