"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpImageUpload } from "@/components/erp/ErpImageUpload";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import {
  EMPTY_PARTNER_SLOT,
  normalizePartnerBanners,
  PARTNER_BANNER_MAX,
  type PartnerBannerSlot,
  type PartnerBanners,
} from "@/lib/partner-banners";
import { publishPartnerBannersUpdate } from "@/lib/partner-banners-sync";

type Side = "left" | "right";

function toEditable(banners: PartnerBanners): PartnerBanners {
  return {
    left: banners.left.map((s) => ({ ...s })),
    right: banners.right.map((s) => ({ ...s })),
  };
}

function SideEditor({
  side,
  label,
  slots,
  onChange,
}: {
  side: Side;
  label: string;
  slots: PartnerBannerSlot[];
  onChange: (side: Side, slots: PartnerBannerSlot[]) => void;
}) {
  const { t, tFmt } = useI18n();

  function updateSlot(index: number, patch: Partial<PartnerBannerSlot>) {
    const next = slots.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(side, next);
  }

  function removeSlot(index: number) {
    onChange(
      side,
      slots.filter((_, i) => i !== index),
    );
  }

  function addSlot() {
    if (slots.length >= PARTNER_BANNER_MAX) return;
    onChange(side, [...slots, { ...EMPTY_PARTNER_SLOT }]);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
        <span className="text-xs text-gray-400">
          {slots.length}/{PARTNER_BANNER_MAX}
        </span>
      </div>

      {slots.length === 0 ? (
        <p className="mb-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-center text-xs text-gray-500">
          {t("erp.theme.partners.noBanners")}
        </p>
      ) : (
        <div className="space-y-4">
          {slots.map((slot, index) => (
            <div key={`${side}-${index}`} className="rounded-lg border border-pink-100 bg-pink-50/30 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-gray-700">
                  {tFmt("erp.theme.partners.bannerN", { n: index + 1 })}
                </p>
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="text-xs text-red-500 hover:underline"
                >
                  {t("erp.common.delete")}
                </button>
              </div>
              <div className="mx-auto max-w-[11rem]">
                <ErpImageUpload
                  variant="partner"
                  label={t("erp.theme.partners.squareImage")}
                  value={slot.image}
                  onChange={(url) => updateSlot(index, { image: url })}
                />
              </div>
              <label className="mt-3 block text-sm">
                <span className="mb-1 block text-xs text-gray-600">{t("erp.theme.partners.linkLabel")}</span>
                <input
                  type="url"
                  value={slot.url}
                  onChange={(e) => updateSlot(index, { url: e.target.value })}
                  placeholder="https://"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {slots.length < PARTNER_BANNER_MAX && (
        <button
          type="button"
          onClick={addSlot}
          className="mt-3 w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-600 hover:border-[var(--pink-accent)] hover:text-[var(--pink-accent)]"
        >
          {t("erp.theme.partners.addBanner")}
        </button>
      )}
    </div>
  );
}

export default function ErpPartnerBannersPage() {
  const { t } = useI18n();
  const [form, setForm] = useState<PartnerBanners>({ left: [], right: [] });
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ partnerBanners: PartnerBanners }>(
        "/api/admin/settings/partner-banners",
        { token: getErpToken() },
      );
      setForm(toEditable(normalizePartnerBanners(data.partnerBanners)));
    } catch {
      setForm({ left: [], right: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateSide(side: Side, slots: PartnerBannerSlot[]) {
    setForm((prev) => ({ ...prev, [side]: slots }));
  }

  async function save() {
    setLoading(true);
    setErrorMsg("");
    try {
      const payload = normalizePartnerBanners(form);
      const data = await api<{ partnerBanners: PartnerBanners }>(
        "/api/admin/settings/partner-banners",
        {
          method: "PATCH",
          token: getErpToken(),
          body: JSON.stringify({ partnerBanners: payload }),
        },
      );
      const next = normalizePartnerBanners(data.partnerBanners);
      setForm(toEditable(next));
      publishPartnerBannersUpdate(next);
      showSaveSuccess({
        subMessage: t("erp.theme.partners.savedSub"),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ErpPageShell titleKey="erp.nav.themePartners" descriptionKey="erp.theme.partners.description">
      {errorMsg ? (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700" aria-live="polite">
          {errorMsg}
        </p>
      ) : null}

      <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
        <p>{t("erp.theme.partners.hint1")}</p>
        <p>{t("erp.theme.partners.hint2")}</p>
        <p>{t("erp.theme.partners.hint3")}</p>
        <p>{t("erp.theme.partners.hint4")}</p>
        <p>{t("erp.theme.partners.hint5")}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SideEditor
          side="left"
          label={t("erp.theme.partners.left")}
          slots={form.left}
          onChange={updateSide}
        />
        <SideEditor
          side="right"
          label={t("erp.theme.partners.right")}
          slots={form.right}
          onChange={updateSide}
        />
      </div>

      <ErpFormActions className="mt-3">
        <button
          type="button"
          onClick={() => setForm({ left: [], right: [] })}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          {t("erp.theme.partners.clearAll")}
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
    </ErpPageShell>
  );
}
