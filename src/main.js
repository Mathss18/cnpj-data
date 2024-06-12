import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { HEADERS_EMPRESAS } from "../utils/headers.js";
import { createReadStream } from "fs";
import csv from "csv-parser";
import { connect } from "./db/connection.js";
import { EmpresaModel } from "./db/models/empresa.model.js";
import { Logger } from "../utils/logger.js";
import { getAllFileNames, logMemory, makeEmpresaEntry, makeEstabelecimentoEntry } from "../utils/functions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const BASE_FOLDER = resolve(__dirname, "../");
export const INPUT_FOLDER = resolve(__dirname, "../input");
export const OUTPUT_FOLDER = resolve(__dirname, "../output");

const readCsvFile = async (filePath, headers, batchSize, batchFunction, onEnd) => {
  return new Promise((resolve, reject) => {
    let queue = [];
    const stream = createReadStream(filePath).pipe(csv({ separator: ";", headers: false }));

    stream.on("data", async (row) => {
      const transformedRow = {};

      Object.keys(row).forEach((key) => {
        const newKey = headers[Number(key)];
        if (newKey) {
          transformedRow[newKey] = row[key];
        }
      });

      queue.push(transformedRow);

      if (queue.length === batchSize) {
        stream.pause();
        await batchFunction(queue);
        stream.resume();
        queue = [];
      }
    });

    stream.on("end", async () => {
      if (queue.length > 0) {
        await batchFunction(queue);
        await onEnd();
        resolve();
      }
      resolve();
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};

const handleEmpresas = async () => {
  const folderPath = path.join(BASE_FOLDER, "output", "Empresas");
  const fileNames = getAllFileNames(folderPath);
  const batchSize = 10000;
  let fileCount = 0;

  for (const fileName of fileNames) {
    let batchCount = 0;
    Logger.magenta(`Processing file: ${fileName}`);
    const filePath = path.join(folderPath, fileName);
    await readCsvFile(filePath, HEADERS_EMPRESAS, batchSize, async (batch) => {
      // EmpresaModel.insertMany(batch);
      let temp = [];
      for (const item of batch) {
        const newEntry = makeEmpresaEntry(item);
        temp.push({
          updateOne: {
            filter: { cnpjBasico: newEntry.cnpjBasico },
            update: { $set: newEntry },
          },
        });
      }
      await EmpresaModel.bulkWrite(temp);
      Logger.green(`[File ${fileCount}] Inserted batch of data ${++batchCount}`);
    });
    fileCount++;
  }
};

const handleEstabelecimentos = async () => {
  const folderPath = path.join(BASE_FOLDER, "output", "Estabelecimentos");
  const fileNames = getAllFileNames(folderPath);
  const batchSize = 5000;
  let fileCount = 0;

  for (const fileName of fileNames) {
    let batchCount = 0;
    Logger.magenta(`Processing file: ${fileName}`);
    const filePath = path.join(folderPath, fileName);
    await readCsvFile(filePath, HEADERS_EMPRESAS, batchSize, async (batch) => {
      let temp = [];
      for (const item of batch) {
        const newEntry = makeEstabelecimentoEntry(item);
        temp.push({
          updateOne: {
            filter: { cnpjBasico: newEntry.cnpjBasico },
            update: { $set: newEntry },
          },
        });
      }
      await EmpresaModel.bulkWrite(temp);
      Logger.green(`[File ${fileCount}] Inserted batch of data ${++batchCount}`);
    });
    fileCount++;
  }
};

const main = async () => {
  console.time("Execution time");
  logMemory(5000);
  await connect();
  // await EmpresaModel.deleteMany({});
  await handleEmpresas();
  // await handleEstabelecimentos();
  console.log("FIM");
  console.timeEnd("Execution time");
};
main();
