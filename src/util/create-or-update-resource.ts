import { query as q } from 'faunadb';
import { CreatedUpdatedStatus, FaunaResource, IResource } from '../types';
import client from './client';
import displayErrors from './display-errors';

const resourceMap = {
  [FaunaResource.Function]: {
    Ref: q.Function,
    Create: q.CreateFunction,
  },
  [FaunaResource.Role]: {
    Ref: q.Role,
    Create: q.CreateRole,
  },
  [FaunaResource.Index]: {
    Ref: q.Index,
    Create: q.CreateIndex,
  },
};

// Create or update a function. Returns the action that was taken.
async function createOrUpdateResource(
  resource: FaunaResource,
  obj: IResource
): Promise<CreatedUpdatedStatus> {
  try {
    return await client.query<CreatedUpdatedStatus>(
      q.Let(
        {
          exists: q.Exists(resourceMap[resource].Ref(obj.name)),
        },
        q.Do(
          q.If(
            q.Var('exists'),
            q.Update(resourceMap[resource].Ref(obj.name), obj),
            resourceMap[resource].Create(obj)
          ),
          q.If(q.Var('exists'), 'updated', 'created')
        )
      )
    );
  } catch (err) {
    displayErrors(err, obj, resource);

    return 'failed';
  }
}

export default createOrUpdateResource;
