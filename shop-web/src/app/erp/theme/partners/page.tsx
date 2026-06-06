"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpImageUpload } from "@/components/erp/ErpImageUpload";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
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
          등록된 배너가 없습니다. 아래 추가 버튼으로 배너를 넣을 수 있습니다.
        </p>
      ) : (
        <div className="space-y-4">
          {slots.map((slot, index) => (
            <div key={`${side}-${index}`} className="rounded-lg border border-pink-100 bg-pink-50/30 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-gray-700">배너 {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="text-xs text-red-500 hover:underline"
                >
                  삭제
                </button>
              </div>
              <div className="mx-auto max-w-[11rem]">
                <ErpImageUpload
                  variant="partner"
                  label="정사각형 이미지"
                  value={slot.image}
                  onChange={(url) => updateSlot(index, { image: url })}
                />
              </div>
              <label className="mt-3 block text-sm">
                <span className="mb-1 block text-xs text-gray-600">링크 주소 (클릭 시 새 창)</span>
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
          + 배너 추가
        </button>
      )}
    </div>
  );
}

export default function ErpPartnerBannersPage() {
  const [form, setForm] = useState<PartnerBanners>({ left: [], right: [] });
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ partnerBanners: PartnerBanners }>(
        "/api/admin/settings/partner-banners",
        { token: getToken() },
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
          token: getToken(),
          body: JSON.stringify({ partnerBanners: payload }),
        },
      );
      const next = normalizePartnerBanners(data.partnerBanners);
      setForm(toEditable(next));
      publishPartnerBannersUpdate(next);
      showSaveSuccess({
        subMessage: "쇼핑몰 좌·우 여백에 실시간 반영됩니다.",
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ErpPageShell
      title="제휴배너"
      description="쇼핑몰 본문 좌·우 여백에 정사각형 배너를 최대 3개씩 노출합니다. 이미지가 있는 슬롯만 표시됩니다."
    >
      {errorMsg ? (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700" aria-live="polite">
          {errorMsg}
        </p>
      ) : null}

      <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
        <p>· 왼쪽 최대 3개 · 오른쪽 최대 3개</p>
        <p>· 배너 크기는 상품 카드 이미지와 같은 정사각형 비율입니다</p>
        <p>· 링크 입력 시 클릭하면 새 창에서 열립니다</p>
        <p>· 업로드 이미지는 정사각형으로 자동 크롭·WebP 변환됩니다</p>
        <p>· 넓은 화면(약 1600px 이상) 좌·우 여백에만 표시되며 본문 레이아웃은 변하지 않습니다</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SideEditor
          side="left"
          label="왼쪽 배너"
          slots={form.left}
          onChange={updateSide}
        />
        <SideEditor
          side="right"
          label="오른쪽 배너"
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
          전체 비우기
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
    </ErpPageShell>
  );
}
