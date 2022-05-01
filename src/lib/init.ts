import fs from "fs";
import path from "path";
import getConfig, { 
	argv, 
	IOptions, 
	defaultSecretEnv, 
	defaultApiEndpointEnv, 
	defaultGraphqlEndpointEnv 
} from "../util/getConfig";
import { status } from "../util/logger";
import prompts from "prompts";
import { exec } from "child_process";
import dotenv from "dotenv";
import error from "../util/error";
import { ResourceType } from "../types";

type ConfigOptions = Partial<IOptions> & { "$schema": string };
type SetupQuestions = "command" | "secret" | "resources" | "development" | "region";
type Resource = ResourceType | "schema";
type Resources = Resource[];

interface Setup {
	command: string,
	secret?: string,
	resources: boolean,
	development: boolean,
	region: "classic" | "eu" | "us" | "preview" | "auto"
}

const templatesDir = path.join(__dirname, "..", "..", "templates");
const defaultCommand = "fauna";
const fguPkgName = "fauna-gql-upload";
const faunaPkgName = "faunadb";

const setupQuestions: prompts.PromptObject<SetupQuestions>[] = [
	{
		type: "text",
		name: "secret",
		message: "Secret admin key for your database (this will be added to your .env file):",
		validate: value => !!value || "Secret is required to upload resources, enter a valid admin secret key."
	},
	{
		type: "confirm",
		name: "development",
		message: "Do you want FGU to connect to a local development instance of FaunaDB?",
		initial: false
	},
	{
		type: "select",
		name: "region",
		message: "Select the region for your production database:",
		choices: [
			{ title: "classic", value: "classic" },
			{ title: "us", value: "us" },
			{ title: "eu", value: "eu" },
			{ title: "preview", value: "preview" },
			{ title: "auto", value: "auto", selected: true, description: "Use whatever region works with your secret key" }
		],
	},
	{
		type: "text",
		name: "command",
		message: "Name of npm script to upload resources:",
		initial: defaultCommand
	},
	{
		type: "confirm",
		name: "resources",
		message: "Would you like to create placeholder resources?",
		initial: true
	}
]

let configOptions: ConfigOptions = {
	"$schema": "node_modules/fauna-gql-upload/config.schema.json"
};

const resourceDirs = new Map<Resource, string>([
	["schema", argv.schemaDir || "schema"],
	["data", argv.dataDir || "data"],
	["functions", argv.fnsDir || "functions"],
	["indexes", argv.indexesDir || "indexes"],
	["providers", argv.providersDir || "providers"],
	["roles", argv.rolesDir || "roles"]
])

/** Setup FGU files and folders based on configuration questions. */
export default async function init(){
	const yes = argv.yes;
	
	const customConfig = argv.config;
	const configPath = customConfig || path.join(process.cwd(), ".fauna.json");
	const configFileExists = fs.existsSync(configPath);
	let resources: Resources = ["functions", "indexes", "schema"];
	let concatSchema = false;
	let setup: Setup = {
		command: defaultCommand,
		secret: undefined,
		resources: true,
		development: false,
		region: "auto"
	}

	if(configFileExists){
		error("The current directory already contains a `.fauna.json` file. Cannot run init in an already initialized directory.");
	}

	status("Initializing FGU in the current directory...", "info");

	if(!yes){
		setup = await prompts(setupQuestions);

		if(setup.resources){
			const resourcesAnswers = await prompts({
				type: "multiselect",
				name: "resources",
				message: "Select resources to create:",
				choices: [
					{ title: "Schema", value: "schema", selected: true },
					{ title: "Functions", value: "functions", selected: true },
					{ title: "Roles", value: "roles", selected: false },
					{ title: "Providers", value: "providers", selected: false },
					{ title: "Indexes", value: "indexes", selected: true },
					{ title: "Data", value: "data", selected: false }
				]
			});

			resources = resourcesAnswers.resources;

			// If user wants to create schema, ask if they want to enable schema concatenation
			if(resourcesAnswers.resources.includes("schema")) {
				concatSchema = (await prompts({
					name: "concatSchema",
					type: "confirm",
					message: "Would you like to enable schema concatenation?",
					initial: false
				})).concatSchema;
			}

			// If concatenation is enabled, add schemaDir to config.
			if(concatSchema) configOptions.schemaDir = path.join("fauna", "schema");
		} else {
			// User does not want to create resources, so set resources to empty array.
			resources = [];
		}
	}

	if(yes){
		// read env file taking into account the flag for env file name
		const envFile = argv.envPath || ".env";
		try{
			const envFilePath = path.join(process.cwd(), envFile);
			const envJson = dotenv.parse(fs.readFileSync(envFilePath));
			setup.secret = envJson[argv.secretEnv || defaultSecretEnv];
		}catch{
			error(`No ${envFile} file found in the current directory. Please create one and add the admin key to it.`);
		}
		
	}

	if(!setup.secret){
		error("Secret key was not provided, cannot finish initialization.");
	}

	if(setup.region !== "auto"){
		configOptions.region = setup.region;
	}
	
	await createPackage(setup.command, customConfig);
	await updateEnvFile(setup);
	await createResources(resources, concatSchema);
	await createConfigFile(configPath, configOptions);

	status(`Fauna GQL Upload has been initialized. To upload resources, run: \`npm run ${setup.command}\``, "success");
}

function addCustomOptions(configOptions: ConfigOptions){
	const acceptedOptions = Object.keys(getConfig()).filter(opt => opt !== "codegen");

	Object.keys(acceptedOptions).forEach((key) => {
		if(argv[key]){
			//@ts-ignore
			configOptions[key] = argv[key];
		}
	});
}

/** Create a config file using the provided options. */
async function createConfigFile(path: string, config: ConfigOptions){
	status(`Creating config file at ${path}...`, "info");

	const configData = JSON.stringify(config, null, 2);
	await fs.promises.writeFile(path, configData);
}

async function createPackage(script: string, customConfig?: string){
	// Get package.json path
	const packagePath = path.join(process.cwd(), "package.json");
	const packageExists = fs.existsSync(packagePath);

	// Run `npm init` if package.json doesn't exist.
	if(!packageExists) {
		status("Initializing package.json...", "info");

		await new Promise( (resolve) => 
			exec(`npm init -y`, (error) => {
				if(error) throw error;
				resolve(undefined);
			})
		);

		// Install fauna-gql-upload and faunadb
		await installPackages([
			{
				packageName: faunaPkgName, 
				dev: false
			},
			{
				packageName: fguPkgName, 
				dev: true
			}
		]);
	}

	// Read package.json
	let packageFile = await fs.promises.readFile(packagePath, "utf8");
	let packageJson = JSON.parse(packageFile);

	// Check if fauna-gql-upload is already installed
	const fguInstalled = !!packageJson.devDependencies[fguPkgName];
	const fdbInstalled = !!packageJson.dependencies[faunaPkgName];

	if(!fguInstalled || !fdbInstalled){
		const packagesToInstall = [];
		if(!fdbInstalled) packagesToInstall.push({
			packageName: faunaPkgName,
			dev: false
		});
		if(!fguInstalled) packagesToInstall.push({
			packageName: fguPkgName,
			dev: true
		});
		await installPackages(packagesToInstall);

		// Read package.json again
		packageFile = await fs.promises.readFile(packagePath, "utf8");
		packageJson = JSON.parse(packageFile);
	}

	// Add upload script to package.json
	packageJson.scripts[script] = `fgu upload ${customConfig ? `--config ${customConfig}` : ""}`;

	// Write package.json
	await fs.promises.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
}

async function installPackages(packages: { packageName: string, dev: boolean }[]){
	if(packages.length === 0) return;

	status("Installing dependencies...", "info");

	const useYarn = await new Promise((resolve) => {
		exec("yarn --version", (err) => {
			if(err) resolve(false);
			else resolve(true);
		});
	});

	const installCommand = useYarn ? "yarn add" : "npm install";

	// Install packages one by one
	for (const { packageName, dev } of packages){
		await new Promise((resolve) => {
			status(`Installing ${packageName}...`, "info");
			exec(`${installCommand} ${dev ? "-D " : ""}${packageName}`, (error) => {
				if(error) {
					status(`Failed to install ${packageName}`, "error");
				}
				resolve(undefined);
			});
		});
	}
}

async function updateEnvFile(options: Setup){
	status("Creating/updating environment file...", "info");

	// read environment file using dotenv
	const envPath = argv.envPath || ".env";
	const envFilePath = path.join(process.cwd(), envPath);
	const envFileExists = fs.existsSync(envFilePath);
	const env = envFileExists ? await fs.promises.readFile(envFilePath, "utf8") : "";
	const envJson = envFileExists ? dotenv.parse(env) : {};

	// new values to env file
	const secretEnv = argv.secretEnv || defaultSecretEnv;
	let newEnv = env;

	if(!envJson?.[secretEnv]) newEnv = env + `\n${secretEnv}=${options.secret}`;

	if(options.development) {
		const apiEndpointEnv = argv.apiEndpointEnv || defaultApiEndpointEnv;
		const graphqlEndpointEnv = argv.graphqlEndpointEnv || defaultGraphqlEndpointEnv;

		if(!envJson?.[apiEndpointEnv]) newEnv += `\n${apiEndpointEnv}=http://localhost:8443`;
		if(!envJson?.[graphqlEndpointEnv]) newEnv += `\n${graphqlEndpointEnv}=http://localhost:8084`;
	}

	// write environment file
	await fs.promises.writeFile(envFilePath, newEnv);
}

/** Create the resource directories  */
async function createResources(resources: Resources, concatSchema = false){
	// If no resources are selected, exit without doing anything.
	if(resources.length === 0) return;

	status("Creating placeholder resources...", "info");

	// Determine directory of fauna resources and create it if it doesn't exist.
	const faunaDir = path.join(process.cwd(), "fauna");
	if(!fs.existsSync(faunaDir)) await fs.promises.mkdir(faunaDir);

	// Determine which directories to create. 
	// Only include schema directory when concatSchema is enabled.
	const activeResources = resources
		.filter(resource => !concatSchema ? resource !== "schema" : true)

	// Create resources.
	await Promise.all(activeResources.map( async resource => {
		// Determine template and destination paths
		const destDir = path.join(faunaDir, resourceDirs.get(resource) || resource);
		const resourceDir = path.join(templatesDir, resource);

		// Create directory if it doesn't exist
		const dirExists = fs.existsSync(destDir);
		if(!dirExists) await fs.promises.mkdir(destDir, { recursive: true });

		// Copy template files to resource directory
		const resourcesFiles = await fs.promises.readdir(resourceDir);
		await Promise.all(resourcesFiles.map(async file => {
			const resourceTemplatePath = path.join(resourceDir, file);
			return fs.promises.copyFile(resourceTemplatePath, path.join(destDir, file));
		}))
	}))

	// Create schema file
	if(!concatSchema && resources.includes("schema")){
		createSchema();
	}
}

/** Create a schema file */
async function createSchema(){
	// Create schema file
	const schema = path.join(process.cwd(), "fauna", "schema.gql");
	const schemaTemplate = path.join(templatesDir, "schema.gql");
	await fs.promises.copyFile(schemaTemplate, schema);
}