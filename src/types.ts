export type CreatedUpdatedStatus = 'created' | 'updated' | 'failed';

export enum FaunaResource {
  Function = 'functions',
  Role = 'roles',
  Index = 'indexes',
}

export interface IResource {
  name: string;
  [rest: string]: unknown;
}

export interface IConfig {
  schemaPath?: string;
  fnsDir?: string;
  rolesDir?: string;
  indexesDir?: string;
}
