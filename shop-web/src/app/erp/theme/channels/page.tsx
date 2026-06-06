"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import {
  DEFAULT_SOCIAL_CHANNELS,
  normalizeSocialChannels,
  SOCIAL_CHANNEL_FIELDS,
  type SocialChannels,
} from "@/lib/social-channels";
import { publishSocialChannelsUpdate } from "@/lib/social-channels-sync";

export default function ErpSocialChannelsPage() {
  const [channels, setChannels] = useState<SocialChannels>(DEFAULT_SOCIAL_CHANNELS);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ socialChannels: SocialChannels }>(
        "/api/admin/settings/social-channels",
        { token: getToken() },
      );
      setChannels(normalizeSocialChannels(data.socialChannels));
    } catch {
      setChannels(DEFAULT_SOCIAL_CHANNELS);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await api<{ socialChannels: SocialChannels }>(
        "/api/admin/settings/social-channels",
        {
          method: "PATCH",
          token: getToken(),
          body: JSON.stringify({ socialChannels: normalizeSocialChannels(channels) }),
        },
      );
      const next = normalizeSocialChannels(data.socialChannels);
      setChannels(next);
      publishSocialChannelsUpdate(next);
      showSaveSuccess({
        subMessage: "푸터 소셜 아이콘에 실시간 반영됩니다.",
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ErpPageShell
      title="채널URL"
      description="쇼핑몰 푸터 Facebook · Instagram · TikTok 아이콘 클릭 시 이동할 주소를 설정합니다."
    >
      {errorMsg ? (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700" aria-live="polite">
          {errorMsg}
        </p>
      ) : null}

      <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
        <p>· 주소를 입력한 채널만 클릭 가능합니다 (비우면 아이콘만 표시)</p>
        <p>· 클릭 시 새 창에서 열립니다</p>
      </div>

      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="space-y-3">
          {SOCIAL_CHANNEL_FIELDS.map(({ key, label }) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-gray-700">{label}</span>
              <input
                type="url"
                value={channels[key]}
                onChange={(e) => setChannels({ ...channels, [key]: e.target.value })}
                placeholder="https://"
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
      </div>

      <ErpFormActions className="mt-3">
        <button
          type="button"
          onClick={() => setChannels(DEFAULT_SOCIAL_CHANNELS)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          기본값으로
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
