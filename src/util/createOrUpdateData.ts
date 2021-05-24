import { DataResource } from "../types";

import client, { q } from "./client";

/** Creates or update domain data. */
export default async function createOrUpdateData(resources: DataResource[]){
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
						key: q.Select(["key"], q.Var("resource"))
					},
					q.Foreach(q.Var("data"),
						q.Lambda("item",
							q.Let(
								{
									match: q.Match(q.Var("index"), q.Select([q.Var("key")], q.Var("item"))),
									exists: q.Exists(q.Var("match")),
									credentials: q.Select(
										0,
										q.Filter(
											q.Select(["credentials"], q.Var("resource"), []),
											q.Lambda(
												"credential",
												q.Equals(
													q.Select(
														[q.Var("key")], 
														q.Var("item")
													),
													q.Select(
														["key"], 
														q.Var("credential")
													)
												)
											)
										),
										false
									)
								},
								q.Do(
									q.If(
										q.Var("exists"),
										q.Let(
											{
												ref: q.Select(["ref"], q.Get(q.Var("match")))
											},
											q.Update(
												q.Var("ref"), q.Merge(
													{ 
														data: q.Var("item"),
													},
													Credentials()
												)
											),
										),
										q.Create(
											q.Var("collection"), q.Merge(
												{ 
													data: q.Var("item") 
												},
												Credentials()
											)
										),
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

/** Set password in credentials object if credentials exist for the current document. */
function Credentials(){
	return q.If(
		q.IsObject(q.Var("credentials")),
		{
			credentials: {
				password: q.Select(
					["password"],
					q.Var("credentials"),
					null
				)
			}
		},
		{
			password: null
		}
	)
}