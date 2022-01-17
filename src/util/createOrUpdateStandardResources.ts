// @ts-ignore
import { query as q } from "faunadb";
import getClient from "./client";
import { Resource, StandardResourceType } from "../types";

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
	},
	providers: {
		create: q.CreateAccessProvider,
		index: q.AccessProvider
	}
}

/**
 * Create or update a resource. Returns the action that was taken.
 * @param {Object} resource - A function object.
 * @param {String} obj.name - The name of the function
 * @param {Object} obj.body - The actual function body
 * @param {String} [obj.role] - The role of the function
 * @returns {Promise<string>} Promise that resolves to either `created` or `updated`
 */
export default async function createOrUpdateResources(
	resources: Resource[], 
	type: StandardResourceType
): Promise<object>{
	const client = await getClient();
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