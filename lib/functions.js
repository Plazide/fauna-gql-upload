const faunadb = require("faunadb");
const fetch = require("node-fetch");

// Alias Function as Func because Function is reserved.
const{ CreateFunction, Update, Function: Func } = faunadb.query;

async function uploadFunctions(fns, secret){
	const client = new faunadb.Client({
		secret,
		fetch
	});

	setFunctions(fns, client);
}

async function setFunctions(fns, client){
	try{
		for(let fn of fns){
			console.log("Trying to create function", fn.name);

			try{
				const status = await createFunction(fn, client);

				if(status === "instance already exists")
					await updateFunction(fn, client).catch(err => console.error(err));

				if(status === true)
					console.log("Created function", fn.name);
			}catch(err){
				throw err;
			}

			console.log();
		}

		console.log("✔️  Finished uploading functions.");
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
		// console.error("Error:", err.message);

		return err.message;
	}
}

async function updateFunction(fn, client){
	try{
		console.log("Trying to update function", fn.name);

		await client.query(
			Update(
				Func(fn.name), {
					"role": fn.role,
					"body": fn.body
				}
			)
		).catch(err => {
			console.error(err);

			console.error("Error:", err.message);
		});
	}catch(err){
		throw err;
	}
}

module.exports = uploadFunctions;
