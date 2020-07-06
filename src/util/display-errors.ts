import { errors } from 'faunadb';
import { FaunaResource, IResource } from '../types';
import FaunaHTTPError = errors.FaunaHTTPError;

const displayErrors = (
  err: FaunaHTTPError,
  resource: IResource,
  type: FaunaResource
): void => {
  const response = JSON.parse(err.requestResult.responseRaw);
  const errors = response.errors;

  console.group('Error creating', type, resource.name);
  for (const error of errors) {
    const failures = error.failures;
    console.log(`${error.code}: ${error.description}`);
    if (failures) {
      console.group('Failures');
      for (const fail of failures) {
        console.log(`${fail.code}: ${fail.description}`);
        console.log(`field: ${fail.field}`);
      }
      console.groupEnd();
    }
  }
  console.groupEnd();
};

export default displayErrors;
