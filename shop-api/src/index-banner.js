export const INDEX_BANNER_LOCALES = ["ko", "en", "id"];

export const DEFAULT_INDEX_BANNER = {
  ko: "FREE SHIPPING UP TO 10K · SAVE UP TO 40%",
  en: "FREE SHIPPING UP TO 10K · SAVE UP TO 40%",
  id: "GRATIS ONGKIR HINGGA 10K · HEMAT HINGGA 40%",
};

export function normalizeIndexBanner(raw) {
  const out = { ...DEFAULT_INDEX_BANNER };
  for (const locale of INDEX_BANNER_LOCALES) {
    const v = raw?.[locale];
    if (typeof v === "string" && v.trim()) {
      out[locale] = v.trim().slice(0, 200);
    }
  }
  return out;
}

export function getIndexBanner(db) {
  return normalizeIndexBanner(db.settings?.indexBanner);
}
