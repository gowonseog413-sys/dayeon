"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";

type PointsSettings = {
  earnRatePercent: number;
  tierSilver: number;
  tierGold: number;
  tierVip: number;
};

type PointsMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  tier: string;
};

export default function ErpUsersPointsPage() {
  const [settings, setSettings] = useState<PointsSettings>({
    earnRatePercent: 1,
    tierSilver: 1000,
    tierGold: 5000,
    tierVip: 10000,
  });
  const [members, setMembers] = useState<PointsMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ settings: PointsSettings; members: PointsMember[] }>(
        "/api/admin/settings/points",
        { token: getToken() },
      );
      setSettings(data.settings);
      setMembers(data.members);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const data = await api<{ settings: PointsSettings; members: PointsMember[] }>(
        "/api/admin/settings/points",
        {
          method: "PATCH",
          token: getToken(),
          body: JSON.stringify(settings),
        },
      );
      setSettings(data.settings);
      setMembers(data.members);
      setMsg("포인트/적립금 정책이 저장되었습니다.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function saveMemberPoints(id: string) {
    const points = Math.max(0, Math.floor(Number(editPoints) || 0));
    try {
      const data = await api<{ user: PointsMember }>(`/api/admin/users/${id}/points`, {
        method: "PATCH",
        token: getToken(),
        body: JSON.stringify({ points }),
      });
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, points: data.user.points, tier: data.user.tier } : m)),
      );
      setEditingId(null);
      setMsg(`${data.user.name}님 적립금이 ${formatRp(data.user.points)}으로 반영되었습니다.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "적립금 수정 실패");
    }
  }

  if (loading) {
    return <ErpPageShell title="포인트/적립금">불러오는 중…</ErpPageShell>;
  }

  return (
    <ErpPageShell
      title="포인트/적립금"
      description="구매 적립 비율·등급 기준을 설정하고 회원별 적립금을 관리합니다."
    >
      {msg ? <p className="mb-3 text-sm text-gray-600">{msg}</p> : null}

      <form onSubmit={saveSettings} className="mb-6 max-w-3xl rounded-xl border bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-gray-800">적립 정책</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">구매 적립률 (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={settings.earnRatePercent}
              onChange={(e) =>
                setSettings({ ...settings, earnRatePercent: Number(e.target.value) })
              }
              className="w-full rounded border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">실버 등급 (P 이상)</span>
            <input
              type="number"
              min={0}
              value={settings.tierSilver}
              onChange={(e) => setSettings({ ...settings, tierSilver: Number(e.target.value) })}
              className="w-full rounded border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">골드 등급 (P 이상)</span>
            <input
              type="number"
              min={0}
              value={settings.tierGold}
              onChange={(e) => setSettings({ ...settings, tierGold: Number(e.target.value) })}
              className="w-full rounded border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">VIP 등급 (P 이상)</span>
            <input
              type="number"
              min={0}
              value={settings.tierVip}
              onChange={(e) => setSettings({ ...settings, tierVip: Number(e.target.value) })}
              className="w-full rounded border px-3 py-2"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "저장 중…" : "정책 저장"}
        </button>
      </form>

      <div className="w-fit max-w-full rounded-xl border bg-white">
        <table className="text-left text-xs">
          <thead className="border-b bg-gray-50 text-gray-500">
            <tr>
              <th className="whitespace-nowrap px-2 py-1.5">이름</th>
              <th className="whitespace-nowrap px-2 py-1.5">메일</th>
              <th className="whitespace-nowrap px-2 py-1.5 text-center">등급</th>
              <th className="whitespace-nowrap px-2 py-1.5 text-right">적립금액</th>
              <th className="whitespace-nowrap px-2 py-1.5 text-center">수정</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-4 text-center text-gray-400">
                  등록된 회원이 없습니다.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="border-b border-gray-50">
                  <td className="whitespace-nowrap px-2 py-1.5 font-medium">{m.name}</td>
                  <td className="max-w-44 truncate px-2 py-1.5" title={m.email}>
                    {m.email}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-center">{m.tier}</td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-right">
                    {editingId === m.id ? (
                      <input
                        type="number"
                        min={0}
                        value={editPoints}
                        onChange={(e) => setEditPoints(e.target.value)}
                        className="w-24 rounded border px-2 py-1 text-right"
                      />
                    ) : (
                      formatRp(m.points)
                    )}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-center">
                    {editingId === m.id ? (
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => saveMemberPoints(m.id)}
                          className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700"
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded border px-2 py-0.5"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(m.id);
                          setEditPoints(String(m.points));
                        }}
                        className="rounded border px-2 py-0.5 text-gray-600 hover:bg-gray-50"
                      >
                        수정
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ErpPageShell>
  );
}
