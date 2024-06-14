import { createReadStream } from "fs";
import { readdirSync } from "fs";
import { resolve } from "path";
import unzipper from "unzipper";
import { Logger } from "../../utils/logger.js";
import { INPUT_FOLDER, OUTPUT_FOLDER } from "./index.js";

const getAllZipFoldersNames = () => {
  return readdirSync(INPUT_FOLDER, { withFileTypes: true })
    .filter((dirent) => !dirent.isDirectory() && dirent.name.endsWith(".zip"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((dirent) => dirent.name);
};

getAllZipFoldersNames().forEach(async (zipFolder) => {
  const zipFilePath = resolve(`${INPUT_FOLDER}/${zipFolder}`);
  const outputFolder = resolve(OUTPUT_FOLDER, zipFolder.replace(".zip", "").replace(/\d+/g, ""));

  Logger.yellow(`Extracting ${zipFolder} to ${outputFolder}... \n`);

  createReadStream(zipFilePath)
    .pipe(unzipper.Extract({ path: outputFolder }))
    .on("close", () => {
      Logger.green(`Extracted ${zipFolder} to ${outputFolder} \n`);
    })
    .on("error", (err) => {
      Logger.red(`Error extracting ${zipFolder}: ${err}`);
    });
});
