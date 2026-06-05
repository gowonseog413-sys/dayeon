type SparkleHeartProps = {
  className?: string;
  /** 애니메이션 시작 지연(초) */
  delay?: number;
  size?: "xs" | "sm" | "md";
};

const SIZE_CLASS = {
  xs: "sparkle-heart--xs",
  sm: "sparkle-heart--sm",
  md: "sparkle-heart--md",
} as const;

/** 작은 핑크 하트 — 반짝이며 살짝 떠다니는 장식 (pointer-events 없음) */
export function SparkleHeart({ className = "", delay = 0, size = "sm" }: SparkleHeartProps) {
  return (
    <span
      aria-hidden
      className={`sparkle-heart ${SIZE_CLASS[size]} ${className}`.trim()}
      style={{ animationDelay: `${delay}s` }}
    >
      ♥
    </span>
  );
}

const LOGO_HEARTS: { className: string; delay: number; size: "xs" | "sm" }[] = [
  { className: "absolute -left-1 top-1", delay: 0, size: "xs" },
  { className: "absolute left-2 -top-0.5", delay: 0.55, size: "sm" },
  { className: "absolute -right-0.5 top-3", delay: 1.1, size: "xs" },
  { className: "absolute right-1 bottom-0", delay: 0.35, size: "sm" },
  { className: "absolute left-1/2 -top-1 -translate-x-1/2", delay: 0.85, size: "xs" },
  { className: "absolute -left-2 bottom-2", delay: 1.45, size: "xs" },
];

/** 헤더 로고 주변 떠다니는 하트 */
export function LogoSparkleHearts() {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {LOGO_HEARTS.map((h) => (
        <SparkleHeart
          key={h.className}
          className={h.className}
          delay={h.delay}
          size={h.size}
        />
      ))}
    </span>
  );
}

/** 네비 메뉴 구분 (핑크: 하트 · 깔끔: 점) */
export function NavHeartDivider({ index = 0 }: { index?: number }) {
  return (
    <span
      className="nav-heart-divider hidden h-[1.125rem] shrink-0 items-center justify-center self-center sm:inline-flex"
      aria-hidden
    >
      <SparkleHeart delay={index * 0.45} size="sm" />
      <span className="nav-heart-clean-only text-sm text-gray-400">·</span>
    </span>
  );
}
