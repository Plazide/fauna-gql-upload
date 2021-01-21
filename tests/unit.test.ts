import wait from "../src/util/wait";
import camelize from "../src/util/camelize";

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