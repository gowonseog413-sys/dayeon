"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BlogHtmlEditor } from "@/components/erp/BlogHtmlEditor";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useI18n } from "@/components/I18nProvider";
import type { LegalSection } from "@/i18n/legal/types";
import { LEGAL_PAGE_LABELS, PAGE_LABELS, type FooterDocTabKey } from "@/lib/erp-catalog";
import { sectionsToHtml } from "@/lib/sections-to-html";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";

const LEGAL_KEYS = Object.keys(LEGAL_PAGE_LABELS);
const SUPPORT_KEYS = ["faq", "shipping", "returns", "contact"] as const;

const LOCALE_TABS = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "id", label: "Indonesia" },
] as const;

type LocaleCode = (typeof LOCALE_TABS)[number]["code"];

function isLegalKey(key: string) {
  return LEGAL_KEYS.includes(key);
}

function isSupportKey(key: string) {
  return (SUPPORT_KEYS as readonly string[]).includes(key);
}

function resolveHtml(data: { html?: string; sections?: LegalSection[] }) {
  if (data.html?.trim()) return data.html;
  if (data.sections?.length) return sectionsToHtml(data.sections);
  return "<p></p>";
}

const PREVIEW_PATH: Record<FooterDocTabKey, string> = {
  about: "/about",
  careers: "/careers",
  eyeCoin: "/eye-coin",
  terms: "/terms",
  privacy: "/privacy",
  faq: "/support/faq",
  shipping: "/support/shipping",
  returns: "/support/returns",
  contact: "/support/contact",
};

type Props = {
  tab: FooterDocTabKey;
};

export function ErpFooterDocEditor({ tab }: Props) {
  const { locale } = useI18n();
  const [legalLocale, setLegalLocale] = useState<LocaleCode>(
    locale === "en" || locale === "id" ? locale : "ko",
  );
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("<p></p>");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const tabLabel = PAGE_LABELS[tab];
  const showTitle = !isLegalKey(tab);

  useEffect(() => {
    if (isLegalKey(tab)) {
      api<{ siteContent: { legal?: Record<string, Record<string, { html?: string; sections?: LegalSection[] }>> } }>(
        "/api/admin/content",
        { token: getToken() },
      )
        .then((d) => {
          const entry = d.siteContent.legal?.[tab]?.[legalLocale];
          setTitle(tabLabel);
          setHtml(entry ? resolveHtml(entry) : "<p></p>");
        })
        .catch(() => {});
      return;
    }

    if (isSupportKey(tab)) {
      api<{ siteContent: { support: Record<string, { title: string; html?: string; sections?: { heading: string; paragraphs: string[] }[]; email?: string }> } }>(
        "/api/admin/content",
        { token: getToken() },
      )
        .then((d) => {
          const p = d.siteContent.support[tab];
          if (p) {
            setTitle(p.title);
            setHtml(resolveHtml(p));
            setEmail(p.email || "");
          }
        })
        .catch(() => {});
      return;
    }

    api<{ siteContent: { pages: Record<string, { title: string; html?: string; sections?: { heading: string; paragraphs: string[] }[] }> } }>(
      "/api/admin/content",
      { token: getToken() },
    )
      .then((d) => {
        const p = d.siteContent.pages[tab];
        if (p) {
          setTitle(p.title);
          setHtml(resolveHtml(p));
        }
      })
      .catch(() => {});
  }, [tab, legalLocale, tabLabel]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      if (isLegalKey(tab)) {
        await api(`/api/admin/content/legal/${tab}/${legalLocale}`, {
          method: "PUT",
          token: getToken(),
          body: JSON.stringify({ html }),
        });
      } else if (isSupportKey(tab)) {
        await api(`/api/admin/content/support/${tab}`, {
          method: "PUT",
          token: getToken(),
          body: JSON.stringify({
            title,
            html,
            ...(tab === "contact" ? { email } : {}),
          }),
        });
      } else {
        await api(`/api/admin/content/pages/${tab}`, {
          method: "PUT",
          token: getToken(),
          body: JSON.stringify({ title, html }),
        });
      }
      setMsg("저장되었습니다. 쇼핑몰에 바로 반영됩니다.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "저장 실패");
    }
  }

  return (
    <ErpPageShell
      title="하단문서관리"
      description={`${tabLabel} — 통합 편집기로 글을 작성·저장합니다. 상단 탭에서 다른 문서를 선택할 수 있습니다.`}
    >
      {isLegalKey(tab) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {LOCALE_TABS.map((loc) => (
            <button
              key={loc.code}
              type="button"
              onClick={() => setLegalLocale(loc.code)}
              className={`rounded-full px-3 py-1 text-xs ${
                legalLocale === loc.code
                  ? "border-2 border-[var(--pink-accent)] bg-[var(--pink-bg)] font-medium text-[var(--pink-deep)]"
                  : "border border-gray-300 text-gray-600"
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={save} className="space-y-3">
        {msg && <p className="text-sm text-green-600">{msg}</p>}

        {showTitle && (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-lg font-semibold shadow-sm"
            placeholder="페이지 제목"
            required
          />
        )}

        {tab === "contact" && (
          <input
            placeholder="고객센터 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm"
          />
        )}

        <BlogHtmlEditor value={html} onChange={setHtml} placeholder={`${tabLabel} 본문을 작성하세요…`} />

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white"
          >
            저장
          </button>
          <Link
            href={PREVIEW_PATH[tab]}
            target="_blank"
            className="rounded-full border px-5 py-2 text-sm text-[var(--pink-accent)]"
          >
            미리보기 ↗
          </Link>
        </div>
      </form>
    </ErpPageShell>
  );
}
