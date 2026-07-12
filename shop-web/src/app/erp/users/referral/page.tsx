"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpContentTabs } from "@/components/erp/ErpContentTabs";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api, formatRp } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";

type ReferralSettings = {
  enabled: boolean;
  referrerReward: number;
  refereeReward: number;
  description: string;
};

type ReferralRow = {
  id: string;
  refereeName: string;
  refereeEmail: string;
  referrerName: string;
  referrerEmail: string;
  referralCode: string;
  referredAt: string | null;
};

type ReferralCodeRow = {
  userId: string;
  name: string;
  email: string;
  code: string;
  referralCount: number;
};

const REFERRAL_TAB_KEYS = [
  { id: "settings", labelKey: "erp.users.referral.tabSettings" },
  { id: "referrals", labelKey: "erp.users.referral.tabReferrals" },
  { id: "codes", labelKey: "erp.users.referral.tabCodes" },
] as const;

type ReferralTabId = (typeof REFERRAL_TAB_KEYS)[number]["id"];

function isReferralTabId(value: string | null): value is ReferralTabId {
  return value === "settings" || value === "referrals" || value === "codes";
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR");
}

function ErpUsersReferralContent() {
  const { t, tFmt } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: ReferralTabId = isReferralTabId(tabParam) ? tabParam : "settings";

  const [settings, setSettings] = useState<ReferralSettings>({
    enabled: true,
    referrerReward: 5000,
    refereeReward: 3000,
    description: "",
  });
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [codes, setCodes] = useState<ReferralCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { showSaveSuccess } = useErpSaveSuccess();

  const referralTabs = REFERRAL_TAB_KEYS.map((tab) => ({
    id: tab.id,
    label: t(tab.labelKey),
  }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{
        settings: ReferralSettings;
        referrals: ReferralRow[];
        codes: ReferralCodeRow[];
      }>("/api/admin/settings/referral", { token: getErpToken() });
      setSettings(data.settings);
      setReferrals(data.referrals);
      setCodes(data.codes);
    } catch {
      setReferrals([]);
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setTab(tab: ReferralTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "settings") params.delete("tab");
    else params.set("tab", tab);
    const qs = params.toString();
    router.replace(qs ? `/erp/users/referral?${qs}` : "/erp/users/referral", { scroll: false });
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    try {
      const data = await api<{ settings: ReferralSettings; referrals: ReferralRow[] }>(
        "/api/admin/settings/referral",
        {
          method: "PATCH",
          token: getErpToken(),
          body: JSON.stringify(settings),
        },
      );
      setSettings(data.settings);
      setReferrals(data.referrals);
      showSaveSuccess({ subMessage: t("erp.users.referral.settingsSaved") });
      load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ErpPageShell titleKey="erp.nav.usersReferral">{t("erp.common.loading")}</ErpPageShell>
    );
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.usersReferral"
      descriptionKey="erp.users.referral.description"
    >
      <ErpContentTabs
        tabs={referralTabs}
        active={activeTab}
        onChange={(id) => setTab(id as ReferralTabId)}
        className="mb-2"
      />

      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}

      {activeTab === "settings" ? (
        <form onSubmit={saveSettings} className="max-w-3xl rounded-xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">{t("erp.users.referral.settingsTitle")}</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              />
              {t("erp.users.referral.enabled")}
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">{t("erp.users.referral.referrerReward")}</span>
              <input
                type="number"
                min={0}
                value={settings.referrerReward}
                onChange={(e) =>
                  setSettings({ ...settings, referrerReward: Number(e.target.value) })
                }
                className="w-full rounded border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">{t("erp.users.referral.refereeReward")}</span>
              <input
                type="number"
                min={0}
                value={settings.refereeReward}
                onChange={(e) =>
                  setSettings({ ...settings, refereeReward: Number(e.target.value) })
                }
                className="w-full rounded border px-3 py-2"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-gray-600">{t("erp.users.referral.descriptionField")}</span>
              <textarea
                rows={2}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {tFmt("erp.users.referral.summary", {
              referrer: formatRp(settings.referrerReward),
              referee: formatRp(settings.refereeReward),
            })}
          </p>
          <ErpFormActions className="mt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? t("erp.common.saving") : t("erp.users.referral.saveSettings")}
            </button>
          </ErpFormActions>
        </form>
      ) : null}

      {activeTab === "referrals" ? (
        <div className="w-fit max-w-full rounded-xl border bg-white">
          <table className="text-left text-xs">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-2 py-1.5">{t("erp.users.referral.colReferredAt")}</th>
                <th className="whitespace-nowrap px-2 py-1.5">{t("erp.users.referral.colReferee")}</th>
                <th className="whitespace-nowrap px-2 py-1.5">{t("erp.users.referral.colReferrer")}</th>
                <th className="whitespace-nowrap px-2 py-1.5">{t("erp.users.referral.colCode")}</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-gray-400">
                    {t("erp.users.referral.noReferrals")}
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50">
                    <td className="whitespace-nowrap px-2 py-1.5 text-gray-500">
                      {formatDate(r.referredAt)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5">
                      <span className="font-medium">{r.refereeName}</span>
                      <span className="ml-1 text-gray-400">{r.refereeEmail}</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5">
                      <span className="font-medium">{r.referrerName}</span>
                      <span className="ml-1 text-gray-400">{r.referrerEmail}</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 font-mono text-gray-700">
                      {r.referralCode}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {activeTab === "codes" ? (
        <div className="w-fit max-w-full rounded-xl border bg-white">
          <table className="text-left text-xs">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-2 py-1.5">{t("erp.users.col.name")}</th>
                <th className="whitespace-nowrap px-2 py-1.5">{t("erp.users.col.email")}</th>
                <th className="whitespace-nowrap px-2 py-1.5">{t("erp.users.referral.colCode")}</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-right">{t("erp.users.referral.colReferralCount")}</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-gray-400">
                    {t("erp.users.referral.noCodes")}
                  </td>
                </tr>
              ) : (
                codes.map((c) => (
                  <tr key={c.userId} className="border-b border-gray-50">
                    <td className="whitespace-nowrap px-2 py-1.5 font-medium">{c.name}</td>
                    <td className="max-w-44 truncate px-2 py-1.5" title={c.email}>
                      {c.email}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 font-mono text-gray-700">
                      {c.code}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right">{c.referralCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </ErpPageShell>
  );
}

function ReferralLoadingFallback() {
  const { t } = useI18n();
  return (
    <ErpPageShell titleKey="erp.nav.usersReferral">{t("erp.common.loading")}</ErpPageShell>
  );
}

export default function ErpUsersReferralPage() {
  return (
    <Suspense fallback={<ReferralLoadingFallback />}>
      <ErpUsersReferralContent />
    </Suspense>
  );
}
