import fs from "fs";
import path from "path";
import camelize from "../util/camelize";
import { codegen } from "@graphql-codegen/core";
import { Types, CodegenPlugin } from "@graphql-codegen/plugin-helpers"
import { UrlLoader } from "@graphql-tools/url-loader"
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { CodeFileLoader } from "@graphql-tools/code-file-loader";
import { loadSchema, loadDocuments } from "@graphql-tools/load";
/* import typescriptPlugin from "@graphql-codegen/typescript"
import typescriptOperationsPlugin from "@graphql-codegen/typescript-operations"; */
import { printSchema, parse } from "graphql";
import getConfig from "../util/getConfig";
import secret from "../util/secret";

const cwd = process.cwd();
const config = getConfig();

export default async function runCodegen(){
	if(!config.codegen) return;

	try{
		const schema = await fetchSchema();
		const documents = await fetchDocuments();
		const { plugins, pluginMap } = await getPlugins();

		const output = await codegen({
			filename: config.codegen?.outputFile,
			schema: parse(printSchema(schema)),
			config: config.codegen.pluginOptions,
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

async function getPlugins(){
	if(!config.codegen) throw new Error("Codegen is not enabled");

	const pluginOptions = config.codegen.pluginOptions;
	const customPlugins = config.codegen.plugins || [];
	const pluginMap: { [key: string]: CodegenPlugin } = {};
	let plugins: Types.ConfiguredPlugin[] = [];
	
	if(!config.codegen.disableTypescript) {
		plugins.push({ typescript: pluginOptions })
		pluginMap.typescript = await import("@graphql-codegen/typescript");
	}

	if(config.codegen.operations) {
		plugins.push({ typescriptOperations: pluginOptions })
		pluginMap.typescriptOperations = await import("@graphql-codegen/typescript-operations");
	}

	if(customPlugins.length > 0)
		await Promise.all(customPlugins.map( async plugin => {
			const name = plugin.split("/").slice(-1).join("");
			const camelCased = camelize(name);
			const pluginPath = await getPluginPath(plugin);

			console.log(pluginPath);

			plugins.push({ [camelCased]: pluginOptions });
			pluginMap[camelCased] = await import(pluginPath);
		}))

	console.log(pluginMap)

	return {plugins, pluginMap};
}

/** Check whether the plugin is official, ie. exists within the "@graphql-codegen" node_modules directory.
	If it is, we return the plugin path with "@graphql-codegen" prepended.
	If it is not, we return the provided plugin path unaltered.
 */
async function getPluginPath(plugin: string){
	/* const officialPath = path.resolve(cwd, "node_modules", "@graphql-codegen", plugin);
	const isOfficialPlugin = await import(officialPath).then( () => true).catch( () => false);

	return isOfficialPlugin
		? officialPath
		: path.resolve(cwd, "node_modules", plugin); */

	const nodeModules = path.resolve(cwd, "node_modules");

	try{
		const pluginPath = path.join(nodeModules, "@graphql-codegen", plugin);
		console.log(pluginPath);
		require(pluginPath)
		return pluginPath;
	}catch(err){
		console.error(err);
		return plugin;
	}
}

async function fetchSchema(){
	const schema = await loadSchema("https://graphql.fauna.com/graphql", {
		loaders: [
			new UrlLoader()
		],
		headers: {
			Authorization: `Bearer ${secret}`,
			...(config.codegen?.headers || {})
		}
	});

	return schema;
}

async function fetchDocuments(){
	if(!config.codegen) throw new Error("Codegen is not enabled.")
	const docs = config.codegen.documents;
	return loadDocuments(docs, { 
		cwd ,
		loaders: [
			new GraphQLFileLoader(),
			new CodeFileLoader()
		]
	});
}
