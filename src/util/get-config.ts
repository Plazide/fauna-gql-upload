import path from 'path';
import fs from 'fs';
import { IConfig } from '../types';

const cwd = process.cwd();

const getConfig = (): IConfig =>
  JSON.parse(fs.readFileSync(path.join(cwd, '.fauna.json'), 'utf8'));

export default getConfig;
