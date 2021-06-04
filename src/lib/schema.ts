import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import yargs from "yargs";
import prompts from "prompts";
import CLISpinner from "cli-spinner";
import wait from "../util/wait";
import { status } from "../util/logger";
import { secret, graphqlEndpoint } from "../util/env";

const Spinner = CLISpinner.Spinner;

// Override the prompt if user supplies '-y' or '--yes'
const defaultYes = yargs.argv.yes || yargs.argv.y
prompts.override(defaultYes ? { shouldOverride: true } : {})

interface SchemaOptions{
	mode?: "merge" | "override" | "replace";
	override?: boolean;
}

async function uploadSchema(schemaPath: string, options: SchemaOptions){
	const schema = path.join(process.cwd(), schemaPath);
	if(!fs.existsSync(schema)){
		status("Cannot find schema at \x1b[4m" + schema + "\x1b[0m", "error");
		return;
	}

	if(options.override){
		status("The `override` option has been deprecated. Please use `--mode override` instead.", "error");
	}

	const data = fs.createReadStream(schema);
	const spinner = new Spinner("Overriding schema.. %s");
	let shouldOverride = false;

	if(options.override || options.mode === "override"){
		const answer = await prompts({
			type: "confirm",
			name: "shouldOverride",
			message: "Be careful! Overriding a schema will delete all collections, indexes, and documents. Do you want to continue?"
		});

		shouldOverride = answer.shouldOverride;
	}

	if((options.override || options.mode === "override") && !shouldOverride) return;

	if(shouldOverride){
		status("Okay, this could take a while. Sit tight...");
		spinner.start();
	}

	const mode = shouldOverride ? "override" : (options.mode || "merge");
	const endpoint = `${graphqlEndpoint}/import?mode=${mode}`;
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
