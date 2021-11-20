import path from "path";
import fs from "fs";
import { Plugin } from "../types";
import yargs from "yargs";

interface IOptions{
	apiEndpointEnv: string;
	graphqlEndpointEnv: string;
	schemaPath: string;
	region?: "classic" | "eu" | "us" | "preview";
	tsconfigPath?: string;
	mode?: "merge" | "override" | "replace";
	envPath: string;
	secretEnv: string;
	fnsDir: string;
	rolesDir: string;
	indexesDir: string;
	dataDir: string;
	providersDir: string;
	codegen?: {
		typescript: boolean;
		operations: boolean;
		outputFile: string;
		headers: { [key: string]: string };
		documents: string[];
		plugins: Plugin[];
		pluginOptions: { [key: string]: string }
	} | null
}

export const argv = yargs
	.option("override", {
		alias: "o",
		description: "Override the schema, this will delete all your data in the database. This option is deprecated.",
		type: "boolean",
		deprecated: "`override` flag is deprecated and will be removed in a future version of Fauna GQL Upload. Use `--mode override` instead."
	})
	.option("mode", {
		alias: "m",
		description: "The mode to use when uploading GraphQL schema.",
		type: "string",
		choices: ["merge", "override", "replace"]
	})
	.option("yes", {
		alias: "y",
		description: "Answer yes to all potential prompts.",
		type: "boolean"
	})
	.option("config", {
		alias: "c",
		description: "Specify custom path to config file",
		type: "string"
	})
	.option("apiEndpointEnv", {
		description: "Specify environment variable for custom API endpoint",
		type: "string"
	})
	.option("graphqlEndpointEnv", {
		description: "Specify environment variable for custom GraphQL endpoint",
		type: "string"
	})
	.option("region", {
		description: "Specify database region.",
		type: "string"
	})
	.option("schemaPath", {
		description: "Specify custom path for GraphQL schema",
		type: "string"
	})
	.option("tsconfigPath", {
		description: "Specify custom path for tsconfig file",
		type: "string"
	})
	.option("envPath", {
		description: "Specify custom path to environment file",
		type: "string"
	})
	.option("secretEnv", {
		description: "Specify custom environment variable for database secret",
		type: "string"
	})
	.option("fnsDir", {
		description: "Specify custom path to functions directory",
		type: "string"
	})
	.option("rolesDir", {
		description: "Specify custom path to roles directory",
		type: "string"
	})
	.option("indexesDir", {
		description: "Specify custom path to indexes directory",
		type: "string"
	})
	.option("dataDir", {
		description: "Specify custom path to data directory",
		type: "string"
	})
	.option("providersDir", {
		description: "Specify custom path to providers directory",
		type: "string"
	})
	.option("codegen", {
		description: "Whether or not to enable codegen",
		type: "boolean"
	})
	.option("codegenDisableTypescript", {
		description: "Whether or not to enable typescript plugin",
		type: "boolean"
	})
	.option("codegenDisableOperations", {
		description: "Whether or not to enable typescript operations plugin",
		type: "boolean"
	})
	.option("codegenOutputFile", {
		description: "Specify destination file for generated code",
		type: "string"
	})
	.option("codegenHeaders", {
		description: "Optional headers to include when fetching GraphQL schema",
		type: "string"
	})
	.option("codegenDocuments", {
		description: "Specify documents containing GraphQL operations and/or fragments",
		type: "array"
	})
	.option("codegenPlugins", {
		description: "Specify plugins to use with GraphQL Codegen",
		type: "array"
	})
	.option("codegenPluginOptions", {
		description: "Specify options for GraphQL codegen plugins",
		type: "string"
	})
	.argv;

const cwd = process.cwd();
const defaultSchema = fs.existsSync("./fauna/schema.gql") ? "./fauna/schema.gql" : "./fauna/schema.graphql"
const defaultRolesDir = path.join("fauna", "roles");
const defaultFnsDir = path.join("fauna", "functions");
const defaultIndexesDir = path.join("fauna", "indexes");
const defaultDataDir = path.join("fauna", "data");
const defaultProvidersDir = path.join("fauna", "providers");
const defaultSecretEnv = "FGU_SECRET";
const defaultApiEndpointEnv = "FGU_API_ENDPOINT";
const defaultGraphqlEndpointEnv = "FGU_GRAPHQL_ENDPOINT"

let globalConfig: IOptions | null = null;

export default function getConfig(){
	if(globalConfig) return globalConfig;

	const customConfig = argv?.config;
	const configPath = path.join(cwd, (customConfig || ".fauna.json"));

	if(customConfig && !fs.existsSync(configPath)){
		throw new Error("Could not find custom config at path " + configPath)
	}

	const providedConfig = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
	const codegenTypescript = providedConfig.codegen?.typescript ?? true;

	const config: IOptions = {
		apiEndpointEnv: argv?.apiEndpointEnv || providedConfig.apiEndpointEnv || defaultApiEndpointEnv,
		graphqlEndpointEnv: argv?.graphqlEndpointEnv || providedConfig.graphqlEndpointEnv || defaultGraphqlEndpointEnv,
		region: argv?.region || providedConfig?.region || undefined,
		mode: argv?.mode || providedConfig.mode || "merge",
		schemaPath: argv?.schemaPath || providedConfig.schemaPath || defaultSchema,
		tsconfigPath: argv?.tsconfigPath || providedConfig.tsconfigPath,
		envPath: argv?.envPath || providedConfig.envPath || ".env",
		secretEnv: argv?.secretEnv || providedConfig.secretEnv || defaultSecretEnv,
		fnsDir: argv?.fnsDir || providedConfig.fnsDir || defaultFnsDir,
		rolesDir: argv?.rolesDir || providedConfig.rolesDir || defaultRolesDir,
		indexesDir: argv?.indexesDir || providedConfig.indexesDir || defaultIndexesDir,
		dataDir: argv?.dataDir || providedConfig.dataDir || defaultDataDir,
		providersDir: argv?.providersDir || providedConfig.providersDir || defaultProvidersDir,
		codegen: (argv?.codegen ?? providedConfig.codegen) ? {
			typescript: !argv?.codegenDisableTypescript ?? codegenTypescript,
			operations: !argv?.codegenDisableOperations ?? providedConfig?.codegen?.operations ?? true,
			outputFile: argv?.codegenOutputFile || providedConfig?.codegen?.outputFile || (codegenTypescript ? "generated/graphql.ts" : "generated/graphql.js"),
			headers: (argv?.codegenHeaders ? JSON.parse(argv.codegenHeaders) : null) || providedConfig?.codegen?.headers || {},
			documents: argv?.codegenDocuments || providedConfig?.codegen?.documents || [],
			plugins: argv?.codegenPlugins || providedConfig?.codegen?.plugins || [],
			pluginOptions: (argv?.codegenPluginOptions ? JSON.parse(argv.codegenPluginOptions) : null) || providedConfig?.codegen?.pluginOptions || {}
		} : null
	}

	globalConfig = config;
	return config;
}
