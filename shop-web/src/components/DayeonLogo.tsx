"use client";

import Image from "next/image";
import Link from "next/link";
import { LogoSparkleHearts } from "@/components/SparkleHeart";
import { useTheme } from "@/components/ThemeProvider";
import { isIndonesiaTheme, isMinimalTheme } from "@/lib/theme";

const LOGO_HEADER_SRC = "/brand/dayeon-logo.png";
const LOGO_FOOTER_SRC = "/brand/dayeon-logo-footer.png";

type Props = {
  /** header | footer | compact */
  variant?: "header" | "footer" | "compact";
  className?: string;
  href?: string;
};

/** h-19(76px) 슬롯 안에서 시각적으로만 키움 — flex 행·검색창 크기는 그대로 */
const HEADER_VISUAL_PX = 120;

const HEIGHT = {
  header: HEADER_VISUAL_PX,
  footer: 128,
  compact: 48,
} as const;

const CLEAN_TEXT = {
  header: {
    main: "text-[1.35rem] font-bold tracking-tight text-[var(--pink-deep)]",
    sub: "mt-0.5 text-[9px] font-normal tracking-[0.35em] text-[var(--muted)] uppercase",
  },
  footer: {
    main: "text-xl font-bold tracking-tight text-[var(--pink-deep)]",
    sub: "mt-0.5 text-[10px] font-normal tracking-[0.35em] text-[var(--muted)] uppercase",
  },
  compact: {
    main: "text-lg font-bold tracking-tight text-[var(--pink-deep)]",
    sub: "mt-0.5 text-[8px] font-normal tracking-[0.35em] text-[var(--muted)] uppercase",
  },
} as const;

function CleanTextLogo({
  variant,
  className = "",
}: {
  variant: "header" | "footer" | "compact";
  className?: string;
}) {
  const s = CLEAN_TEXT[variant];
  return (
    <span className={`inline-flex shrink-0 flex-col items-start leading-none ${className}`}>
      <span className={s.main}>dayeon</span>
      <span className={s.sub}>lenses</span>
    </span>
  );
}

const INDONESIA_TEXT = {
  header: {
    main: "font-serif text-[1.42rem] font-bold tracking-tight text-[var(--pink-accent)]",
    sub: "mt-1 text-[8px] font-medium tracking-[0.48em] text-[var(--muted)] uppercase",
    line: "mt-1 h-0.5 w-full max-w-[4.5rem] rounded-full bg-[var(--pink-accent)]/80",
  },
  footer: {
    main: "font-serif text-xl font-bold tracking-tight text-[var(--pink-accent)]",
    sub: "mt-1 text-[9px] font-medium tracking-[0.48em] text-[var(--muted)] uppercase",
    line: "mt-1 h-0.5 w-full max-w-[5rem] rounded-full bg-[var(--pink-accent)]/80",
  },
  compact: {
    main: "font-serif text-lg font-bold tracking-tight text-[var(--pink-accent)]",
    sub: "mt-0.5 text-[7px] font-medium tracking-[0.45em] text-[var(--muted)] uppercase",
    line: "mt-0.5 h-0.5 w-full max-w-[3.5rem] rounded-full bg-[var(--pink-accent)]/80",
  },
} as const;

function IndonesiaTextLogo({
  variant,
  className = "",
}: {
  variant: "header" | "footer" | "compact";
  className?: string;
}) {
  const s = INDONESIA_TEXT[variant];
  return (
    <span className={`inline-flex shrink-0 flex-col items-start leading-none ${className}`}>
      <span className={s.main}>dayeon</span>
      <span className={s.sub}>LENSES</span>
      <span className={s.line} aria-hidden />
    </span>
  );
}

/** dayeon 쇼핑몰 로고 (스티커 마크) */
export function DayeonLogo({ variant = "header", className = "", href = "/" }: Props) {
  const { theme } = useTheme();
  const h = HEIGHT[variant];
  const src = variant === "footer" ? LOGO_FOOTER_SRC : LOGO_HEADER_SRC;
  const isIndonesia = isIndonesiaTheme(theme);
  const isClean = isMinimalTheme(theme) && !isIndonesia;

  const inner = isIndonesia ? (
    <IndonesiaTextLogo variant={variant} className={className} />
  ) : isClean ? (
    <CleanTextLogo variant={variant} className={className} />
  ) : (
    <span className={`inline-flex shrink-0 items-center overflow-visible ${className}`}>
      <Image
        src={src}
        alt="dayeon"
        width={variant === "footer" ? 512 : 1024}
        height={variant === "footer" ? 512 : 1024}
        quality={100}
        unoptimized={variant === "footer"}
        sizes={variant === "footer" ? `${HEIGHT.footer}px` : undefined}
        className="h-auto w-auto object-contain"
        style={{ height: h }}
        priority={variant === "header"}
      />
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`shrink-0 hover:opacity-90 ${
          variant === "header"
            ? "relative flex h-19 w-30 items-center justify-center overflow-visible"
            : variant === "footer"
              ? "inline-flex items-center"
              : ""
        }`}
        aria-label="dayeon home"
      >
        {variant === "header" && theme === "pink" && <LogoSparkleHearts />}
        {inner}
      </Link>
    );
  }
  return inner;
}

export function LensMarkIcon({ size = 32 }: { size?: number }) {
  return (
    <Image
      src={LOGO_HEADER_SRC}
      alt=""
      width={512}
      height={512}
      className="object-contain"
      style={{ height: size, width: "auto" }}
      aria-hidden
    />
  );
}
