import fs from 'fs';
import fsp from 'fs/promises';
import {spawn} from 'child_process';
import {pipeline} from 'stream/promises';

const ensurePaperMc = async () => {
  const fetchPaper = (uri = '') => fetch(`https://papermc.io/api/v2/projects/paper${uri}`);

  try {
    await fsp.stat('./papermc/papermc.jar');
    console.info('papermc exists');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.info('getting latest papermc version number');

      const versionsRes = await fetchPaper();
      const {versions} = await versionsRes.json();
      const version = versions.pop();

      console.info(`getting latest papermc ${version} build number`);

      const buildsRes = await fetchPaper(`/versions/${version}`);
      const {builds} = await buildsRes.json();
      const buildNum = builds.pop();

      console.info(`getting papermc ${version} build ${buildNum}`);

      const buildRes = await fetchPaper(`/versions/${version}/builds/${buildNum}`);
      const build = await buildRes.json();

      console.info(`downloading papermc ${version} build ${buildNum} sha256 ${build.downloads.application.sha256}`);

      await pipeline(
        (await fetchPaper(`/versions/${version}/builds/${buildNum}/downloads/${build.downloads.application.name}`)).body,
        fs.createWriteStream('./papermc/papermc.jar')
      );

    }
  }
};

const ensureEula = async () => {
  try {
    await fsp.stat('./papermc/eula.txt');
    console.info('eula exists');
  } catch (error) {
    const eula = fs.createWriteStream('./papermc/eula.txt');
    eula.write('eula=true');
    console.info('eula created');
  }
};


await ensureEula();
await ensurePaperMc();

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

papermc.on('error', error => console.error(error));
