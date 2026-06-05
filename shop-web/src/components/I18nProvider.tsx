"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MESSAGES, translate, translateFmt, type Locale } from "@/i18n/messages";
import { getStoredLocale, LOCALE_EVENT, setStoredLocale } from "@/i18n/locale-store";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  tFmt: (key: string, vars: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");

  useEffect(() => {
    const initial = getStoredLocale();
    setLocaleState(initial);
    document.documentElement.lang = initial === "id" ? "id" : initial === "en" ? "en" : "ko";

    const onChange = (e: Event) => {
      const next = (e as CustomEvent<Locale>).detail;
      if (next && MESSAGES[next]) setLocaleState(next);
    };
    window.addEventListener(LOCALE_EVENT, onChange);
    return () => window.removeEventListener(LOCALE_EVENT, onChange);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setStoredLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback((key: string) => translate(locale, key), [locale]);
  const tFmt = useCallback(
    (key: string, vars: Record<string, string | number>) =>
      translateFmt(locale, key, vars),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, tFmt }),
    [locale, setLocale, t, tFmt],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: "ko" as Locale,
      setLocale: () => {},
      t: (key: string) => translate("ko", key),
      tFmt: (key: string, vars: Record<string, string | number>) =>
        translateFmt("ko", key, vars),
    };
  }
  return ctx;
}
