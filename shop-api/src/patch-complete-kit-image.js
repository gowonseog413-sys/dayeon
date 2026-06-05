import { readDb, writeDb } from "./db.js";

const NEW_IMAGE = "/products/bundle-complete-kit.png";

const db = readDb();
let n = 0;
for (const p of db.products) {
  if (p.id === "p16" || p.image?.includes("bundle-complete-kit")) {
    p.image = NEW_IMAGE;
    if (p.images?.length) {
      p.images = p.images.map((img, i) =>
        i === 0 ? { ...img, url: NEW_IMAGE } : img,
      );
    }
    n++;
  }
}
writeDb(db);
console.log(`Updated Complete Kit B image → ${NEW_IMAGE} (${n} products)`);
