import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { HEADERS_EMPRESAS, HEADERS_ESTABELECIMENTOS } from "../../utils/headers.js";
import { connect } from "../db/connection.js";
import { EmpresaModel } from "../db/models/empresa.model.js";
import { Logger } from "../../utils/logger.js";
import { setTimeout as sleep } from "timers/promises";
import {
  getAllFileNames,
  logMemory,
  makeEmpresaEntry,
  makeEstabelecimentoEntry,
  readCsvFile,
} from "../../utils/functions.js";
import { BASE_FOLDER, EMPRESAS_BATCH_SIZE, ESTABELECIMENTOS_BATCH_SIZE } from "./index.js";

const handleEmpresas = async () => {
  const folderPath = path.join(BASE_FOLDER, "output", "Empresas");
  const fileNames = getAllFileNames(folderPath);
  let fileCount = 0;

  for (const fileName of fileNames) {
    let batchCount = 0;
    Logger.magenta(`Processing file: ${fileName}`);
    const filePath = path.join(folderPath, fileName);
    const insertFunction = async (batch) => {
      let temp = [];
      for (const item of batch) {
        const newEntry = makeEmpresaEntry(item);
        temp.push(newEntry);
      }
      await EmpresaModel.insertMany(temp);
      Logger.green(`[File ${fileCount}] Inserted batch of data ${++batchCount}`);
    };
    await readCsvFile(filePath, HEADERS_EMPRESAS, EMPRESAS_BATCH_SIZE, insertFunction, insertFunction);
    fileCount++;
  }
};

const handleEstabelecimentos = async () => {
  const folderPath = path.join(BASE_FOLDER, "output", "Estabelecimentos");
  const fileNames = getAllFileNames(folderPath);
  let fileCount = 0;
  let index = 0;

  for (const fileName of fileNames) {
    let batchCount = 0;
    Logger.magenta(`Processing file: ${fileName}`);
    const filePath = path.join(folderPath, fileName);
    const insertFunction = async (batch) => {
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
      if (index % 3 === 0) {
        EmpresaModel.bulkWrite(temp).then(() => {
          Logger.green(`[File ${fileCount}] Inserted batch of data ${++batchCount}`);
        });
      } else {
        await EmpresaModel.bulkWrite(temp);
        Logger.green(`[File ${fileCount}] Inserted batch of data ${++batchCount}`);
      }
      index++;
    };
    await readCsvFile(filePath, HEADERS_ESTABELECIMENTOS, ESTABELECIMENTOS_BATCH_SIZE, insertFunction, insertFunction);
    fileCount++;
  }
};

const main = async () => {
  console.time("Execution time");
  logMemory(1000 * 30);
  await connect();
  // await EmpresaModel.deleteMany({});
  await handleEmpresas();
  await sleep(1000 * 10);
  await handleEstabelecimentos();
  console.log(await EmpresaModel.countDocuments());
  console.timeEnd("Execution time");
  console.log("FIM");
};
main();
