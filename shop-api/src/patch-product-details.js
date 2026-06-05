import { readDb, writeDb } from "./db.js";
import { enrichLensProduct } from "./product-details.js";
import { EXTRA_ACCESSORIES } from "./extra-accessories.js";

const db = readDb();
if (!db.reviews) db.reviews = [];

for (const p of EXTRA_ACCESSORIES) {
  if (!db.products.some((x) => x.id === p.id)) {
    db.products.push(p);
  }
}

db.products = db.products.map((p) => enrichLensProduct(p));

writeDb(db);
console.log(`Patched ${db.products.length} products (galleries x4 each)`);
