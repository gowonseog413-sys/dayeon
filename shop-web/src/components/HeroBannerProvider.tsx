"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import {
  DEFAULT_HERO_BANNERS,
  normalizeHeroBanners,
  type HeroBannerSlide,
} from "@/lib/hero-banners";
import { subscribeHeroBannersUpdates } from "@/lib/hero-banners-sync";

type HeroBannerContextValue = {
  heroBanners: HeroBannerSlide[];
  refresh: () => Promise<void>;
};

const HeroBannerContext = createContext<HeroBannerContextValue>({
  heroBanners: DEFAULT_HERO_BANNERS,
  refresh: async () => {},
});

export function HeroBannerProvider({ children }: { children: React.ReactNode }) {
  const [heroBanners, setHeroBanners] = useState<HeroBannerSlide[]>(DEFAULT_HERO_BANNERS);

  const apply = useCallback((next: HeroBannerSlide[]) => {
    setHeroBanners(normalizeHeroBanners(next));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ heroBanners: HeroBannerSlide[] }>(
        `/api/settings/hero-banners?_=${Date.now()}`,
        { cache: "no-store" },
      );
      apply(data.heroBanners);
    } catch {
      /* keep current */
    }
  }, [apply]);

  useEffect(() => {
    refresh();
    const unsub = subscribeHeroBannersUpdates(apply);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      unsub();
      window.removeEventListener("focus", onFocus);
    };
  }, [apply, refresh]);

  const value = useMemo(() => ({ heroBanners, refresh }), [heroBanners, refresh]);

  return <HeroBannerContext.Provider value={value}>{children}</HeroBannerContext.Provider>;
}

export function useHeroBanners() {
  return useContext(HeroBannerContext);
}
