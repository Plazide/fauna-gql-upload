import { DataResource, Resource, ResourceType, UploadResourcesOptions } from "../types";

import createOrUpdateData from "./createOrUpdateData";
import createOrUpdateStandardResources from "./createOrUpdateStandardResources";
import createFunctionsWithoutRoles from "./createFunctionsWithoutRoles";

/**
 * Create or update resources.
 * @param {object[]} resources - Resources to be uploaded
 * @param {"data"|"functions"|"roles"|"indexes"} type - The type of resource to upload
 * @param {{ fnsWithRoles: boolean }} options - Additional options
 */
export default async function createOrUpdateResources(
	resources: Resource[], 
	type: ResourceType, 
	{ fnsWithRoles = true }: UploadResourcesOptions = {}
){
	const resourcesArray = resources;

	if (type === "data") {
		return createOrUpdateData(resourcesArray as DataResource[]);
	}

	if(type === "functions" && !fnsWithRoles){
		return createFunctionsWithoutRoles(resourcesArray);
	}

	return createOrUpdateStandardResources(resourcesArray, type);
}