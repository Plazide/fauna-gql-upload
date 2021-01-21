import path from "path";
import fs from "fs";

interface IOptions{
	schemaPath: string,
	tsconfigPath?: string;
	envPath: string,
	secretEnv: string,
	fnsDir: string,
	rolesDir: string,
	indexesDir: string,
	dataDir: string,
	codegen: {
		disableTypescript: boolean,
		operations: boolean,
		outputFile: string,
		headers: { [key: string]: string },
		documents: string[],
		plugins: string[],
		pluginOptions: { [key: string]: string }
	} | null
}

const cwd = process.cwd();
const defaultRolesDir = path.join("fauna", "roles");
const defaultFnsDir = path.join("fauna", "functions");
const defaultIndexesDir = path.join("fauna", "indexes");
const defaultDataDir = path.join("fauna", "data");
const defaultSecretEnv = "FAUNADB_SECRET";

let globalConfig: IOptions | null = null;

export default function getConfig(){
	if(globalConfig) return globalConfig;

	const configPath = path.join(cwd, ".fauna.json");
	const providedConfig = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
	const codegenDisableTypescript = (providedConfig.codegen && providedConfig.codegen.disableTypescript) || false;

	const defaultCodegen = {
		disableTypescript: codegenDisableTypescript,
		operations: providedConfig.operations || true,
		outputFile: providedConfig.codegen.outputFile || (codegenDisableTypescript ? "generated/graphql.js" : "generated/graphql.ts"),
		headers: providedConfig.codegen.headers || {},
		documents: providedConfig.codegen.documents || [],
		plugins: providedConfig.codegen.plugins || [],
		pluginOptions: providedConfig.pluginOptions || {}
	}

	const config: IOptions = {
		schemaPath: providedConfig.schemaPath || "./fauna/schema.gql",
		tsconfigPath: providedConfig.tsconfigPath,
		envPath: providedConfig.envPath || ".env",
		secretEnv: providedConfig.secretEnv || defaultSecretEnv,
		fnsDir: providedConfig.fnsDir || defaultFnsDir,
		rolesDir: providedConfig.rolesDir || defaultRolesDir,
		indexesDir: providedConfig.indexesDir || defaultIndexesDir,
		dataDir: providedConfig.dataDir || defaultDataDir,
		codegen: providedConfig.codegen ? {
			disableTypescript: codegenDisableTypescript,
			operations: providedConfig.operations || true,
			outputFile: providedConfig.codegen.outputFile || (codegenDisableTypescript ? "generated/graphql.js" : "generated/graphql.ts"),
			headers: providedConfig.codegen.headers || {},
			documents: providedConfig.codegen.documents || [],
			plugins: providedConfig.codegen.plugins || [],
			pluginOptions: providedConfig.pluginOptions || {}
		} : null
	}

	globalConfig = config;
	return config;
}
