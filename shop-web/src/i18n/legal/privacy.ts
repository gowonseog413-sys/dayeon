import type { Locale } from "@/i18n/messages";
import type { LegalSection } from "./types";
import { PRIVACY_EN } from "./privacy-en";
import { PRIVACY_ID } from "./privacy-id";
import { PRIVACY_KO } from "./privacy-ko";

const BY_LOCALE: Record<Locale, LegalSection[]> = {
  ko: PRIVACY_KO,
  en: PRIVACY_EN,
  id: PRIVACY_ID,
};

export function getPrivacySections(locale: Locale): LegalSection[] {
  return BY_LOCALE[locale] ?? PRIVACY_KO;
}
