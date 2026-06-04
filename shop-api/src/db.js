import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "db.json");

const emptyDb = () => ({
  users: [],
  products: [],
  orders: [],
});

export function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    const db = emptyDb();
    writeDb(db);
    return db;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

export function writeDb(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function updateDb(mutator) {
  const db = readDb();
  mutator(db);
  writeDb(db);
  return db;
}
