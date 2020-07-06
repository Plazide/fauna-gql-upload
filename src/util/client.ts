import { config } from 'dotenv';
config();

import fauna from 'faunadb';
import nodeFetch from 'node-fetch';
import secret from './secret';

const client = new fauna.Client({
  secret: secret as string,
  fetch: nodeFetch as never,
});

export default client;
