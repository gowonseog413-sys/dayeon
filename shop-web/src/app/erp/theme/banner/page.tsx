"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import {
  DEFAULT_INDEX_BANNER,
  normalizeIndexBanner,
  type IndexBannerMap,
} from "@/lib/index-banner";
import { publishIndexBannerUpdate } from "@/lib/index-banner-sync";
import { LOCALES } from "@/i18n/messages";

const LOCALE_LABEL_KEY: Record<string, string> = {
  ko: "erp.theme.banner.locale.ko",
  en: "erp.theme.banner.locale.en",
  id: "erp.theme.banner.locale.id",
};

export default function ErpIndexBannerPage() {
  const { t } = useI18n();
  const [form, setForm] = useState<IndexBannerMap>(DEFAULT_INDEX_BANNER);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ indexBanner: IndexBannerMap }>(
        "/api/admin/settings/index-banner",
        { token: getErpToken() },
      );
      setForm(normalizeIndexBanner(data.indexBanner));
    } catch {
      setForm(DEFAULT_INDEX_BANNER);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setLoading(true);
    try {
      const data = await api<{ indexBanner: IndexBannerMap }>(
        "/api/admin/settings/index-banner",
        {
          method: "PATCH",
          token: getErpToken(),
          body: JSON.stringify({ indexBanner: form }),
        },
      );
      const next = normalizeIndexBanner(data.indexBanner);
      setForm(next);
      publishIndexBannerUpdate(next);
      showSaveSuccess({ subMessage: t("erp.theme.banner.savedSub") });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ErpPageShell titleKey="erp.nav.themeBanner" descriptionKey="erp.theme.banner.description">
      {errorMsg ? (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700" aria-live="polite">
          {errorMsg}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">{t("erp.theme.banner.preview")}</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="banner-gingham py-2.5 text-center text-xs font-medium text-[var(--pink-deep)]">
              {form.ko || DEFAULT_INDEX_BANNER.ko}
            </div>
            <div className="bg-gray-50 px-3 py-6 text-center text-[10px] text-gray-400">
              {t("erp.theme.banner.previewArea")}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-gray-500">{t("erp.theme.banner.previewNote")}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">{t("erp.theme.banner.editTitle")}</h3>
          <div className="space-y-3">
            {LOCALES.map(({ code, label }) => (
              <label key={code} className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  {LOCALE_LABEL_KEY[code] ? t(LOCALE_LABEL_KEY[code]) : label}
                </span>
                <input
                  type="text"
                  maxLength={200}
                  value={form[code]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [code]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder={DEFAULT_INDEX_BANNER[code]}
                />
              </label>
            ))}
          </div>
          <ErpFormActions className="mt-3">
            <button
              type="button"
              onClick={() => setForm({ ...DEFAULT_INDEX_BANNER })}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              {t("erp.theme.banner.restoreDefault")}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={save}
              className="rounded-lg bg-[#1e293b] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? t("erp.common.saving") : t("erp.common.save")}
            </button>
          </ErpFormActions>
        </div>
      </div>
    </ErpPageShell>
  );
}
