const faunadb = require("faunadb");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const cwd = process.cwd();
const displayErrors = require("../util/displayErrors");

const{ CreateRole, Update, Role } = faunadb.query;

async function uploadRoles(rolesDir, secret){
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

		const client = new faunadb.Client({
			secret,
			fetch
		});

		await setRoles(roles, client);
	});
}

async function setRoles(roles, client){
	try{
		let numCreated = 0,
			numUpdated = 0,
			numFailed = 0;

		for(let role of roles)
			try{
				const status = await createRole(role, client);

				if(status === "instance already exists"){
					await updateRole(role, client).catch( err => console.error(err));
					numUpdated++;
					continue;
				}

				if(status === true){
					numCreated++;
					continue;
				}

				if(status !== true){
					numFailed++;
					console.log(status);
					continue;
				}
			}catch(err){
				throw err;
			}

		console.group("✔️  Finished uploading roles.");
		console.log("Created", numCreated, "roles");
		console.log("Updated", numUpdated, "roles");
		if(numFailed > 0)
			console.warn("Failed with", numFailed, "roles");
		console.log();
		console.groupEnd();
	}catch(err){
		throw err;
	}
}

async function createRole(role, client){
	try{
		await client.query(
			CreateRole(role)
		);

		return true;
	}catch(err){
		const response = JSON.parse(err.requestResult.responseRaw);
		const errors = response.errors;

		if(err.message !== "instance already exists")
			displayErrors(errors, role, "role");

		return err.message;
	}
}

async function updateRole(role, client){
	try{
		await client.query(
			Update(Role(role.name), role)
		);
	}catch(err){
		const response = JSON.parse(err.requestResult.responseRaw);
		const errors = response.errors;

		displayErrors(errors, role, "role");
	}
}

module.exports = uploadRoles;
