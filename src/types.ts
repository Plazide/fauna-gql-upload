export enum UploadStatus {
  Created = 'created',
  Updated = 'updated',
  Failed = 'failed',
}

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
  secretEnv?: string;
  schemaPath?: string;
  fnsDir?: string;
  rolesDir?: string;
  indexesDir?: string;
}
