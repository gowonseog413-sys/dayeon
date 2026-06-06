"use client";

import { useEffect, useState } from "react";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { CHANNEL_TYPE_LABEL, type PaymentChannel } from "@/lib/payment-methods";

export default function ErpPaymentsPage() {
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    api<{ channels: PaymentChannel[] }>("/api/admin/payments/channels", { token: getToken() })
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
        token: getToken(),
        body: JSON.stringify({ channels }),
      });
      showSaveSuccess({ subMessage: "결제 채널 설정이 반영되었습니다." });
      load();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  function update(idx: number, patch: Partial<PaymentChannel>) {
    setChannels((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  if (loading) return <ErpPageShell title="결제 채널 설정">불러오는 중…</ErpPageShell>;

  return (
    <ErpPageShell
      title="결제 채널 설정"
      description="쇼핑몰·체크아웃에 노출되는 결제수단과 Jubelio 채널 코드를 관리합니다."
    >
      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        인도네시아: 신용카드(Midtrans), GoPay(충전식 e-wallet), 가상계좌(BCA/Mandiri/BNI/BRI)를
        Jubelio OMS 결제 채널과 매핑합니다.
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
                쇼핑몰 노출
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                한글명
                <input
                  value={ch.nameKo}
                  onChange={(e) => update(idx, { nameKo: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                인도네시아어명
                <input
                  value={ch.nameId}
                  onChange={(e) => update(idx, { nameId: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Jubelio 채널 코드
                <input
                  value={ch.jubelioCode}
                  onChange={(e) => update(idx, { jubelioCode: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5 font-mono text-sm"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                설명 (한글)
                <textarea
                  rows={2}
                  value={ch.descriptionKo}
                  onChange={(e) => update(idx, { descriptionKo: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5"
                />
              </label>
              {ch.type === "virtual_account" && (
                <label className="text-sm sm:col-span-2">
                  지원 VA 은행 (쉼표 구분)
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
          {saving ? "저장 중…" : "채널 설정 저장"}
        </button>
      </ErpFormActions>
    </ErpPageShell>
  );
}
