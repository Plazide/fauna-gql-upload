const createOrUpdateData = require('./createOrUpdateData');
const createOrUpdateStandardResources = require('./createOrUpdateStandardResources');

async function createOrUpdateResources(resources, type){
	if (type === 'data') {
		return createOrUpdateData(resources);
	}

	return createOrUpdateStandardResources(resources, type);
}

module.exports = createOrUpdateResources;