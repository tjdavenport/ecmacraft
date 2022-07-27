import fs from 'fs';
import path from 'path';
import fsp from 'fs/promises';
import express from 'express';
import handler from './handler.mjs';
import {downloadPaper, jargex} from '../papermc.mjs';

const system = ({
  PAPERMC_DIR = ''
}) => {
  const router = express.Router();

  router.get('/status', handler(async (req, res, next) => {
    const filenames = await fsp.readdir(PAPERMC_DIR);
    const jarName = filenames.find(name => name.match(jargex));

    return res.json({
      eulaAgreed: filenames.includes('eula.txt'),
      jarMatch: jarName?.match(jargex),
    });
  }));

  router.post('/eula', handler(async (req, res, next) => {
    try {
      await fsp.stat(path.join(PAPERMC_DIR, 'eula.txt'));
      await fsp.rm(path.join(PAPERMC_DIR, 'eula.txt'));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        return next(error);
      }
    }

    const eula = fs.createWriteStream(path.join(PAPERMC_DIR, 'eula.txt'));
    eula.write('eula=true');
    eula.close();
    return res.json({success: true});
  }));

  router.post('/install', handler(async (req, res, next) => {
    try {
      const filenames = await fsp.readdir(PAPERMC_DIR);
      const existingJarName = filenames.find(name => name.match(jargex));

      if (existingJarName) {
        await fsp.rm(path.join(PAPERMC_DIR, existingJarName));
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        return next(error);
      }
    }

    const [jarName] = req.query.uri.match(jargex);
    await downloadPaper(req.query.uri, path.join(PAPERMC_DIR, jarName));
    return res.json({success: true});
  }));

  return router;
};


export default system;
