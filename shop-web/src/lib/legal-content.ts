import type { Locale } from "@/i18n/messages";
import type { LegalSection } from "@/i18n/legal/types";
import { getPrivacySections } from "@/i18n/legal/privacy";
import { getTermsSections } from "@/i18n/legal/terms";
import { sectionsToHtml } from "@/lib/sections-to-html";
import { api } from "@/lib/api";

export type LegalDoc = "terms" | "privacy";

export type LegalDocument = {
  html?: string;
  sections: LegalSection[];
};

export async function fetchLegalDocument(doc: LegalDoc, locale: Locale): Promise<LegalDocument> {
  try {
    const data = await api<{ html?: string; sections?: LegalSection[] }>(
      `/api/content/legal/${doc}?locale=${locale}`,
    );
    if (data.html?.trim()) {
      return { html: data.html, sections: [] };
    }
    if (data.sections?.length) {
      return { sections: data.sections };
    }
  } catch {
    /* i18n fallback */
  }
  const sections = doc === "terms" ? getTermsSections(locale) : getPrivacySections(locale);
  return { sections };
}

/** @deprecated fetchLegalDocument 사용 */
export async function fetchLegalSections(doc: LegalDoc, locale: Locale): Promise<LegalSection[]> {
  const doc_ = await fetchLegalDocument(doc, locale);
  return doc_.sections;
}

export function legalSectionsToHtml(sections: LegalSection[]): string {
  return sectionsToHtml(sections);
}
