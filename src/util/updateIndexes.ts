//@ts-ignore
import { query as q } from "faunadb";

import { IndexResource, Resource } from "../types";
import getClient from "./client";
import wait from "./wait";
import createOrUpdateResources from "./createOrUpdateStandardResources";

export default async function updateIndexes(indexes: IndexResource[]){
	// 1. Delete original indexes
	await deleteOriginalIndexes(indexes);

	// 2. Wait 60 seconds
	await wait(60 * 1000);

	// 3. Create indexes
	await createOrUpdateResources(indexes as Resource[], "indexes");
}

async function deleteOriginalIndexes(indexes: IndexResource[]){
	const client = await getClient();
	return client.query(
		q.Foreach(
			indexes,
			q.Lambda(
				"index",
				q.Let(
					{
						name: q.Select(["name"], q.Var("index")),
						indexRef: q.Index(q.Var("name")),
						exists: q.Exists(q.Var("indexRef"))
					},
					q.If(
						q.Var("exists"),
						q.Delete(q.Var("indexRef")),
						null
					)
				)
			)
		)
	)
}