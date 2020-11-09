const path = require("path");
const fs = require("fs");
const cwd = process.cwd();

function getConfig(){
	const configPath = path.join(cwd, ".fauna.json");
	return fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
}

module.exports = getConfig;
