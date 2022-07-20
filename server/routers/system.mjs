import fs from 'fs';
import path from 'path';
import fsp from 'fs/promises';
import express from 'express';
import config from '../config.mjs';
import handler from './handler.mjs';
import {downloadPaper} from '../papermc.mjs';

const router = express.Router();

router.get('/system/status', handler(async (req, res, next) => {
  const status = {};
  const files = await fsp.readdir(config.PAPERMC_DIR);

  return res.json({
    papermcDownloaded: files.includes('papermc.jar'),
    eulaAgreed: files.includes('eula.txt'),
  });
}));

router.post('/system/eula', handler(async (req, res, next) => {
  try {
    await fsp.stat(path.join(config.PAPERMC_DIR, 'eula.txt'));
    await fsp.rm(path.join(config.PAPERMC_DIR, 'eula.txt'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      return next(error);
    }
  }

  const eula = fs.createWriteStream(path.join(config.PAPERMC_DIR, 'eula.txt'));
  eula.write('eula=true');
  eula.close();
  return res.json({success: true});
}));

router.post('/system/install', handler(async (req, res, next) => {
  try {
    await fsp.stat(path.join(config.PAPERMC_DIR, 'papermc.jar'))
    await fsp.rm(path.join(config.PAPERMC_DIR, 'papermc.jar'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      return next(error);
    }
  }

  await downloadPaper(req.query.uri, path.join(config.PAPERMC_DIR, 'papermc.jar'));
  return res.json({success: true});
}));

export default router;
