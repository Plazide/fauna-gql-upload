# Local development

The default endpoints in Fauna GQL Upload do not work when developing locally using the [Fauna Dev](https://docs.fauna.com/fauna/current/integrations/dev) docker image. To solve this, you can set two environment variables, `FGU_API_ENDPOINT` and `FGU_GRAPHQL_ENDPOINT`, to your local endpoints.

The names of these variables can be customized using the `apiEndpointEnv` and `graphqlEndpointEnv` options.

For a full guide on how to setup Fauna Dev with Fauna GQL Upload, see [Set up Fauna GQL Upload with Fauna Dev](https://blog.chjweb.se/set-up-fauna-gql-upload-with-fauna-dev).