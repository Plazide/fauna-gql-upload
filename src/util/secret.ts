// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import getConfig from './get-config';
const config = getConfig();

const defaultSecret = 'FAUNADB_SECRET';
const { secretEnv = defaultSecret } = config;
const secret = process.env[secretEnv];

if (!secret) {
  throw new Error(`Missing ${secretEnv} env in .env file`);
}

export default secret;
