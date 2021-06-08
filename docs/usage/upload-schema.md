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