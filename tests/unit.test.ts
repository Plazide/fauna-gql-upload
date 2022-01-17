import wait from "../src/util/wait";
import camelize from "../src/util/camelize";
import dotenv from "dotenv";

import { FetchMockStatic } from "fetch-mock";
import fetch from "node-fetch";

import "fetch-mock-jest";

jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock = (fetch as unknown) as FetchMockStatic;

const endpoints = [
	"https://graphql.eu.fauna.com/graphql",
	"https://graphql.us.fauna.com/graphql",
	"https://graphql.fauna-preview.com/graphql",
	"https://graphql.fauna.com/graphql",
	"http://localhost:8084/graphql"
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
		const imported = await import("../src/util/getEndpoint");
		const getGraphqlEndpoint = imported.default;

		// Mock classic endpoint
		let correctEndpoint: typeof endpoints[number] = "https://graphql.fauna.com/graphql";
		mockEndpoints(correctEndpoint);

		// Test classic endpoint
		let endpoint = await getGraphqlEndpoint(false);
		expect(endpoint.graphql).toEqual("https://graphql.fauna.com");

		// Mock eu endpoint
		correctEndpoint = "https://graphql.eu.fauna.com/graphql";
		mockEndpoints(correctEndpoint);

		// Test eu endpoint
		endpoint = await getGraphqlEndpoint(false);
		expect(endpoint.graphql).toEqual("https://graphql.eu.fauna.com");

		// Mock local endpoint
		correctEndpoint = "http://localhost:8084/graphql";
		mockEndpoints(correctEndpoint);

		// Test local endpoint
		endpoint = await getGraphqlEndpoint(false);
		expect(endpoint.graphql).toEqual("http://localhost:8084");

		// Mock non-existing endpoint
		mockEndpoints("https://fake-endpoint.fauna.com/graphql");
		
		// Test non-existing endpoint
		endpoint = await getGraphqlEndpoint(false);
		expect(endpoint.graphql).toBe(null)
	})
})
