"use client";

import { useEffect, useState } from "react";
import { CmsHtmlBody } from "@/components/CmsHtmlBody";
import { LegalDocumentBody } from "@/components/LegalDocumentBody";
import { useI18n } from "@/components/I18nProvider";
import type { LegalSection } from "@/i18n/legal/types";
import { fetchLegalDocument } from "@/lib/legal-content";

type Props = {
  standalone?: boolean;
};

export function PrivacyPolicySection({ standalone = false }: Props) {
  const { locale, t } = useI18n();
  const [html, setHtml] = useState<string | null>(null);
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [loading, setLoading] = useState(true);
  const title = t("footer.privacy");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLegalDocument("privacy", locale)
      .then((data) => {
        if (cancelled) return;
        if (data.html?.trim()) {
          setHtml(data.html);
          setSections([]);
        } else {
          setHtml(null);
          setSections(data.sections);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <section
      className={
        standalone
          ? "mx-auto min-h-[calc(100vh-12rem)] max-w-6xl px-4 py-8 sm:py-10"
          : "mx-auto max-w-6xl px-4 py-4 sm:py-5"
      }
    >
      {standalone ? (
        <h1 className="mb-6 text-3xl font-semibold text-[var(--pink-deep)]">{title}</h1>
      ) : (
        <h2 className="mb-3 text-lg font-semibold text-[var(--pink-deep)] sm:text-xl">{title}</h2>
      )}
      <div
        className={
          standalone
            ? "max-h-[calc(100vh-16rem)] overflow-y-auto overscroll-contain rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)] sm:max-h-[calc(100vh-14rem)] sm:p-6"
            : "max-h-[min(70vh,36rem)] overflow-y-auto overscroll-contain rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)] sm:p-6"
        }
        tabIndex={0}
        role="region"
        aria-label={title}
      >
        {loading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : html ? (
          <CmsHtmlBody html={html} />
        ) : (
          <LegalDocumentBody sections={sections} listStyle="bullet" />
        )}
      </div>
      <p className="mt-3 text-center text-xs text-gray-500">{t("legal.scrollPrivacy")}</p>
    </section>
  );
}
