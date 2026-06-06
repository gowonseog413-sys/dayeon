"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  DEFAULT_REVIEW_REWARD,
  normalizeReviewReward,
  type ReviewReward,
} from "@/lib/review-reward";
import { subscribeReviewRewardUpdates } from "@/lib/review-reward-sync";

export function useReviewReward() {
  const [reviewReward, setReviewReward] = useState<ReviewReward>(DEFAULT_REVIEW_REWARD);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ reviewReward: ReviewReward }>(
        `/api/settings/review-reward?_=${Date.now()}`,
        { cache: "no-store" },
      );
      setReviewReward(normalizeReviewReward(data.reviewReward));
    } catch {
      /* keep current */
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsub = subscribeReviewRewardUpdates(setReviewReward);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      unsub();
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return { reviewReward, refresh };
}
