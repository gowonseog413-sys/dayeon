import type { Locale } from "@/i18n/messages";
import type { LegalSection } from "./types";
import { TERMS_EN } from "./terms-en";
import { TERMS_ID } from "./terms-id";
import { TERMS_KO } from "./terms-ko";

const BY_LOCALE: Record<Locale, LegalSection[]> = {
  ko: TERMS_KO,
  en: TERMS_EN,
  id: TERMS_ID,
};

export function getTermsSections(locale: Locale): LegalSection[] {
  return BY_LOCALE[locale] ?? TERMS_KO;
}
