const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

async function uploadSchema(schemaPath, secret){
	const schema = path.join(process.cwd(), schemaPath);
	const data = fs.createReadStream(schema);

	const res = await fetch("https://graphql.fauna.com/import", {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${secret}`,
			"Content-Type": "text/plain"
		},
		body: data
	}).catch(console.error);

	if(!res.ok){
		const result = await res.text();
		console.error("Error:", result);
		console.log();
		console.log("Search for this error on Google:", encodeURI(`https://google.com/search?q=faunadb graphql ${result}`));
	}

	if(res.ok)
		console.log("✔️  Successfully updated schema.");
}

module.exports = uploadSchema;
