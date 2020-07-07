import fs from 'fs';
import path from 'path';
import { FaunaResource, IResource, UploadStatus } from '../types';
import createOrUpdateResource from '../util/create-or-update-resource';
import logResults from '../util/log-results';

const cwd = process.cwd();

const setResources = async (
  resourceType: FaunaResource,
  objects: IResource[]
) => {
  try {
    let numCreated = 0;
    let numUpdated = 0;
    let numFailed = 0;

    for (const obj of objects) {
      try {
        const status = await createOrUpdateResource(resourceType, obj);

        switch (status) {
          case UploadStatus.Created:
            numCreated++;
            break;
          case UploadStatus.Updated:
            numUpdated++;
            break;
          case UploadStatus.Failed:
            numFailed++;
            break;
          default:
            break;
        }
      } catch (err) {
        throw err; // exception caught locally
      }
    }

    logResults({
      type: resourceType,
      numCreated,
      numUpdated,
      numFailed,
    });
  } catch (err) {
    throw err; // exception caught locally
  }
};

const uploadResources = async (
  resourceType: FaunaResource,
  dir: string
): Promise<void> => {
  fs.readdir(dir, async (err, files) => {
    if (err) {
      console.log(`Could not read ${resourceType} directory...`);
      console.log(`✗  Ignoring ${resourceType}`);

      return;
    }

    const resourceFiles = files
      .map((file) => {
        try {
          return require(path.join(cwd, dir, file));
        } catch (err) {
          console.error('✗  Could not read', file);

          return null;
        }
      })
      .filter((value) => value !== null);

    await setResources(resourceType, resourceFiles);
  });
};

export default uploadResources;
