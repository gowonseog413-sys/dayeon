"use client";

import type { Locale } from "./messages";

const STORAGE_KEY = "eyesight_locale";
export const LOCALE_EVENT = "eyesight-locale-change";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "ko";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "en" || v === "id" || v === "ko") return v;
  return "ko";
}

export function setStoredLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale === "id" ? "id" : locale === "en" ? "en" : "ko";
  window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: locale }));
}
