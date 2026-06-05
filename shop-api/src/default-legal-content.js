import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../data/legal");
const LOCALES = ["ko", "en", "id"];
const DOCS = ["terms", "privacy"];

function readJson(name) {
  const file = path.join(DATA_DIR, name);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function buildLegalDefaults() {
  const legal = { terms: {}, privacy: {} };
  for (const doc of DOCS) {
    for (const locale of LOCALES) {
      legal[doc][locale] = {
        sections: readJson(`${doc}-${locale}.json`),
      };
    }
  }
  return legal;
}

export const DEFAULT_LEGAL = buildLegalDefaults();
export const LEGAL_DOCS = DOCS;
export const LEGAL_LOCALES = LOCALES;
