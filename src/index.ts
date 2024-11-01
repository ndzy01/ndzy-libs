import * as fs from 'fs';
import path from 'path';
import axios, {AxiosInstance, AxiosRequestHeaders} from 'axios';
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
          const data = await axios.post(`${baseUrl}/music`, {name: 'test'});
          console.log('------ndzy------新增music', data.data, '------ndzy------');

          idObj.maxId++;
          const newPath = path.dirname(filePath) + `/${idObj.maxId}_${uuidv4()}.${fileType}`;
          fs.renameSync(filePath, newPath);
          fs.writeFileSync(path.dirname(filePath) + `/name.txt`, path.basename(filePath, path.extname(filePath)));
        }
      }
    }
  }
};

export const musicInitTask = async (directory: string, baseUrl: string,) => {
  console.log('------ndzy------入参', directory, baseUrl, '------ndzy------');

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {recursive: true});
  }

  let maxId;
  const {
    data: {data},
  } = await axios(`${baseUrl}/music?sort=id%2CDESC&limit=1`);

  if (data) {
    maxId = data[0].id;
  }

  console.log('------ndzy------', maxId, data, '------ndzy------');

  await init(directory, {maxId}, baseUrl);

  fs.writeFileSync(`${directory}/version.json`, JSON.stringify({version: new Date().valueOf()}, null, 2));

  console.log('------ndzy------', "更新版本号", '------ndzy------');

  console.log('------ndzy------', '初始化完成', '------ndzy------');
};

const updateFiles = async (directory: string, githubName: string, baseUrl: string) => {
  const files = fs.readdirSync(directory);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await updateFiles(filePath, githubName, baseUrl); // 如果是目录，则递归调用
    } else {
      const fileType = file.substring(file.lastIndexOf('.') + 1);
      const [id, _] = path.basename(filePath, path.extname(filePath)).split('_');

      if (fileType === 'mp3' || fileType === 'flac') {
        const newPath = path.dirname(filePath) + `/${id}_${uuidv4()}.${fileType}`;
        fs.renameSync(filePath, newPath);
        const name = fs.readFileSync(path.dirname(filePath) + `/name.txt`, {encoding: 'utf-8'});

        const data = await axios.patch(`${baseUrl}/music/${id}`, {
          url: `https://www.ndzy01.com/${githubName}/${newPath.split("/resource/")[1]}`,
          fileType,
          name,
        });
        console.log('------ndzy------更新music', data.data, {
          url: `https://www.ndzy01.com/${githubName}/${newPath.split("/resource/")[1]}`,
          fileType,
          name,
        }, '------ndzy------');
      }
    }
  }
};

export const musicUpdateTask = async (directory: string, name: string, baseUrl: string) => {
  console.log('------ndzy------', directory, name, baseUrl, '------ndzy------');

  await updateFiles(directory, name, baseUrl);

  fs.writeFileSync(`${directory}/version.json`, JSON.stringify({version: new Date().valueOf()}, null, 2));

  console.log('------ndzy------', "更新版本号", '------ndzy------');

  console.log('------ndzy------', '更新完成', '------ndzy------');
};

export const musicEndTask = async (baseUrl: string) => {
  console.log('------ndzy------', baseUrl, '------ndzy------');

  await axios(`${baseUrl}/music/update/github/data`);

  console.log('------ndzy------', '完成', '------ndzy------');
};


export class AxiosSingleton {
  static instance: null | AxiosInstance = null;

  constructor(baseURL: string) {
    if (!AxiosSingleton.instance) {
      AxiosSingleton.instance = axios.create({
        baseURL: baseURL,
        timeout: 60000
      });

      // 请求拦截器
      AxiosSingleton.instance.interceptors.request.use(
        config => {
          const token = sessionStorage.getItem("token")

          if (token) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${token}`,
            } as AxiosRequestHeaders
          }

          return config;
        },
        error => {
          return Promise.reject(error);
        }
      );

      // 响应拦截器
      AxiosSingleton.instance.interceptors.response.use(
        response => {
          return response.data
        },
        error => {
          return Promise.reject(error);
        }
      );
    }
    return AxiosSingleton.instance;
  }
}