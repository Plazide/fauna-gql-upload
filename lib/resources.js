const fs = require("fs");
const path = require("path");
const createOrUpdateResource = require("../util/createOrUpdateResource");
const logResults = require("../util/logResults");

const cwd = process.cwd();

async function uploadResources(resourceDir, type){
	const files = await fs.promises.readdir(resourceDir).catch(err => {
		return null;
	});

	if(!files || (files && files.length === 0)){
		return;
	}

	const resourceFiles = files.map( file => {
		try{
			const resource = require(path.join(cwd, resourceDir, file));

			return resource;
		}catch(err){
			console.error("❌  Error reading file", `${resourceDir}/${file}`);
			console.error(err);

			return null;
		}
	}).filter( value => value !== null);

	await setResources(resourceFiles, type);
}

async function setResources(resources, type){
	try{
		let numCreated = 0,
			numUpdated = 0,
			numFailed = 0;

		for(let resource of resources)
			try{
				const status = await createOrUpdateResource(resource, type);

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
			type,
			numCreated,
			numUpdated,
			numFailed
		})
	}catch(err){
		throw err;
	}
}

module.exports = uploadResources;
