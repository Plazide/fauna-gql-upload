import { DataResource } from "../types";

import getClient, { q } from "./client";

/** Creates or update domain data. */
export default async function createOrUpdateData(resources: DataResource[]){
	const client = await getClient();
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
									hasRef: q.ContainsField("ref", q.Var("item")),
									ref: q.If(q.Var("hasRef"), q.Select(["ref"], q.Var("item")), null),
									match: q.If(
										q.Var("hasRef"),
										null,
										q.Match(q.Var("index"), q.Select([q.Var("key")], q.Var("item"))),
									),
									exists: q.If(
										q.Var("hasRef"),
										q.Exists(q.Var("ref")),
										q.Exists(q.Var("match")),
									),									
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
										// If ref is specified, use it to create or update the data.
										q.Var("hasRef"),
										q.If(
											q.Var("exists"),
											// Update data if it exists.
											q.Update(
												q.Var("ref"), 
												q.Merge(
													{
														data: q.Var("item")
													},
													Credentials()
												)
											),
											// Create data if it doesn't exist.
											q.Create(
												q.Var("ref"), 
												q.Merge(
													{
														data: q.Var("item")
													},
													Credentials()
												)
											),
										),
										// If ref is not specified, use the match to create or update the data.
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
					undefined
				)
			}
		},
		{
			password: null
		}
	)
}