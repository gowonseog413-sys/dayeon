export const MESSAGES_UPDATED_EVENT = "dayeon-messages-updated";
export const MESSAGES_PING_STORAGE_KEY = "dayeon-messages-ping";
const MESSAGES_CHANNEL = "dayeon-messages";

const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(MESSAGES_CHANNEL);
    channel.onmessage = () => listeners.forEach((fn) => fn());
  } catch {
    channel = null;
  }
  return channel;
}

export function publishMessagesUpdated() {
  window.dispatchEvent(new CustomEvent(MESSAGES_UPDATED_EVENT));
  getChannel()?.postMessage({ at: Date.now() });
  try {
    localStorage.setItem(MESSAGES_PING_STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function subscribeMessagesUpdates(onUpdate: () => void): () => void {
  listeners.add(onUpdate);
  getChannel();

  const onEvent = () => onUpdate();
  const onStorage = (e: StorageEvent) => {
    if (e.key === MESSAGES_PING_STORAGE_KEY) onUpdate();
  };

  window.addEventListener(MESSAGES_UPDATED_EVENT, onEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onUpdate);
    window.removeEventListener(MESSAGES_UPDATED_EVENT, onEvent);
    window.removeEventListener("storage", onStorage);
  };
}
