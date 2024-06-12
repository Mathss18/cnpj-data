import mongoose from "mongoose";

let empresaSchema = new mongoose.Schema({
  cnpjBasico: {
    type: String,
  },
  cnpjOrdem: {
    type: String,
  },
  cnpjDv: {
    type: String,
  },
  razaoSocial: {
    type: String,
  },
  naturezaJuridica: {
    codigo: { type: String },
    descricao: { type: String },
  },
  qualificacaoDoResponsavel: {
    codigo: { type: String },
    descricao: { type: String },
  },
  capitalSocial: {
    type: String,
  },
  porteEmpresa: {
    type: String,
  },
  enteFederativo: {
    type: String,
  },
  identificadorMatrizFilial: {
    type: String,
  },
  nomeFantasia: {
    type: String,
  },
  situacaoCadastral: {
    type: String,
  },
  dataSituacaoCadastral: {
    type: String,
  },
  motivoSituacaoCadastral: {
    type: String,
  },
  nomeCidadeExterior: {
    type: String,
  },
  pais: {
    codigo: { type: String },
    descricao: { type: String },
  },
  dataInicioAtividade: {
    type: String,
  },
  cnaeFiscalPrincipal: {
    type: String,
  },
  cnaeFiscalSecundaria: {
    type: String,
  },
  tipoLogradouro: {
    type: String,
  },
  logradouro: {
    type: String,
  },
  numero: {
    type: String,
  },
  complemento: {
    type: String,
  },
  bairro: {
    type: String,
  },
  cep: {
    type: String,
  },
  uf: {
    type: String,
  },
  municipio: {
    codigo: { type: String },
    descricao: { type: String },
  },
  ddd1: {
    type: String,
  },
  telefone1: {
    type: String,
  },
  ddd2: {
    type: String,
  },
  telefone2: {
    type: String,
  },
  dddFax: {
    type: String,
  },
  fax: {
    type: String,
  },
  email: {
    type: String,
  },
  situacaoEspecial: {
    type: String,
  },
  dataSituacaoEspecial: {
    type: String,
  },
  opcaoPelosSimples: {
    type: String,
  },
  dataOpcaoPeloSimples: {
    type: String,
  },
  dataExclusaoSimples: {
    type: String,
  },
  opcaoPeloMei: {
    type: String,
  },
  dataOpcaoMei: {
    type: String,
  },
  dataExclusaoMei: {
    type: String,
  },
  socios: [
    {
      identificadorSocio: {
        type: String,
      },
      nomeRazaoSocial: {
        type: String,
      },
      cpfCnpj: {
        type: String,
      },
      dataEntradaSociedade: {
        type: String,
      },
      pais: { type: String },
      representanteLegal: {
        type: String,
      },
      nomeRepresentanteLegal: {
        type: String,
      },
      qualificacaoRepresentanteLegal: {
        type: String,
      },
      faixaEtaria: {
        type: String,
      },
    },
  ],
});

export const EmpresaModel = mongoose.model("empresas", empresaSchema);
