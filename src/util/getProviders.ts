import { ProviderResource, ProviderResult } from "../types";
import getClient, { q } from "./client";

export default async function getProviders(providers: ProviderResource[]): Promise<ProviderResult[]>{
	const client = await getClient();
	return client.query(
		q.Map(
			providers,
			q.Lambda(
				"provider",
				q.Get(
					q.AccessProvider(
						q.Select(
							"name",
							q.Var("provider")
						)
					)
				)
			)
		)
	)
}