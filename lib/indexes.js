const faunadb = require("faunadb");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const displayErrors = require("../util/displayErrors");

const cwd = process.cwd();

const{ CreateIndex, Update, Index } = faunadb.query;

async function uploadIndexes(dir, secret){
	fs.readdir(dir, async (err, files) => {
		if(err){
			console.log("Could not read indexes directory");
			console.log("❌ Ignoring indexes");

			return;
		}

		const indexes = files.map( file => {
			try{
				const index = require(path.join(cwd, dir, file));

				return index;
			}catch(err){
				console.error("❌  Could not read", file);

				return null;
			}
		}).filter( value => value !== null);

		const client = new faunadb.Client({
			secret,
			fetch
		});

		await setIndexes(indexes, client);
	});
}

async function setIndexes(indexes, client){
	try{
		let numCreated = 0,
			numUpdated = 0,
			numFailed = 0;

		for(let index of indexes)
			try{
				const status = await createIndex(index, client);

				if(status === "instance already exists"){
					await updateIndex(index, client).catch(console.error);
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

		console.group("✔️  Finished uploading indexes");
		console.log("Created", numCreated, "indexes");
		console.log("Updated", numUpdated, "indexes");
		if(numFailed > 0)
			console.warn("Failed with", numFailed, "indexes");
		console.log();
		console.groupEnd();
	}catch(err){
		throw err;
	}
}

async function createIndex(index, client){
	try{
		await client.query(
			CreateIndex(index)
		);

		return true;
	}catch(err){
		const response = JSON.parse(err.requestResult.responseRaw);
		const errors = response.errors;

		if(err.message !== "instance already exists")
			displayErrors(errors, index, "index");

		return err.message;
	}
}

async function updateIndex(index, client){
	try{
		await client.query(
			Update(
				Index(index.name), index
			)
		);
	}catch(err){
		const response = JSON.parse(err.requestResult.responseRaw);
		const errors = response.errors;

		displayErrors(errors, index, "index");
	}
}

module.exports = uploadIndexes;
