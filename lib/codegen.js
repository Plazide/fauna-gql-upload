const fs = require("fs");
const path = require("path");
const camelize = require("../util/camelize");
const { codegen } = require("@graphql-codegen/core");
const { UrlLoader } = require("@graphql-tools/url-loader")
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { CodeFileLoader } = require("@graphql-tools/code-file-loader");
const { loadSchema, loadDocuments } = require("@graphql-tools/load");
const typescriptPlugin = require("@graphql-codegen/typescript")
const typescriptOperationsPlugin = require("@graphql-codegen/typescript-operations");
const { printSchema, parse } = require("graphql");
const getConfig = require("../util/getConfig");
const secret = require("../util/secret");

const cwd = process.cwd();
const config = getConfig();

async function runCodegen(){
	try{
		const schema = await fetchSchema();
		const documents = await fetchDocuments();
		const {plugins, pluginMap} = getPlugins();

		const output = await codegen({
			filename: config.codegen.outputFile,
			schema: parse(printSchema(schema)),
			plugins,
			pluginMap,
			documents
		})
		const outputExists = fs.existsSync(config.codegen.outputFile);

		if(!output){
			console.log("🛈  Generated GraphQL output is empty.")
		}

		if(!outputExists){
			await fs.promises.mkdir(config.codegen.outputFile.split("/").slice(0, -1).join("/"), { recursive: true })
		}

		
		await fs.promises.writeFile(path.join(cwd, config.codegen.outputFile), output);
		console.log("✔️  Generated GraphQL types, queries and mutations.");
	}catch(err){
		console.error(err);
	}
}

function getPlugins(){
	const pluginOptions = config.codegen.pluginOptions;
	const customPlugins = config.codegen.plugins;
	const pluginMap = {};
	let plugins = [];
	
	if(!config.codegen.disableTypescript) {
		plugins.push({ typescript: pluginOptions })
		pluginMap.typescript = typescriptPlugin;
	}
	if(config.codegen.operations) {
		plugins.push({ typescriptOperations: pluginOptions })
		pluginMap.typescriptOperations = typescriptOperationsPlugin;
	}
	customPlugins.forEach( plugin => {
		const name = plugin.split("/").slice(-1).join("");
		const camelCased = camelize(name);
		const pluginPath = getPluginPath(plugin);

		plugins.push({ [camelCased]: pluginOptions });
		pluginMap[camelCased] = require(pluginPath);
	})

	return {plugins, pluginMap};
}

/** Check whether the plugin is official, ie. exists within the "@graphql-codegen" node_modules directory.
	If it is, we return the plugin path with "@graphql-codegen" prepended.
	If it is not, we return the provided plugin path unaltered.
 */
function getPluginPath(plugin){
	const officialPath = path.resolve(cwd, "node_modules", "@graphql-codegen", plugin);
	const isOfficialPlugin = fs.existsSync(officialPath)

	return isOfficialPlugin
		? officialPath
		: path.resolve(cwd, "node_modules", plugin);
}

async function fetchSchema(){
	const schema = await loadSchema("https://graphql.fauna.com/graphql", {
		loaders: [
			new UrlLoader()
		],
		headers: {
			Authorization: `Bearer ${secret}`,
			...config.codegen.headers
		}
	});

	return schema;
}

async function fetchDocuments(){
	const docs = config.codegen.documents;
	return loadDocuments(docs, { 
		cwd ,
		loaders: [
			new GraphQLFileLoader(),
			new CodeFileLoader()
		]
	});
}

module.exports = runCodegen;
