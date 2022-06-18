# 💡 Contributing

If you want to make changes to Fauna GQL Upload, this is the place to be. You'll find guides for local development and testing below. While these aren't extensive, they should give you an idea of how to get started.

## Areas where help is needed

There are a few areas where your help would be extra appreciated. These are listed below:

 - Testing. The current test suite is lacking and needs to be improved.
 - Documentation. The current documentation works, but there is room for improvement. This includes:
	- Creating a better design
	- Implementing search
	- Implementing versioning
	- Improving overall quality of content
- Examples. There should be simple example projects inside the repo.

If you want to help out with any of these areas, [send me an email](mailto:carl@chjweb.se), send me a DM on [Twitter](https://twitter.com/chj_web), or open an issue to start a discussion.

## Local development

First thing to do is to `git clone` the repo. Like this:

```sh
git clone https://github.com/Plazide/fauna-gql-upload
```

You should then move into the created directory and create a new branch where your changes will live.

```sh
git checkout -b <new-feature>
```

Now install the dependencies:

```sh
yarn install
```

Since Fauna GQL Upload is written in Typescript, we need to build the code before it'll run. During development, we can use the following command to build new changes as they happen:

```sh
yarn watch
```

You are now ready to start developing.

## Manual testing

To actually test your changes, you need to create a new directory and link your local version of Fauna GQL Upload to it. To do this, first run the following command in your local Fauna GQL Upload project:

```sh
yarn link
```

Then run the following command in the project you use for testing:

```sh
yarn link fauna-gql-upload
```

You can now create resources and start testing your changes.

> **NOTE**: To get up and running quickly with your testing project, you can run the commands above and then run `yarn fgu init` to create placeholder resources.

### Other notes

#### Using local version of FaunaDB

To test things properly, you need a FaunaDB instance to test against. The simplest way to use FaunaDB is by using the cloud instances. If you are running a lot of tests with large amounts resources, it is possible that you could incur charges. To avoid this, it is possible to install a development version of FaunaDB locally using Docker.

Read about how to [set up Fauna GQL Upload with Fauna Dev](https://blog.chjweb.se/set-up-fauna-gql-upload-with-fauna-dev).

#### Other means of installation

It is possible that the linking method doesn't work for some features. When you notice that the test project starts throwing errors that it shouldn't, try installing Fauna GQL Upload like you normally would but with the path to your local project. Like this:

```sh
yarn add -D /path/to/your/local/project
```

Unfortunately, when doing this, you will need to re-install the package after every change you make to the code.

## Automatic tests

The test suite for Fauna GQL Upload is very limited right now (we only have 3 tests). Regardless, it is still a good idea to run these tests before committing. To run tests, you need to first copy the contents of `.env.test-example` to `.env.test`, like so:

```sh
cp .env.test-example .env.test
```

Replace the placeholder values with your own.

You can then run the tests using:

```sh
yarn test
```

Please consider adding tests for any features that you might add.

## Documentation

It is sometimes necessary to add or edit the documentation after making changes to the code. You can do this by going into the `/docs` folder.

It is not necessary, but once you've made your changes, you can run `yarn mkdocs` to build and inspect the documentation. This requires [Python](https://www.python.org/) and the [mkdocs CLI](https://www.mkdocs.org/getting-started/).