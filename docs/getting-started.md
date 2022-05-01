# 🏹 Getting started

## Initialize Fauna GQL Upload

It is possible, as of version 2.5.0, to run an initialization command that, based on a few questions, creates the desired folders and configuration files. Simply run: 

```sh
yarn fgu init
```

or 

```sh
npx fgu init
```

and answer the questions that are presented. This will create the folders you need and create a config file with the correct options. If you don't want to answer the questions and you're happy with the defaults, simply add the `-y` flag to the command. Like so:

```sh
yarn fgu init -y
```

You could, of course, completely ignore the init command and create the folders and configuration files yourself. The init command could be a good way to familiarize yourself with the folder structure.

> **NOTE:** This command creates placeholder resources. Remember to edit or delete these before uploading.

## Manual setup

### Installation

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

### Adding npm script

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

### Files and directories

For the command to work properly, you need to have certain information in your project.

- You need a `.env` file with a variable called `FGU_SECRET`. This should be an admin key for your database. ***This is required*** 
- To upload a schema, you need a valid schema file. This file should be located at `fauna/schema.gql` relative to the working directory where the command is executed. See [Uploading schema](/usage/upload-schema) for more info. It is also possible to create a *folder* called `schema` and divide your schema into multiple files that will be automatically concatenated before upload.
- To upload functions, you need a directory called `fauna/functions`. Within this directory, you should have one `.js`/`.ts` file for each of your functions. See [Uploading Functions](/usage/upload-functions) for an example of such a file.
- To upload roles, you need a directory called `fauna/roles`. Within this directory, you should have one `.js`/`.ts` file for each of your roles. See [Uploading Roles](/usage/upload-roles) for an example of such a file.
- To upload indexes, you need a directory called `fauna/indexes`. Within this directory, you should have one `.js`/`.ts` file for each of your indexes. See [Uploading indexes](/usage/upload-indexes) for an example of such a file.
- To upload domain data, you need a directory called `fauna/data`. Within this directory, you should have one `.js`/`.ts` file for each of your data sets. See [Uploading data](/usage/upload-data) for an example of such a file.
- To upload access providers, you need a directory called `fauna/providers`. Within this directory, you should have one `.js`/`.ts` file for each of your providers. See [Uploading access providers](/usage/upload-access-providers) for an example of such a file.

## Usage

To upload your resources, simply run the previously configured command. For example, if your npm script is called `fauna` run the following.

with npm:
```sh
npm run fauna
```

with yarn:
```sh
yarn fauna
```