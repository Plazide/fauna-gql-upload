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

const useResources = resources.filter(resource => argv[resource]);

upload({ 
	override: argv.override,
	resources: useResources.length > 0 ? useResources : undefined
})