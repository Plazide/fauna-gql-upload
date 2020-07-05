const fs = require("fs");
const path = require("path");
const createOrUpdateIndex = require("../util/createOrUpdateIndex");
const logResults = require("../util/logResults");

const cwd = process.cwd();

async function uploadIndexes(dir){
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

		await setIndexes(indexes);
	});
}

async function setIndexes(indexes){
	try{
		let numCreated = 0,
			numUpdated = 0,
			numFailed = 0;

		for(let index of indexes)
			try{
				const status = await createOrUpdateIndex(index);

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
			type: "indexes",
			numCreated,
			numUpdated,
			numFailed
		})
	}catch(err){
		throw err;
	}
}

module.exports = uploadIndexes;
