"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BlogHtmlEditor } from "@/components/erp/BlogHtmlEditor";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { useI18n } from "@/components/I18nProvider";
import type { LegalSection } from "@/i18n/legal/types";
import { FOOTER_DOC_LABEL_KEYS } from "@/i18n/erp-messages";
import {
  getStaticPage,
  getStaticSupport,
  type StaticPageKey,
  type StaticSupportKey,
} from "@/i18n/static-content";
import { LEGAL_PAGE_LABELS, type FooterDocTabKey } from "@/lib/erp-catalog";
import { sectionsToHtml } from "@/lib/sections-to-html";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";

const LEGAL_KEYS = Object.keys(LEGAL_PAGE_LABELS);
const SUPPORT_KEYS = ["faq", "shipping", "returns", "contact"] as const;
const PAGE_KEYS = ["about", "careers", "eyeCoin"] as const;

const LOCALE_TABS = [
  { code: "ko", labelKey: "erp.footer.localeKo" },
  { code: "en", labelKey: "erp.footer.localeEn" },
  { code: "id", labelKey: "erp.footer.localeId" },
] as const;

type LocaleCode = (typeof LOCALE_TABS)[number]["code"];

type CmsEntry = {
  title?: string;
  html?: string;
  sections?: LegalSection[];
  email?: string;
};

type CmsI18nBucket = CmsEntry | Record<string, CmsEntry>;

const PAGE_STATIC: Record<string, StaticPageKey> = {
  about: "about",
  careers: "careers",
  eyeCoin: "eyeCoin",
};

const SUPPORT_STATIC: Record<string, StaticSupportKey> = {
  faq: "faq",
  shipping: "shipping",
  returns: "returns",
  contact: "contact",
};

function isLegalKey(key: string) {
  return LEGAL_KEYS.includes(key);
}

function isSupportKey(key: string) {
  return (SUPPORT_KEYS as readonly string[]).includes(key);
}

function isPageKey(key: string) {
  return (PAGE_KEYS as readonly string[]).includes(key);
}

function resolveHtml(data: CmsEntry) {
  if (data.html?.trim()) return data.html;
  if (data.sections?.length) return sectionsToHtml(data.sections);
  return "<p></p>";
}

function pickLocaleEntry(bucket: CmsI18nBucket | undefined, loc: LocaleCode): CmsEntry | null {
  if (!bucket) return null;
  if (typeof bucket.title === "string") {
    return loc === "ko" ? bucket : null;
  }
  const entry = (bucket as Record<string, CmsEntry>)[loc];
  return entry?.title || entry?.html || entry?.sections?.length ? entry : null;
}

function staticPageFallback(tab: FooterDocTabKey, loc: LocaleCode): CmsEntry | null {
  if (loc === "ko") return null;
  if (isPageKey(tab)) {
    const p = getStaticPage(PAGE_STATIC[tab], loc);
    return { title: p.title, html: sectionsToHtml(p.sections), email: p.email };
  }
  if (isSupportKey(tab)) {
    const p = getStaticSupport(SUPPORT_STATIC[tab], loc);
    return { title: p.title, html: sectionsToHtml(p.sections), email: p.email };
  }
  return null;
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
  const { locale, t, tFmt } = useI18n();
  const [contentLocale, setContentLocale] = useState<LocaleCode>(
    locale === "en" || locale === "id" ? locale : "ko",
  );
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("<p></p>");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { showSaveSuccess } = useErpSaveSuccess();

  const tabLabel = t(FOOTER_DOC_LABEL_KEYS[tab] ?? tab);
  const showTitle = !isLegalKey(tab);

  useEffect(() => {
    setContentLocale(locale === "en" || locale === "id" ? locale : "ko");
  }, [locale]);

  useEffect(() => {
    const token = getErpToken();

    if (isLegalKey(tab)) {
      api<{ siteContent: { legal?: Record<string, Record<string, CmsEntry>> } }>(
        "/api/admin/content",
        { token },
      )
        .then((d) => {
          const entry = d.siteContent.legal?.[tab]?.[contentLocale];
          setTitle(tabLabel);
          setHtml(entry ? resolveHtml(entry) : "<p></p>");
        })
        .catch(() => {});
      return;
    }

    api<{
      siteContent: {
        pages: Record<string, CmsI18nBucket>;
        support: Record<string, CmsI18nBucket>;
      };
    }>("/api/admin/content", { token })
      .then((d) => {
        const bucket = isSupportKey(tab)
          ? d.siteContent.support[tab]
          : d.siteContent.pages[tab];
        const entry = pickLocaleEntry(bucket, contentLocale) ?? staticPageFallback(tab, contentLocale);
        if (entry) {
          setTitle(entry.title || tabLabel);
          setHtml(resolveHtml(entry));
          setEmail(entry.email || "");
        } else {
          setTitle(tabLabel);
          setHtml("<p></p>");
          setEmail("");
        }
      })
      .catch(() => {});
  }, [tab, contentLocale, tabLabel]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const token = getErpToken();
    try {
      if (isLegalKey(tab)) {
        await api(`/api/admin/content/legal/${tab}/${contentLocale}`, {
          method: "PUT",
          token,
          body: JSON.stringify({ html }),
        });
      } else if (isSupportKey(tab)) {
        await api(`/api/admin/content/support/${tab}/${contentLocale}`, {
          method: "PUT",
          token,
          body: JSON.stringify({
            title,
            html,
            ...(tab === "contact" ? { email } : {}),
          }),
        });
      } else {
        await api(`/api/admin/content/pages/${tab}/${contentLocale}`, {
          method: "PUT",
          token,
          body: JSON.stringify({ title, html }),
        });
      }
      showSaveSuccess({ subMessage: t("erp.footer.saveReflects") });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    }
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.pages"
      description={tFmt("erp.footer.docEditorDesc", { label: tabLabel })}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {LOCALE_TABS.map((loc) => (
          <button
            key={loc.code}
            type="button"
            onClick={() => setContentLocale(loc.code)}
            className={`rounded-full px-3 py-1 text-xs ${
              contentLocale === loc.code
                ? "border-2 border-[var(--pink-accent)] bg-[var(--pink-bg)] font-medium text-[var(--pink-deep)]"
                : "border border-gray-300 text-gray-600"
            }`}
          >
            {t(loc.labelKey)}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="space-y-3">
        {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}

        {showTitle && (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-lg font-semibold shadow-sm"
            placeholder={t("erp.footer.pageTitlePlaceholder")}
            required
          />
        )}

        {tab === "contact" && (
          <input
            placeholder={t("erp.footer.supportEmailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm"
          />
        )}

        <BlogHtmlEditor
          value={html}
          onChange={setHtml}
          placeholder={tFmt("erp.footer.bodyPlaceholder", { label: tabLabel })}
        />

        <ErpFormActions className="gap-3">
          <Link
            href={PREVIEW_PATH[tab]}
            target="_blank"
            className="rounded-full border px-5 py-2 text-sm text-[var(--pink-accent)]"
          >
            {t("erp.footer.preview")}
          </Link>
          <button
            type="submit"
            className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white"
          >
            {t("erp.common.save")}
          </button>
        </ErpFormActions>
      </form>
    </ErpPageShell>
  );
}
