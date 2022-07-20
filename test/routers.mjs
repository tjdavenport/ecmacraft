import fs from 'fs';
import path from 'path';
import cors from 'cors';
import assert from 'assert';
import test from 'node:test';
import express from 'express';
import bodyParser from 'body-parser';
import config from '../server/config.mjs';
import systemRouter from '../server/routers/system.mjs';

const fixturesDir = path.join(process.cwd(), 'test', 'fixtures');
config.PAPERMC_DIR = path.join(fixturesDir, 'papermc');

const makeApp = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  return app;
};

test('server routers', async t => {
  await t.test('defines endpoints for system operations', async () => {
    const fetchSystem = (uri = '', opts = {}) => fetch(`http://localhost:1337/system${uri}`, opts);
    const buildUri = '%2Fversions%2F1.19%2Fbuilds%2F68%2Fpaper-1.19-68.jar';
    const app = makeApp();

    app.use(systemRouter);
    fs.mkdirSync(path.join(fixturesDir, 'papermc'));


    const afterListen = async () => {
      await fetchSystem('/status')
        .then(res => res.json())
        .then(system => assert(system.papermcDownloaded === false));
      await fetchSystem(`/install?uri=${buildUri}`, {method: 'POST'});
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

      fs.rmSync(path.join(fixturesDir, 'papermc'), {recursive: true});
      server.close();
    };

    const server = app.listen(1337, afterListen);

    return afterListen;
  });
});
