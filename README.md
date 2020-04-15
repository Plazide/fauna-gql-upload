# fauna-gql
fauna-gql is a simple CLI to update your database's GraphQL schema and resolver functions without going to the FaunaDB dashboard. It uses the `https://graphql.fauna.com/import` endpoint to update the schema from a file within your project, and the FQL driver for JavaScript to update and create functions.

## Install
You could install locally within your project:
```sh
npm install fauna-gql-upload
```

or, you could install it globally
```sh
npm install fauna-gql-upload -g
```

### Local install
When installing locally you have to run the command using a NPM script.

Package.json:
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "fauna": "fauna-gql"
  }
}
```

Running it:
```sh
npm run fauna
```

### Global install
When installing globally, all you have to do is run the command:
```sh
fauna-gql
```

## Configuration
For the command to work properly, you need to have certain information in your project.

1. You need a `.env` file with a variable called `FAUNADB_SECRET`
2. You need a valid schema file to upload. This file should be located at `./models/schema.gql` relative to the working directory where the command is executed.
3. To upload functions, you need a directory called `fauna/functions`. Within this directory, you should have one `.js` for each of you functions. See [Uploading Functions](#uploading-functions) to see an example of such a file.

If you want to use another environment variable name, another path for the schema, or another functions directory, you could create a `.fauna.json` file. It takes the following properties:
```json
{
	"schemaPath": "./schema.gql",
	"secretEnv": "FAUNADB_SECRET",
	"fnsDir": "fauna/functions"
}
```

These would now take precedent over the default values.

## Usage

### Uploading schema
To upload your schema, it has to be placed at `fauna/schema.gql` or the path specified in `.fauna.json`. It also needs to be valid (of course), otherwise you would get back an error. For more information on writing a GraphQL schema for FaunaDB, see the [official documentation](https://docs.fauna.com/fauna/current/api/graphql/).

### Uploading functions
To upload functions, you need a to have a `fauna/functions` directory containing `.js` files that describe your function's name, role, and body. As mentioned earlier, it is possible to customize the functions path by adding a `fnsDir` property to the `.fauna.json` file.

For your functions to work, you need to `require("faunadb")` inside each of the function files, and use the functions inside `fauna.query` to build your function. Take a look at the following example:
```js
const{ query } = require("faunadb");
const{ Query, Lambda, Let, Identity, Select, Get, Var } = query;

module.exports = {
	name: "current_user",
	body:
	Query(
		Lambda([], Let({ userRef: Identity() }, Select([], Get(Var("userRef")))))
	)
};

```
This function would return the currently authenticated user. 

As you can see, you need to export an object containing the name of the function, as well as the body of the function. See the [Fauna documentation](https://docs.fauna.com/fauna/current/api/fql/functions/createfunction) for a full reference on the accepted properties.

