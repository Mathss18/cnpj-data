import path from "path";
import { BASE_FOLDER } from "./index.js";
import { Logger } from "../utils/logger.js";
import { getAllFileNames, getMemory, readCSVFile } from "../utils/functions.js";
import { connect } from "./db/connection.js";
import { EmpresaModel } from "./db/models/empresa.model.js";
import { setTimeout as sleep } from "timers/promises";
import { writeFileSync } from "fs";
import { HEADERS_EMPRESAS, HEADERS_ESTABELECIMENTOS } from "../utils/headers.js";

const clearAllEmpresas = async () => {
  try {
    await EmpresaModel.deleteMany({});
    Logger.green("All Empresas data cleared");
  } catch (error) {
    Logger.red("Error clearing Empresas data:", error);
  }
};

const logMemory = (time = 10000) => {
  setInterval(() => {
    writeFileSync("memory.txt", `${new Date().toISOString()} ${getMemory()} \n`, { flag: "a" });
  }, time);
};

const handleEmpresas = async () => {
  const folderPath = path.join(BASE_FOLDER, "output", "Empresas");
  const fileNames = getAllFileNames(folderPath);
  const batchSize = 10000;
  let fileCount = 0;

  for (const fileName of fileNames) {
    let temp = [];
    let batchCount = 0;
    fileCount++;
    Logger.magenta(`Processing file: ${fileName}`);
    const filePath = path.join(folderPath, fileName);

    await new Promise((resolve, reject) => {
      readCSVFile(
        filePath,
        HEADERS_EMPRESAS,
        async (data) => {
          const newEntry = {
            cnpjBasico: data.cnpjBasico,
            razaoSocial: data.razaoSocial,
            naturezaJuridica: {
              codigo: data.naturezaJuridica,
              descricao: "",
            },
            qualificacaoDoResponsavel: {
              codigo: data.qualificacaoDoResponsavel,
              descricao: "",
            },
            capitalSocial: data.capitalSocial,
            porteEmpresa: data.porteEmpresa,
          };

          temp.push(newEntry);

          if (temp.length === batchSize) {
            EmpresaModel.insertMany(temp)
              .then(() => {
                Logger.green(`[File ${fileCount}] Inserted batch of data ${++batchCount}`);
              })
              .catch((error) => {
                Logger.red("Error inserting batch:", error);
                reject(error);
              });
            temp = []; // Reset the temp array after successful insertion
          }
        },
        async () => {
          // Insert remaining records if any
          if (temp.length > 0) {
            try {
              await EmpresaModel.insertMany(temp);
              Logger.yellow("Inserted remaining data");
              temp = []; // Reset the temp array after successful insertion
              resolve();
            } catch (error) {
              Logger.red("Error inserting remaining data:", error);
              reject(error);
            }
          } else {
            resolve();
          }
        },
        (error) => {
          Logger.red("Error reading file", error);
          reject(error);
        },
        batchSize
      );
    });
  }
};

const handleEstabelecimentos = async () => {
  const folderPath = path.join(BASE_FOLDER, "output", "Estabelecimentos");
  const fileNames = getAllFileNames(folderPath);
  const batchSize = 5000;
  let fileCount = 0;

  for (const fileName of fileNames) {
    let temp = [];
    let batchCount = 0;
    Logger.magenta(`Processing file: ${fileName}`);
    const filePath = path.join(folderPath, fileName);

    await new Promise((resolve, reject) => {
      readCSVFile(
        filePath,
        HEADERS_ESTABELECIMENTOS,
        async (data) => {
          const newEntry = {
            cnpjBasico: data.cnpjBasico,
            cnpjOrdem: data.cnpjOrdem,
            cnpjDv: data.cnpjDv,
            identificadorMatrizFilial: data.identificadorMatrizFilial,
            nomeFantasia: data.nomeFantasia,
            situacaoCadastral: data.situacaoCadastral,
            dataSituacaoCadastral: data.dataSituacaoCadastral,
            motivoSituacaoCadastral: data.motivoSituacaoCadastral,
            nomeCidadeExterior: data.nomeCidadeExterior,
            pais: {
              codigo: data.pais,
              descricao: "",
            },
            dataInicioAtividade: data.dataInicioAtividade,
            cnaeFiscalPrincipal: data.cnaeFiscalPrincipal,
            cnaeFiscalSecundaria: data.cnaeFiscalSecundaria,
            tipoLogradouro: data.tipoLogradouro,
            logradouro: data.logradouro,
            numero: data.numero,
            complemento: data.complemento,
            bairro: data.bairro,
            cep: data.cep,
            uf: data.uf,
            municipio: {
              codigo: data.codigoMunicipio,
              descricao: "",
            },
            ddd1: data.ddd1,
            telefone1: data.telefone1,
            ddd2: data.ddd2,
            telefone2: data.telefone2,
            dddFax: data.dddFax,
            fax: data.fax,
            email: data.email,
            situacaoEspecial: data.situacaoEspecial,
            dataSituacaoEspecial: data.dataSituacaoEspecial,
          };
          temp.push({
            updateOne: {
              filter: { cnpjBasico: newEntry.cnpjBasico },
              update: { $set: newEntry },
              // upsert: true,
            },
          });

          if (temp.length === batchSize) {
            try {
              await EmpresaModel.bulkWrite(temp);
              Logger.green(`[File ${fileCount}] Inserted batch of data ${++batchCount}`);
              temp = []; // Reset the temp array after successful insertion
            } catch (error) {
              Logger.red("Error inserting data:", error);
              reject(error);
            }
          }
        },
        async () => {
          // Insert remaining records if any
          if (temp.length > 0) {
            try {
              await EmpresaModel.bulkWrite(temp);
              Logger.yellow("Inserted remaining data");
              resolve();
              temp = []; // Reset the temp array after successful insertion
            } catch (error) {
              Logger.red("Error inserting remaining data:", error);
              reject(error);
            }
          } else {
            resolve();
          }
        },
        (error) => {
          Logger.red("Error reading file", error);
          reject(error);
        },
        batchSize
      );
    });

    fileCount++;
  }
};

(async () => {
  try {
    console.time("Execution time");
    logMemory();
    await connect();
    // await clearAllEmpresas();
    // await handleEmpresas();
    // await sleep(1000 * 30); // Sleep for 30 seconds
    await handleEstabelecimentos();
    console.timeEnd("Execution time");
  } catch (error) {
    console.error("Error Here:", error);
    process.exit(1);
  }
})();
