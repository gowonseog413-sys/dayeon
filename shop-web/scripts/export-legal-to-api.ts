import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PRIVACY_EN } from "../src/i18n/legal/privacy-en";
import { PRIVACY_ID } from "../src/i18n/legal/privacy-id";
import { PRIVACY_KO } from "../src/i18n/legal/privacy-ko";
import { TERMS_EN } from "../src/i18n/legal/terms-en";
import { TERMS_ID } from "../src/i18n/legal/terms-id";
import { TERMS_KO } from "../src/i18n/legal/terms-ko";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "shop-api/data/legal");

const files: Record<string, unknown> = {
  "terms-ko.json": TERMS_KO,
  "terms-en.json": TERMS_EN,
  "terms-id.json": TERMS_ID,
  "privacy-ko.json": PRIVACY_KO,
  "privacy-en.json": PRIVACY_EN,
  "privacy-id.json": PRIVACY_ID,
};

fs.mkdirSync(outDir, { recursive: true });
for (const [name, data] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
console.log(`Wrote ${Object.keys(files).length} legal JSON files to ${outDir}`);
