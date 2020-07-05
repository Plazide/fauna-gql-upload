const path = require("path");
const fs = require("fs");
const cwd = process.cwd();

function getConfig(){
	return JSON.parse(fs.readFileSync(path.join(cwd, ".fauna.json"), "utf8"));
}

module.exports = getConfig;