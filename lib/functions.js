const fs = require("fs");
const path = require("path");
const createOrUpdateFunction = require("../util/createOrUpdateFunction");
const logResults = require("../util/logResults");

const cwd = process.cwd();

async function uploadFunctions(fnsDir){
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

		await setFunctions(fns);
	});
}

async function setFunctions(fns){
	try{
		let numCreated = 0,
			numUpdated = 0,
			numFailed = 0;

		for(let fn of fns)
			try{
				const status = await createOrUpdateFunction(fn);

				if(status === "created"){
					numCreated++;
					continue;
				}

				if(status === "updated"){
					numUpdated++;
					continue;
				}

				if(status !== "updated" && status !== "created"){
					numFailed++;
					continue;
				}
			}catch(err){
				throw err;
			}

		logResults({
			type: "functions",
			numCreated,
			numUpdated,
			numFailed
		})
	}catch(err){
		throw err;
	}
}

module.exports = uploadFunctions;
