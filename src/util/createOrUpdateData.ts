import { Resource } from "../types";

import client, { q } from "./client";

/**
 * Creates or update domain data.
 * @param {Array} resources - An array of domain data definitions.
 * @returns {Promise<string>} Promise that resolves to either `created` or `updated`
 */
export default async function createOrUpdateData(resources: Resource[]){
	const result = await client.query(
		q.Foreach(
			resources,
			q.Lambda(
				"resource",
				q.Let(
					{
						collection: q.Select(["collection"], q.Var("resource")),
						data: q.Select(["data"], q.Var("resource")),
						index: q.Select(["index"], q.Var("resource")),
						key: q.Select(["key"], q.Var("resource")),
					},
					q.Foreach(q.Var("data"),
						q.Lambda("item",
							q.Let(
								{
									match: q.Match(q.Var("index"), q.Select([q.Var("key")], q.Var("item"))),
									exists: q.Exists(q.Var("match")),
								},
								q.Do(
									q.If(
										q.Var("exists"),
										q.Let(
											{
												ref: q.Select(["ref"], q.Get(q.Var("match")))
											},
											q.Update(q.Var("ref"), { data: q.Var("item") }),
										),
										q.Create(q.Var("collection"), { data: q.Var("item") }),
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
			)
		)
	)

	return result;
}