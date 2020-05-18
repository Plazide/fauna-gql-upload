const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const prompts = require("prompts");
const Spinner = require("cli-spinner").Spinner;
const wait = require("../util/wait");

async function uploadSchema(schemaPath, secret, override = false){
	const schema = path.join(process.cwd(), schemaPath);
	const data = fs.createReadStream(schema);
	const spinner = new Spinner("Overriding schema.. %s");

	const{ shouldOverride } = override ? await prompts({
		type: "confirm",
		name: "shouldOverride",
		message: "Be careful! Overriding a schema will delete all collections, indexes, and documents. Do you want to continue?"
	}) : false;

	if(override && !shouldOverride) return;

	if(shouldOverride){
		console.log();
		console.log("Okay, this could take a while. Sit tight...");
		spinner.start();
	}

	const endpoint = `https://graphql.fauna.com/import${shouldOverride ? "?mode=override" : "?mode=merge"}`;
	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${secret}`,
			"Content-Type": "text/plain"
		},
		body: data
	}).catch(console.error);
	const result = await res.text();

	if(shouldOverride){
		await wait(61 * 1000);
		spinner.stop(true);
	}

	if(!res.ok){
		console.error("Error:", result);
		console.log();
	}

	if(res.ok){
		console.log(result);
		console.log("✔️  Successfully updated schema.");
	}
}

module.exports = uploadSchema;
