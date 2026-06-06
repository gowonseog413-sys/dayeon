export type ReviewReward = {
  enabled: boolean;
  points: number;
};

export const DEFAULT_REVIEW_REWARD: ReviewReward = {
  enabled: true,
  points: 1000,
};

export function normalizeReviewReward(raw: unknown): ReviewReward {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_REVIEW_REWARD };
  }
  const o = raw as Partial<ReviewReward>;
  return {
    enabled: o.enabled !== false,
    points: Math.max(0, Math.floor(Number(o.points) || 0)),
  };
}

export function reviewRewardNotice(reward: ReviewReward): string | null {
  if (!reward.enabled || reward.points <= 0) return null;
  return `소중한 리뷰 남겨주시면 ${reward.points.toLocaleString("ko-KR")}포인트 적립해 드립니다.`;
}
