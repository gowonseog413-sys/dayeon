import {
  DEFAULT_HERO_BANNERS,
  normalizeHeroBanners,
  type HeroBannerSlide,
} from "@/lib/hero-banners";

export const HERO_BANNERS_UPDATED_EVENT = "dayeon-hero-banners-updated";
export const HERO_BANNERS_STORAGE_KEY = "dayeon-hero-banners";
const HERO_BANNERS_CHANNEL = "dayeon-hero-banners";

const listeners = new Set<(slides: HeroBannerSlide[]) => void>();
let channel: BroadcastChannel | null = null;

function notifyListeners(slides: HeroBannerSlide[]) {
  listeners.forEach((fn) => fn(normalizeHeroBanners(slides)));
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(HERO_BANNERS_CHANNEL);
    channel.onmessage = (ev) => {
      if (ev.data?.heroBanners) notifyListeners(ev.data.heroBanners);
    };
  } catch {
    channel = null;
  }
  return channel;
}

export function publishHeroBannersUpdate(slides: HeroBannerSlide[]): HeroBannerSlide[] {
  const next = normalizeHeroBanners(slides);

  window.dispatchEvent(
    new CustomEvent(HERO_BANNERS_UPDATED_EVENT, { detail: { heroBanners: next } }),
  );

  getChannel()?.postMessage({ heroBanners: next, at: Date.now() });

  try {
    localStorage.setItem(
      HERO_BANNERS_STORAGE_KEY,
      JSON.stringify({ slides: next, at: Date.now() }),
    );
  } catch {
    /* ignore */
  }

  return next;
}

export function subscribeHeroBannersUpdates(
  onSlides: (slides: HeroBannerSlide[]) => void,
): () => void {
  listeners.add(onSlides);
  getChannel();

  const onEvent = (e: Event) => {
    const detail = (e as CustomEvent<{ heroBanners: HeroBannerSlide[] }>).detail;
    if (detail?.heroBanners) onSlides(normalizeHeroBanners(detail.heroBanners));
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key !== HERO_BANNERS_STORAGE_KEY || !e.newValue) return;
    try {
      const parsed = JSON.parse(e.newValue) as { slides?: HeroBannerSlide[] };
      onSlides(normalizeHeroBanners(parsed.slides));
    } catch {
      onSlides(DEFAULT_HERO_BANNERS);
    }
  };

  window.addEventListener(HERO_BANNERS_UPDATED_EVENT, onEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onSlides);
    window.removeEventListener(HERO_BANNERS_UPDATED_EVENT, onEvent);
    window.removeEventListener("storage", onStorage);
  };
}
