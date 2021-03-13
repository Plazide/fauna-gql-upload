> **Important note:** The minimum supported node version is v12.10.0 

# fauna-gql-upload
fauna-gql-upload is a simple CLI to update your database's GraphQL schema, resolver functions, indexes, and database roles without going to the FaunaDB dashboard. It uses the `https://graphql.fauna.com/import` endpoint to update the schema from a file within your project, and the FQL driver for JavaScript to update/create functions, roles, and indexes.

## Table of contents
- [fauna-gql-upload](#fauna-gql-upload)
	- [Table of contents](#table-of-contents)
	- [Main features](#main-features)
	- [Install](#install)
	- [Configuration](#configuration)
		- [Adding a npm script](#adding-a-npm-script)
		- [Files and directories](#files-and-directories)
		- [Config file](#config-file)
	- [Usage](#usage)
		- [Uploading schema](#uploading-schema)
			- [Overriding the schema](#overriding-the-schema)
		- [Uploading functions](#uploading-functions)
		- [Uploading roles](#uploading-roles)
		- [Uploading indexes](#uploading-indexes)
			- [Predicate functions](#predicate-functions)
		- [Uploading data](#uploading-data)
		- [Uploading access providers](#uploading-access-providers)
		- [Typescript](#typescript)
			- [Configuration file](#configuration-file)
			- [Incremental adoption](#incremental-adoption)
		- [GraphQL code generation](#graphql-code-generation)
			- [Plugins](#plugins)
			- [Configuring plugins](#configuring-plugins)
	- [Problems or issues](#problems-or-issues)
	- [Get in touch](#get-in-touch)

## Main features
- 🗄️ Store all your User-defined functions, roles, indexes, and domain data within your project.
- 📜 Update your schema and other resources without leaving your editor.
- 🔃 Easily replicate FaunaDB resources across databases and accounts.
- 📑 Include FaunaDB resources in version control and source code.
- ✔️ Typescript support.
- 🔥 GraphQL code generation (using [GraphQL codegen](https://graphql-code-generator.com/)).

> **NOTE:** If you want to use this package with typescript, you do **not** need to build the resources manually. As of version 1.9.0, type-checking and typescript compilation is handled automatically without extra configuration. Read more about [typescript support](#typescript).

## Install
`fauna-gql-upload` needs a local installation of `faunadb`. That means you need to install both packages.

With npm:
```sh
npm install --save-dev fauna-gql-upload faunadb
```

With yarn:
```sh
yarn add -D fauna-gql-upload faunadb
```

> **NOTE:** You do not need to install `faunadb` as a development dependency. You could also install it normally if you use it as part of your frontend or in other backend code.

## Configuration

### Adding a npm script

You will need to add a npm script to the command.

Package.json:
```js
{
...
"scripts": {
  "fauna": "fgu" // you can use 'fgu' or 'fauna-gql'
}
...
}
```

Running it:
```sh
npm run fauna
```
### Files and directories

For the command to work properly, you need to have certain information in your project.

1. You need a `.env` file with a variable called `FAUNADB_SECRET`. __This is required__ 
2. You need a valid schema file to upload. This file should be located at `fauna/schema.gql` relative to the working directory where the command is executed. __This is required__ 
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
|`providersDir`|`fauna/providers`|Path to directory that holds your access providers.
|`codegen`|`null`|Whether or not to generate code based on your GraphQL schema. Takes either a **boolean** or an **object**
|`codegen.plugins`|`[]`|Any plugins you want to use with GraphQL codegen
|`codegen.pluginOptions`|`{}`|Plugin options to apply to all plugins
|`codegen.documents`|`[]`|Array of file paths, relative to the project root, to read queries, mutations, and subscriptions from
|`codegen.outputFile`|`generated/graphql.ts`|File that the generated GraphQL types and operations will be written to
|`codegen.headers`|`{}`|Any additional headers you want to include. This is usually used with preview features such as `x-schema-preview: partial-update-mutation`. Your secret is automatically added, so no need to include it here.
|`codegen.operations`|`true`|Whether or not to enable the `typescript-operations` plugin.
|`codegen.typescript`|`true`|Whether or not to enable the `typescript` plugin. Setting this to false will change your `outputFile` to use a `.js` extension, unless you've set a custom `outputFile` and won't generate types.

*All properties are optional, you can omit `.fauna.json` completely if you are happy with the defaults.*

## Usage

To upload your resources, simply run the previously configured command.

with npm:
```sh
npm run fauna
```

with yarn:
```sh
yarn fauna
```

> **NOTE:** As you will notice, all of the resource examples below are using import/export syntax. This is not supported in node by default, but `fauna-gql-upload` builds all of your resources using [esbuild](https://esbuild.github.io/) which makes this syntax work without extra configuration on your part.

### Uploading schema
To upload your schema, it has to be placed at `fauna/schema.gql` or the path specified in `.fauna.json`. It also needs to be valid, otherwise you would get back an error. For more information on writing a GraphQL schema for FaunaDB, see the [official documentation](https://docs.fauna.com/fauna/current/api/graphql/).

#### Overriding the schema
If you need to make schema changes that are not compatible with the previous versions of the schema, you might have to override it. This can be done by adding a `--override` flag when running the command.

Like so:
```sh
fgu --override
```

Your npm script would then look like this:
```json
{
...
"scripts": {
  "fauna": "fgu",
  "fauna-override": "fgu --override",
}
...
}
```

and then run:
```sh
npm run fauna-override
```

Since overriding the schema removes all collections, functions, and indexes, you will be asked to confirm your intention. In certain situations though, you'd want to skip this confirmation, like in a CI/CD pipeline. Therefore, you can use the `-y` flag to override the prompt and go forward with the operation without questions.

It would look like this:
```sh
fgu --override -y
```

### Uploading functions
To upload functions, you need a to have a `fauna/functions` directory containing `.js` files that describe your function's name, role, and body. As mentioned earlier, it is possible to customize the functions path by adding a `fnsDir` property to the `.fauna.json` file.

For your functions to work, you need to `import "faunadb"` inside each of the function files, and use the functions inside `faunadb.query` to build your function. Take a look at the following example:
```js
import { query as q } from "faunadb";

export default {
  name: "current_user",
  body:
  q.Query(
    q.Lambda([], q.Let({ userRef: q.CurrentIdentity() }, q.Select([], q.Get(q.Var("userRef")))))
  )
};

```
This function would return the currently authenticated user. 

As you can see, you need to export an object containing the name of the function, as well as the body of the function. See the [Fauna documentation](https://docs.fauna.com/fauna/current/api/fql/functions/createfunction) for a full reference on the accepted properties.

### Uploading roles
To upload roles, you need a `fauna/roles` directory containing a `.js` file for each of your roles. These files describe the role and look like the following example.

```js
import { query as q } from "faunadb";
import onlyDeleteByOwner from "../predicates/onlyDeleteByOwner";

export default {
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

### Uploading indexes
To upload indexes, you need a `fauna/indexes` directory containing a `.js` file for each of your indexes. These files describe the index and look like the following example.

```js
import { query as q } from "faunadb";

export default {
  name: "people_sort_by_age_asc",
  source: q.Collection("People"),
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
import { query as q } from "faunadb";

export default q.Query(
  q.Lambda(
    "ref",
    q.Equals(q.CurrentIdentity(), q.Select(["data", "user"], q.Get(q.Var("ref"))))
  )
);
```

### Uploading data
To upload data, you need a `fauna/data` directory containing a `.js` file for each of your data definition sets. These files describe the data and look like the following example.

Data is idempotent, meaning multiple calls of the `fauna-gql` command will not yield duplicates. Documents that already exist (determined by the specified `key`) will be updated. This is why you must define a unique index and also specify which field to use for uniqueness with the `key` property.

```js
export default {
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

### Uploading access providers
To upload your access provider configuration, you need a `fauna/providers` directory containing `.ts`/`.js` files that hold your configuration information.

These files look like the following example:

```js
import { query as q } from "faunadb";

export default {
	name: "auth0",
	issuer: "https://<your-auth0-domain>.auth0.com",
	jwks_uri: "https://<your-auth0-domain>.auth0.com/.well-known/jwks.json",
	roles: [ q.Role("user") ]
}
```

The issuer domain can be found in your Auth0 dashboard, and the `jwks_uri` is simply that domain with `/.well-known/jwks.json` appended.

When uploading the access provider, an audience url will be logged to the console. This audience URL should be used in the *identifier* field when creating a new API in the Auth0 dashboard. Refer to [Setting up SSO authentication in Fauna with Auth0](https://fauna.com/blog/setting-up-sso-authentication-in-fauna-with-auth0#set-up-an-auth0-api) by [Brecht De Rooms](https://twitter.com/databrecht) for more in depth instructions.

### Typescript

This package supports type-checking and automatic compilation of typescript files. All you need to do is change the file extension to `.ts`.

```ts
import{ query as q } from "faunadb";
import { IFunctionResource } from "fauna-gql-upload";

export default {
  name: "current_user",
  body:
  q.Query(
    q.Lambda([], q.Let({ userRef: q.Identity() }, q.Select([], q.Get(q.Var("userRef")))))
  )
} as IFunctionResource;
```

#### Configuration file

`fauna-gql-upload` looks for a `tsconfig.json` file in the following order:

1. The file specified in `.fauna.json` under the `tsconfigPath` property.
2. The closest `tsconfig.json` to the current resource, ie. if you have a `tsconfig.json` in your functions directory, it will be used for your functions but not for other resources.
3. If the two previous checks return empty, the default compiler options will be used.


#### Incremental adoption
If you've already started a project using `.js` files, you can just add new files with the `.ts` extension and `fauna-gql-upload` will pick up both file extensions and treat them correctly.

### GraphQL code generation
`fauna-gql-upload` supports offers low-config GraphQL code generation.

All you need to do is to install the `graphql` package, like so:
```sh
yarn add graphql
```

Then, the simplest way to use code generation is to set the `codegen` property in `.fauna.json` to `true`. Like so:

```json
{
  "codegen": true
}
```

And then run your npm script:

```sh
yarn fauna
```

This would create a file at `generated/graphql.ts` containing your GraphQL types.

For a full list of `codegen` options, see the [config file section](#config-file) .

#### Plugins

One of the most useful features of the GraphQL Codegen package is the ability to extend its functionality, this is done through plugins. `fauna-gql-upload` has two of the most ubiquitous plugins installed by default, `typescript` and `typescript-operations`, making it slightly easier to install other plugins.

If you'd want to generate types and operations that can be used with React Apollo, you would install the `typescript-react-apollo` plugin, like so:

```sh
yarn add -D @graphql-codegen/typescript-react-apollo
```

and then adding it to the `.fauna.json` file, like so:

```json
{
	"codegen": {
		"plugins": "typescript-react-apollo"
	}
}
```

And that's it. The plugin should now work. Note that you do **NOT** need to install the `typescript` and `typescript-operations` plugins since, as mentioned earlier, these are installed by default.

For a list of available plugins see the [GraphQL Codegen documentation](https://graphql-code-generator.com/docs/plugins/index).

#### Configuring plugins

There are two ways of passing options to your plugins.

The first way is through the `codegen.pluginOptions` property in `.fauna.json`. Adding options here will pass them to *all* of the configured plugins, including the default `typescript` and `typescript-operations` plugins. It would look like this:

```JSON
{
	"codegen": {
		"pluginOptions": {
			"omitOperationSuffix": true
		}
	}
}
```

The above method is useful when you want to configure many plugins that use the same options. If you instead want to apply options to a single plugin, you can pass an array to the `codegen.plugins` property with the name of the plugin and the desired options. Like this:

```JSON
{
	"codegen": {
		"plugins": [
			["typescript-react-apollo", {
				"withHooks": false
			}]
		]
	}
}
```

If you pass the same option to both the `pluginOptions` and the local plugin options, the local plugin options will take precedence.

You find the plugin options under each specific plugin in the [GraphQL codegen documentation](https://graphql-code-generator.com/docs/plugins/index)

## Problems or issues

If you have any problems using the package or believe to have encountered any bugs, please [create an issue](https://github.com/Plazide/fauna-gql-upload/issues/new).

## Get in touch
If you want to get in touch with me, feel free to reach out to me on Twitter([@chj_web](https://twitter.com/chj_web)).
