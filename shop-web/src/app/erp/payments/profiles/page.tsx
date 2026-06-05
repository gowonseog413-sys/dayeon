"use client";

import { useEffect, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
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
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ profiles: AdminProfileRow[] }>("/api/admin/payments/profiles", {
      token: getToken(),
    })
      .then((d) => setProfiles(d.profiles))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ErpPageShell
      title="회원 결제수단"
      description="고객이 마이페이지에 등록한 결제수단 목록입니다. (카드 전체 번호는 저장하지 않습니다)"
    >
      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : profiles.length === 0 ? (
        <p className="text-sm text-gray-400">등록된 회원 결제수단이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="px-2 py-1.5">회원</th>
                <th className="px-2 py-1.5">메일</th>
                <th className="px-2 py-1.5">유형</th>
                <th className="px-2 py-1.5">표시명</th>
                <th className="px-2 py-1.5">상세</th>
                <th className="px-2 py-1.5 text-center">기본</th>
                <th className="px-2 py-1.5">수정일</th>
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
                    {new Date(p.updatedAt).toLocaleString("ko-KR")}
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
