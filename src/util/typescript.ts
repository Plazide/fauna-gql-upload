import ts from "typescript";
import fs from "fs";
import path from "path";
import getConfig from "./getConfig";

const cwd = process.cwd();
const config = getConfig();

export async function typeCheck(entries: string[], dir: string){
	const compilerOptions = await getCompilerOptions(dir);

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

async function getCompilerOptions(dir: string){
	const basePath = path.join(cwd, dir);

	// Look for a tsconfig.json file.
	const configFile = config.tsconfigPath || ts.findConfigFile(basePath, (name) => fs.existsSync(name));

	// Return the compiler options from that config file if it exists.
	if(configFile){
		const configJson = await fs.promises.readFile(configFile, { encoding: "utf8" })
		const config = ts.parseConfigFileTextToJson(configFile, configJson);
		if(config.error) {
			const host = ts.createCompilerHost(config.config);
			const message = ts.formatDiagnostic(config.error, host);
			console.log(message);
		}

		const { options: compilerOptions } = ts.convertCompilerOptionsFromJson(config.config.compilerOptions, basePath);
		return compilerOptions;
	}

	// Return default compiler options if no tsconfig.json exists.
	return ts.getDefaultCompilerOptions();
}