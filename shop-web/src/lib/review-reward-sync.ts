import {
  DEFAULT_REVIEW_REWARD,
  normalizeReviewReward,
  type ReviewReward,
} from "@/lib/review-reward";

export const REVIEW_REWARD_UPDATED_EVENT = "dayeon-review-reward-updated";
export const REVIEW_REWARD_STORAGE_KEY = "dayeon-review-reward";
const REVIEW_REWARD_CHANNEL = "dayeon-review-reward";

const listeners = new Set<(reward: ReviewReward) => void>();
let channel: BroadcastChannel | null = null;

function notifyListeners(reward: ReviewReward) {
  listeners.forEach((fn) => fn(normalizeReviewReward(reward)));
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(REVIEW_REWARD_CHANNEL);
    channel.onmessage = (ev) => {
      if (ev.data?.reviewReward) notifyListeners(ev.data.reviewReward);
    };
  } catch {
    channel = null;
  }
  return channel;
}

export function publishReviewRewardUpdate(reward: ReviewReward): ReviewReward {
  const next = normalizeReviewReward(reward);

  window.dispatchEvent(
    new CustomEvent(REVIEW_REWARD_UPDATED_EVENT, { detail: { reviewReward: next } }),
  );

  getChannel()?.postMessage({ reviewReward: next, at: Date.now() });

  try {
    localStorage.setItem(
      REVIEW_REWARD_STORAGE_KEY,
      JSON.stringify({ reviewReward: next, at: Date.now() }),
    );
  } catch {
    /* ignore */
  }

  return next;
}

export function subscribeReviewRewardUpdates(
  onReward: (reward: ReviewReward) => void,
): () => void {
  listeners.add(onReward);
  getChannel();

  const onEvent = (e: Event) => {
    const detail = (e as CustomEvent<{ reviewReward: ReviewReward }>).detail;
    if (detail?.reviewReward) onReward(normalizeReviewReward(detail.reviewReward));
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key !== REVIEW_REWARD_STORAGE_KEY || !e.newValue) return;
    try {
      const parsed = JSON.parse(e.newValue) as { reviewReward?: ReviewReward };
      onReward(normalizeReviewReward(parsed.reviewReward));
    } catch {
      onReward(DEFAULT_REVIEW_REWARD);
    }
  };

  window.addEventListener(REVIEW_REWARD_UPDATED_EVENT, onEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onReward);
    window.removeEventListener(REVIEW_REWARD_UPDATED_EVENT, onEvent);
    window.removeEventListener("storage", onStorage);
  };
}
