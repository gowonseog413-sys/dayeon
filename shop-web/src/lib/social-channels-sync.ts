import {
  DEFAULT_SOCIAL_CHANNELS,
  normalizeSocialChannels,
  type SocialChannels,
} from "@/lib/social-channels";

export const SOCIAL_CHANNELS_UPDATED_EVENT = "dayeon-social-channels-updated";
export const SOCIAL_CHANNELS_STORAGE_KEY = "dayeon-social-channels";
const SOCIAL_CHANNELS_CHANNEL = "dayeon-social-channels";

const listeners = new Set<(channels: SocialChannels) => void>();
let channel: BroadcastChannel | null = null;

function notifyListeners(channels: SocialChannels) {
  listeners.forEach((fn) => fn(normalizeSocialChannels(channels)));
}

function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel(SOCIAL_CHANNELS_CHANNEL);
    channel.onmessage = (ev) => {
      if (ev.data?.socialChannels) notifyListeners(ev.data.socialChannels);
    };
  }
  return channel;
}

export function publishSocialChannelsUpdate(channels: SocialChannels): SocialChannels {
  const next = normalizeSocialChannels(channels);
  try {
    localStorage.setItem(SOCIAL_CHANNELS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent(SOCIAL_CHANNELS_UPDATED_EVENT, { detail: { socialChannels: next } }),
  );
  getChannel()?.postMessage({ socialChannels: next, at: Date.now() });
  return next;
}

export function subscribeSocialChannelsUpdates(
  onChannels: (channels: SocialChannels) => void,
): () => void {
  listeners.add(onChannels);
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<{ socialChannels: SocialChannels }>).detail;
    if (detail?.socialChannels) onChannels(normalizeSocialChannels(detail.socialChannels));
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key !== SOCIAL_CHANNELS_STORAGE_KEY || !e.newValue) return;
    try {
      onChannels(normalizeSocialChannels(JSON.parse(e.newValue)));
    } catch {
      /* ignore */
    }
  };
  window.addEventListener(SOCIAL_CHANNELS_UPDATED_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChannels);
    window.removeEventListener(SOCIAL_CHANNELS_UPDATED_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

export function readCachedSocialChannels(): SocialChannels {
  if (typeof window === "undefined") return { ...DEFAULT_SOCIAL_CHANNELS };
  try {
    const raw = localStorage.getItem(SOCIAL_CHANNELS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SOCIAL_CHANNELS };
    return normalizeSocialChannels(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SOCIAL_CHANNELS };
  }
}
