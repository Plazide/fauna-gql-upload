const fs = require("fs");
const path = require("path");
const createOrUpdateResources = require("../util/createOrUpdateResources");
const displayErrors = require("../util/displayErrors");
const esbuild = require("esbuild");
const { typeCheck } = require("../util/typescript");

const cwd = process.cwd();

async function uploadResources(dir, type){
	const failedUploadError = `❌  Failed to upload ${type}\n`;

	const resourceDir = path.join(dir, "output");
	const files = await fs.promises.readdir(dir).catch(err => {
		return null;
	});

	if(!files || (files && files.length === 0)){
		return;
	}

	const entries = files.filter(value => value !== null).map( file => path.join(dir, file));
	const containsTs = files.some( file => getExt(file) === ".ts");
	if(containsTs) {
		const ok = await typeCheck(entries);

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
			const resourcePath = path.join(cwd, resourceDir, removeExt(file) + ".js");
			const resource = await require(resourcePath);

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
		await createOrUpdateResources(resourceFiles, type);
		console.log("✔️  Successfully uploaded", type);
		console.log();
	}catch(err){
		console.error(failedUploadError);
		displayErrors(err, type);
		console.log();
	}

}

function removeExt(str){
	return str.split(".").slice(0, -1).join("");
}

function getExt(str){
	return path.extname(str);
}

module.exports = uploadResources;