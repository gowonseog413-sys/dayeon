/** 상품별 썸네일 4장 (서로 다른 이미지 URL) */

const L = {
  bluebell: "/products/lens-bluebell-gray.png",
  posy: "/products/lens-posy-choco.png",
  daisy: "/products/lens-daisy-gray.png",
  moist: "/products/lens-moist-clear.png",
  freesia: "/products/lens-freesia-brown.png",
  calla: "/products/lens-calla-choco.png",
  ocher: "/products/lens-ocher-brown.png",
  ivy: "/products/lens-ivy-brown.png",
  rohto: "/products/product-rohto-lycee.png",
  biotrue: "/products/product-biotrue-mps.png",
  renu: "/products/product-renu-fresh.png",
  anya: "/products/product-lens-case-anya.png",
  travel: "/products/product-travel-case.png",
  applicator: "/products/product-lens-applicator.png",
  bundleTravel: "/products/bundle-travel-essentials.png",
  bundleComplete: "/products/bundle-complete-kit.png",
  bundleLensmate: "/products/bundle-lensmate-pack.png",
  bundleDaily: "/products/bundle-daily-care.png",
  bundleStarter: "/products/bundle-starter-kit.png",
  bundlePremium: "/products/bundle-premium.png",
  bundleGift: "/products/bundle-gift-set.png",
};

function gallery(urls, labels = ["정면", "착용", "패키지", "디테일"]) {
  return urls.slice(0, 4).map((url, i) => ({ url, alt: labels[i] || `뷰 ${i + 1}` }));
}

export const GALLERY_BY_ID = {
  p1: gallery([L.bluebell, L.daisy, L.posy, L.moist]),
  p2: gallery([L.posy, L.bluebell, L.calla, L.freesia]),
  p3: gallery([L.daisy, L.moist, L.bluebell, L.ivy]),
  p4: gallery([L.moist, L.daisy, L.bluebell, L.posy]),
  p5: gallery([L.freesia, L.ocher, L.calla, L.ivy]),
  p6: gallery([L.calla, L.posy, L.freesia, L.bluebell]),
  p7: gallery([L.ocher, L.ivy, L.freesia, L.daisy]),
  p8: gallery([L.ivy, L.ocher, L.calla, L.moist]),
  p9: gallery([L.rohto, L.biotrue, L.renu, L.moist], ["제품", "구성", "사용", "착용"]),
  p10: gallery([L.biotrue, L.renu, L.rohto, L.moist]),
  p11: gallery([L.renu, L.rohto, L.biotrue, L.daisy]),
  p12: gallery([L.anya, L.travel, L.applicator, L.rohto]),
  p13: gallery([L.travel, L.anya, L.applicator, L.biotrue]),
  p14: gallery([L.applicator, L.anya, L.travel, L.renu]),
  p15: gallery([L.bundleTravel, L.travel, L.anya, L.applicator]),
  p16: gallery([L.bundleComplete, L.biotrue, L.renu, L.anya]),
  p17: gallery([L.bundleLensmate, L.travel, L.applicator, L.anya]),
  p23: gallery([L.daisy, L.bluebell, L.freesia, L.ivy]),
  p24: gallery([L.freesia, L.calla, L.ocher, L.posy]),
  p25: gallery([L.ivy, L.ocher, L.freesia, L.moist]),
  p26: gallery([L.posy, L.calla, L.freesia, L.ivy]),
  p27: gallery([L.bluebell, L.daisy, L.moist, L.posy]),
  p28: gallery([L.calla, L.ocher, L.posy, L.freesia]),
  p29: gallery([L.ocher, L.calla, L.ivy, L.bluebell]),
  p30: gallery([L.biotrue, L.rohto, L.renu, L.moist]),
  p31: gallery([L.renu, L.biotrue, L.rohto, L.daisy]),
  p32: gallery([L.rohto, L.renu, L.biotrue, L.moist]),
  p33: gallery([L.bundleDaily, L.anya, L.travel, L.biotrue]),
  p34: gallery([L.bundleStarter, L.applicator, L.anya, L.travel]),
  p35: gallery([L.bundlePremium, L.bundleComplete, L.renu, L.rohto]),
  p36: gallery([L.bundleGift, L.bundleTravel, L.bundleDaily, L.anya]),
  p18: gallery([L.renu, L.biotrue, L.rohto, L.moist]),
  p19: gallery([L.biotrue, L.renu, L.rohto, L.anya]),
  p20: gallery([L.anya, L.travel, L.applicator, L.daisy]),
  p21: gallery([L.applicator, L.travel, L.anya, L.bluebell]),
  p22: gallery([L.travel, L.anya, L.applicator, L.posy]),
};

export function getProductGallery(product) {
  const mapped = GALLERY_BY_ID[product.id];
  if (mapped) return mapped;
  const main = product.image;
  const pool = Object.values(L).filter((u) => u !== main);
  return gallery([main, pool[0], pool[1], pool[2]]);
}
