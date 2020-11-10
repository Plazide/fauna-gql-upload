const ts = require("typescript");
const fs = require("fs");
const getConfig = require("./getConfig");

const cwd = process.cwd();
const config = getConfig();

async function typeCheck(entries){
	const compilerOptions = await getCompilerOptions();

	// Don't build files, that is handled by esbuild.
	compilerOptions.noEmit = true;

	const program = ts.createProgram({
		options: compilerOptions,
		rootNames: entries		
	});
	const diagnosticsHost = ts.createCompilerHost(compilerOptions);
	const diagnostics = ts.getPreEmitDiagnostics(program);

	if(diagnostics.length > 0){	
		// Log typescript messages.
		const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, diagnosticsHost);
		console.log(formatted);

		// Cancel execution.
		return false;
	}

	return true;
}

async function getCompilerOptions(){
	// Look for a tsconfig.json file.
	const configFile = config.tsconfigPath || ts.findConfigFile(cwd, (name) => fs.existsSync(name));

	// Return the compiler options from that config file if it exists.
	if(configFile){
		const configJson = await fs.promises.readFile(configFile, { encoding: "utf8" })
		const config = ts.parseConfigFileTextToJson(configFile, configJson);
		if(config.error) throw new Error(config.error.messageText);

		const { options: compilerOptions } = ts.convertCompilerOptionsFromJson(config.config.compilerOptions);
		return compilerOptions;
	}

	// Return default compiler options if no tsconfig.json exists.
	return ts.getDefaultCompilerOptions();
}

module.exports = {
	typeCheck
}