// src/index.ts
import * as fs from "fs";
import path from "path";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
var init = async (directory, idObj, baseUrl) => {
  const files = fs.readdirSync(directory);
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await init(filePath, idObj, baseUrl);
    } else {
      const fileType = file.substring(file.lastIndexOf(".") + 1);
      const arr = path.basename(filePath, path.extname(filePath)).split("_");
      if (fileType === "mp3" || fileType === "flac") {
        if (arr.length !== 2) {
          await axios.post(`${baseUrl}/music`, { name: "test" });
          idObj.maxId++;
          const newPath = path.dirname(filePath) + `/${idObj.maxId}_${uuidv4()}.${fileType}`;
          fs.renameSync(filePath, newPath);
          fs.writeFileSync(path.dirname(filePath) + `/name.txt`, path.basename(filePath, path.extname(filePath)));
        }
      }
    }
  }
};
var musicStartTask = async (directory, baseUrl) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  let maxId;
  const {
    data: { data }
  } = await axios(`${baseUrl}/music?sort=id%2CDESC&limit=1`);
  console.log("------ndzy------", data, "------ndzy------");
  if (data) {
    maxId = data[0].id;
  }
  if (data) {
    maxId = data[0].id;
  }
  await init(directory, { maxId }, baseUrl);
  fs.writeFileSync(`${directory}/version.json`, JSON.stringify({ version: (/* @__PURE__ */ new Date()).valueOf() }, null, 2));
  console.log("------ndzy------", "\u521D\u59CB\u5316\u6210\u529F", "------ndzy------");
};
var updateFiles = async (directory, name, baseUrl) => {
  const files = fs.readdirSync(directory);
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await updateFiles(filePath, name, baseUrl);
    } else {
      const fileType = file.substring(file.lastIndexOf(".") + 1);
      const [id, _] = path.basename(filePath, path.extname(filePath)).split("_");
      if (fileType === "mp3" || fileType === "flac") {
        const newPath = path.dirname(filePath) + `/${id}_${uuidv4()}.${fileType}`;
        fs.renameSync(filePath, newPath);
        const name2 = fs.readFileSync(path.dirname(filePath) + `/name.txt`, { encoding: "utf-8" });
        await axios.patch(`${baseUrl}/music/${id}`, {
          url: `https://www.ndzy01.com/${name2}/${path.relative(__dirname + "/resource/", newPath)}`,
          fileType,
          name: name2
        });
      }
    }
  }
};
var musicUpdateFilesTask = async (directory, name, baseUrl) => {
  await updateFiles(directory, name, baseUrl);
  fs.writeFileSync(`${directory}/version.json`, JSON.stringify({ version: (/* @__PURE__ */ new Date()).valueOf() }, null, 2));
};
var musicEndTask = async (baseUrl) => {
  await axios(`${baseUrl}/music/update/github/data`);
  console.log("------ndzy------", "\u5B8C\u6210", "------ndzy------");
};
export {
  musicEndTask,
  musicStartTask,
  musicUpdateFilesTask
};
