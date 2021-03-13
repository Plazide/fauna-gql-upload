import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import yargs from "yargs";
import prompts from "prompts";
import CLISpinner from "cli-spinner";
import secret from "../util/secret";
import wait from "../util/wait";
import { status } from "../util/logger";

const Spinner = CLISpinner.Spinner;

// Override the prompt if user supplies '-y' or '--yes'
const defaultYes = yargs.argv.yes || yargs.argv.y
prompts.override(defaultYes ? { shouldOverride: true } : {})

async function uploadSchema(schemaPath: string, override = false){
	const schema = path.join(process.cwd(), schemaPath);
	if(!fs.existsSync(schema)){
		status("Cannot find schema at \x1b[4m" + schema + "\x1b[0m", "error");

		return;
	}

	const data = fs.createReadStream(schema);
	const spinner = new Spinner("Overriding schema.. %s");
	let shouldOverride = false;

	if(override){
		const answer = await prompts({
			type: "confirm",
			name: "shouldOverride",
			message: "Be careful! Overriding a schema will delete all collections, indexes, and documents. Do you want to continue?"
		});

		shouldOverride = answer.shouldOverride;
	}

	if(override && !shouldOverride) return;

	if(shouldOverride){
		status("Okay, this could take a while. Sit tight...");
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
	});
	const result = await res.text();

	if(shouldOverride){
		status("Waiting 65 seconds before uploading resources.")
		await wait(65 * 1000);
		spinner.stop(true);
	}

	if(!res.ok){
		status(result, "error");
	}

	if(res.ok)
		status("updated schema", "success");
}

export default uploadSchema;
