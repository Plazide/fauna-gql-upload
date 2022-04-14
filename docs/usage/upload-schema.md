# Upload schema

To upload your schema, it has to be placed at `fauna/schema.gql` or the path specified in `.fauna.json`. It also needs to be valid, otherwise you would get back an error. For more information on writing a GraphQL schema for FaunaDB, see the [official documentation](https://docs.fauna.com/fauna/current/api/graphql/).

## Schema modes

There are three different schema import modes. 

1. **Merge**. creates missing collections, indexes, and functions. *This is the default*.
2. **Override**. This will delete all collections, indexes, and functions
3. **Replace**. This will replace metadata in collections, indexes, functions, and databases.

Read more about [schema import modes](https://docs.fauna.com/fauna/current/api/graphql/endpoints#modes).

Which import mode you want to use can be specified using the `--mode` option. Like so:

```bash
fgu --mode replace
```

## Overriding the schema
If you need to make schema changes that are not compatible with the previous versions of the schema, you might have to override it. This can be done by adding a `--mode` flag when running the command.

Like so:
```sh
fgu --mode override
```

Your npm script would then look like this:
```json
...
"scripts": {
  "fauna": "fgu",
  "fauna-override": "fgu --mode override",
}
...
```

and then run:
```sh
npm run fauna-override
```

Since overriding the schema removes all collections, functions, and indexes, you will be asked to confirm your intention. In certain situations though, you'd want to skip this confirmation, like in a CI/CD pipeline. Therefore, you can use the `-y` flag to override the prompt and go forward with the operation without questions.

It would look like this:
```sh
fgu --mode override -y
```

## Concatenating schema files

It is possible to separate the different parts of your schema into their own files. You could, for example, create a file called `queries.gql` that hold your query definitions and then create another file called `mutations.gql` that hold your mutation definitions. These files will then be concatenated into a single file before uploading the schema to Fauna.

You need to add the `schemaDir` option to your `.fauna.json` file to use this feature. This option must point to a directory containing one or more graphql schema definition files with either a `.gql` or `.graphql` extension.

When using the `schemaDir` option, the `schemaPath` option will be ignored. If neither of these are defined in `.fauna.json` the default `schemaPath` value will be used, which is `fauna/schema.gql`.

A config file containing a `schemaDir` option could look like this:

```json
{
  "schemaDir": "fauna/schema"
}
```

No other options need to be defined.

You can also use a command-line option to specify the `schemaDir`, like so:

```sh
fgu --schemaDir fauna/schema
```