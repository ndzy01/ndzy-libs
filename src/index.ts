import * as fs from 'fs';
import path from 'path';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';

const init = async (directory: string, idObj: { maxId: number }, baseUrl: string) => {
  const files = fs.readdirSync(directory);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await init(filePath, idObj, baseUrl); // 如果是目录，则递归调用
    } else {
      const fileType = file.substring(file.lastIndexOf('.') + 1);
      const arr = path.basename(filePath, path.extname(filePath)).split('_');

      if (fileType === 'mp3' || fileType === 'flac') {
        if (arr.length !== 2) {
          await axios.post(`${baseUrl}/music`, {name: 'test'});

          idObj.maxId++;
          const newPath = path.dirname(filePath) + `/${idObj.maxId}_${uuidv4()}.${fileType}`;
          fs.renameSync(filePath, newPath);
          fs.writeFileSync(path.dirname(filePath) + `/name.txt`, path.basename(filePath, path.extname(filePath)));
        }
      }
    }
  }
};

export const musicStartTask = async (directory: string, baseUrl: string,) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {recursive: true});
  }

  let maxId;
  const {
    data: {data},
  } = await axios(`${baseUrl}/music?sort=id%2CDESC&limit=1`);

  console.log('------ndzy------', data, '------ndzy------');

  if (data) {
    maxId = data[0].id;
  }

  if (data) {
    maxId = data[0].id;
  }

  await init(directory, {maxId}, baseUrl);

  fs.writeFileSync(`${directory}/version.json`, JSON.stringify({version: new Date().valueOf()}, null, 2));

  console.log('------ndzy------', '初始化成功', '------ndzy------');
};

const updateFiles = async (directory: string, name: string, baseUrl: string) => {
  const files = fs.readdirSync(directory);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await updateFiles(filePath, name, baseUrl); // 如果是目录，则递归调用
    } else {
      const fileType = file.substring(file.lastIndexOf('.') + 1);
      const [id, _] = path.basename(filePath, path.extname(filePath)).split('_');

      if (fileType === 'mp3' || fileType === 'flac') {
        const newPath = path.dirname(filePath) + `/${id}_${uuidv4()}.${fileType}`;
        fs.renameSync(filePath, newPath);
        const name = fs.readFileSync(path.dirname(filePath) + `/name.txt`, {encoding: 'utf-8'});

        await axios.patch(`${baseUrl}/music/${id}`, {
          url: `https://www.ndzy01.com/${name}/${path.relative(__dirname + '/resource/', newPath)}`,
          fileType,
          name,
        });
      }
    }
  }
};

export const musicUpdateFilesTask = async (directory: string, name: string, baseUrl: string) => {
  await updateFiles(directory, name, baseUrl);

  fs.writeFileSync(`${directory}/version.json`, JSON.stringify({version: new Date().valueOf()}, null, 2));
};

export const musicEndTask = async (baseUrl: string) => {
  await axios(`${baseUrl}/music/update/github/data`);
  console.log('------ndzy------', '完成', '------ndzy------');
};