const fs = require("fs");
const path = require("path");
const { codegen } = require("@graphql-codegen/core");
const { UrlLoader } = require("@graphql-tools/url-loader")
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { CodeFileLoader } = require("@graphql-tools/code-file-loader");
const { loadSchema, loadDocuments } = require("@graphql-tools/load");
const typescriptPlugin = require("@graphql-codegen/typescript")
const typescriptOperationsPlugin = require("@graphql-codegen/typescript-operations");
const namedOperationsObjectPlugin = require("@graphql-codegen/named-operations-object");
const typescriptGraphQLRequestPlugin = require("@graphql-codegen/typescript-graphql-request");
const { printSchema, parse } = require("graphql");
const getConfig = require("../util/getConfig");
const secret = require("../util/secret");

const cwd = process.cwd();
const config = getConfig();

async function runCodegen(){
	try{
		const schema = await fetchSchema();
		const documents = await fetchDocuments();
		const plugins = getPlugins();

		const output = await codegen({
			filename: config.codegen.outputFile,
			schema: parse(printSchema(schema)),
			plugins,
			pluginMap: {
				typescript: typescriptPlugin,
				namedOperationsObject: namedOperationsObjectPlugin,
				typescriptOperations: typescriptOperationsPlugin,
				typescriptGraphQLRequest: typescriptGraphQLRequestPlugin
			},
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
	console.log(config.codegen)
	let plugins = [];
	if(!config.codegen.disableTypescript){
		plugins.push({ typescript: {} })
		plugins.push({ typescriptOperations: {} })
		plugins.push({ typescriptGraphQLRequest: {} })
	}
	//plugins.push({ namedOperationsObject: { identifierName: "operations" } })

	return plugins;
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
