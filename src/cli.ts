#!/usr/bin/env node
import { upload } from "./index";
import { ResourceType } from "./types";
import { argv } from "./util/getConfig";
import yargs from "yargs";
import init from "./lib/init";

const resources: ("schema" | ResourceType)[] = [
	"schema",
	"data",
	"functions",
	"indexes",
	"providers",
	"roles"
];

function _upload(){
	const override = argv.override;
	const useResources = resources.filter(resource => argv[resource]);
	
	upload({ 
		override: override,
		
		// Pass empty array if --ignore-all is provided,
		resources: useResources.length > 0 ? useResources : undefined
	})
}


// Define commands
yargs
	// Command for initializing FGU
	.command("init", "Initialize FGU in the current directory", {}, init)
	
	// Default command
	.command(["upload", "$0"], "Upload resources", {}, _upload)
	.demandCommand()
	.argv;


	

process.addListener("unhandledRejection", e => {
	throw e;
})