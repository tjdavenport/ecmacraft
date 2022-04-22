import fs from 'fs';
import path from 'path';
import cors from 'cors';
import assert from 'assert';
import express from 'express';
import bodyParser from 'body-parser';
import config from '../server/config.mjs';
import system from '../server/routers/system.mjs';

const fixturesDir = path.join(process.cwd(), 'test', 'fixtures');
const fetchSystem = (uri = '', opts = {}) => fetch(`http://localhost:1337/system${uri}`, opts);

describe('server routers', () => {
  const cache = {};

  before(done => {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());
    app.use(system);
    config.PAPERMC_DIR = path.join(fixturesDir, 'papermc');
    fs.mkdirSync(path.join(fixturesDir, 'papermc'));
    cache.server = app.listen(1337, () => done());
  });

  it('defines endpoints system operations', async function() {
    this.timeout(60000 * 5);
    await fetchSystem('/status')
      .then(res => res.json())
      .then(system => assert(system.papermcDownloaded === false));

    await fetchSystem('/install/1.18.1/215', {method: 'POST'});
    await fetchSystem('/status')
      .then(res => res.json())
      .then(system => {
        assert(system.papermcDownloaded === true);
        assert(system.eulaAgreed === false);
      });

    await fetchSystem('/eula', {method: 'POST'});
    await fetchSystem('/status')
      .then(res => res.json())
      .then(system => {
        assert(system.papermcDownloaded === true);
        assert(system.eulaAgreed === true);
      });
  });

  after(() => {
    fs.rmSync(path.join(fixturesDir, 'papermc'), {recursive: true});
    return cache.server.close();
  });
});
