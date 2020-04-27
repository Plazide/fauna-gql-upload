const faunadb = require("faunadb");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const cwd = process.cwd();

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
		for(let role of roles){
			console.log("Trying to create role", role.name);

			try{
				const status = await createRole(role, client);

				if(status === "instance already exists")
					await updateRole(role, client).catch( err => console.error(err));

				if(status === true)
					console.log("Created role", role.name);
			}catch(err){
				throw err;
			}

			console.log();
		}

		console.log("✔️  Finished uploading roles.");
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
		return err.message;
	}
}

async function updateRole(role, client){
	try{
		console.log("Trying to update role", role.name);

		await client.query(
			Update(Role(role.name), role)
		).catch(err => {
			console.error(err);

			console.error("Error:", err.message);
		});
	}catch(err){
		throw err;
	}
}

module.exports = uploadRoles;
