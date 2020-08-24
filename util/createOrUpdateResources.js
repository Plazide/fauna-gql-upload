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
async function createOrUpdateResources(resources, type){
	const result = await client.query(
		q.Foreach(
			resources,
			q.Lambda(
				"resource",
				q.Let(
					{
						name: q.Select(["name"], q.Var("resource")),
						exists: q.Exists(actions[type].index(q.Var("name")))
					},
					q.Do(
						q.If(
							q.Var("exists"),
							q.Update(actions[type].index(q.Var("name")), q.Var("resource")),
							actions[type].create(q.Var("resource"))
						),
						q.If(
							q.Var("exists"),
							"updated",
							"created"
						)
					)
				)
			)
		)
	)

	return result;
}

module.exports = createOrUpdateResources;