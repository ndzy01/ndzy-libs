"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  musicEndTask: () => musicEndTask,
  musicInitTask: () => musicInitTask,
  musicUpdateTask: () => musicUpdateTask
});
module.exports = __toCommonJS(src_exports);
var fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_axios = __toESM(require("axios"));
var import_uuid = require("uuid");
var init = async (directory, idObj, baseUrl) => {
  const files = fs.readdirSync(directory);
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = import_path.default.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await init(filePath, idObj, baseUrl);
    } else {
      const fileType = file.substring(file.lastIndexOf(".") + 1);
      const arr = import_path.default.basename(filePath, import_path.default.extname(filePath)).split("_");
      if (fileType === "mp3" || fileType === "flac") {
        if (arr.length !== 2) {
          const data = await import_axios.default.post(`${baseUrl}/music`, { name: "test" });
          console.log("------ndzy------\u65B0\u589Emusic", data.data, "------ndzy------");
          idObj.maxId++;
          const newPath = import_path.default.dirname(filePath) + `/${idObj.maxId}_${(0, import_uuid.v4)()}.${fileType}`;
          fs.renameSync(filePath, newPath);
          fs.writeFileSync(import_path.default.dirname(filePath) + `/name.txt`, import_path.default.basename(filePath, import_path.default.extname(filePath)));
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
  } = await (0, import_axios.default)(`${baseUrl}/music?sort=id%2CDESC&limit=1`);
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
    const filePath = import_path.default.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await updateFiles(filePath, githubName, baseUrl);
    } else {
      const fileType = file.substring(file.lastIndexOf(".") + 1);
      const [id, _] = import_path.default.basename(filePath, import_path.default.extname(filePath)).split("_");
      if (fileType === "mp3" || fileType === "flac") {
        const newPath = import_path.default.dirname(filePath) + `/${id}_${(0, import_uuid.v4)()}.${fileType}`;
        fs.renameSync(filePath, newPath);
        const name = fs.readFileSync(import_path.default.dirname(filePath) + `/name.txt`, { encoding: "utf-8" });
        const data = await import_axios.default.patch(`${baseUrl}/music/${id}`, {
          url: `https://www.ndzy01.com/${githubName}/${newPath.split("/resource/")[1]}`,
          fileType,
          name
        });
        console.log("------ndzy------\u66F4\u65B0music", data.data, {
          url: `https://www.ndzy01.com/${githubName}/${newPath.split("/resource/")[1]}`,
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
  await (0, import_axios.default)(`${baseUrl}/music/update/github/data`);
  console.log("------ndzy------", "\u5B8C\u6210", "------ndzy------");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  musicEndTask,
  musicInitTask,
  musicUpdateTask
});
