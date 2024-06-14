import { createReadStream, readdirSync, writeFileSync } from "fs";
import csv from "csv-parser";

export const getAllFileNames = (folderName) => {
  return readdirSync(folderName, { withFileTypes: true })
    .filter((dirent) => !dirent.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((dirent) => dirent.name);
};

export const readCsvFile = async (
  filePath,
  headers,
  batchSize,
  batchFunction,
  onEnd
) => {
  return new Promise((resolve, reject) => {
    let queue = [];
    const stream = createReadStream(filePath).pipe(
      csv({ separator: ";", headers: false })
    );

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
        await onEnd(queue);
        resolve();
      }
      resolve();
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};

export function getMemory() {
  return Object.entries(process.memoryUsage()).reduce((carry, [key, value]) => {
    return `${carry}${key}:${Math.round((value / 1024 / 1024) * 100) / 100}MB;`;
  }, "");
}

export const logMemory = (time = 10000) => {
  setInterval(() => {
    writeFileSync("memory.txt", `${new Date().toISOString()} ${getMemory()} \n`, { flag: "a" });
  }, time);
};

export const makeEmpresaEntry = (data) => {
  return {
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
};

export const makeEstabelecimentoEntry = (data) => {
  return {
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
};
