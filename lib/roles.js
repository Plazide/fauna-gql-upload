const fs = require("fs");
const path = require("path");
const cwd = process.cwd();
const createOrUpdateRole = require("../util/createOrUpdateRole");
const logResults = require("../util/logResults");

async function uploadRoles(rolesDir){
	fs.readdir(rolesDir, async (err, rolesFiles) => {
		if(err){
			console.log("Could not read roles directory...");
			console.log("❌  Ignoring roles");

			return;
		}

		const roles = rolesFiles.map( file => {
			try{
				const role = require(path.join(cwd, rolesDir, file));

				return role;
			}catch(err){
				console.error("❌  Could not read", file);

				return null;
			}
		}).filter( value => value !== null);

		await setRoles(roles);
	});
}

async function setRoles(roles){
	try{
		let numCreated = 0,
			numUpdated = 0,
			numFailed = 0;

		for(let role of roles)
			try{
				const status = await createOrUpdateRole(role);

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
			type: "roles",
			numCreated,
			numUpdated,
			numFailed
		})
	}catch(err){
		throw err;
	}
}

module.exports = uploadRoles;
