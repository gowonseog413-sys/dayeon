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
  DEFAULT_SOCIAL_CHANNELS,
  normalizeSocialChannels,
  type SocialChannels,
} from "@/lib/social-channels";
import { subscribeSocialChannelsUpdates } from "@/lib/social-channels-sync";

type SocialChannelContextValue = {
  channels: SocialChannels;
  refresh: () => Promise<void>;
};

const SocialChannelContext = createContext<SocialChannelContextValue>({
  channels: DEFAULT_SOCIAL_CHANNELS,
  refresh: async () => {},
});

export function SocialChannelProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<SocialChannels>(DEFAULT_SOCIAL_CHANNELS);

  const applyChannels = useCallback((next: SocialChannels) => {
    setChannels(normalizeSocialChannels(next));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ socialChannels: SocialChannels }>(
        `/api/settings/social-channels?_=${Date.now()}`,
        { cache: "no-store" },
      );
      applyChannels(normalizeSocialChannels(data.socialChannels));
    } catch {
      /* keep current */
    }
  }, [applyChannels]);

  useEffect(() => {
    refresh();
    const unsub = subscribeSocialChannelsUpdates(applyChannels);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      unsub();
      window.removeEventListener("focus", onFocus);
    };
  }, [applyChannels, refresh]);

  const value = useMemo(() => ({ channels, refresh }), [channels, refresh]);

  return (
    <SocialChannelContext.Provider value={value}>{children}</SocialChannelContext.Provider>
  );
}

export function useSocialChannels() {
  return useContext(SocialChannelContext);
}
