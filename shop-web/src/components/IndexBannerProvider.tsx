"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "@/lib/api";
import {
  DEFAULT_INDEX_BANNER,
  indexBannerForLocale,
  normalizeIndexBanner,
  type IndexBannerMap,
} from "@/lib/index-banner";
import { subscribeIndexBannerUpdates } from "@/lib/index-banner-sync";
import type { Locale } from "@/i18n/messages";
import { useI18n } from "@/components/I18nProvider";

type IndexBannerContextValue = {
  indexBanner: IndexBannerMap;
  text: string;
  refresh: () => Promise<void>;
};

const IndexBannerContext = createContext<IndexBannerContextValue | null>(null);

export function IndexBannerProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const [indexBanner, setIndexBanner] = useState<IndexBannerMap>(DEFAULT_INDEX_BANNER);
  const bannerRef = useRef(indexBanner);
  bannerRef.current = indexBanner;

  const applyBanner = useCallback((next: IndexBannerMap) => {
    setIndexBanner(normalizeIndexBanner(next));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ indexBanner: IndexBannerMap }>("/api/settings/index-banner", {
        cache: "no-store",
      });
      applyBanner(normalizeIndexBanner(data.indexBanner));
    } catch {
      applyBanner(DEFAULT_INDEX_BANNER);
    }
  }, [applyBanner]);

  useEffect(() => {
    refresh();
    return subscribeIndexBannerUpdates(applyBanner);
  }, [refresh, applyBanner]);

  useEffect(() => {
    let cancelled = false;
    const POLL_MS = 2000;

    const poll = async () => {
      if (document.hidden || cancelled) return;
      try {
        const data = await api<{ indexBanner: IndexBannerMap }>(
          `/api/settings/index-banner?_=${Date.now()}`,
          { cache: "no-store" },
        );
        if (cancelled) return;
        const next = normalizeIndexBanner(data.indexBanner);
        if (JSON.stringify(bannerRef.current) !== JSON.stringify(next)) {
          applyBanner(next);
        }
      } catch {
        /* ignore */
      }
    };

    const id = window.setInterval(poll, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) void poll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [applyBanner]);

  const value = useMemo(
    () => ({
      indexBanner,
      text: indexBannerForLocale(indexBanner, locale),
      refresh,
    }),
    [indexBanner, locale, refresh],
  );

  return (
    <IndexBannerContext.Provider value={value}>{children}</IndexBannerContext.Provider>
  );
}

export function useIndexBanner() {
  const ctx = useContext(IndexBannerContext);
  if (!ctx) {
    return {
      indexBanner: DEFAULT_INDEX_BANNER,
      text: indexBannerForLocale(DEFAULT_INDEX_BANNER, "ko" as Locale),
      refresh: async () => {},
    };
  }
  return ctx;
}
