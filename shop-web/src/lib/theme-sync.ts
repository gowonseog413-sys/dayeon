import {
  normalizeSiteThemeSettings,
  type SiteThemeSettings,
} from "@/lib/theme-settings";
import { normalizeSiteTheme, type SiteTheme } from "@/lib/theme";

export const THEME_UPDATED_EVENT = "dayeon-theme-updated";
export const THEME_STORAGE_KEY = "dayeon-site-theme";
const THEME_CHANNEL = "dayeon-site-theme";

const listeners = new Set<(settings: SiteThemeSettings) => void>();
let channel: BroadcastChannel | null = null;

function notifyListeners(settings: SiteThemeSettings) {
  const next = normalizeSiteThemeSettings(settings);
  listeners.forEach((fn) => fn(next));
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(THEME_CHANNEL);
    channel.onmessage = (ev) => {
      if (ev.data?.theme) notifyListeners(ev.data);
    };
  } catch {
    channel = null;
  }
  return channel;
}

export function syncThemeToDom(theme: SiteTheme): SiteTheme {
  const next = normalizeSiteTheme(theme);
  document.documentElement.setAttribute("data-theme", next);
  return next;
}

/** 관리자 적용 직후 — 같은 브라우저 다른 탭에 즉시 알림 */
export function publishThemeSettingsUpdate(
  settings: Partial<SiteThemeSettings>,
): SiteThemeSettings {
  const next = normalizeSiteThemeSettings(settings);
  syncThemeToDom(next.theme);

  window.dispatchEvent(
    new CustomEvent(THEME_UPDATED_EVENT, { detail: next }),
  );

  getChannel()?.postMessage({ ...next, at: Date.now() });

  try {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ ...next, at: Date.now() }),
    );
  } catch {
    /* storage 비활성 */
  }

  return next;
}

/** @deprecated publishThemeSettingsUpdate 사용 */
export function publishThemeUpdate(theme: SiteTheme): SiteTheme {
  return publishThemeSettingsUpdate({ theme }).theme;
}

export function subscribeThemeUpdates(
  onSettings: (settings: SiteThemeSettings) => void,
): () => void {
  listeners.add(onSettings);
  getChannel();

  const onEvent = (e: Event) => {
    const detail = (e as CustomEvent<SiteThemeSettings>).detail;
    if (detail?.theme) onSettings(normalizeSiteThemeSettings(detail));
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY || !e.newValue) return;
    try {
      const parsed = JSON.parse(e.newValue) as Partial<SiteThemeSettings>;
      onSettings(normalizeSiteThemeSettings(parsed));
    } catch {
      onSettings(normalizeSiteThemeSettings({ theme: e.newValue.split(":")[0] }));
    }
  };

  window.addEventListener(THEME_UPDATED_EVENT, onEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onSettings);
    window.removeEventListener(THEME_UPDATED_EVENT, onEvent);
    window.removeEventListener("storage", onStorage);
  };
}
