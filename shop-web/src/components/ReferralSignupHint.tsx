"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type ReferralPublicSettings = {
  enabled: boolean;
  refereeReward: number;
};

function formatPointAmount(amount: number) {
  return `P ${amount.toLocaleString("ko-KR")}`;
}

export function referralSignupHintText(refereeReward: number) {
  if (refereeReward <= 0) {
    return "추천인 코드가 있으시면 입력해 주세요. (선택)";
  }
  return `추천인 코드를 입력하면 ${formatPointAmount(refereeReward)}이 적립되며, 현금처럼 사용하실 수 있습니다.`;
}

export function ReferralSignupHint({ className = "" }: { className?: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      api<ReferralPublicSettings>("/api/settings/referral")
        .then((data) => {
          if (cancelled) return;
          if (!data.enabled) {
            setText("추천인 코드가 있으시면 입력해 주세요. (선택)");
            return;
          }
          setText(referralSignupHintText(data.refereeReward));
        })
        .catch(() => {
          if (!cancelled) {
            setText(referralSignupHintText(3000));
          }
        });
    };

    load();
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <p className={`-mt-2 text-xs leading-relaxed text-gray-500 ${className}`.trim()}>
      {text ?? "추천인 안내를 불러오는 중…"}
    </p>
  );
}
