# fauna-gql-upload
fauna-gql-upload is a simple CLI to update your database's GraphQL schema, resolver functions, indexes, and database roles without going to the FaunaDB dashboard. It uses the `https://graphql.fauna.com/import` endpoint to update the schema from a file within your project, and the FQL driver for JavaScript to update/create functions, roles, and indexes.

> **NOTE:** If you want to use this package with typescript, you do not need to build the resources manually. As of version 1.9.0, type-checking and typescript compilation is handled automatically without extra configuration. Read more about [typescript support](#typescript)

## Main features
- Store all your User-defined functions, roles, indexes, and domain data within your project.
- Update your schema and other resources without leaving your editor.
- Easily replicate FaunaDB resources across databases and accounts.
- Include FaunaDB resources in version control and source code.
- Typescript support.

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

1. You need a `.env` file with a variable called `FAUNADB_SECRET`.
2. You need a valid schema file to upload. This file should be located at `fauna/schema.gql` relative to the working directory where the command is executed.
3. To upload functions, you need a directory called `fauna/functions`. Within this directory, you should have one `.js` file for each of you functions. See [Uploading Functions](#uploading-functions) for an example of such a file.
4. To upload roles, you need a directory called `fauna/roles`. Within this directory, you should have one `.js` file for each of your roles. See [Uploading Roles](#uploading-roles) for an example of such a file.
5. To upload indexes, you need a directory called `fauna/indexes`. Within this directory, you should have one `.js` file for each of your indexes. See [Uploading indexes](#uploading-indexes) for an example of such a file.
6. To upload domain data, you need a directory called `fauna/data`. Within this directory, you should have one `.js` file for each of your data sets. See [Uploading data](#uploading-data) for an example of such a file.

### Config file

If you need to customize paths or set a different environment variable name for your secret key, you can create a `.fauna.json` file.

It takes the following properties:

|Property|Default|Description|
|--------|-------|-------|
|`schemaPath`|`models/schema.gql`|Path to your GraphQL schema.
|`secretEnv`|`FAUNADB_SECRET`|The key used to access the your FaunaDB database.
|`tsconfigPath`|`tsconfig.json`|Path to a `tsconfig.json` file.
|`envPath`|`.env`|Path to the environment file that holds your `secretEnv`
|`fnsDir`|`fauna/functions`|Path to directory that holds your FQL UDFs.
|`rolesDir`|`fauna/roles`|Path to directory that holds your FaunaDB roles
|`dataDir`|`fauna/data`|Path to directory that holds your domain data.

*All properties are optional, you can omit `.fauna.json` completely if you are happy with the defaults.*

## Usage

### Uploading schema
To upload your schema, it has to be placed at `fauna/schema.gql` or the path specified in `.fauna.json`. It also needs to be valid (of course), otherwise you would get back an error. For more information on writing a GraphQL schema for FaunaDB, see the [official documentation](https://docs.fauna.com/fauna/current/api/graphql/).

#### Overriding the schema
If you need to make schema changes that are not compatible with the previous versions of the schema, you might have to override it. This can be done by adding a `--override` flag when running the command.

Like so:
```sh
fauna-gql --override
```

If you are running the command locally with npm, you need to add the flag to the npm script.
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "fauna": "fauna-gql",
    "fauna-override": "fauna-gql --override",
  }
}
```

and then run:
```sh
npm run fauna-override
```

Since overriding the schema removes all collections, functions, and indexes, you will be asked to confirm your intention. In certain situations though, you'd want to skip this confirmation, like in a CI/CD pipeline. Therefore, you can use the `-y` flag to override the prompt and go forward with the opration without questions.

It would look like this:
```sh
fauna-gql --override -y
```

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

### Uploading indexes
To upload indexes, you need a `fauna/indexes` directory containing a `.js` file for each of your indexes. These files describe the index and look like the following example.

```js
const { query } = require("faunadb");
const { Collection } = query;

module.exports = {
	name: "people_sort_by_age_asc",
	source: Collection("People"),
	values: [
		{ field: ["data", "age"] },
		{ field: ["ref"] }
	]
}
```

Fauna does actually create indexes based on your schema. But in certain situations it might be necessary to create custom indexes. The index above sorts people in ascending order by their age.

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

### Uploading data
To upload data, you need a `fauna/data` directory containing a `.js` file for each of your data definition sets. These files describe the data and look like the following example.

Data is idempotent, meaning multiple calls of the `fauna-gql` command will not yield duplicates. Documents that already exist (determined by the specified `key`) will be updated. This is why you must define a unique index and also specify which field to use for uniqueness with the `key` property.

```js
module.exports = {
  collection: "Languages",
  index: "languages_by_key",
  key: "key",
  data: [
    { key: "en", name: "English" },
    { key: "es", name: "Spanish" },
    { key: "fr", name: "French" },
  ],
};

```

### Typescript

This package supports type-checking and automatic compilation of typescript files. All you need to do is change the file extension to `.ts`.

You will also need to make sure you use the correct export syntax. Exports need to look like the following example to allow fauna-gql-upload to read it:

```ts
import{ query } from "faunadb";
const{ Query, Lambda, Let, Identity, Select, Get, Var } = query;


export = {
	name: "current_user",
	body:
	Query(
		Lambda([], Let({ userRef: Identity() }, Select([], Get(Var("userRef")))))
	)
}
```

#### Configuration file

fauna-gql-upload looks for a `tsconfig.json` file in the following order:

1. The file specified in `.fauna.json` under the `tsconfigPath` property.
2. The closest `tsconfig.json` to the current resource, ie. if you have a `tsconfig.json` in your functions directory, we will use that for your functions but not for other resources.
3. If the two previous checks returns empty, the default compiler options will be used.


#### Incremental adoption
If you've already started a project using `.js` files, you can just add new files with the `.ts` extension and fauna-gql-upload will pick up both file extensions and treat then correctly.

## Get in touch
If you want to get in touch with me, feel free to reach out to me one Twitter([@chj_web](https://twitter.com/chj_web)).
