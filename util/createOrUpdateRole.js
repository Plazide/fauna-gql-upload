const { query: q } = require("faunadb");
const client = require("./client");
const displayErrors = require("./displayErrors");

/**
 * Create or update a user-defined role. Returns the action that was taken.
 * @param {Object} obj - A role object.
 * @param {String} obj.name - The name of the role
 * @param {Object[]} obj.privileges - The privileges of the role
 * @param {Object[]} [obj.membership] - The the memberships of the role
 * @returns {Promise<string>} Promise that resolves to either `created` or `updated`
 */
async function createOrUpdateRole(obj){
	try{
		const result = await client.query(
			q.Let(
				{
					exists: q.Exists(q.Role(obj.name))
				},
				q.Do(
					q.If(
						q.Var("exists"),
						q.Update(q.Role(obj.name), obj),
						q.CreateRole(obj)
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
		displayErrors(err, obj, "role")
	}
	
}

module.exports = createOrUpdateRole;