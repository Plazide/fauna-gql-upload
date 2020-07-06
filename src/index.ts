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

const userConfig = getConfig();

const defaultConfig = {
  schemaPath: './models/schema.gql',
  fnsDir: path.join('./fauna', FaunaResource.Function),
  rolesDir: path.join('./fauna', FaunaResource.Role),
  indexesDir: path.join('./fauna', FaunaResource.Index),
};

const cfg = { ...defaultConfig, ...userConfig };

(async () => {
  // Upload schema
  await uploadSchema(cfg.schemaPath, argv.override);

  // Upload indexes
  await uploadResource(FaunaResource.Index, cfg.indexesDir);

  // Upload functions
  await uploadResource(FaunaResource.Function, cfg.fnsDir);

  // Upload roles
  await uploadResource(FaunaResource.Role, cfg.rolesDir);
})();
