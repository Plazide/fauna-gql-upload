#!/usr/bin/env node
import { upload } from "./index";
import { argv } from "./util/getConfig";

upload({ 
	override: argv.override
})