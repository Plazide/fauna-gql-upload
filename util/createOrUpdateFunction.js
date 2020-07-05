const { query: q } = require("faunadb");
const client = require("./client");
const displayErrors = require("./displayErrors");

/**
 * Create or update a user-defined function. Returns the action that was taken.
 * @param {Object} obj - A function object.
 * @param {String} obj.name - The name of the function
 * @param {Object} obj.body - The actual function body
 * @param {String} [obj.role] - The role of the function
 * @returns {Promise<string>} Promise that resolves to either `created` or `updated`
 */
async function createOrUpdateFunction(obj){
	try{
		const result = await client.query(
			q.Let(
				{
					exists: q.Exists(q.Function(obj.name))
				},
				q.Do(
					q.If(
						q.Var("exists"),
						q.Update(q.Function(obj.name), obj),
						q.CreateFunction(obj)
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
		displayErrors(err, obj, "function");
	}

}

module.exports = createOrUpdateFunction;