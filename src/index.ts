import { UploadOptions } from "./types";
import getConfig from "./util/getConfig";
export {
	DataResource,
	FunctionResource,
	IndexResource,
	Membership,
	Privilege,
	ProviderResource,
	RoleResource,
	ResourceType
} from "./types";

const {
	schemaPath,
	indexesDir,
	fnsDir,
	rolesDir,
	dataDir,
	providersDir,
	codegen
} = getConfig();

export async function upload({
	override = false,
	resources = ["schema", "data", "functions", "indexes", "providers", "roles"],
	runCodegen = true
}: UploadOptions = {}) {
	ensurePackage("faunadb")
	const uploadSchema = (await import("./lib/schema")).default;
	const uploadResources = (await import("./lib/resources")).default;

	// Upload schema
	if(resources.includes("schema"))
		await uploadSchema(schemaPath, override);

	// Upload indexes
	if(resources.includes("indexes"))
		await uploadResources(indexesDir, "indexes");

	// Upload functions without their role property.
	// This solves a problem where the fauna would throw an invalid reference error
	// when referencing user defined roles before they exist.
	if(resources.includes("functions"))
		await uploadResources(fnsDir, "functions", { fnsWithRoles: false });

	// Upload roles
	if(resources.includes("roles"))
		await uploadResources(rolesDir, "roles");

	// Upload functions with roles
	if(resources.includes("functions"))
		await uploadResources(fnsDir, "functions", { fnsWithRoles: true })

	// Upload data
	if(resources.includes("data"))
		await uploadResources(dataDir, "data");

	// Create access providers
	if(resources.includes("providers"))
		await uploadResources(providersDir, "providers");

	// If the codegen is specified
	if(codegen && runCodegen){
		ensurePackage("graphql");

		const runCodegen = (await import("./lib/codegen")).default;
		runCodegen()
	}
		
};

function ensurePackage(name: string){
	try{
		require(name);
	}catch(err){
		throw `Missing required peer dependency "${name}".
			
Run "yarn add -D ${name}" to install it with yarn,
or "npm i --save-dev ${name}" to install with npm.
			`
	}
}
