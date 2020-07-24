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

    return {
      type: resourceType,
      numCreated,
      numUpdated,
      numFailed,
    };
  } catch (err) {
    throw err; // exception caught locally
  }
};

interface IUploadStats {
  type: FaunaResource;
  numCreated: number;
  numUpdated: number;
  numFailed: number;
}

const uploadResources = async (
  resourceType: FaunaResource,
  dir: string
): Promise<IUploadStats> => {
  try {
    const files = await fs.promises.readdir(dir);
    const resourceFiles = files
      .sort()
      .map((file) => {
        try {
          return require(path.join(cwd, dir, file));
        } catch (err) {
          console.error('✗  Could not read', file);

          return null;
        }
      })
      .filter((value) => value !== null);

    return await setResources(resourceType, resourceFiles);
  } catch (e) {
    console.log(`Could not read ${resourceType} directory...`);
    console.log(`✗  Ignoring ${resourceType}`);
    return {
      type: resourceType,
      numCreated: 0,
      numUpdated: 0,
      numFailed: 0,
    };
  }
};

export default uploadResources;
