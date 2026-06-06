import { SITE_THEMES } from "./site-theme.js";

export function normalizeThemeMotion(raw) {
  const out = {};
  for (const theme of SITE_THEMES) {
    out[theme] = raw?.[theme] !== false;
  }
  return out;
}

export function isMotionEnabled(themeMotion, theme) {
  return normalizeThemeMotion(themeMotion)[theme] !== false;
}
