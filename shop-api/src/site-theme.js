export const SITE_THEMES = ["pink", "clean", "indonesia", "dark", "aqua"];

export function normalizeSiteTheme(raw) {
  if (raw === "clean" || raw === "indonesia" || raw === "dark" || raw === "aqua") {
    return raw;
  }
  return "pink";
}
