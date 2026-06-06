import {
  isMotionEnabled,
  normalizeSiteTheme,
  normalizeThemeMotion,
  type SiteTheme,
  type ThemeMotionMap,
} from "@/lib/theme";

export type SiteThemeSettings = {
  theme: SiteTheme;
  themeMotion: ThemeMotionMap;
  motionEnabled: boolean;
};

export function normalizeSiteThemeSettings(raw: {
  theme?: string | null;
  themeMotion?: Partial<ThemeMotionMap> | null;
  motionEnabled?: boolean;
}): SiteThemeSettings {
  const theme = normalizeSiteTheme(raw.theme);
  const themeMotion = normalizeThemeMotion(raw.themeMotion);
  return {
    theme,
    themeMotion,
    motionEnabled:
      raw.motionEnabled !== undefined
        ? raw.motionEnabled
        : isMotionEnabled(themeMotion, theme),
  };
}
