"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import {
  THEME_PREVIEW,
  THEME_LABELS,
  normalizeSiteTheme,
  type SiteTheme,
  type ThemeMotionMap,
} from "@/lib/theme";
import { normalizeSiteThemeSettings } from "@/lib/theme-settings";
import { publishThemeSettingsUpdate } from "@/lib/theme-sync";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";

const THEMES: { id: SiteTheme; order: number; desc: string }[] = [
  { id: "pink", order: 1, desc: "아기자기 핑크, 다연 기본 스타일" },
  { id: "clean", order: 2, desc: "미니멀·모노톤, 깔끔한 쇼핑 경험" },
  { id: "indonesia", order: 3, desc: "따뜻한 레드·크림 톤, 트로피컬 무드" },
  { id: "dark", order: 4, desc: "블랙·골드 프리미엄, 고급 렌즈 라인" },
  { id: "aqua", order: 5, desc: "아쿠아·블루 클린, 촉촉함·신뢰감" },
];

const CARD_MIN_H = "min-h-[7.75rem]";

function MotionToggle({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-medium transition disabled:opacity-50 ${
        enabled
          ? "border-[var(--pink-accent)] bg-[var(--pink-bg)] text-[var(--pink-deep)]"
          : "border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >
      <span
        className={`relative h-3.5 w-7 rounded-full transition ${
          enabled ? "bg-[var(--pink-accent)]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow transition ${
            enabled ? "left-3.5" : "left-0.5"
          }`}
        />
      </span>
      모션 {enabled ? "ON" : "OFF"}
    </button>
  );
}

export default function ErpThemePage() {
  const [active, setActive] = useState<SiteTheme>("pink");
  const [preview, setPreview] = useState<SiteTheme>("pink");
  const [themeMotion, setThemeMotion] = useState<ThemeMotionMap>({
    pink: true,
    clean: true,
    indonesia: true,
    dark: true,
    aqua: true,
  });
  const [loading, setLoading] = useState<SiteTheme | null>(null);
  const [motionLoading, setMotionLoading] = useState<SiteTheme | null>(null);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api<{ theme: SiteTheme; themeMotion: ThemeMotionMap }>(
        "/api/admin/settings/theme",
        { token: getToken() },
      );
      const settings = normalizeSiteThemeSettings(data);
      setActive(settings.theme);
      setPreview(settings.theme);
      setThemeMotion(settings.themeMotion);
    } catch {
      setActive("pink");
      setPreview("pink");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function applyTheme(theme: SiteTheme) {
    if (loading) return;
    setLoading(theme);
    try {
      const data = await api<{ theme: SiteTheme; themeMotion: ThemeMotionMap }>(
        "/api/admin/settings/theme",
        {
          method: "PATCH",
          token: getToken(),
          body: JSON.stringify({ theme }),
        },
      );
      const settings = normalizeSiteThemeSettings(data);
      setActive(settings.theme);
      setPreview(settings.theme);
      setThemeMotion(settings.themeMotion);
      publishThemeSettingsUpdate(settings);
      showSaveSuccess({
        message: "적용되었습니다",
        subMessage: `${THEME_LABELS[theme]} 테마가 쇼핑몰에 실시간 반영됩니다.`,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "테마 적용에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  }

  async function toggleMotion(theme: SiteTheme, enabled: boolean) {
    if (motionLoading) return;
    setMotionLoading(theme);
    try {
      const data = await api<{ theme: SiteTheme; themeMotion: ThemeMotionMap }>(
        "/api/admin/settings/theme",
        {
          method: "PATCH",
          token: getToken(),
          body: JSON.stringify({ themeMotion: { [theme]: enabled } }),
        },
      );
      const settings = normalizeSiteThemeSettings(data);
      setThemeMotion(settings.themeMotion);
      publishThemeSettingsUpdate(settings);
      showSaveSuccess({
        message: "저장되었습니다",
        subMessage: `${THEME_LABELS[theme]} 모션이 ${enabled ? "켜짐" : "꺼짐"} · 쇼핑몰에 실시간 반영됩니다.`,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "모션 설정에 실패했습니다.");
    } finally {
      setMotionLoading(null);
    }
  }

  function selectTheme(theme: SiteTheme) {
    setPreview(theme);
    if (theme !== active) applyTheme(theme);
  }

  return (
    <ErpPageShell
      title="테마변경"
      description="적용 시 모든 방문자에게 동일한 쇼핑몰 테마가 표시됩니다. 테마별 모션은 ON/OFF로 제어할 수 있습니다."
    >
      {errorMsg ? (
        <p className="mb-2 w-full rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700" aria-live="polite">
          {errorMsg}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start">
        <div className="flex w-full shrink-0 flex-col gap-2.5 lg:max-h-[calc(100vh-12rem)] lg:w-[17.5rem] lg:overflow-y-auto lg:pr-1">
          {THEMES.map((t) => {
            const isActive = active === t.id;
            const isPreview = preview === t.id;
            const isLoading = loading === t.id;
            const isMotionBusy = motionLoading === t.id;
            return (
              <div
                key={t.id}
                className={`flex ${CARD_MIN_H} w-full flex-col rounded-xl border-2 bg-white p-4 ${
                  isPreview ? "border-[var(--pink-accent)]" : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectTheme(t.id)}
                  disabled={isLoading}
                  className="w-full flex-1 text-left disabled:opacity-60"
                >
                  <p className="text-sm font-bold text-gray-900">
                    {t.order}. {THEME_LABELS[t.id]}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{t.desc}</p>
                </button>
                <div className="mt-3 flex h-7 shrink-0 items-center gap-2">
                  {isActive ? (
                    <span className="inline-flex h-7 w-[7.25rem] shrink-0 items-center justify-center rounded-full bg-[var(--pink-accent)] text-[10px] font-medium text-white">
                      적용 중
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => applyTheme(t.id)}
                      className="inline-flex h-7 w-[7.25rem] shrink-0 items-center justify-center rounded-full border border-[var(--pink-accent)] text-[10px] font-medium text-[var(--pink-accent)] hover:bg-[var(--pink-bg)] disabled:opacity-50"
                    >
                      {isLoading ? "적용 중..." : "이 테마 적용"}
                    </button>
                  )}
                  <MotionToggle
                    enabled={themeMotion[t.id]}
                    disabled={isMotionBusy}
                    onChange={(next) => toggleMotion(t.id, next)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <p className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
            미리보기 — {THEME_LABELS[preview]}
            {themeMotion[preview] ? " · 모션 ON" : " · 모션 OFF"}
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
