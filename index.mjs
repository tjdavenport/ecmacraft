import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import config from './server/config.mjs';
import systemRouter from './server/routers/system.mjs';

config.PAPERMC_DIR = path.join(process.cwd(), 'papermc');

const app = express();

app.use(bodyParser.json());
app.use('/api', systemRouter);

app.listen(8080, () => console.info(`listening on 8080`));

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
