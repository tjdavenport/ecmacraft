import fs from 'fs';
import cors from 'cors';
import assert from 'assert';
import test from 'node:test';
import express from 'express';
import {config} from './util.mjs';
import bodyParser from 'body-parser';
import systemRouter from '../server/routers/system.mjs';

const makeApp = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  return app;
};

test('server routers', async t => {
  await t.test('defines endpoints for system operations', async () => {
    const fetchSystem = (uri = '', opts = {}) => fetch(`http://localhost:1337${uri}`, opts);
    const buildUri = '%2Fversions%2F1.19%2Fbuilds%2F68%2Fpaper-1.19-68.jar';
    const app = makeApp();

    app.use(systemRouter(config));
    fs.mkdirSync(config.PAPERMC_DIR);

    const server = await new Promise(resolve => {
      const http = app.listen(1337, () => resolve(http));
    });

    await fetchSystem('/status')
      .then(res => res.json())
      .then(system => assert(!system.jarMatch));
    await fetchSystem(`/install?uri=${buildUri}`, {method: 'POST'});
    await fetchSystem('/status')
      .then(res => res.json())
      .then(system => {
        assert(system.jarMatch.toString() === [
          'paper-1.19-68.jar', '1.19', '68'
        ].toString());
        assert(system.eulaAgreed === false);
      });
    await fetchSystem('/eula', {method: 'POST'});
    await fetchSystem('/status')
      .then(res => res.json())
      .then(system => {
        assert(system.jarMatch.toString() === [
          'paper-1.19-68.jar', '1.19', '68'
        ].toString());
        assert(system.eulaAgreed === true);
      });

    fs.rmSync(config.PAPERMC_DIR, {recursive: true});
    server.close();
  });
});
