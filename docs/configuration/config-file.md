# Config file

If you need to customize paths or set a different environment variable name for your secret key, you can create a configuration file called `.fauna.json` in your project root. The name of this file can be customized using the `--config` command-line option (see [Command-line options](/configuration/command-line-options) for more info).

It takes the following properties:

|Property|Default|Description|
|--------|-------|-------|
|`schemaPath`|`fauna/schema.gql`|Path to your GraphQL schema.
|`secretEnv`|`FGU_SECRET`|The key used to access your FaunaDB database.
|`region`|Whichever endpoint works with the provided secret|Specify the region group that your database belongs to. Possible values are: `eu`, `us`, `classic`, `preview` and `local`.
|`mode`|`merge`|Specify the schema upload mode. Possible values are: `merge`, `override` and `replace`
|`apiEndpointEnv`|`FGU_API_ENDPOINT`|Environment variable for custom api endpoint, useful for local development
|`graphqlEndpointEnv`|`FGU_GRAPHQL_ENDPOINT`|Environment variable for custom graphql endpoint, useful for local development
|`tsconfigPath`|`tsconfig.json`|Path to a `tsconfig.json` file.
|`envPath`|`.env`|Path to the environment file that holds your `secretEnv`
|`fnsDir`|`fauna/functions`|Path to directory that holds your FQL UDFs.
|`indexesDir`|`fauna/indexes`|Path to directory that holds your FaunaDB indexes
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