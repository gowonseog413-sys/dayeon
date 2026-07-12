"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
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
import { getErpToken } from "@/lib/auth-store";
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

const STATUS_KEY: Record<EventPopupStatus, string> = {
  active: "erp.theme.popups.status.active",
  scheduled: "erp.theme.popups.status.scheduled",
  expired: "erp.theme.popups.status.expired",
  disabled: "erp.theme.popups.status.disabled",
  invalid: "erp.theme.popups.status.invalid",
};

const STATUS_CLASS: Record<EventPopupStatus, string> = {
  active: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  expired: "bg-gray-100 text-gray-500",
  disabled: "bg-gray-100 text-gray-500",
  invalid: "bg-red-100 text-red-700",
};

export default function ErpEventPopupsPage() {
  const { t, tFmt, locale } = useI18n();
  const inputLang = locale === "id" ? "id" : locale === "en" ? "en" : "ko";
  const [popups, setPopups] = useState<EventPopup[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ popups: EventPopup[] }>("/api/admin/event-popups", {
        token: getErpToken(),
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
    const token = getErpToken();
    try {
      if (editingId) {
        await api(`/api/admin/event-popups/${editingId}`, {
          method: "PUT",
          token,
          body: JSON.stringify(form),
        });
        showSaveSuccess({
          message: t("erp.save.title"),
          subMessage: t("erp.theme.popups.savedEditSub"),
        });
      } else {
        await api("/api/admin/event-popups", {
          method: "POST",
          token,
          body: JSON.stringify(form),
        });
        showSaveSuccess({
          message: t("erp.common.registeredTitle"),
          subMessage: t("erp.theme.popups.savedNewSub"),
        });
      }
      cancelEdit();
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.theme.popups.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("erp.theme.popups.confirmDelete"))) return;
    try {
      await api(`/api/admin/event-popups/${id}`, {
        method: "DELETE",
        token: getErpToken(),
      });
      if (editingId === id) cancelEdit();
      showSaveSuccess({ message: t("erp.common.deletedTitle") });
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.theme.popups.deleteFailed"));
    }
  }

  return (
    <ErpPageShell titleKey="erp.nav.themePopups" descriptionKey="erp.theme.popups.description">
      {errorMsg ? (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700">{errorMsg}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form onSubmit={save} className="space-y-3 rounded-xl border bg-white p-4">
          <p className="text-sm font-bold text-gray-900">
            {editingId ? t("erp.theme.popups.editTitle") : t("erp.theme.popups.newTitle")}
          </p>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">{t("erp.theme.popups.titleLabel")}</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder={t("erp.theme.popups.titlePlaceholder")}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">{t("erp.theme.popups.contentLabel")}</span>
            <textarea
              required
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm leading-relaxed"
              placeholder={t("erp.theme.popups.contentPlaceholder")}
            />
          </label>

          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-700">{t("erp.theme.popups.startLabel")}</p>
              <button
                type="button"
                onClick={setQuickStartNow}
                className="text-[11px] text-[var(--pink-accent)] hover:underline"
              >
                {t("erp.theme.popups.startNow")}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                lang={inputLang}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full rounded border bg-white px-3 py-2 text-sm"
              />
              <input
                type="time"
                lang={inputLang}
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded border bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-700">{t("erp.theme.popups.endLabel")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                lang={inputLang}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full rounded border bg-white px-3 py-2 text-sm"
              />
              <input
                type="time"
                lang={inputLang}
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
            {t("erp.theme.popups.enabled")}
          </label>
          <ErpFormActions className="pt-1">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-full border px-5 py-2 text-sm text-gray-600"
              >
                {t("erp.common.cancel")}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading
                ? t("erp.common.saving")
                : editingId
                  ? t("erp.theme.popups.saveEdit")
                  : t("erp.common.register")}
            </button>
          </ErpFormActions>
        </form>

        <div className="rounded-xl border bg-white p-4">
          <p className="mb-3 text-sm font-bold text-gray-900">
            {tFmt("erp.theme.popups.listTitle", { count: popups.length })}
          </p>
          {popups.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">{t("erp.theme.popups.noPopups")}</p>
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
                          {timezoneLabel(EVENT_POPUP_ADMIN_TZ, locale)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASS[status]}`}
                      >
                        {t(STATUS_KEY[status])}
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
                        {t("erp.common.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(popup.id)}
                        className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        {t("erp.common.delete")}
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
