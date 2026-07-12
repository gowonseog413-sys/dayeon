"use client";

import { useI18n } from "@/components/I18nProvider";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

/** 네이트 스타일 페이지 번호 (1 … 5 6 7 … 10) */
export function ErpPagination({ page, totalPages, onChange }: Props) {
  const { t } = useI18n();
  if (totalPages <= 1) return null;

  const items: (number | "…")[] = [];
  const add = (n: number) => {
    if (n >= 1 && n <= totalPages && !items.includes(n)) items.push(n);
  };

  add(1);
  if (page > 3) items.push("…");
  for (let n = page - 1; n <= page + 1; n++) add(n);
  if (page < totalPages - 2) items.push("…");
  if (totalPages > 1) add(totalPages);

  const ordered: (number | "…")[] = [];
  for (const x of items) {
    if (x === "…") {
      if (ordered[ordered.length - 1] !== "…") ordered.push("…");
    } else if (!ordered.includes(x)) ordered.push(x);
  }

  return (
    <nav className="mt-2 flex flex-wrap items-center justify-center gap-1 text-sm" aria-label={t("erp.common.paginationAria")}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="min-w-[2rem] rounded border px-2 py-1 disabled:opacity-40"
      >
        {t("erp.common.prev")}
      </button>
      {ordered.map((n, i) =>
        n === "…" ? (
          <span key={`e-${i}`} className="px-1 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`min-w-[2rem] rounded border px-2 py-1 ${
              n === page
                ? "border-[var(--pink-accent)] bg-[var(--pink-accent)] font-semibold text-white"
                : "hover:bg-gray-50"
            }`}
          >
            {n}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="min-w-[2rem] rounded border px-2 py-1 disabled:opacity-40"
      >
        {t("erp.common.next")}
      </button>
    </nav>
  );
}
