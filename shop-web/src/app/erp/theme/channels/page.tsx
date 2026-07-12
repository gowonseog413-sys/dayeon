"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import {
  DEFAULT_SOCIAL_CHANNELS,
  normalizeSocialChannels,
  SOCIAL_CHANNEL_FIELDS,
  type SocialChannels,
} from "@/lib/social-channels";
import { publishSocialChannelsUpdate } from "@/lib/social-channels-sync";

export default function ErpSocialChannelsPage() {
  const { t } = useI18n();
  const [channels, setChannels] = useState<SocialChannels>(DEFAULT_SOCIAL_CHANNELS);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ socialChannels: SocialChannels }>(
        "/api/admin/settings/social-channels",
        { token: getErpToken() },
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
          token: getErpToken(),
          body: JSON.stringify({ socialChannels: normalizeSocialChannels(channels) }),
        },
      );
      const next = normalizeSocialChannels(data.socialChannels);
      setChannels(next);
      publishSocialChannelsUpdate(next);
      showSaveSuccess({
        subMessage: t("erp.theme.channels.savedSub"),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ErpPageShell titleKey="erp.nav.themeChannels" descriptionKey="erp.theme.channels.description">
      {errorMsg ? (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700" aria-live="polite">
          {errorMsg}
        </p>
      ) : null}

      <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
        <p>{t("erp.theme.channels.hint1")}</p>
        <p>{t("erp.theme.channels.hint2")}</p>
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
          {t("erp.theme.channels.restoreDefault")}
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
