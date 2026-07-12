"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import { CHANNEL_TYPE_LABEL, type PaymentChannel } from "@/lib/payment-methods";

export default function ErpPaymentsPage() {
  const { t } = useI18n();
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    api<{ channels: PaymentChannel[] }>("/api/admin/payments/channels", { token: getErpToken() })
      .then((d) => setChannels(d.channels))
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    setErrorMsg("");
    try {
      await api("/api/admin/payments/channels", {
        method: "PUT",
        token: getErpToken(),
        body: JSON.stringify({ channels }),
      });
      showSaveSuccess({ subMessage: t("erp.payments.saveSuccess") });
      load();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : t("erp.common.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  function update(idx: number, patch: Partial<PaymentChannel>) {
    setChannels((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  if (loading) {
    return (
      <ErpPageShell titleKey="erp.nav.paymentsChannels">{t("erp.common.loading")}</ErpPageShell>
    );
  }

  return (
    <ErpPageShell titleKey="erp.nav.paymentsChannels" descriptionKey="erp.payments.channelsDesc">
      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {t("erp.payments.indonesiaNote")}
      </p>
      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}

      <div className="space-y-4">
        {channels.map((ch, idx) => (
          <div key={ch.id} className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-gray-900">
                {CHANNEL_TYPE_LABEL[ch.type]} · {ch.nameKo}
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={ch.enabled}
                  onChange={(e) => update(idx, { enabled: e.target.checked })}
                />
                {t("erp.payments.storeVisible")}
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                {t("erp.payments.nameKo")}
                <input
                  value={ch.nameKo}
                  onChange={(e) => update(idx, { nameKo: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                {t("erp.payments.nameId")}
                <input
                  value={ch.nameId}
                  onChange={(e) => update(idx, { nameId: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                {t("erp.payments.jubelioCode")}
                <input
                  value={ch.jubelioCode}
                  onChange={(e) => update(idx, { jubelioCode: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5 font-mono text-sm"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                {t("erp.payments.descKo")}
                <textarea
                  rows={2}
                  value={ch.descriptionKo}
                  onChange={(e) => update(idx, { descriptionKo: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5"
                />
              </label>
              {ch.type === "virtual_account" && (
                <label className="text-sm sm:col-span-2">
                  {t("erp.payments.vaBanks")}
                  <input
                    value={(ch.vaBanks || []).join(", ")}
                    onChange={(e) =>
                      update(idx, {
                        vaBanks: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="mt-1 w-full rounded border px-2 py-1.5"
                  />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      <ErpFormActions className="mt-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-gray-800 px-5 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-60"
        >
          {saving ? t("erp.common.saving") : t("erp.payments.saveChannels")}
        </button>
      </ErpFormActions>
    </ErpPageShell>
  );
}
