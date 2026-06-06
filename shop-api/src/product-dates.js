/** 상품 등록일·포인트 설정 — 기존 데이터 보완 */
export function ensureProductCreatedAt(db) {
  const base = new Date("2025-01-01T09:00:00.000Z");
  let changed = false;
  for (let i = 0; i < db.products.length; i++) {
    const p = db.products[i];
    if (!p.createdAt) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      p.createdAt = d.toISOString();
      changed = true;
    }
    if (p.pointsEnabled === undefined) {
      p.pointsEnabled = true;
      changed = true;
    }
  }
  return changed;
}

export function isProductPointsEnabled(product) {
  return product?.pointsEnabled !== false;
}
