import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import yargs from "yargs";
import prompts from "prompts";
import CLISpinner from "cli-spinner";
import wait from "../util/wait";
import { status } from "../util/logger";
import { secret } from "../util/env";
import getEndpoint from "../util/getEndpoint";

const Spinner = CLISpinner.Spinner;

// Override the prompt if user supplies '-y' or '--yes'
const defaultYes = yargs.argv.yes || yargs.argv.y
prompts.override(defaultYes ? { shouldOverride: true } : {})

interface SchemaOptions{
	mode?: "merge" | "override" | "replace";
	override?: boolean;
	schemaPath?: string;
	schemaDir?: string;
}

async function buildSchema(dir: string): Promise<string | null>{
	const directory = path.join(process.cwd(), dir);
	const files = await fs.promises.readdir(directory);
	const schemaFiles = files.filter(file => 
		file.endsWith(".graphql") || file.endsWith(".gql")
	);

	if(schemaFiles.length === 0){
		status("No GraphQL schema files found in directory. Make sure that all files in the specified directory ends in one of the following extensions: `.gql` or `.graphql`", "error");
		return null;
	}

	const schemaParts = await Promise.all(schemaFiles.map(async file => {
		return fs.promises.readFile(path.join(directory, file), "utf8");
	}));

	const concatenatedSchema = schemaParts.join("\n");

	return concatenatedSchema;
}

async function uploadSchema(options: SchemaOptions){
	const { graphql: graphqlEndpoint } = await getEndpoint();
	

	const schemaDir = options.schemaDir;
	const schemaPath = options.schemaPath;
	

	const schema = schemaDir && schemaPath 
		? await buildSchema(schemaDir) 
		: (schemaPath ? path.join(process.cwd(), schemaPath) : null);


	if(!schema){
		status("Cannot read schema. Make sure you've specified a schemaDir or schemaPath", "error");
		return;
	}

	if(!schemaDir){
		if(schema) {
			if(!fs.existsSync(schema)){
				status("Cannot find schema at \x1b[4m" + schema + "\x1b[0m", "error");
				return;
			}
		}
	}
	

	if(options.override){
		status("The `override` option has been deprecated. Please use `--mode override` instead.", "error");
	}

	console.log(schema)
	const data = schemaDir ? schema : fs.createReadStream(schema);
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
		return false;
	}

	if(res.ok){
		status("updated schema", "success");
		return true;
	}
}

export default uploadSchema;
