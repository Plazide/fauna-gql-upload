# 🏹 Getting started

## Installation

Fauna GQL Upload needs a local installation of `faunadb`. That means you need to install both `fauna-gql-upload` and `faunadb`.

With npm:
```sh
npm install --save-dev fauna-gql-upload faunadb
```

With yarn:
```sh
yarn add -D fauna-gql-upload faunadb
```

> **NOTE:** You do not need to install `faunadb` as a development dependency. You could also install it normally if you use it as part of your frontend or in other backend code.

## Adding npm script

You will need to add an npm script to the command.

Package.json:
```js
...
"scripts": {
  "fauna": "fgu" // you can use 'fgu' or 'fauna-gql'
}
...
```

Running it:
```sh
npm run fauna
```

or:

```sh
yarn fauna
```

## Files and directories

For the command to work properly, you need to have certain information in your project.

- You need a `.env` file with a variable called `FGU_SECRET`. This should be an admin key for your database. ***This is required*** 
- You need a valid schema file to upload. This file should be located at `fauna/schema.gql` relative to the working directory where the command is executed. See [Uploading schema](/usage/upload-schema) for more info. ***This is required*** 
- To upload functions, you need a directory called `fauna/functions`. Within this directory, you should have one `.js`/`.ts` file for each of your functions. See [Uploading Functions](/usage/upload-functions) for an example of such a file.
- To upload roles, you need a directory called `fauna/roles`. Within this directory, you should have one `.js`/`.ts` file for each of your roles. See [Uploading Roles](/usage/upload-roles) for an example of such a file.
- To upload indexes, you need a directory called `fauna/indexes`. Within this directory, you should have one `.js`/`.ts` file for each of your indexes. See [Uploading indexes](/usage/upload-indexes) for an example of such a file.
- To upload domain data, you need a directory called `fauna/data`. Within this directory, you should have one `.js`/`.ts` file for each of your data sets. See [Uploading data](/usage/upload-data) for an example of such a file.
- To upload access providers, you need a directory called `fauna/providers`. Within this directory, you should have one `.js`/`.ts` file for each of your providers. See [Uploading access providers](/usage/upload-access-providers) for an example of such a file.

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

> **NOTE:** As you will notice, all of the resource examples below are using import/export syntax. This is not supported in node by default, but Fauna GQL Upload builds all of your resources using [esbuild](https://esbuild.github.io/) which makes this syntax work without extra configuration on your part.