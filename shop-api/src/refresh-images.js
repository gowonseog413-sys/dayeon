import { updateDb } from "./db.js";

const map = {
  p1: "/products/lens-bluebell-gray.png",
  p2: "/products/lens-posy-choco.png",
  p3: "/products/lens-daisy-gray.png",
  p4: "/products/lens-moist-clear.png",
  p5: "/products/lens-freesia-brown.png",
  p6: "/products/lens-calla-choco.png",
  p7: "/products/lens-ocher-brown.png",
  p8: "/products/lens-ivy-brown.png",
  p9: "/products/product-rohto-lycee.png",
  p10: "/products/product-biotrue-mps.png",
  p11: "/products/product-renu-fresh.png",
  p12: "/products/product-lens-case-anya.png",
  p13: "/products/product-travel-case.png",
  p14: "/products/product-lens-applicator.png",
};

updateDb((d) => {
  d.products.forEach((p) => {
    if (map[p.id]) p.image = map[p.id];
  });
});

console.log("Product images updated:", Object.keys(map).length);
