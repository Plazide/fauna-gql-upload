> **Important note:** The minimum supported node version is v12.10.0 

# Fauna GQL Upload
Fauna GQL Upload is a simple CLI to update your [FaunaDB](https://fauna.com) database's GraphQL schema, resolver functions, indexes, and database roles without going to the FaunaDB dashboard. It uses the `https://graphql.fauna.com/import` endpoint to update the schema from a file within your project, and the FQL driver for JavaScript to update/create functions, roles, and indexes.

Read the [documentation](https://fgu-docs.com) to get started!

## Table of contents
- [Fauna GQL Upload](#fauna-gql-upload)
	- [Table of contents](#table-of-contents)
	- [Main features](#main-features)
	- [Installation](#installation)
	- [Documentation](#documentation)
	- [Migrating to v2.0.0](#migrating-to-v200)
		- [No more global installs](#no-more-global-installs)
		- [You need a local installation of `faunadb`](#you-need-a-local-installation-of-faunadb)
		- [You might need `faunadb@>=4.0.0`](#you-might-need-faunadb400)
		- [Changing the secret environment variable](#changing-the-secret-environment-variable)

## Main features
- 🗄️ Store all your User-defined functions, roles, indexes, and domain data within your project.
- 📜 Update your schema and other resources without leaving your editor.
- 🔃 Easily replicate FaunaDB resources across databases and accounts.
- 📑 Include FaunaDB resources in version control and source code.
- ✔️ Typescript support.
- 🔥 GraphQL codegen (using [GraphQL codegen](https://graphql-code-generator.com/)).

> **NOTE:** If you want to use this package with typescript, you do **not** need to build the resources manually. As of version 1.9.0, type-checking and typescript compilation is handled automatically without extra configuration. Read more about [typescript support](#typescript).

## Installation

To install, run:

```sh
npm install --save-dev faunadb fauna-gql-upload
```

or with yarn:

```sh
yarn add -D faunadb fauna-gql-upload
```

## Documentation

To view the documentation, visit the new [documentation site](https://fgu-docs.com).

## Migrating to v2.0.0
Version `2.0.0` hasn't introduced too many breaking changes, so migration should be fairly simple. Here are the changes that might cause issues.

### No more global installs
Fauna GQL Upload previously supported global installation to be used as a CLI. Support for global installations has been removed. If you have a previous global installation, I suggest removing that from your system. To continue using the package, you'll simply have to follow the [getting started section](https://fgu-docs.com/getting-started) in the documentation.

### You need a local installation of `faunadb`
It was previously possible to use Fauna GQL Upload without a local `faunadb` installation. This is no longer possible, the package now relies solely on the `faunadb` version that you install.

### You might need `faunadb@>=4.0.0`
It is still possible to upload resources with versions before `4.0.0`, but if you are configuring access providers in your project, you will have to use `faunadb@>=4.0.0` since that's when the `AccessProvider` and `CreateAccessProvider` functions were added.

The version of `faunadb` specified in `peerDependencies` is `>=4.0.0`, but if you won't be using access providers you should still be able to install older versions. You'll just have to ignore the "incorrect peer depencency" warnings.

### Changing the secret environment variable
The default environment variable for your FaunaDB admin key used to be `FAUNADB_SECRET`. This has now changed to `FGU_SECRET`.

If you have previously used the default environment variable you now need to either:

- Rename `FAUNADB_SECRET` to `FGU_SECRET` in your environment file
- Or set the `secretEnv` property in `.fauna.json` to `FAUNADB_SECRET` 
