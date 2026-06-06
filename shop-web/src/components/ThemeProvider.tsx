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
  normalizeSiteThemeSettings,
  type SiteThemeSettings,
} from "@/lib/theme-settings";
import type { SiteTheme } from "@/lib/theme";
import {
  publishThemeSettingsUpdate,
  subscribeThemeUpdates,
  syncThemeToDom,
} from "@/lib/theme-sync";

export {
  THEME_UPDATED_EVENT,
  publishThemeSettingsUpdate,
  publishThemeUpdate,
} from "@/lib/theme-sync";

type ThemeContextValue = SiteThemeSettings & {
  refresh: () => Promise<void>;
  applySettings: (settings: Partial<SiteThemeSettings>) => void;
  applyTheme: (theme: SiteTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteThemeSettings>(() =>
    normalizeSiteThemeSettings({}),
  );
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const applySettings = useCallback((partial: Partial<SiteThemeSettings>) => {
    const next = normalizeSiteThemeSettings({
      ...settingsRef.current,
      ...partial,
    });
    syncThemeToDom(next.theme);
    setSettings(next);
  }, []);

  const applyTheme = useCallback(
    (theme: SiteTheme) => {
      applySettings({ theme });
    },
    [applySettings],
  );

  const refresh = useCallback(async () => {
    try {
      const data = await api<SiteThemeSettings>("/api/settings/theme", {
        cache: "no-store",
      });
      applySettings(normalizeSiteThemeSettings(data));
    } catch {
      applySettings({ theme: "pink" });
    }
  }, [applySettings]);

  useEffect(() => {
    refresh();
    return subscribeThemeUpdates((next) => {
      applySettings(next);
    });
  }, [refresh, applySettings]);

  useEffect(() => {
    let cancelled = false;
    const POLL_MS = 2000;

    const poll = async () => {
      if (document.hidden || cancelled) return;
      try {
        const data = await api<SiteThemeSettings>(
          `/api/settings/theme?_=${Date.now()}`,
          { cache: "no-store" },
        );
        if (cancelled) return;
        const next = normalizeSiteThemeSettings(data);
        const cur = settingsRef.current;
        if (
          cur.theme === next.theme &&
          cur.motionEnabled === next.motionEnabled &&
          JSON.stringify(cur.themeMotion) === JSON.stringify(next.themeMotion)
        ) {
          return;
        }
        applySettings(next);
      } catch {
        /* 네트워크 일시 오류 무시 */
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
  }, [applySettings]);

  const value = useMemo(
    () => ({
      ...settings,
      refresh,
      applySettings,
      applyTheme,
    }),
    [settings, refresh, applySettings, applyTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
