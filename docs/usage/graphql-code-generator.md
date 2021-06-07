# GraphQL code generator

Fauna GQL Upload supports offers low-config GraphQL code generation.

All you need to do is to install the `graphql` package, like so:
```sh
yarn add graphql
```

Then, the simplest way to use code generation is to set the `codegen` property in `.fauna.json` to `true`. Like so:

```js
{
  "codegen": true
}
```

And then run your npm script:

```sh
yarn fauna
```

This would create a file at `generated/graphql.ts` containing your GraphQL types.

For a full list of `codegen` options, see the [config file section](/configuration/config-file).

## Plugins

One of the most useful features of the GraphQL Codegen package is the ability to extend its functionality, this is done through plugins. Fauna GQL Upload has two of the most ubiquitous plugins installed by default, `typescript` and `typescript-operations`, making it slightly easier to install other plugins.

If you'd want to generate types and operations that can be used with React Apollo, you would install the `typescript-react-apollo` plugin, like so:

```sh
yarn add -D @graphql-codegen/typescript-react-apollo
```

and then adding it to the `.fauna.json` file, like so:

```js
{
  "codegen": {
    "plugins": "typescript-react-apollo"
  }
}
```

And that's it. The plugin should now work. Note that you do **NOT** need to install the `typescript` and `typescript-operations` plugins since, as mentioned earlier, these are installed by default.

For a list of available plugins see the [GraphQL Codegen documentation](https://graphql-code-generator.com/docs/plugins/index).

## Configuring plugins

There are two ways of passing options to your plugins.

The first way is through the `codegen.pluginOptions` property in `.fauna.json`. Adding options here will pass them to *all* of the configured plugins, including the default `typescript` and `typescript-operations` plugins. It would look like this:

```js
{
  "codegen": {
    "pluginOptions": {
      "omitOperationSuffix": true
    }
  }
}
```

The above method is useful when you want to configure many plugins that use the same options. If you instead want to apply options to a single plugin, you can pass an array to the `codegen.plugins` property with the name of the plugin and the desired options. Like this:

```js
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