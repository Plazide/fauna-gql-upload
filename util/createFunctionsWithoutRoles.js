const { query: q } = require("faunadb");
const client = require("./client");

async function createFunctionsWithoutRoles(resources){
	// Remove the role property from all resources.
	const resourcesWithoutRoles = resources.map( resource => {
		return {
			...resource,
			role: undefined
		};
	})

	return client.query(
		q.Foreach(
			resourcesWithoutRoles,
			q.Lambda(
				"resource",
				q.Let(
					{
						name: q.Select(["name"], q.Var("resource")),
						exists: q.Exists(q.Function(q.Var("name")))
					},
					q.If(
						q.Not(q.Var("exists")),
						// Create function if it doesn't exist.
						q.CreateFunction(q.Var("resource")),
						// Do nothing if it exists.
						null
					)
				)
			)
		)
	)
}

module.exports = createFunctionsWithoutRoles;