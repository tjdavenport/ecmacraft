import path from 'path';
import fs from 'fs/promises';
import {randomUUID} from 'crypto';

const fixturesDir = path.join(process.cwd(), 'test', 'fixtures');

export const fixtured = test => async () => {
  const dir = path.join(fixturesDir, randomUUID());
  await fs.mkdir(dir);
  await test(dir);
  await fs.rm(dir, {recursive: true});
};
