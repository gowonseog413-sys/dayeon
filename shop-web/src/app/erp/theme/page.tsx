"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import {
  THEME_PREVIEW,
  normalizeSiteTheme,
  type SiteTheme,
  type ThemeMotionMap,
} from "@/lib/theme";
import { normalizeSiteThemeSettings } from "@/lib/theme-settings";
import { publishThemeSettingsUpdate } from "@/lib/theme-sync";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";

const THEMES: { id: SiteTheme; order: number; descKey: string }[] = [
  { id: "pink", order: 1, descKey: "erp.theme.desc.pink" },
  { id: "clean", order: 2, descKey: "erp.theme.desc.clean" },
  { id: "indonesia", order: 3, descKey: "erp.theme.desc.indonesia" },
  { id: "dark", order: 4, descKey: "erp.theme.desc.dark" },
  { id: "aqua", order: 5, descKey: "erp.theme.desc.aqua" },
];

const CARD_MIN_H = "min-h-[7.75rem]";

function themeNameKey(id: SiteTheme) {
  return `erp.theme.name.${id}` as const;
}

function MotionToggle({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  const { t } = useI18n();
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
      {t("erp.theme.motion")} {enabled ? t("erp.theme.motionOn") : t("erp.theme.motionOff")}
    </button>
  );
}

export default function ErpThemePage() {
  const { t, tFmt } = useI18n();
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
        { token: getErpToken() },
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
          token: getErpToken(),
          body: JSON.stringify({ theme }),
        },
      );
      const settings = normalizeSiteThemeSettings(data);
      setActive(settings.theme);
      setPreview(settings.theme);
      setThemeMotion(settings.themeMotion);
      publishThemeSettingsUpdate(settings);
      showSaveSuccess({
        message: t("erp.theme.applied"),
        subMessage: tFmt("erp.theme.appliedSub", { name: t(themeNameKey(theme)) }),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.theme.applyFailed"));
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
          token: getErpToken(),
          body: JSON.stringify({ themeMotion: { [theme]: enabled } }),
        },
      );
      const settings = normalizeSiteThemeSettings(data);
      setThemeMotion(settings.themeMotion);
      publishThemeSettingsUpdate(settings);
      showSaveSuccess({
        message: t("erp.save.title"),
        subMessage: tFmt("erp.theme.motionSavedSub", {
          name: t(themeNameKey(theme)),
          state: enabled ? t("erp.theme.motionOnState") : t("erp.theme.motionOffState"),
        }),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.theme.motionFailed"));
    } finally {
      setMotionLoading(null);
    }
  }

  function previewTheme(theme: SiteTheme) {
    setPreview(theme);
  }

  return (
    <ErpPageShell titleKey="erp.nav.theme" descriptionKey="erp.theme.description">
      {errorMsg ? (
        <p className="mb-2 w-full rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700" aria-live="polite">
          {errorMsg}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start">
        <div className="flex w-full shrink-0 flex-col gap-2.5 lg:max-h-[calc(100vh-12rem)] lg:w-[17.5rem] lg:overflow-y-auto lg:pr-1">
          {THEMES.map((themeItem) => {
            const isActive = active === themeItem.id;
            const isPreview = preview === themeItem.id;
            const isLoading = loading === themeItem.id;
            const isMotionBusy = motionLoading === themeItem.id;
            return (
              <div
                key={themeItem.id}
                className={`flex ${CARD_MIN_H} w-full flex-col rounded-xl border-2 bg-white p-4 ${
                  isPreview ? "border-[var(--pink-accent)]" : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => previewTheme(themeItem.id)}
                  disabled={isLoading}
                  className="w-full flex-1 text-left disabled:opacity-60"
                >
                  <p className="text-sm font-bold text-gray-900">
                    {themeItem.order}. {t(themeNameKey(themeItem.id))}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{t(themeItem.descKey)}</p>
                </button>
                <div className="mt-3 flex h-7 shrink-0 items-center gap-2">
                  {isActive ? (
                    <span className="inline-flex h-7 w-[7.25rem] shrink-0 items-center justify-center rounded-full bg-[var(--pink-accent)] text-[10px] font-medium text-white">
                      {t("erp.theme.applying")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => applyTheme(themeItem.id)}
                      className="inline-flex h-7 w-[7.25rem] shrink-0 items-center justify-center rounded-full border border-[var(--pink-accent)] text-[10px] font-medium text-[var(--pink-accent)] hover:bg-[var(--pink-bg)] disabled:opacity-50"
                    >
                      {isLoading ? t("erp.theme.applyingEllipsis") : t("erp.theme.applyThis")}
                    </button>
                  )}
                  <MotionToggle
                    enabled={themeMotion[themeItem.id]}
                    disabled={isMotionBusy}
                    onChange={(next) => toggleMotion(themeItem.id, next)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <p className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
            {tFmt("erp.theme.preview", { name: t(themeNameKey(preview)) })}
            {themeMotion[preview] ? t("erp.theme.previewMotionOn") : t("erp.theme.previewMotionOff")}
          </p>
          <div className="relative aspect-[16/10] w-full bg-gray-50">
            {THEMES.map((themeItem) => (
              <Image
                key={themeItem.id}
                src={THEME_PREVIEW[themeItem.id]}
                alt={tFmt("erp.theme.previewAlt", { name: t(themeNameKey(themeItem.id)) })}
                width={1280}
                height={800}
                unoptimized
                priority
                className={`absolute inset-0 h-full w-full object-contain object-top transition-opacity duration-200 ${
                  preview === themeItem.id ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </ErpPageShell>
  );
}
