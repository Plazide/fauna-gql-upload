import { IProviderResource, IProviderResult } from "../types";
import client, { q } from "./client";

export default function getProviders(providers: IProviderResource[]): Promise<IProviderResult[]>{
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