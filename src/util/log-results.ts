import { FaunaResource } from '../types';

interface ILogResults {
  type: FaunaResource; // The type that was processed, can be `functions`, `roles`, or `indexes`
  numFailed: number; // The amount of entries that failed.
  numUpdated: number; // The amount of entries that were updated.
  numCreated: number; // The amount of entries that were created.
}

// Log the results of a upload operation.
const logResults = ({
  type,
  numUpdated,
  numCreated,
  numFailed,
}: ILogResults): void => {
  console.group(`✔️  Finished uploading ${type}.`);

  if (numCreated > 0) console.log('Created', numCreated, type);

  if (numUpdated > 0) console.log('Updated', numUpdated, type);

  if (numFailed > 0) console.warn('Failed with', numFailed, type);

  console.log();
  console.groupEnd();
};

export default logResults;
