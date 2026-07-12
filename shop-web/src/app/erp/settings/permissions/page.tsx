"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { PasswordInput } from "@/components/PasswordInput";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { useErpPermissions } from "@/hooks/useErpPermissions";
import { POSITION_KEY_MAP, POSITION_VALUES } from "@/i18n/erp-messages";
import { api } from "@/lib/api";
import { getErpStoredUser, getErpToken } from "@/lib/auth-store";
import {
  MASTER_EMAIL,
  POSITION_OPTIONS,
  type ErpPermissionGroup,
  type ErpStaffRow,
  formatStaffLoginAt,
} from "@/lib/erp-permissions";

type StaffResponse = {
  staff: ErpStaffRow[];
  counts: Record<string, number>;
  masterEmail: string;
};

type FormState = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phone: string;
  address: string;
  hireDate: string;
  status: "active" | "leave";
  permissions: string[];
};

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM: FormState = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  department: "",
  position: POSITION_OPTIONS[0],
  phone: "",
  address: "",
  hireDate: today(),
  status: "active",
  permissions: ["dashboard"],
};

function positionLabel(t: (key: string) => string, position: string) {
  const key = POSITION_KEY_MAP[position];
  return key ? t(key) : position;
}

export default function ErpPermissionsPage() {
  const { t, tFmt } = useI18n();
  const { isMaster, groups, loading: permLoading, email: loginEmail } = useErpPermissions();
  const stored = getErpStoredUser();
  const canManage = isMaster || loginEmail.toLowerCase() === MASTER_EMAIL;
  const { showSaveSuccess } = useErpSaveSuccess();
  const [staff, setStaff] = useState<ErpStaffRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const token = getErpToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await api<StaffResponse>("/api/admin/permissions/staff", { token });
      setStaff(data.staff);
      setCounts(data.counts);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("erp.permissions.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (canManage) load();
  }, [canManage, load]);

  const filteredStaff = useMemo(() => {
    const term = q.trim().toLowerCase();
    return staff.filter((row) => {
      if (activeGroup && !row.permissions.includes(activeGroup)) return false;
      if (!term) return true;
      return (
        row.email.toLowerCase().includes(term) ||
        row.name.toLowerCase().includes(term) ||
        row.department.toLowerCase().includes(term) ||
        row.position.toLowerCase().includes(term) ||
        row.address.toLowerCase().includes(term)
      );
    });
  }, [staff, activeGroup, q]);

  function togglePerm(id: string) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(id)
        ? f.permissions.filter((p) => p !== id)
        : [...f.permissions, id],
    }));
  }

  function openAddModal() {
    setEditingId("new");
    setForm({ ...EMPTY_FORM, hireDate: today(), permissions: ["dashboard"] });
    setModalOpen(true);
  }

  function openEditModal(row: ErpStaffRow) {
    if (row.role === "master") return;
    setEditingId(row.id);
    setForm({
      email: row.email,
      password: "",
      firstName: row.firstName,
      lastName: row.lastName,
      department: row.department,
      position: row.position || POSITION_OPTIONS[0],
      phone: row.phone,
      address: row.address,
      hireDate: row.hireDate || today(),
      status: row.status,
      permissions: [...row.permissions],
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function saveStaff() {
    const token = getErpToken();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      if (editingId === "new") {
        await api("/api/admin/permissions/staff", {
          method: "POST",
          token,
          body: JSON.stringify(form),
        });
        showSaveSuccess({ message: t("erp.permissions.saveSuccessAdd") });
      } else if (editingId) {
        const body: Record<string, unknown> = { ...form };
        if (!body.password) delete body.password;
        delete body.email;
        await api(`/api/admin/permissions/staff/${editingId}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(body),
        });
        showSaveSuccess({ message: t("erp.permissions.saveSuccessEdit") });
      }
      closeModal();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("erp.permissions.errorSave"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelected() {
    const token = getErpToken();
    const deletable = [...selectedIds].filter((id) => {
      const row = staff.find((s) => s.id === id);
      return row?.role === "staff";
    });
    if (!token || deletable.length === 0) return;
    if (!window.confirm(tFmt("erp.permissions.deleteConfirm", { count: deletable.length }))) return;
    setSaving(true);
    try {
      for (const id of deletable) {
        await api(`/api/admin/permissions/staff/${id}`, { method: "DELETE", token });
      }
      setSelectedIds(new Set());
      showSaveSuccess({ message: t("erp.permissions.deleteSuccess") });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("erp.permissions.errorDelete"));
    } finally {
      setSaving(false);
    }
  }

  if (permLoading) {
    return (
      <ErpPageShell titleKey="erp.nav.permissions">
        <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
      </ErpPageShell>
    );
  }

  if (!canManage) {
    const who = stored?.email || loginEmail || t("erp.permissions.unknownUser");
    return (
      <ErpPageShell titleKey="erp.nav.permissions">
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {tFmt("erp.permissions.masterOnly", { email: MASTER_EMAIL })}
          <br />
          <span className="mt-1 inline-block text-amber-900/80">
            {t("erp.permissions.currentLogin")} <strong>{who}</strong> —{" "}
            {t("erp.permissions.reloginHint")}
          </span>
        </p>
      </ErpPageShell>
    );
  }

  return (
    <ErpPageShell titleKey="erp.nav.permissions" descriptionKey="erp.permissions.description">
      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="-mx-3 -mb-3 flex flex-col sm:-mx-4 sm:-mb-4 lg:min-h-[calc(100vh-11rem)] lg:flex-row lg:items-stretch">
        <nav
          className="shrink-0 border-b border-[#d8d0c6] bg-[#f5f0e8] lg:w-[13.5rem] lg:border-b-0 lg:border-r"
          aria-label={t("erp.permissions.groupNav")}
        >
          <div className="sticky top-0 max-h-[calc(100vh-11rem)] overflow-y-auto px-2 py-3">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a7f72]">
              {t("erp.permissions.groupNav")}
            </p>
            <button
              type="button"
              onClick={() => setActiveGroup(null)}
              className={`mb-0.5 flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm ${
                activeGroup === null
                  ? "bg-[#4a6b68] font-medium text-white shadow-sm"
                  : "text-gray-800 hover:bg-[#ebe4da]"
              }`}
            >
              {t("erp.permissions.allStaff")}
              <span className="text-xs tabular-nums opacity-80">
                {tFmt("erp.permissions.countSuffix", { count: staff.length })}
              </span>
            </button>
            {groups.map((g) => (
              <GroupFilterButton
                key={g.id}
                group={g}
                count={counts[g.id] ?? 0}
                active={activeGroup === g.id}
                onClick={() => setActiveGroup(g.id)}
              />
            ))}
          </div>
        </nav>

        <div className="min-w-0 flex-1 px-3 py-3 sm:px-4 sm:py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d8d0c6] bg-white px-4 py-3">
            <div>
              <p className="text-xs text-gray-500">{t("erp.permissions.adminMode")}</p>
              <h3 className="text-base font-semibold text-gray-900">
                {t("erp.permissions.allStaffView")}{" "}
                <span className="ml-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  {tFmt("erp.permissions.totalCount", { count: filteredStaff.length })}
                </span>
              </h3>
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("erp.permissions.searchPlaceholderShort")}
              className="min-w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-lg bg-[#4a6b68] px-4 py-2 text-sm font-medium text-white"
            >
              + {t("erp.common.add")}
            </button>
            <button
              type="button"
              disabled={selectedIds.size !== 1}
              onClick={() => {
                const row = staff.find((s) => selectedIds.has(s.id));
                if (row) openEditModal(row);
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              {t("erp.common.edit")}
            </button>
            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={deleteSelected}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-600 disabled:opacity-40"
            >
              {t("erp.common.delete")}
            </button>
            <button
              type="button"
              onClick={load}
              className="ml-auto rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600"
            >
              {t("erp.common.refresh")}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#d8d0c6] bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f3f4f6] text-left text-xs text-gray-600">
                <tr>
                  <th className="px-3 py-2.5">{t("erp.permissions.select")}</th>
                  <th className="px-3 py-2.5">{t("erp.permissions.lastAccess")}</th>
                  <th className="px-3 py-2.5">{t("erp.permissions.colNo")}</th>
                  <th className="px-3 py-2.5">{t("erp.permissions.hireDate")}</th>
                  <th className="px-3 py-2.5">{t("erp.permissions.position")}</th>
                  <th className="px-3 py-2.5">{t("erp.permissions.department")}</th>
                  <th className="px-3 py-2.5">{t("erp.permissions.fullName")}</th>
                  <th className="px-3 py-2.5">{t("erp.permissions.role")}</th>
                  <th className="px-3 py-2.5">{t("erp.permissions.emailId")}</th>
                  <th className="px-3 py-2.5">{t("erp.permissions.phone")}</th>
                  <th className="px-3 py-2.5">{t("erp.permissions.address")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-3 py-10 text-center text-gray-500">
                      {t("erp.common.loading")}
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-3 py-10 text-center text-gray-500">
                      {t("erp.permissions.emptyStaff")}
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((row, idx) => (
                    <tr key={row.id} className="border-t border-gray-100 hover:bg-[#faf6f0]/70">
                      <td className="px-3 py-2">
                        {row.role === "staff" ? (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(row.id)}
                            onChange={(e) => {
                              const next = new Set(selectedIds);
                              if (e.target.checked) next.add(row.id);
                              else next.delete(row.id);
                              setSelectedIds(next);
                            }}
                          />
                        ) : null}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                        {formatStaffLoginAt(row.lastLoginAt)}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{filteredStaff.length - idx}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">{row.hireDate || "-"}</td>
                      <td className="px-3 py-2">{positionLabel(t, row.position) || "-"}</td>
                      <td className="px-3 py-2">{row.department || "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => row.role === "staff" && openEditModal(row)}
                          className={`font-medium ${
                            row.role === "staff"
                              ? "text-[#0284c7] hover:underline"
                              : "text-gray-900"
                          }`}
                        >
                          {row.name}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        {row.role === "master" ? (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                            {t("erp.permissions.roleMaster")}
                          </span>
                        ) : (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                            {t("erp.permissions.roleMember")}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{row.email}</td>
                      <td className="px-3 py-2 text-xs">{row.phone || "-"}</td>
                      <td className="max-w-48 truncate px-3 py-2 text-xs text-gray-600">
                        {row.address || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-xs text-gray-500">{t("erp.permissions.lastAccessNote")}</p>
        </div>
      </div>

      {modalOpen ? (
        <StaffModal
          editingId={editingId}
          form={form}
          setForm={setForm}
          groups={groups}
          saving={saving}
          onClose={closeModal}
          onSave={saveStaff}
          onTogglePerm={togglePerm}
        />
      ) : null}
    </ErpPageShell>
  );
}

function StaffModal({
  editingId,
  form,
  setForm,
  groups,
  saving,
  onClose,
  onSave,
  onTogglePerm,
}: {
  editingId: string | null;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  groups: ErpPermissionGroup[];
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onTogglePerm: (id: string) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#4a6b68] px-5 py-3 text-white">
          <h3 className="font-semibold">
            {editingId === "new"
              ? t("erp.permissions.addStaffModal")
              : t("erp.permissions.editStaffModal")}
          </h3>
          <button type="button" onClick={onClose} className="text-xl leading-none opacity-80">
            ×
          </button>
        </div>

        <div className="space-y-3 p-5">
          <label className="block text-sm">
            {t("erp.permissions.fullName")}*
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              {t("erp.permissions.hireDate")}
              <input
                type="date"
                value={form.hireDate}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              {t("erp.permissions.position")}
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
              >
                {POSITION_VALUES.map((p) => (
                  <option key={p} value={p}>
                    {positionLabel(t, p)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            {t("erp.permissions.department")}
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder={t("erp.permissions.departmentPlaceholder")}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            {t("erp.common.status")}
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as "active" | "leave" })
              }
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            >
              <option value="active">{t("erp.permissions.working")}</option>
              <option value="leave">{t("erp.permissions.leave")}</option>
            </select>
          </label>

          {editingId === "new" ? (
            <label className="block text-sm">
              {t("erp.permissions.emailLoginId")}*
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="staff@dayeon.shop"
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
              />
            </label>
          ) : (
            <p className="text-sm text-gray-600">
              {t("erp.permissions.loginId")}{" "}
              <span className="font-mono">{form.email}</span>
            </p>
          )}

          <label className="block text-sm">
            {t("erp.permissions.phone")}
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            {t("erp.permissions.address")}
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder={t("erp.permissions.addressPlaceholder")}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            {editingId === "new"
              ? t("erp.permissions.passwordNew")
              : t("erp.permissions.passwordChange")}
            <PasswordInput
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder={t("erp.permissions.passwordPlaceholder")}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2 pr-10"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-800">
              {t("erp.permissions.menuPermissions")}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {groups
                .filter((g) => g.id !== "permissions")
                .map((g) => (
                  <label
                    key={g.id}
                    className="flex items-start gap-2 rounded border border-gray-100 px-2 py-1.5 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(g.id)}
                      onChange={() => onTogglePerm(g.id)}
                      className="mt-0.5"
                    />
                    <span>{t(`erp.permGroup.${g.id}.label`)}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm"
          >
            {t("erp.common.cancel")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="rounded-lg bg-[#4a6b68] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? t("erp.common.saving") : t("erp.common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupFilterButton({
  group,
  count,
  active,
  onClick,
}: {
  group: ErpPermissionGroup;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const { t, tFmt } = useI18n();
  const label = t(`erp.permGroup.${group.id}.label`);
  const desc = t(`erp.permGroup.${group.id}.desc`);

  return (
    <button
      type="button"
      onClick={onClick}
      title={desc}
      className={`mb-0.5 flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm ${
        active
          ? "bg-[#4a6b68] font-medium text-white shadow-sm"
          : "text-gray-800 hover:bg-[#ebe4da]"
      }`}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="shrink-0 text-xs tabular-nums opacity-80">
        {tFmt("erp.permissions.countSuffix", { count })}
      </span>
    </button>
  );
}
