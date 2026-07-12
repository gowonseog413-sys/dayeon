"use client";

import { useI18n } from "@/components/I18nProvider";
import { TIER_COLORS, normalizeTierId, tierMessageKey, type TierId } from "@/lib/tier";

function TierIcon({ tier }: { tier: TierId }) {
  const c = TIER_COLORS[tier];
  if (tier === "bronze") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="12" r="9" fill={c.bg} stroke={c.ring} strokeWidth="2" />
        <path d="M8 14l2-4 2 3 2-5 2 6" fill="none" stroke={c.ring} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (tier === "silver") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <polygon
          points="12,3 20,9 17,20 7,20 4,9"
          fill={c.bg}
          stroke={c.ring}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (tier === "gold") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5 2.5-7.5-6-4.5h7.5z"
          fill={c.bg}
          stroke={c.ring}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M12 2l3 6h7l-5.5 4 2 7L12 16l-6.5 3 2-7L2 8h7z"
        fill={c.bg}
        stroke={c.ring}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2" fill={c.ring} opacity="0.6" />
    </svg>
  );
}

type Props = {
  tier?: string | null;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
};

export function TierBadge({ tier, size = "md", showLabel = true, className = "" }: Props) {
  const { t } = useI18n();
  const id = normalizeTierId(tier);
  const label = t(tierMessageKey(id));
  const textSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 ${textSize} font-medium ${className}`}
      style={{ color: TIER_COLORS[id].text }}
    >
      <TierIcon tier={id} />
      {showLabel ? <span>({label})</span> : null}
    </span>
  );
}
