export const CMS_LOCALES = ["ko", "en", "id"];

export function isLegacyCmsPage(entry) {
  return Boolean(entry && typeof entry.title === "string");
}

/** `{ ko: page }` 형태로 통일 (기존 단일 객체는 ko로 승격) */
export function normalizeCmsPageEntry(entry) {
  if (!entry) return { ko: { title: "", html: "<p></p>", sections: [] } };
  if (isLegacyCmsPage(entry)) return { ko: structuredClone(entry) };
  return structuredClone(entry);
}

export function normalizeCmsPagesMap(pages) {
  const out = {};
  for (const [key, entry] of Object.entries(pages || {})) {
    out[key] = normalizeCmsPageEntry(entry);
  }
  return out;
}

export function getCmsPageLocale(entry, locale) {
  const normalized = normalizeCmsPageEntry(entry);
  return normalized[locale] || null;
}
