import {
  DEFAULT_INDEX_BANNER,
  normalizeIndexBanner,
  type IndexBannerMap,
} from "@/lib/index-banner";

export const INDEX_BANNER_UPDATED_EVENT = "dayeon-index-banner-updated";
export const INDEX_BANNER_STORAGE_KEY = "dayeon-index-banner";
const INDEX_BANNER_CHANNEL = "dayeon-index-banner";

const listeners = new Set<(banner: IndexBannerMap) => void>();
let channel: BroadcastChannel | null = null;

function notifyListeners(banner: IndexBannerMap) {
  listeners.forEach((fn) => fn(normalizeIndexBanner(banner)));
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(INDEX_BANNER_CHANNEL);
    channel.onmessage = (ev) => {
      if (ev.data?.indexBanner) notifyListeners(ev.data.indexBanner);
    };
  } catch {
    channel = null;
  }
  return channel;
}

export function publishIndexBannerUpdate(banner: IndexBannerMap): IndexBannerMap {
  const next = normalizeIndexBanner(banner);

  window.dispatchEvent(
    new CustomEvent(INDEX_BANNER_UPDATED_EVENT, { detail: { indexBanner: next } }),
  );

  getChannel()?.postMessage({ indexBanner: next, at: Date.now() });

  try {
    localStorage.setItem(INDEX_BANNER_STORAGE_KEY, JSON.stringify({ ...next, at: Date.now() }));
  } catch {
    /* ignore */
  }

  return next;
}

export function subscribeIndexBannerUpdates(
  onBanner: (banner: IndexBannerMap) => void,
): () => void {
  listeners.add(onBanner);
  getChannel();

  const onEvent = (e: Event) => {
    const detail = (e as CustomEvent<{ indexBanner: IndexBannerMap }>).detail;
    if (detail?.indexBanner) onBanner(normalizeIndexBanner(detail.indexBanner));
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key !== INDEX_BANNER_STORAGE_KEY || !e.newValue) return;
    try {
      const parsed = JSON.parse(e.newValue) as Partial<IndexBannerMap>;
      onBanner(normalizeIndexBanner(parsed));
    } catch {
      onBanner(DEFAULT_INDEX_BANNER);
    }
  };

  window.addEventListener(INDEX_BANNER_UPDATED_EVENT, onEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onBanner);
    window.removeEventListener(INDEX_BANNER_UPDATED_EVENT, onEvent);
    window.removeEventListener("storage", onStorage);
  };
}
