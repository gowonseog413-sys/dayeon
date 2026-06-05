"use client";

import { useAuth } from "@/hooks/useAuth";
import { honorificName, userPoints, userTier } from "@/lib/user-display";
import { formatRp } from "@/lib/api";

const TIER_INFO = [
  { tier: "일반", min: 0, desc: "가입 즉시 적용되는 기본 등급입니다." },
  { tier: "실버", min: 1000, desc: "1,000P 이상 적립 시 실버 등급이 됩니다." },
  { tier: "골드", min: 5000, desc: "5,000P 이상 적립 시 골드 등급이 됩니다." },
  { tier: "VIP", min: 10000, desc: "10,000P 이상 적립 시 VIP 등급이 됩니다." },
];

export default function ProfilePointsPage() {
  const { user, ready } = useAuth();

  if (!ready || !user) {
    return <p className="text-sm text-gray-500">로딩 중...</p>;
  }

  const name = honorificName(user);
  const tier = userTier(user);
  const points = userPoints(user);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--pink-deep)]">포인트/등급</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]">
          <p className="text-xs font-semibold text-gray-500">현재 등급</p>
          <p className="mt-2 text-3xl font-bold text-[var(--pink-accent)]">{tier}</p>
          <p className="mt-2 text-sm text-gray-600">{name}</p>
        </div>
        <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]">
          <p className="text-xs font-semibold text-gray-500">보유 포인트</p>
          <p className="mt-2 text-3xl font-bold text-[var(--pink-deep)]">
            {points.toLocaleString("ko-KR")}P
          </p>
          <p className="mt-2 text-sm text-gray-500">적립금 환산 {formatRp(points)}</p>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]">
        <h2 className="mb-3 text-sm font-semibold text-[var(--pink-deep)]">등급 안내</h2>
        <ul className="space-y-3 text-sm text-gray-600">
          {TIER_INFO.map((row) => (
            <li
              key={row.tier}
              className={`rounded-xl border px-3 py-2 ${
                row.tier === tier
                  ? "border-[var(--pink-accent)] bg-[var(--pink-bg)]"
                  : "border-gray-100"
              }`}
            >
              <p className="font-semibold text-[var(--pink-deep)]">
                {row.tier}
                <span className="ml-2 font-normal text-gray-500">
                  {row.min > 0 ? `${row.min.toLocaleString("ko-KR")}P 이상` : "기본"}
                </span>
              </p>
              <p className="mt-1 text-xs">{row.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
