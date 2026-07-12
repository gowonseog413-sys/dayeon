import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readDb } from "./db.js";
import { ensureDefaultUsers } from "./ensure-default-users.js";
import { ensureSiteContent } from "./site-content.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "db.json");

/** 배포 환경: DB가 비어 있으면 시드 실행 */
export async function bootstrapDb() {
  if (!fs.existsSync(dbPath)) {
    console.log("[bootstrap] DB 없음 → seed 실행");
    await import("./seed.js");
    return;
  }
  const db = readDb();
  if (!db.products?.length) {
    console.log("[bootstrap] 상품 없음 → seed 실행");
    await import("./seed.js");
  }
  ensureSiteContent();
  await ensureDefaultUsers();
  console.log("[bootstrap] DB 준비 완료");
}
