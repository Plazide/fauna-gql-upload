const createOrUpdateData = require('./createOrUpdateData');
const createOrUpdateStandardResources = require('./createOrUpdateStandardResources');
const createFunctionsWithoutRoles = require("./createFunctionsWithoutRoles");

/**
 * Create or update resources.
 * @param {object[]} resources - Resources to be uploaded
 * @param {"data"|"functions"|"roles"|"indexes"} type - The type of resource to upload
 * @param {{ fnsWithRoles: boolean }} options - Additional options
 */
async function createOrUpdateResources(resources, type, { fnsWithRoles = true } = {}){
	if (type === 'data') {
		return createOrUpdateData(resources);
	}

	if(type === "functions" && !fnsWithRoles){
		return createFunctionsWithoutRoles(resources);
	}

	return createOrUpdateStandardResources(resources, type);
}

module.exports = createOrUpdateResources;