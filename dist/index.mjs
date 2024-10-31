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
          const data = await axios.post(`${baseUrl}/music`, { name: "test" });
          console.log("------ndzy------\u65B0\u589Emusic", data.data, "------ndzy------");
          idObj.maxId++;
          const newPath = path.dirname(filePath) + `/${idObj.maxId}_${uuidv4()}.${fileType}`;
          fs.renameSync(filePath, newPath);
          fs.writeFileSync(path.dirname(filePath) + `/name.txt`, path.basename(filePath, path.extname(filePath)));
        }
      }
    }
  }
};
var musicInitTask = async (directory, baseUrl) => {
  console.log("------ndzy------\u5165\u53C2", directory, baseUrl, "------ndzy------");
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  let maxId;
  const {
    data: { data }
  } = await axios(`${baseUrl}/music?sort=id%2CDESC&limit=1`);
  if (data) {
    maxId = data[0].id;
  }
  console.log("------ndzy------", maxId, data, "------ndzy------");
  await init(directory, { maxId }, baseUrl);
  fs.writeFileSync(`${directory}/version.json`, JSON.stringify({ version: (/* @__PURE__ */ new Date()).valueOf() }, null, 2));
  console.log("------ndzy------", "\u66F4\u65B0\u7248\u672C\u53F7", "------ndzy------");
  console.log("------ndzy------", "\u521D\u59CB\u5316\u5B8C\u6210", "------ndzy------");
};
var updateFiles = async (directory, githubName, baseUrl) => {
  const files = fs.readdirSync(directory);
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await updateFiles(filePath, githubName, baseUrl);
    } else {
      const fileType = file.substring(file.lastIndexOf(".") + 1);
      const [id, _] = path.basename(filePath, path.extname(filePath)).split("_");
      if (fileType === "mp3" || fileType === "flac") {
        const newPath = path.dirname(filePath) + `/${id}_${uuidv4()}.${fileType}`;
        fs.renameSync(filePath, newPath);
        const name = fs.readFileSync(path.dirname(filePath) + `/name.txt`, { encoding: "utf-8" });
        const data = await axios.patch(`${baseUrl}/music/${id}`, {
          url: `https://www.ndzy01.com/${name}/${path.relative(__dirname + "/resource/", newPath)}`,
          fileType,
          name
        });
        console.log("------ndzy------\u65B0\u589Emusic", data.data, {
          url: `https://www.ndzy01.com/${githubName}/${path.relative(__dirname + "/resource/", newPath)}`,
          fileType,
          name
        }, "------ndzy------");
      }
    }
  }
};
var musicUpdateTask = async (directory, name, baseUrl) => {
  console.log("------ndzy------", directory, name, baseUrl, "------ndzy------");
  await updateFiles(directory, name, baseUrl);
  fs.writeFileSync(`${directory}/version.json`, JSON.stringify({ version: (/* @__PURE__ */ new Date()).valueOf() }, null, 2));
  console.log("------ndzy------", "\u66F4\u65B0\u7248\u672C\u53F7", "------ndzy------");
  console.log("------ndzy------", "\u66F4\u65B0\u5B8C\u6210", "------ndzy------");
};
var musicEndTask = async (baseUrl) => {
  console.log("------ndzy------", baseUrl, "------ndzy------");
  await axios(`${baseUrl}/music/update/github/data`);
  console.log("------ndzy------", "\u5B8C\u6210", "------ndzy------");
};
export {
  musicEndTask,
  musicInitTask,
  musicUpdateTask
};
