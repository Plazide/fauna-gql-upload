# Changelog

## 1.9.1 - November 24th, 2020

### Fixed
- Problem with Typescript when using NextJS. We didn't support the `export default` syntax when exporting from resource files. This proved to be a problem when using default Typescript options in NextJS since the `export = {}` syntax threw errors. Thanks to [@seanconnollydev](https://github.com/seanconnollydev) for extending the supported export syntax.

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