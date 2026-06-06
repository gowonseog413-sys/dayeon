export const SITE_THEMES = ["pink", "clean", "indonesia", "dark", "aqua"] as const;

export type SiteTheme = (typeof SITE_THEMES)[number];

export const THEME_LABELS: Record<SiteTheme, string> = {
  pink: "러블리 핑크",
  clean: "모노 클린",
  indonesia: "선셋 웜",
  dark: "다크 프리미엄",
  aqua: "아쿠아 클린",
};

export const THEME_PREVIEW: Record<SiteTheme, string> = {
  pink: "/erp/theme-pink-preview.png",
  clean: "/erp/theme-clean-preview.png",
  indonesia: "/erp/theme-indonesia-preview.png",
  dark: "/erp/theme-dark-preview.png",
  aqua: "/erp/theme-aqua-preview.png",
};

export function normalizeSiteTheme(raw: string | undefined | null): SiteTheme {
  if (
    raw === "clean" ||
    raw === "indonesia" ||
    raw === "dark" ||
    raw === "aqua"
  ) {
    return raw;
  }
  return "pink";
}

export type ThemeMotionMap = Record<SiteTheme, boolean>;

export const DEFAULT_THEME_MOTION: ThemeMotionMap = {
  pink: true,
  clean: true,
  indonesia: true,
  dark: true,
  aqua: true,
};

export function normalizeThemeMotion(
  raw: Partial<ThemeMotionMap> | undefined | null,
): ThemeMotionMap {
  const out = { ...DEFAULT_THEME_MOTION };
  for (const id of SITE_THEMES) {
    if (raw?.[id] === false) out[id] = false;
  }
  return out;
}

export function isMotionEnabled(
  themeMotion: ThemeMotionMap,
  theme: SiteTheme,
): boolean {
  return themeMotion[theme] !== false;
}

/** 핑크 외 미니멀 UI(깔끔·인도네시아·아쿠아) */
export function isMinimalTheme(theme: SiteTheme): boolean {
  return theme === "clean" || theme === "indonesia" || theme === "aqua";
}

export function isIndonesiaTheme(theme: SiteTheme): boolean {
  return theme === "indonesia";
}

export function isDarkTheme(theme: SiteTheme): boolean {
  return theme === "dark";
}

export function isAquaTheme(theme: SiteTheme): boolean {
  return theme === "aqua";
}
