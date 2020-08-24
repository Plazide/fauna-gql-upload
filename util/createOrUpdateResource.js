const { query: q } = require("faunadb");
const client = require("./client");
const displayErrors = require("./displayErrors");

const actions = {
	functions: {
		create: q.CreateFunction,
		index: q.Function
	},
	indexes: {
		create: q.CreateIndex,
		index: q.Index,
	},
	roles: {
		create: q.CreateRole,
		index: q.Role
	}
}

/**
 * Create or update a user-defined function. Returns the action that was taken.
 * @param {Object} resource - A function object.
 * @param {String} obj.name - The name of the function
 * @param {Object} obj.body - The actual function body
 * @param {String} [obj.role] - The role of the function
 * @returns {Promise<string>} Promise that resolves to either `created` or `updated`
 */
async function createOrUpdateResource(resource, type){
	try{
		const result = await client.query(
			q.Let(
				{
					exists: q.Exists(actions[type].index(resource.name))
				},
				q.Do(
					q.If(
						q.Var("exists"),
						q.Update(actions[type].index(resource.name), resource),
						actions[type].create(resource)
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
		console.log(err);
		displayErrors(err, resource, type);
	}

}

module.exports = createOrUpdateResource;