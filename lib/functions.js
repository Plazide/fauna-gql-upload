const faunadb = require("faunadb");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const displayErrors = require("../util/displayErrors");

const cwd = process.cwd();

// Alias Function as Func because Function is reserved.
const{ CreateFunction, Update, Function: Func } = faunadb.query;

async function uploadFunctions(fnsDir, secret){
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

		const client = new faunadb.Client({
			secret,
			fetch
		});

		await setFunctions(fns, client);
	});
}

async function setFunctions(fns, client){
	try{
		let numCreated = 0,
			numUpdated = 0,
			numFailed = 0;

		for(let fn of fns)
			try{
				const status = await createFunction(fn, client);

				if(status === "instance already exists"){
					await updateFunction(fn, client).catch(err => console.error(err));
					numUpdated++;
					continue;
				}

				if(status === true){
					numCreated++;
					continue;
				}

				if(status !== true){
					numFailed++;
					continue;
				}
			}catch(err){
				throw err;
			}

		console.group("✔️  Finished uploading functions.");
		console.log("Created", numCreated, "functions");
		console.log("Updated", numUpdated, "functions");
		if(numFailed > 0)
			console.warn("Failed with", numFailed, "functions");
		console.log();
		console.groupEnd();
	}catch(err){
		throw err;
	}
}

async function createFunction(fn, client){
	try{
		await client.query(
			CreateFunction(fn)
		);

		return true;
	}catch(err){
		const response = JSON.parse(err.requestResult.responseRaw);
		const errors = response.errors;

		if(err.message !== "instance already exists")
			displayErrors(errors, fn, "function");

		return err.message;
	}
}

async function updateFunction(fn, client){
	try{
		await client.query(
			Update(
				Func(fn.name), {
					"role": fn.role,
					"body": fn.body
				}
			)
		);
	}catch(err){
		const response = JSON.parse(err.requestResult.responseRaw);
		const errors = response.errors;

		displayErrors(errors, fn, "function");
	}
}

module.exports = uploadFunctions;
