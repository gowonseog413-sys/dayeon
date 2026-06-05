"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  /** URL query without page (e.g. category=tips) */
  query?: string;
};

function pageHref(basePath: string, query: string | undefined, p: number) {
  const params = new URLSearchParams(query ?? "");
  if (p > 1) params.set("page", String(p));
  else params.delete("page");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function NatePagination({ page, totalPages, basePath, query }: Props) {
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

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-0"
      aria-label={t("pagination.aria")}
    >
      {page > 1 ? (
        <Link href={pageHref(basePath, query, page - 1)} className={`${btn} rounded-l`}>
          {t("common.prev")}
        </Link>
      ) : (
        <span className={`${btn} rounded-l text-gray-300`}>{t("common.prev")}</span>
      )}

      {start > 1 && (
        <>
          <Link href={pageHref(basePath, query, 1)} className={btn}>
            1
          </Link>
          {start > 2 && <span className={`${btn} border-l-0 text-gray-400`}>…</span>}
        </>
      )}

      {pages.map((p, i) => (
        <Link
          key={p}
          href={pageHref(basePath, query, p)}
          className={`${p === page ? active : btn} ${i > 0 || start > 1 ? "border-l-0" : ""}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className={`${btn} border-l-0 text-gray-400`}>…</span>}
          <Link href={pageHref(basePath, query, totalPages)} className={`${btn} border-l-0`}>
            {totalPages}
          </Link>
        </>
      )}

      {page < totalPages ? (
        <Link href={pageHref(basePath, query, page + 1)} className={`${btn} rounded-r border-l-0`}>
          {t("common.next")}
        </Link>
      ) : (
        <span className={`${btn} rounded-r border-l-0 text-gray-300`}>{t("common.next")}</span>
      )}
    </nav>
  );
}
