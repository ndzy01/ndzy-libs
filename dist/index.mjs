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
var musicStart = async (baseUrl, directory) => {
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
export {
  musicStart
};
