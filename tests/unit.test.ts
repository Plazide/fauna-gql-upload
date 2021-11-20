import wait from "../src/util/wait";
import camelize from "../src/util/camelize";
import dotenv from "dotenv";

import type { FetchMockStatic } from "fetch-mock";
import fetch from "node-fetch";

import "fetch-mock-jest";

jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock = (fetch as unknown) as FetchMockStatic;

const endpoints = [
	"https://graphql.eu.fauna.com/graphql",
	"https://graphql.us.fauna.com/graphql",
	"https://graphql.fauna-preview.com/graphql",
	"https://graphql.fauna.com/graphql"
] as const;

function mockEndpoints(correctEndpoint: string){
	endpoints.forEach( endpoint => {
		fetchMock.post(
			endpoint,
			{
				errors:
				endpoint === correctEndpoint
				? [{
					message: 'No usable value for query\n' +
					'Did not find value which can be converted into java.lang.String'
				}]
				: [{
					message: "Invalid database secret."
				}]
			},
			{ overwriteRoutes: true }
		)
	})
}

describe("Unit tests", () => {
	beforeEach( () => {
		dotenv.config({ path: ".env.test" });
		fetchMock.reset();
	})

	test("Should wait about 500 ms", async () => {
		const waitTime = 500;
		const time = Date.now();
		await wait(waitTime);
		const newTime = Date.now();
		expect(newTime).toBeGreaterThanOrEqual(time + waitTime);
		expect(newTime).toBeLessThan(time + waitTime + 5);
	})
	
	test("Should camelCase string", () => {
		expect(camelize("Hello there")).toBe("helloThere");
		expect(camelize("hello-there")).toBe("helloThere")
	})
	
	test("Should return correct endpoint", async () => {
		const imported = await import("../src/util/getGraphqlEndpoint");
		const getGraphqlEndpoint = imported.default;
		let correctEndpoint: typeof endpoints[number] = "https://graphql.fauna.com/graphql";
		mockEndpoints(correctEndpoint);

		let endpoint = await getGraphqlEndpoint();
		expect(endpoint).toEqual("https://graphql.fauna.com");

		correctEndpoint = "https://graphql.eu.fauna.com/graphql";
		mockEndpoints(correctEndpoint);

		endpoint = await getGraphqlEndpoint();
		expect(endpoint).toEqual("https://graphql.eu.fauna.com");
	})
})
