type Props = {
  title: string;
  className?: string;
};

/** 홈·카탈로그 섹션 제목 — 아기자기 핑크 장식 */
export function CuteSectionTitle({ title, className = "" }: Props) {
  return (
    <h2
      className={`mb-8 flex items-center justify-center gap-2 text-center text-xl font-bold tracking-wide text-[var(--pink-deep)] sm:gap-3 sm:text-2xl ${className}`}
    >
      <span
        className="section-title-deco--flower text-base text-[var(--pink-accent)] sm:text-lg"
        aria-hidden
      >
        ✿
      </span>
      <span
        className="section-title-deco--id text-base text-[var(--pink-accent)] sm:text-lg"
        aria-hidden
      >
        ◆
      </span>
      <span
        className="section-title-deco--dark text-base text-[var(--pink-accent)] sm:text-lg"
        aria-hidden
      >
        ✦
      </span>
      <span
        className="section-title-deco--aqua text-base text-[var(--pink-accent)] sm:text-lg"
        aria-hidden
      >
        ◎
      </span>
      <span>{title}</span>
      <span
        className="section-title-deco--aqua text-base text-[var(--pink-accent)] sm:text-lg"
        aria-hidden
      >
        ◎
      </span>
      <span
        className="section-title-deco--dark text-base text-[var(--pink-accent)] sm:text-lg"
        aria-hidden
      >
        ✦
      </span>
      <span
        className="section-title-deco--id text-base text-[var(--pink-accent)] sm:text-lg"
        aria-hidden
      >
        ◆
      </span>
      <span
        className="section-title-deco--flower text-base text-[var(--pink-accent)] sm:text-lg"
        aria-hidden
      >
        ✿
      </span>
    </h2>
  );
}
