import {
  DEFAULT_PARTNER_BANNERS,
  normalizePartnerBanners,
  type PartnerBanners,
} from "@/lib/partner-banners";

export const PARTNER_BANNERS_UPDATED_EVENT = "dayeon-partner-banners-updated";
export const PARTNER_BANNERS_STORAGE_KEY = "dayeon-partner-banners";
const PARTNER_BANNERS_CHANNEL = "dayeon-partner-banners";

const listeners = new Set<(banners: PartnerBanners) => void>();
let channel: BroadcastChannel | null = null;

function notifyListeners(banners: PartnerBanners) {
  listeners.forEach((fn) => fn(normalizePartnerBanners(banners)));
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(PARTNER_BANNERS_CHANNEL);
    channel.onmessage = (ev) => {
      if (ev.data?.partnerBanners) notifyListeners(ev.data.partnerBanners);
    };
  } catch {
    channel = null;
  }
  return channel;
}

export function publishPartnerBannersUpdate(banners: PartnerBanners): PartnerBanners {
  const next = normalizePartnerBanners(banners);

  window.dispatchEvent(
    new CustomEvent(PARTNER_BANNERS_UPDATED_EVENT, { detail: { partnerBanners: next } }),
  );

  getChannel()?.postMessage({ partnerBanners: next, at: Date.now() });

  try {
    localStorage.setItem(
      PARTNER_BANNERS_STORAGE_KEY,
      JSON.stringify({ ...next, at: Date.now() }),
    );
  } catch {
    /* ignore */
  }

  return next;
}

export function subscribePartnerBannersUpdates(
  onBanners: (banners: PartnerBanners) => void,
): () => void {
  listeners.add(onBanners);
  getChannel();

  const onEvent = (e: Event) => {
    const detail = (e as CustomEvent<{ partnerBanners: PartnerBanners }>).detail;
    if (detail?.partnerBanners) onBanners(normalizePartnerBanners(detail.partnerBanners));
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key !== PARTNER_BANNERS_STORAGE_KEY || !e.newValue) return;
    try {
      const parsed = JSON.parse(e.newValue) as Partial<PartnerBanners>;
      onBanners(normalizePartnerBanners(parsed));
    } catch {
      onBanners(DEFAULT_PARTNER_BANNERS);
    }
  };

  window.addEventListener(PARTNER_BANNERS_UPDATED_EVENT, onEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onBanners);
    window.removeEventListener(PARTNER_BANNERS_UPDATED_EVENT, onEvent);
    window.removeEventListener("storage", onStorage);
  };
}
