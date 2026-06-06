"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import {
  DEFAULT_INDEX_BANNER,
  normalizeIndexBanner,
  type IndexBannerMap,
} from "@/lib/index-banner";
import { publishIndexBannerUpdate } from "@/lib/index-banner-sync";
import { LOCALES } from "@/i18n/messages";

const LOCALE_LABEL: Record<string, string> = {
  ko: "한국어",
  en: "English",
  id: "Bahasa Indonesia",
};

export default function ErpIndexBannerPage() {
  const [form, setForm] = useState<IndexBannerMap>(DEFAULT_INDEX_BANNER);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ indexBanner: IndexBannerMap }>(
        "/api/admin/settings/index-banner",
        { token: getToken() },
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
          token: getToken(),
          body: JSON.stringify({ indexBanner: form }),
        },
      );
      const next = normalizeIndexBanner(data.indexBanner);
      setForm(next);
      publishIndexBannerUpdate(next);
      showSaveSuccess({ subMessage: "쇼핑몰 최상단 띠 배너에 실시간 반영됩니다." });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ErpPageShell
      title="인덱스 상단 문구"
      description="쇼핑몰 최상단 띠 배너 문구입니다. 언어별로 다르게 설정할 수 있습니다."
    >
      {errorMsg ? (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700" aria-live="polite">
          {errorMsg}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">미리보기</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="banner-gingham py-2.5 text-center text-xs font-medium text-[var(--pink-deep)]">
              {form.ko || DEFAULT_INDEX_BANNER.ko}
            </div>
            <div className="bg-gray-50 px-3 py-6 text-center text-[10px] text-gray-400">
              헤더 · 검색 · 메뉴 영역
            </div>
          </div>
          <p className="mt-2 text-[11px] text-gray-500">
            실제 색상·폰트는 적용 중인 테마에 따라 달라집니다.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">문구 편집</h3>
          <div className="space-y-3">
            {LOCALES.map(({ code, label }) => (
              <label key={code} className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  {LOCALE_LABEL[code] ?? label}
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
              기본값 복원
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={save}
              className="rounded-lg bg-[#1e293b] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "저장 중…" : "저장"}
            </button>
          </ErpFormActions>
        </div>
      </div>
    </ErpPageShell>
  );
}
