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
import { normalizeSiteTheme, type SiteTheme } from "@/lib/theme";

export const THEME_UPDATED_EVENT = "dayeon-theme-updated";

type ThemeContextValue = {
  theme: SiteTheme;
  refresh: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyDomTheme(theme: SiteTheme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>("pink");

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ theme: SiteTheme }>("/api/settings/theme", {
        cache: "no-store",
      });
      const next = normalizeSiteTheme(data.theme);
      setTheme(next);
      applyDomTheme(next);
    } catch {
      setTheme("pink");
      applyDomTheme("pink");
    }
  }, []);

  useEffect(() => {
    refresh();
    const onTheme = () => refresh();
    window.addEventListener(THEME_UPDATED_EVENT, onTheme);
    return () => window.removeEventListener(THEME_UPDATED_EVENT, onTheme);
  }, [refresh]);

  const value = useMemo(() => ({ theme, refresh }), [theme, refresh]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
