export const PARTNER_BANNER_MAX = 3;

export const DEFAULT_PARTNER_BANNERS = {
  left: [],
  right: [],
};

function normalizeSlot(raw) {
  const image = typeof raw?.image === "string" ? raw.image.trim() : "";
  const url = typeof raw?.url === "string" ? raw.url.trim() : "";
  if (!image) return null;
  return { image, url };
}

function normalizeSide(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeSlot)
    .filter(Boolean)
    .slice(0, PARTNER_BANNER_MAX);
}

export function normalizePartnerBanners(raw) {
  return {
    left: normalizeSide(raw?.left),
    right: normalizeSide(raw?.right),
  };
}

export function getPartnerBanners(db) {
  return normalizePartnerBanners(db.settings?.partnerBanners);
}
