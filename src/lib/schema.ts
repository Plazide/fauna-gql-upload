import fs from 'fs';
import path from 'path';
import fetch, { Response } from 'node-fetch';
import yargs from 'yargs';
import prompts from 'prompts';
import { Spinner } from 'cli-spinner';
import secret from '../util/secret';
import wait from '../util/wait';

// Override the prompt if user supplies '-y' or '--yes'
const defaultYes = yargs.argv.yes || yargs.argv.y;
prompts.override(defaultYes ? { shouldOverride: true } : {});

const uploadSchema = async (
  schemaPath: string,
  override = false
): Promise<void> => {
  const schema = path.join(process.cwd(), schemaPath);
  const data = fs.createReadStream(schema);
  const spinner = new Spinner('Overriding schema.. %s');

  const shouldOverride = override
    ? (
        await prompts({
          type: 'confirm',
          name: 'shouldOverride',
          message:
            'Be careful! Overriding a schema will delete all collections, indexes, and documents. Do you want to continue?',
        })
      ).shouldOverride
    : false;

  if (override && !shouldOverride) return;

  if (shouldOverride) {
    console.log();
    console.log('Okay, this could take a while. Sit tight...');
    spinner.start();
  }

  const endpoint = `https://graphql.fauna.com/import${
    shouldOverride ? '?mode=override' : '?mode=merge'
  }`;

  const res = (await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'text/plain',
    },
    body: data,
  }).catch(console.error)) as Response;

  const result = await res.text();

  if (shouldOverride) {
    console.log('Waiting 65 seconds before uploading resources.');
    await wait(65 * 1000);
    spinner.stop(true);
  }

  if (!res.ok) {
    console.error('Error:', result);
    console.log();
  }

  if (res.ok) {
    console.log('✔️  Successfully updated schema.');
  }
};

export default uploadSchema;
