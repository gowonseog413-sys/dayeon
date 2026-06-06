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
  DEFAULT_PARTNER_BANNERS,
  hasPartnerBanners,
  normalizePartnerBanners,
  type PartnerBanners,
} from "@/lib/partner-banners";
import { subscribePartnerBannersUpdates } from "@/lib/partner-banners-sync";

type PartnerBannerContextValue = {
  partnerBanners: PartnerBanners;
  visible: boolean;
  refresh: () => Promise<void>;
};

const PartnerBannerContext = createContext<PartnerBannerContextValue>({
  partnerBanners: DEFAULT_PARTNER_BANNERS,
  visible: false,
  refresh: async () => {},
});

export function PartnerBannerProvider({ children }: { children: React.ReactNode }) {
  const [partnerBanners, setPartnerBanners] = useState<PartnerBanners>(DEFAULT_PARTNER_BANNERS);
  const bannersRef = useRef(partnerBanners);
  bannersRef.current = partnerBanners;

  const applyBanners = useCallback((next: PartnerBanners) => {
    setPartnerBanners(normalizePartnerBanners(next));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ partnerBanners: PartnerBanners }>(
        `/api/settings/partner-banners?_=${Date.now()}`,
        { cache: "no-store" },
      );
      applyBanners(normalizePartnerBanners(data.partnerBanners));
    } catch {
      /* keep current */
    }
  }, [applyBanners]);

  useEffect(() => {
    refresh();
    const unsub = subscribePartnerBannersUpdates(applyBanners);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      unsub();
      window.removeEventListener("focus", onFocus);
    };
  }, [applyBanners, refresh]);

  const value = useMemo(
    () => ({
      partnerBanners,
      visible: hasPartnerBanners(partnerBanners),
      refresh,
    }),
    [partnerBanners, refresh],
  );

  return (
    <PartnerBannerContext.Provider value={value}>{children}</PartnerBannerContext.Provider>
  );
}

export function usePartnerBanners() {
  return useContext(PartnerBannerContext);
}
