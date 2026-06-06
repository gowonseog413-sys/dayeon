"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  /** URL query without page (e.g. category=tips) */
  query?: string;
  /** Link 모드 URL page 쿼리 키 (기본 page) */
  pageKey?: string;
  hash?: string;
  /** 설정 시 버튼 모드 — 같은 페이지 내 클라이언트 페이지네이션 */
  onPageChange?: (page: number) => void;
  className?: string;
};

function pageHref(
  basePath: string,
  query: string | undefined,
  p: number,
  pageKey = "page",
  hash = "",
) {
  const params = new URLSearchParams(query ?? "");
  if (p > 1) params.set(pageKey, String(p));
  else params.delete(pageKey);
  const qs = params.toString();
  const path = qs ? `${basePath}?${qs}` : basePath;
  return `${path}${hash}`;
}

function PageControl({
  className,
  href,
  onClick,
  children,
  ariaCurrent,
}: {
  className: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  ariaCurrent?: "page";
}) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} aria-current={ariaCurrent}>
        {children}
      </button>
    );
  }
  return (
    <Link href={href!} className={className} aria-current={ariaCurrent}>
      {children}
    </Link>
  );
}

export function NatePagination({
  page,
  totalPages,
  basePath,
  query,
  pageKey = "page",
  hash = "",
  onPageChange,
  className = "mt-10",
}: Props) {
  const { t } = useI18n();
  if (totalPages <= 1) return null;

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const btn =
    "inline-flex min-h-[36px] min-w-[36px] items-center justify-center border border-gray-300 bg-white px-2 text-sm text-gray-700 hover:bg-gray-50";
  const active =
    "inline-flex min-h-[36px] min-w-[36px] items-center justify-center border border-[var(--pink-accent)] bg-[var(--pink-accent)] px-2 text-sm font-semibold text-white";

  const go = (p: number) => onPageChange?.(p);

  return (
    <nav
      className={`${className} flex flex-wrap items-center justify-center gap-0`}
      aria-label={t("pagination.aria")}
    >
      {page > 1 ? (
        <PageControl
          href={pageHref(basePath, query, page - 1, pageKey, hash)}
          onClick={onPageChange ? () => go(page - 1) : undefined}
          className={`${btn} rounded-l`}
        >
          {t("common.prev")}
        </PageControl>
      ) : (
        <span className={`${btn} rounded-l text-gray-300`}>{t("common.prev")}</span>
      )}

      {start > 1 && (
        <>
          <PageControl
            href={pageHref(basePath, query, 1, pageKey, hash)}
            onClick={onPageChange ? () => go(1) : undefined}
            className={btn}
          >
            1
          </PageControl>
          {start > 2 && <span className={`${btn} border-l-0 text-gray-400`}>…</span>}
        </>
      )}

      {pages.map((p, i) => (
        <PageControl
          key={p}
          href={pageHref(basePath, query, p, pageKey, hash)}
          onClick={onPageChange ? () => go(p) : undefined}
          className={`${p === page ? active : btn} ${i > 0 || start > 1 ? "border-l-0" : ""}`}
          ariaCurrent={p === page ? "page" : undefined}
        >
          {p}
        </PageControl>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className={`${btn} border-l-0 text-gray-400`}>…</span>}
          <PageControl
            href={pageHref(basePath, query, totalPages, pageKey, hash)}
            onClick={onPageChange ? () => go(totalPages) : undefined}
            className={`${btn} border-l-0`}
          >
            {totalPages}
          </PageControl>
        </>
      )}

      {page < totalPages ? (
        <PageControl
          href={pageHref(basePath, query, page + 1, pageKey, hash)}
          onClick={onPageChange ? () => go(page + 1) : undefined}
          className={`${btn} rounded-r border-l-0`}
        >
          {t("common.next")}
        </PageControl>
      ) : (
        <span className={`${btn} rounded-r border-l-0 text-gray-300`}>{t("common.next")}</span>
      )}
    </nav>
  );
}
