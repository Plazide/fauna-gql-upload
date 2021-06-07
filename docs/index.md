# Introduction

Fauna GQL Upload is a simple CLI to update your database's GraphQL schema, resolver functions, indexes, and database roles without going to the FaunaDB dashboard. It uses the `https://graphql.fauna.com/import` endpoint to update the schema from a file within your project, and the FQL driver for JavaScript to update/create functions, roles, and indexes.

It was initially built to just upload the GraphQL schema, but has since evolved to become more comprehensive. You can now upload UDFs (User-defined functions), roles, indexes, domain data, and access providers. It also integrates with [GraphQL code generator](https://www.graphql-code-generator.com/) to easily generate types based on your schema. 

I hope you will find it useful!

## Get started

Go to the [Getting started section](/getting-started) to learn how to install and configure the Fauna GQL Upload!