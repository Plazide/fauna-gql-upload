/**
 * Log the results of a upload operation.
 * @param {Object} data - The log data.
 * @param {String} data.type - The type that was processed, can be `functions`, `roles`, or `indexes`
 * @param {Number} data.numFailed - The amount of entries that failed.
 * @param {Number} data.numUpdated - The amount of entries that were updated.
 * @param {Number} data.numCreated - The amount of entries that were created.
 */
function logResults({ type, numUpdated, numCreated, numFailed }){
	console.group(`✔️  Finished uploading ${type}.`);

	if(numCreated > 0)
		console.log("Created", numCreated, type);

	if(numUpdated > 0)
		console.log("Updated", numUpdated, type);

	if(numFailed > 0)
		console.warn("Failed with", numFailed, type);
		
	console.log();
	console.groupEnd();
}

module.exports = logResults;