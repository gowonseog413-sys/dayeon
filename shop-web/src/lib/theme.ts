export const SITE_THEMES = ["pink", "clean", "indonesia"] as const;

export type SiteTheme = (typeof SITE_THEMES)[number];

export const THEME_LABELS: Record<SiteTheme, string> = {
  pink: "핑크테마",
  clean: "깔끔테마",
  indonesia: "인도네시아테마",
};

export const THEME_PREVIEW: Record<SiteTheme, string> = {
  pink: "/erp/theme-pink-preview.png",
  clean: "/erp/theme-clean-preview.png",
  indonesia: "/erp/theme-indonesia-preview.png",
};

export function normalizeSiteTheme(raw: string | undefined | null): SiteTheme {
  if (raw === "clean" || raw === "indonesia") return raw;
  return "pink";
}

/** 핑크 외 미니멀 UI(깔끔·인도네시아) */
export function isMinimalTheme(theme: SiteTheme): boolean {
  return theme === "clean" || theme === "indonesia";
}

export function isIndonesiaTheme(theme: SiteTheme): boolean {
  return theme === "indonesia";
}
