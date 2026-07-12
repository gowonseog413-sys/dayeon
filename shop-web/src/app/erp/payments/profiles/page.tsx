"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import {
  CHANNEL_TYPE_LABEL,
  profileSummary,
  type PaymentProfile,
} from "@/lib/payment-methods";

type AdminProfileRow = PaymentProfile & {
  userName: string;
  userEmail: string;
};

export default function ErpPaymentProfilesPage() {
  const { t, locale } = useI18n();
  const dateLocale = locale === "id" ? "id-ID" : locale === "en" ? "en-US" : "ko-KR";
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ profiles: AdminProfileRow[] }>("/api/admin/payments/profiles", {
      token: getErpToken(),
    })
      .then((d) => setProfiles(d.profiles))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ErpPageShell titleKey="erp.nav.paymentsProfiles" descriptionKey="erp.payments.profilesDesc">
      {loading ? (
        <p className="text-sm text-gray-400">{t("erp.common.loading")}</p>
      ) : profiles.length === 0 ? (
        <p className="text-sm text-gray-400">{t("erp.payments.noProfiles")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="px-2 py-1.5">{t("erp.payments.colMember")}</th>
                <th className="px-2 py-1.5">{t("erp.payments.colEmail")}</th>
                <th className="px-2 py-1.5">{t("erp.payments.colType")}</th>
                <th className="px-2 py-1.5">{t("erp.payments.colLabel")}</th>
                <th className="px-2 py-1.5">{t("erp.payments.colDetail")}</th>
                <th className="px-2 py-1.5 text-center">{t("erp.payments.colDefault")}</th>
                <th className="px-2 py-1.5">{t("erp.payments.colUpdated")}</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="px-2 py-1.5">{p.userName}</td>
                  <td className="px-2 py-1.5 text-gray-600">{p.userEmail}</td>
                  <td className="px-2 py-1.5">{CHANNEL_TYPE_LABEL[p.channelType]}</td>
                  <td className="px-2 py-1.5">{p.label}</td>
                  <td className="px-2 py-1.5 text-gray-600">{profileSummary(p)}</td>
                  <td className="px-2 py-1.5 text-center">{p.isDefault ? "✓" : "-"}</td>
                  <td className="px-2 py-1.5 text-gray-500">
                    {new Date(p.updatedAt).toLocaleString(dateLocale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ErpPageShell>
  );
}
