"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import {
  THEME_PREVIEW,
  THEME_LABELS,
  normalizeSiteTheme,
  type SiteTheme,
} from "@/lib/theme";
import { THEME_UPDATED_EVENT } from "@/components/ThemeProvider";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";

const THEMES: { id: SiteTheme; order: number; desc: string }[] = [
  { id: "pink", order: 1, desc: "아기자기 핑크 스타일 (기본)" },
  { id: "clean", order: 2, desc: "미니멀·모노톤 스타일" },
  { id: "indonesia", order: 3, desc: "따뜻한 레드·크림 톤, 인도네시아 쇼핑몰 느낌" },
];

const CARD_MIN_H = "min-h-[7.75rem]";

export default function ErpThemePage() {
  const [active, setActive] = useState<SiteTheme>("pink");
  const [preview, setPreview] = useState<SiteTheme>("pink");
  const [loading, setLoading] = useState<SiteTheme | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api<{ theme: SiteTheme }>("/api/admin/settings/theme", {
        token: getToken(),
      });
      const t = normalizeSiteTheme(data.theme);
      setActive(t);
      setPreview(t);
    } catch {
      setActive("pink");
      setPreview("pink");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function applyTheme(theme: SiteTheme) {
    setLoading(theme);
    try {
      await api<{ theme: SiteTheme }>("/api/admin/settings/theme", {
        method: "PATCH",
        token: getToken(),
        body: JSON.stringify({ theme }),
      });
      setActive(theme);
      setPreview(theme);
      setMessage(`${THEME_LABELS[theme]}가 적용되었습니다. 쇼핑몰을 새로고침해 확인하세요.`);
      window.dispatchEvent(new Event(THEME_UPDATED_EVENT));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "테마 적용에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <ErpPageShell
      title="테마변경"
      description="적용 시 모든 방문자에게 동일한 쇼핑몰 테마가 표시됩니다."
    >
      <div className="mb-2 min-h-[2.375rem]">
        <p
          className={`w-full rounded-lg bg-[var(--pink-bg)] px-3 py-1.5 text-sm text-[var(--pink-deep)] transition-opacity ${
            message ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-live="polite"
        >
          {message || " "}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[15rem]">
          {THEMES.map((t) => {
            const isActive = active === t.id;
            const isPreview = preview === t.id;
            const isLoading = loading === t.id;
            return (
              <div
                key={t.id}
                className={`flex ${CARD_MIN_H} w-full flex-col rounded-xl border-2 bg-white p-4 ${
                  isPreview ? "border-[var(--pink-accent)]" : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPreview(t.id)}
                  className="w-full flex-1 text-left"
                >
                  <p className="text-sm font-bold text-gray-900">
                    {t.order}. {THEME_LABELS[t.id]}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{t.desc}</p>
                </button>
                <div className="mt-3 flex h-7 shrink-0 items-center">
                  {isActive ? (
                    <span className="inline-flex h-7 w-[7.25rem] items-center justify-center rounded-full bg-[var(--pink-accent)] text-[10px] font-medium text-white">
                      적용 중
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => applyTheme(t.id)}
                      className="inline-flex h-7 w-[7.25rem] items-center justify-center rounded-full border border-[var(--pink-accent)] text-[10px] font-medium text-[var(--pink-accent)] hover:bg-[var(--pink-bg)] disabled:opacity-50"
                    >
                      {isLoading ? "적용 중..." : "이 테마 적용"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <p className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
            미리보기 — {THEME_LABELS[preview]}
          </p>
          <div className="relative aspect-[16/10] w-full bg-gray-50">
            {THEMES.map((t) => (
              <Image
                key={t.id}
                src={THEME_PREVIEW[t.id]}
                alt={`${THEME_LABELS[t.id]} 미리보기`}
                width={1280}
                height={800}
                unoptimized
                priority
                className={`absolute inset-0 h-full w-full object-contain object-top transition-opacity duration-200 ${
                  preview === t.id ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </ErpPageShell>
  );
}
