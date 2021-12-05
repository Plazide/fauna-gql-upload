# Command-line options

The properties listed under [config file](/configuration/config-file) can also be specified as command-line options. You would use the name of the property in either camelCase, `fgu --secretEnv SECRET`, or kebab-case, `fgu --secret-env SECRET`.

The main use-cases for command-line options are to specify different config files or environment files.

To change the config file to be used, you would use something like this:

```sh
fgu --config fauna.prod.json
```

> **NOTE:** The config file still has to be in a JSON format.

To specify a different environment file, you would do something like this:

```sh
fgu --envPath .production.env
```

## Codegen

To use GraphQL codegen through command-line options, you need to first provide the `--codegen` option and then the desired options. All of the codegen options are prefixed with `codegen` followed by the name specified in the [config file table](/configuration/config-file).

The only options that are not the same as their config property counter-parts are the `--codegenDisableTypescript`, which corresponds to `codegen.typescript`, and `--codegenDisableOperations`, which corresponds to `codegen.operations`, options. These control default GraphQL codegen plugins which are enabled by default.

An example of usage with GraphQL codegen would be:
```sh
fgu --codegen --codegenPlugins typescript-urql --codegenPluginOptions '{ \"omitOperationSuffix\": true }'
```

> **NOTE:** It is not recommended to configure Fauna GQL Upload with command-line options, they only exist to provide flexibility. You would want to use a config file in most cases.

## Resources

You can specify which resource types to upload using the following command-line options:

|Option|Description|
|------|-----------|
|`--schema`|Upload the GraphQL schema|
|`--data`|Upload domain data|
|`--functions`|Upload functions|
|`--indexes`|Upload indexes|
|`--providers`|Upload access providers|
|`--roles`|Upload roles|
|`--ignore-all`|Ignore all resources

The `--ignore-all` option can be used in combination with `--codegen` to only generate GraphQL types and skip uploading resources.