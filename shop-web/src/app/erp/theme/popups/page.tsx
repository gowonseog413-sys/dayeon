"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import {
  EVENT_POPUP_ADMIN_TZ,
  formatEventSchedule,
  getEventPopupStatus,
  timezoneLabel,
  type EventPopupStatus,
} from "@/lib/event-popup-schedule";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import type { EventPopup } from "@/lib/types";

type FormState = {
  title: string;
  content: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  enabled: boolean;
};

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeInput() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function emptyForm(): FormState {
  const today = todayInput();
  return {
    title: "",
    content: "",
    startDate: today,
    startTime: "00:00",
    endDate: today,
    endTime: "23:59",
    enabled: true,
  };
}

const STATUS_LABEL: Record<EventPopupStatus, string> = {
  active: "노출 중",
  scheduled: "예약됨",
  expired: "기간 종료",
  disabled: "비활성",
  invalid: "설정 오류",
};

const STATUS_CLASS: Record<EventPopupStatus, string> = {
  active: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  expired: "bg-gray-100 text-gray-500",
  disabled: "bg-gray-100 text-gray-500",
  invalid: "bg-red-100 text-red-700",
};

export default function ErpEventPopupsPage() {
  const [popups, setPopups] = useState<EventPopup[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ popups: EventPopup[] }>("/api/admin/event-popups", {
        token: getToken(),
      });
      setPopups(data.popups);
    } catch {
      setPopups([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(popup: EventPopup) {
    setEditingId(popup.id);
    setForm({
      title: popup.title,
      content: popup.content,
      startDate: popup.startDate.slice(0, 10),
      startTime: popup.startTime || "00:00",
      endDate: popup.endDate.slice(0, 10),
      endTime: popup.endTime || "23:59",
      enabled: popup.enabled,
    });
    setErrorMsg("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
    setErrorMsg("");
  }

  function setQuickStartNow() {
    setForm((f) => ({ ...f, startDate: todayInput(), startTime: nowTimeInput() }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const token = getToken();
    try {
      if (editingId) {
        await api(`/api/admin/event-popups/${editingId}`, {
          method: "PUT",
          token,
          body: JSON.stringify(form),
        });
        showSaveSuccess({ message: "저장되었습니다", subMessage: "이벤트 팝업이 수정되었습니다." });
      } else {
        await api("/api/admin/event-popups", {
          method: "POST",
          token,
          body: JSON.stringify(form),
        });
        showSaveSuccess({ message: "등록되었습니다", subMessage: "이벤트 팝업이 쇼핑몰에 노출됩니다." });
      }
      cancelEdit();
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("이 팝업을 삭제할까요?")) return;
    try {
      await api(`/api/admin/event-popups/${id}`, {
        method: "DELETE",
        token: getToken(),
      });
      if (editingId === id) cancelEdit();
      showSaveSuccess({ message: "삭제되었습니다" });
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  return (
    <ErpPageShell
      title="이벤트 팝업"
      description="쇼핑몰 우측 상단에 뜨는 안내 팝업입니다. 노출 시간은 로컬·한국 접속 시 KST, 인도네시아 IP 접속 시 WIB 기준으로 적용됩니다."
    >
      {errorMsg ? (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700">{errorMsg}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form onSubmit={save} className="space-y-3 rounded-xl border bg-white p-4">
          <p className="text-sm font-bold text-gray-900">
            {editingId ? "팝업 수정" : "새 팝업 등록"}
          </p>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">제목*</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="예: 여름 시즌 오픈 이벤트"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">안내 내용*</span>
            <textarea
              required
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm leading-relaxed"
              placeholder="고객에게 보여줄 안내 문구를 입력하세요."
            />
          </label>

          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-700">노출 시작 (예약)</p>
              <button
                type="button"
                onClick={setQuickStartNow}
                className="text-[11px] text-[var(--pink-accent)] hover:underline"
              >
                지금부터
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full rounded border bg-white px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded border bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-700">노출 종료</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full rounded border bg-white px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded border bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            />
            노출 사용
          </label>
          <ErpFormActions className="pt-1">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-full border px-5 py-2 text-sm text-gray-600"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "저장 중..." : editingId ? "수정 저장" : "등록"}
            </button>
          </ErpFormActions>
        </form>

        <div className="rounded-xl border bg-white p-4">
          <p className="mb-3 text-sm font-bold text-gray-900">등록된 팝업 ({popups.length})</p>
          {popups.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">등록된 팝업이 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {popups.map((popup) => {
                const status = getEventPopupStatus(popup, new Date(), EVENT_POPUP_ADMIN_TZ);
                return (
                  <li
                    key={popup.id}
                    className="rounded-lg border border-gray-200 p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{popup.title}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatEventSchedule(popup, EVENT_POPUP_ADMIN_TZ)} · ERP{" "}
                          {timezoneLabel(EVENT_POPUP_ADMIN_TZ)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASS[status]}`}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-gray-600">
                      {popup.content}
                    </p>
                    <ErpFormActions className="mt-3">
                      <button
                        type="button"
                        onClick={() => startEdit(popup)}
                        className="rounded border px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(popup.id)}
                        className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </ErpFormActions>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </ErpPageShell>
  );
}
