# fauna-gql
fauna-gql is a simple CLI to update your database's GraphQL schema, resolver functions, and database roles without going to the FaunaDB dashboard. It uses the `https://graphql.fauna.com/import` endpoint to update the schema from a file within your project, and the FQL driver for JavaScript to update/create functions and roles.

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
3. To upload functions, you need a directory called `fauna/functions`. Within this directory, you should have one `.js` file for each of you functions. See [Uploading Functions](#uploading-functions) to see an example of such a file.
4. To upload roles, you need a directory called `fauna/roles`. Within this directory, you should have one `.js` file for each of your roles. See [Uploading Roles](#uploading-roles) to see and example of such a file.

If you want to use another environment variable name, another path for the schema, or another functions directory, you could create a `.fauna.json` file. It takes the following properties:
```json
{
	"schemaPath": "./schema.gql",
	"secretEnv": "FAUNADB_SECRET",
	"fnsDir": "fauna/functions",
	"rolesDir": "fauna/roles"
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

### Uploading roles
To upload roles, you need a `fauna/roles` directory containing a `.js` file for each of your roles. These files describe the role and look like the following example.

```js
const{ query } = require("faunadb");
const { Collection } = query;
const onlyDeleteByOwner = require("../predicates/onlyDeleteByOwner");

module.exports = {
	name: "user",
	privileges: [
		{
			resource: Collection("Comment"),
			actions: {
				read: true,
				create: true,
				delete: onlyDeleteByOwner
			}
		}
	]
}
```
As with the functions, you need to include certain functions from the `faunadb` driver. 

#### Predicate functions
Another detail that you've probably noticed is the `onlyDeleteByOwner` function. This is a [predicate function](https://docs.fauna.com/fauna/current/security/roles#mco). It lets you define your own permissions based on the user making the request and the document's fields. You would normally have to write these inline with the permissions. But in this case, we can create these in seperate files and reuse them multiple times for different resources.

The `onlyDeleteByOwner.js` file would like this:
```js
const{ query } = require("faunadb");
const{ Query, Lambda, Equals, Identity, Select, Get, Var } = query;

module.exports = Query(
	Lambda(
		"ref",
		Equals(Identity(), Select(["data", "user"], Get(Var("ref"))))
	)
);
```

## Get in touch
If you want to get in touch with me, feel free to reach out to me one Twitter([@chj_web](https://twitter.com/chj_web)).
