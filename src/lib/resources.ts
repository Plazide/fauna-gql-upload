import fs from "fs";
import path from "path";
import createOrUpdateResources from "../util/createOrUpdateResources";
import * as esbuild from "esbuild";
import { IndexResource, ProviderResource, Resource, ResourceType, UploadResourcesOptions } from "../types";
import { detailedError, status } from "../util/logger";
import getProviders from "../util/getProviders";
import updateIndexes from "../util/updateIndexes";
import CLISpinner from "cli-spinner";
import { errors } from "faunadb";

const Spinner = CLISpinner.Spinner; 

const cwd = process.cwd();
const allowedExts = [".js", ".ts"];

async function uploadResources(dir: string, type: ResourceType, options?: UploadResourcesOptions){
	const failedUploadError = `Failed to upload ${type}\n`;

	const resourceDir = path.join(dir, "output");
	const files = await fs.promises.readdir(dir).catch(err => {
		return null;
	});

	if(!files || (files && files.length === 0)){
		return;
	}

	const entries = files.filter(file =>{
		const ext = getExt(file)

		if(allowedExts.includes(ext)){
			return true
		}
		return false
	}).map( file => path.join(dir, file));
	const containsTs = files.some( file => getExt(file) === ".ts");
	if(containsTs) {
		const { typeCheck } = require("../util/typescript");
		const ok = await typeCheck(entries, dir);

		if(!ok){
			// Log status message for failed upload.
			status(failedUploadError, "error");

			// Cancel execution.
			return;
		}
	}

	// Build resources before reading data.
	try{
		await esbuild.build({
			entryPoints: entries,
			outdir: resourceDir,
			bundle: true,
			platform: "node",
			outExtension: { ".js": ".cjs" },
			target: ["esnext"]
		});
	}catch(err){
		status(failedUploadError, "error");
		return;
	}


	const resourceFiles: Resource[] = (await Promise.all(files.map( async file => {
		try{
			if(!allowedExts.includes(getExt(file))) return null;
			const resourcePath = path.join(cwd, resourceDir, removeExt(file) + ".cjs");
			const resource = await import(resourcePath);

			// Handle default exports
			return resource.default || resource;
		}catch(err){
			status(`Error reading file ${dir}/${file}`, "error");
			console.error(err);

			return null;
		}
	}))).filter( value => value !== null);

	// Remove out directory after reading files
	await fs.promises.rmdir(resourceDir, { recursive: true });

	try{
		const result = await createOrUpdateResources(resourceFiles, type, options);

		// Don't log success message on first function pass.
		if(type === "functions" && !options?.fnsWithRoles) return;
		
		status(`successfully uploaded ${type}`, "success");

		// Get and log the audience value of the uploaded providers
		if(type === "providers"){
			const providers = await getProviders(result as ProviderResource[]);
			
			providers.forEach( provider => {
				status(`audience for ${provider.name}: ${provider.audience}`, "info");
			})
		}
	}catch(err){
		// Don't log error message on first function pass.
		if(type === "functions" && !options?.fnsWithRoles) return;

		if(type === "indexes" && (err as any).requestResult.responseRaw.includes("Index sources, terms, values, and partition count may not be updated.")){
			status("Index sources, terms, values, and partition count cannot be updated normally. We must first delete the index and create it again. This will happen automatically, hold on...", "info");

			try{
				const indexes = resourceFiles.filter(val => !!val.source);
				
				const spinner = new Spinner("Updating mutated indexes... %s");
				spinner.start();
				await updateIndexes(indexes as IndexResource[]);
				spinner.stop();

				console.log();
				status("Successfully updated mutated indexes", "success");

				return;
			}catch(err){
				status("Failed to update mutated indexes", "error");
				console.error(err);
			}
		}
		
		detailedError(err as errors.FaunaHTTPError, type);
		throw "Upload operation failed. See logged errors above for more info."
	}

}

function removeExt(str: string){
	return str.split(".").slice(0, -1).join("");
}

function getExt(str: string){
	return path.extname(str);
}

export default uploadResources;
