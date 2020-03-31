# fauna-gql
fauna-gql is a simple CLI to update your database's GraphQL schema without going to the FaunaDB dashboard. It uses the `https://graphql.fauna.com/import` endpoint to update the schema from a file within your project.

## Install
You could install locally within your project:
```sh
npm install fauna-gql-upload
```

or, you could install is globally
```sh
npm install fauna-gql-upload -g
```

## Configuration
For the command to work properly, you need to have certain information in your project.

1. You need a `.env` file with a variable called `FAUNA_SECRET`
2. You need a valid schema file to upload. This file should be located at `./models/schema.gql` relative to the working directory where the command is executed.

If you want to use another env var name or another path for the schema, you could create a `.fauna.json` file. It takes the following properties:
```json
{
	"schemaPath": "./schema.gql",
	"secretEnv": "FAUNADB_SECRET"
}
```

These would now take precedent over the default values.

## Usage

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