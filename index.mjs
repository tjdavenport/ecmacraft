import express from 'express';
import bodyParser from 'body-parser';
import expressStatic from 'express-static';
import systemRouter from './server/routers/system.mjs';

const app = express();

/*
const papermc = spawn('java', ['-Xms2G', '-Xmx2G', '-jar', './papermc.jar', '--nogui'], {
  cwd: './papermc'
});

papermc.stdout.on('data', data => {
  console.log(data.toString());
});

papermc.stderr.on('data', data => {
  console.log(data.toString());
});

papermc.on('close', code => {
  console.info(`papermc closed with code ${code}`);
});

papermc.on('error', error => console.error(error));*/
