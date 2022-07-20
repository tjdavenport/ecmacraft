import fs from 'fs';
import fsp from 'fs/promises';
import {pipeline} from 'stream/promises';

export const downloadPaper = async (uri = '', dest = '') => pipeline(
  (await fetch(`https://papermc.io/api/v2/projects/paper${uri}`)).body,
  fs.createWriteStream(dest)
);
