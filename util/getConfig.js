const path = require("path");
const fs = require("fs");
const cwd = process.cwd();

const defaultRolesDir = path.join("fauna", "roles");
const defaultFnsDir = path.join("fauna", "functions");
const defaultIndexesDir = path.join("fauna", "indexes");
const defaultDataDir = path.join("fauna", "data");
const defaultSecretEnv = "FAUNADB_SECRET";

let globalConfig = null;

function getConfig(){
	if(globalConfig) return globalConfig;

	const configPath = path.join(cwd, ".fauna.json");
	const providedConfig = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
	const codegenDisableTypescript = (providedConfig.codegen && providedConfig.codegen.disableTypescript) || false;

	const config = {
		schemaPath: providedConfig.schemaPath || "./fauna/schema.gql",
		envPath: providedConfig.envPath || ".env",
		secretEnv: providedConfig.secretEnv || defaultSecretEnv,
		fnsDir: providedConfig.fnsDir || defaultFnsDir,
		rolesDir: providedConfig.rolesDir || defaultRolesDir,
		indexesDir: providedConfig.indexesDir || defaultIndexesDir,
		dataDir: providedConfig.dataDir || defaultDataDir,
		codegen: providedConfig.codegen ? {
			disableTypescript: codegenDisableTypescript,
			outputFile: providedConfig.codegen.outputFile || (codegenDisableTypescript ? "generated/graphql.ts" : "generated/graphql.js"),
			headers: providedConfig.codegen.headers || {},
			documents: providedConfig.codegen.documents || [],
			plugins: providedConfig.codegen.plugins || []
		} : false
	}

	globalConfig = config;
	return config;
}

module.exports = getConfig;
