#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import path from 'path';
import yargs from 'yargs';
import { FaunaResource } from './types';
import getConfig from './util/get-config';
import uploadSchema from './lib/schema';
import uploadResource from './lib/resources';

const argv = yargs
  .option('override', {
    alias: 'o',
    description:
      'Override the schema, this will delete all your data in the database.',
    type: 'boolean',
  })
  .option('yes', {
    alias: 'y',
    description: 'Answer yes to all potential prompts.',
    type: 'boolean',
  }).argv;

const config = getConfig();

const defaultRolesDir = path.join('fauna', 'roles');
const defaultFnsDir = path.join('fauna', 'functions');
const defaultIndexesDir = path.join('fauna', 'indexes');

const {
  schemaPath = './models/schema.gql',
  fnsDir = defaultFnsDir,
  rolesDir = defaultRolesDir,
  indexesDir = defaultIndexesDir,
} = config;

(async () => {
  // Upload schema
  await uploadSchema(schemaPath, argv.override);
  console.log();

  // Upload indexes
  await uploadResource(FaunaResource.Index, indexesDir);

  // Upload functions
  await uploadResource(FaunaResource.Function, fnsDir);

  // Upload roles
  await uploadResource(FaunaResource.Role, rolesDir);
})();
