import path from 'path';

const fixturesDir = path.join(process.cwd(), 'test', 'fixtures');

export const config = {
  PAPERMC_DIR: path.join(fixturesDir, 'papermc'),
};
