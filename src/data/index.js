import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const BASE_FOLDER = resolve(__dirname, "../");
export const INPUT_FOLDER = resolve(__dirname, "../input");
export const OUTPUT_FOLDER = resolve(__dirname, "../output");

export const EMPRESAS_BATCH_SIZE = 10000;
export const ESTABELECIMENTOS_BATCH_SIZE = 2000;