#!/usr/bin/env node
import { upload } from "./index";
import { ResourceType } from "./types";
import { argv } from "./util/getConfig";

const resources: ("schema" | ResourceType)[] = [
	"schema",
	"data",
	"functions",
	"indexes",
	"providers",
	"roles"
];

const ignoreAll = argv.ignoreAll;
const useResources = resources.filter(resource => argv[resource]);

upload({ 
	override: argv.override,
	// Pass empty array if --ignore-all is provided,
	resources: ignoreAll ? [] : (useResources.length > 0 ? useResources : undefined)
})