const { query: q } = require("faunadb");
const client = require("./client");
const displayErrors = require("./displayErrors");

/**
 * Create or update an index.
 * @param {Object} obj - An index object.
 * @param {String} obj.name - The name of the index
 * @param {Object} obj.source - The source collection for the index
 * @param {Object[]} [obj.terms] - The terms of the index.
 * @param {Object[]} [obj.values] - The values of the index.
 * @returns {Promise<string>} Promise that resolves to either `created` or `updated`
 */
async function createOrUpdateIndex(obj){
	try{
		const result = await client.query(
			q.Let(
				{
					exists: q.Exists(q.Index(obj.name))
				},
				q.Do(
					q.If(
						q.Var("exists"),
						q.Update(q.Index(obj.name), obj),
						q.CreateIndex(obj)
					),
					q.If(
						q.Var("exists"),
						"updated",
						"created"
					)
				)
			)
		)
	
		return result;
	}catch(err){
		displayErrors(err, obj, "index");
	}
	
}

module.exports = createOrUpdateIndex;