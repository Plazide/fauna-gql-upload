import fs from "fs";
import path from "path";
import createOrUpdateResources from "../util/createOrUpdateResources";
import displayErrors from "../util/displayErrors";
import esbuild from "esbuild";
import { typeCheck } from "../util/typescript";
import { ResourceType, UploadResourcesOptions } from "../types";

const cwd = process.cwd();
const allowedExts = [".js", ".ts"];

async function uploadResources(dir: string, type: ResourceType, options?: UploadResourcesOptions){
	const failedUploadError = `❌  Failed to upload ${type}\n`;

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
			console.log(failedUploadError);

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
			format: "cjs",
			target: ["node10.4"]
		});
	}catch(err){
		console.log();
		console.log(failedUploadError);
		return;
	}


	const resourceFiles = (await Promise.all(files.map( async file => {
		try{
			if(!allowedExts.includes(getExt(file))) return null;
			const resourcePath = path.join(cwd, resourceDir, removeExt(file) + ".js");
			const resource = await require(resourcePath);

			console.log(resource);
			return resource;
		}catch(err){
			console.error("❌ Error reading file", `${resourceDir}/${file}`);
			console.error(err);

			return null;
		}
	}))).filter( value => value !== null);

	// Remove out directory before building files
	await fs.promises.rmdir(resourceDir, { recursive: true });

	try{
		await createOrUpdateResources(resourceFiles, type, options);

		// Don't log success message on first function pass.
		if(type === "functions" && !options?.fnsWithRoles) return;
		
		console.log("✔️  Successfully uploaded", type);
		console.log();
	}catch(err){
		console.error(failedUploadError);
		displayErrors(err, type);
		console.log();
	}

}

function removeExt(str: string){
	return str.split(".").slice(0, -1).join("");
}

function getExt(str: string){
	return path.extname(str);
}

export default uploadResources;