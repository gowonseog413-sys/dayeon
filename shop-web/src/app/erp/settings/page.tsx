"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpLanguageSwitcher } from "@/components/erp/ErpLanguageSwitcher";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { LOCALES } from "@/i18n/messages";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";

type EnvInfo = {
  shopUrl: string;
  erpUrl: string;
  apiUrl: string;
};

const CONTROL_LINKS = [
  {
    href: "/erp/theme",
    labelKey: "erp.settings.shortcutTheme",
    descKey: "erp.settings.shortcutThemeDesc",
  },
  {
    href: "/erp/payments",
    labelKey: "erp.settings.shortcutPayments",
    descKey: "erp.settings.shortcutPaymentsDesc",
  },
  {
    href: "/erp/users/points",
    labelKey: "erp.settings.shortcutPoints",
    descKey: "erp.settings.shortcutPointsDesc",
  },
  {
    href: "/erp/users/referral",
    labelKey: "erp.settings.shortcutReferral",
    descKey: "erp.settings.shortcutReferralDesc",
  },
  {
    href: "/erp/users/reviews",
    labelKey: "erp.settings.shortcutReviews",
    descKey: "erp.settings.shortcutReviewsDesc",
  },
  {
    href: "/erp/products/stock",
    labelKey: "erp.settings.shortcutStock",
    descKey: "erp.settings.shortcutStockDesc",
  },
  {
    href: "/erp/pages/about",
    labelKey: "erp.settings.shortcutPages",
    descKey: "erp.settings.shortcutPagesDesc",
  },
];

export default function ErpSettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const [env, setEnv] = useState<EnvInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setEnv({
      shopUrl: origin || "-",
      erpUrl: origin ? `${origin}/erp` : "-",
      apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3601",
    });

    const token = getErpToken();
    if (!token) {
      setError(t("erp.settings.errorLogin"));
      return;
    }
    api("/api/admin/stats", { token }).catch((err) => {
      setError(err instanceof Error ? err.message : t("erp.settings.errorApi"));
    });
  }, [t]);

  return (
    <ErpPageShell titleKey="erp.settings.title" descriptionKey="erp.settings.description">
      {error ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
          {error}
        </p>
      ) : null}

      <section className="mb-6 rounded-xl border border-[#d8d0c6] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#4a6b68]">{t("erp.settings.language")}</h3>
          <ErpLanguageSwitcher />
        </div>
        <p className="mt-2 text-sm text-gray-600">{t("erp.settings.languageDesc")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setLocale(item.code)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                locale === item.code
                  ? "border-[#4a6b68] bg-[#4a6b68] font-medium text-white"
                  : "border-[#d8d0c6] bg-white text-gray-700 hover:border-[#4a6b68]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-[#d8d0c6] bg-white p-4">
        <h3 className="text-sm font-semibold text-[#4a6b68]">{t("erp.settings.accessInfo")}</h3>
        <dl className="mt-3 space-y-2 text-sm text-gray-700">
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">{t("erp.settings.shop")}</dt>
            <dd>
              {env ? (
                <a href={env.shopUrl} className="font-mono text-[var(--pink-accent)] underline">
                  {env.shopUrl}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">{t("erp.settings.erp")}</dt>
            <dd>
              {env ? (
                <a href={env.erpUrl} className="font-mono text-[var(--pink-accent)] underline">
                  {env.erpUrl}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">{t("erp.settings.api")}</dt>
            <dd className="font-mono text-xs">{env?.apiUrl ?? "-"}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">{t("erp.settings.adminAccount")}</h3>
        <p className="mt-2 text-sm text-amber-800">{t("erp.settings.adminNote")}</p>
        <p className="mt-2 font-mono text-sm text-gray-800">dayeon@naver.com / admin1004</p>
        <p className="mt-2 text-xs text-amber-700">{t("erp.settings.adminGateNote")}</p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t("erp.settings.shortcuts")}</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {CONTROL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-[#d8d0c6] bg-white px-4 py-3 transition hover:border-[#4a6b68] hover:shadow-sm"
            >
              <p className="font-medium text-gray-900">{t(item.labelKey)}</p>
              <p className="mt-0.5 text-xs text-gray-500">{t(item.descKey)}</p>
            </Link>
          ))}
        </div>
      </section>
    </ErpPageShell>
  );
}
