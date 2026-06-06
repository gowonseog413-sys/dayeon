import type { Locale } from "@/i18n/messages";

export type IndexBannerMap = Record<Locale, string>;

export const DEFAULT_INDEX_BANNER: IndexBannerMap = {
  ko: "FREE SHIPPING UP TO 10K · SAVE UP TO 40%",
  en: "FREE SHIPPING UP TO 10K · SAVE UP TO 40%",
  id: "GRATIS ONGKIR HINGGA 10K · HEMAT HINGGA 40%",
};

export function normalizeIndexBanner(
  raw: Partial<IndexBannerMap> | undefined | null,
): IndexBannerMap {
  const out = { ...DEFAULT_INDEX_BANNER };
  for (const locale of ["ko", "en", "id"] as const) {
    const v = raw?.[locale];
    if (typeof v === "string" && v.trim()) {
      out[locale] = v.trim().slice(0, 200);
    }
  }
  return out;
}

export function indexBannerForLocale(
  banner: IndexBannerMap,
  locale: Locale,
): string {
  return banner[locale] || banner.ko;
}
