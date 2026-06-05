export const SITE_THEMES = ["pink", "clean", "indonesia"];

export function normalizeSiteTheme(raw) {
  if (raw === "clean" || raw === "indonesia") return raw;
  return "pink";
}
