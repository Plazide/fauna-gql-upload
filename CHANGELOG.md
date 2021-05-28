# Changelog

## 2.2.0 - June 2nd, 2021
### Added
- Support for adding credentials to data resources. See [Adding credentials to your data](https://github.com/Plazide/fauna-gql-upload#adding-credentials-to-your-data)

### Fixed
- Error when using `{ "type": "module" }` in `package.json`. Thanks to [@ry5n](https://github.com/ry5n) for reporting this in issue #30.

---

## 2.1.0 - April 5th, 2021
### Added
- Custom config path. You can now specify a custom config path using the `--config` command-line option.
- Support for command-line options. You can now use every option available in the config file as command-line options.

---

## 2.0.2 - March 19th, 2021
### Fixed
- Typo in README.md that suggested the default schema path was `models/schema.gql`, it is actually `fauna/schema.gql` or `fauna/schema.graphql`.

---

## 2.0.1 - March 15th, 2021

### Fixed
- `membership` property in `RoleResource` interface. It was defined as required, but is actually optional.

---

## 2.0.0 - March 15th, 2021

### Added
- Support for uploading [access providers](https://docs.fauna.com/fauna/current/security/external/access_provider). See [uploading access providers](https://github.com/Plazide/fauna-gql-upload#uploading-access-providers) section in readme for more information.
- Ability to import interfaces to help with writing resources when using Typescript. See [Typescript](https://github.com/Plazide/fauna-gql-upload#typescript) section in readme for an example of this.
- Low-config GraphQL code generation. See [GraphQL code generation](https://github.com/Plazide/fauna-gql-upload#graphql-code-generation) section in readme for more information.
- Support for custom GraphQL and API endpoints, enabling local development with [Fauna Dev](https://docs.fauna.com/fauna/current/integrations/dev). See [local development](https://github.com/Plazide/fauna-gql-upload#local-development) section in readme for more info.

### Changed
- Converted project to Typescript
- Look of logging output
- The default environment variable for the secret key to `FGU_SECRET`

### Removed
- Support for global installations. You must now install the package locally and add an npm script.

### Fixed
- A few bugs

---

## 1.9.3 - December 22nd, 2020

### Fixed
- Error that prevented Typescript resources from being uploaded. Thanks to [@seanconnollydev](https://github.com/seanconnollydev) for fixing this in PR #16.

## 1.9.2 - December 6th, 2020

### Fixed
- Error when not having Typescript installed in the project directory.
- Error when having non `.js` or `.ts` files in resource directory. Thanks to [@naotone](https://github.com/naotone) for fixing this in PR #15.

---

## 1.9.1 - November 24th, 2020

### Fixed
- Problem with Typescript when using NextJS. We didn't support the `export default` syntax when exporting from resource files. This proved to be a problem when using default Typescript options in NextJS since the `export = {}` syntax threw errors. Thanks to [@seanconnollydev](https://github.com/seanconnollydev) for extending the supported export syntax.
- Typescript not using the closest `tsconfig.json` file. You were supposed to be able to create a seperate `tsconfig.json` file for each resource type by simply placing it in the resource directory. This did not work since typescript started looking for a config file in the working directory and therefore ignoring all the resource directories.

---

## 1.9.0 - November 23rd, 2020

### Added
- Changelog.

- GitHub releases. As per request by [@cheap-glitch](https://github.com/cheap-glitch) in issue #11, all new NPM releases will be accompanied by a GitHub release.

- Support for typescript resource files. All files with a `.ts` extension are typechecked and compiled using the closest `tsconfig.json` file. More info under [typescript](https://github.com/Plazide/fauna-gql-upload#typescript) in readme.

- Support for asynchronous resources. Thanks to [@cheap-glitch](https://github.com/cheap-glitch).

- `fgu` as alias to `fauna-gql`.

### Fixed
- Optional config file. Previously, the command would fail when no `.fauna.json` file existed in the project. This was not the intended behaviour. Again, thanks to [@cheap-glitch](https://github.com/cheap-glitch).

- Error message is now shown when the a schema doesn't exist at the provided path.

- Default schema path is now the same as specified in readme. Previously, the default schema path was `models/schema.gql` while the readme specified `fauna/schema.gql`. Since users were previously required to use a `.fauna.json` file to set the schema path, the actual default path was never used. Therefore, I do not consider this a breaking change.

- Invalid reference error when uploading function that uses custom role. If you created a custom role which was refrenced in a UDF, fauna would throw a invalid reference error because that role did not exist at the time it was referenced. This has been fixed by first creating functions with an empty role property, and then updating the functions after the roles have been created.

---