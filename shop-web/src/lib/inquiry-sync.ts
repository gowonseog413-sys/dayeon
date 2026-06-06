import type { Inquiry } from "@/lib/types";

export const INQUIRY_UPDATED_EVENT = "dayeon-inquiry-updated";
export const INQUIRY_PING_STORAGE_KEY = "dayeon-inquiry-ping";
const INQUIRY_CHANNEL = "dayeon-inquiry";

const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(INQUIRY_CHANNEL);
    channel.onmessage = () => {
      listeners.forEach((fn) => fn());
    };
  } catch {
    channel = null;
  }
  return channel;
}

/** 관리자 답변 등록 시 — 고객 편지함 갱신용 */
export function publishInquiryReplyUpdated() {
  publishInquiryCreated();
}

export function publishInquiryCreated(_inquiry?: Inquiry) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(INQUIRY_UPDATED_EVENT));

  getChannel()?.postMessage({ at: Date.now() });

  try {
    localStorage.setItem(INQUIRY_PING_STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function subscribeInquiryUpdates(onUpdate: () => void): () => void {
  listeners.add(onUpdate);
  getChannel();

  const onEvent = () => onUpdate();
  const onStorage = (e: StorageEvent) => {
    if (e.key === INQUIRY_PING_STORAGE_KEY) onUpdate();
  };

  window.addEventListener(INQUIRY_UPDATED_EVENT, onEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onUpdate);
    window.removeEventListener(INQUIRY_UPDATED_EVENT, onEvent);
    window.removeEventListener("storage", onStorage);
  };
}
