import { readDb, updateDb } from "./db.js";
import { normalizeCmsPagesMap } from "./cms-locales.js";
import { DEFAULT_LEGAL } from "./default-legal-content.js";
import { DEFAULT_SITE_CONTENT } from "./default-site-content.js";

function withLegalDefaults(content) {
  const merged = structuredClone(content);
  if (!merged.legal) merged.legal = structuredClone(DEFAULT_LEGAL);
  else {
    for (const doc of ["terms", "privacy"]) {
      if (!merged.legal[doc]) merged.legal[doc] = structuredClone(DEFAULT_LEGAL[doc]);
      for (const locale of ["ko", "en", "id"]) {
        if (!merged.legal[doc][locale]?.sections?.length) {
          merged.legal[doc][locale] = structuredClone(DEFAULT_LEGAL[doc][locale]);
        }
      }
    }
  }
  return merged;
}

function withNormalizedCms(content) {
  const merged = withLegalDefaults(structuredClone(content));
  if (merged.pages) merged.pages = normalizeCmsPagesMap(merged.pages);
  if (merged.support) merged.support = normalizeCmsPagesMap(merged.support);
  return merged;
}

export function getSiteContent() {
  const db = readDb();
  if (!db.siteContent?.pages) {
    return withNormalizedCms(structuredClone(DEFAULT_SITE_CONTENT));
  }
  return withNormalizedCms(db.siteContent);
}

export function ensureSiteContent() {
  const db = readDb();
  if (!db.siteContent?.pages) {
    updateDb((d) => {
      d.siteContent = withLegalDefaults(structuredClone(DEFAULT_SITE_CONTENT));
    });
    return;
  }
  if (!db.siteContent.legal?.terms?.ko?.sections?.length) {
    updateDb((d) => {
      d.siteContent = withLegalDefaults(d.siteContent);
    });
  }
}
