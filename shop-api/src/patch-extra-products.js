import { readDb, writeDb } from "./db.js";
import { enrichLensProduct } from "./product-details.js";
import { EXTRA_PRODUCTS, BUNDLE_IMAGE_FIX } from "./extra-products.js";
import { EXTRA_ACCESSORIES } from "./extra-accessories.js";

const db = readDb();
if (!db.reviews) db.reviews = [];

for (const p of [...EXTRA_ACCESSORIES, ...EXTRA_PRODUCTS]) {
  if (!db.products.some((x) => x.id === p.id)) {
    db.products.push(p);
  }
}

for (const [id, image] of Object.entries(BUNDLE_IMAGE_FIX)) {
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx !== -1) db.products[idx].image = image;
}

db.products = db.products.map((p) => enrichLensProduct(p));
writeDb(db);
console.log(`Products: ${db.products.length} (extra + bundle images fixed)`);
