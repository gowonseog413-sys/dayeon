import fs from "fs";

const text = `"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { useErpPermissions } from "@/hooks/useErpPermissions";
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

export default function ErpPermissionsPage() {
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
      setError(err instanceof Error ? err.message : "\uC0AC\uC6D0 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    } finally {
      setLoading(false);
    }
  }, []);

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
        showSaveSuccess({ message: "\uC2E0\uADDC \uC0AC\uC6D0\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
      } else if (editingId) {
        const body: Record<string, unknown> = { ...form };
        if (!body.password) delete body.password;
        delete body.email;
        await api(\`/api/admin/permissions/staff/\${editingId}\`, {
          method: "PATCH",
          token,
          body: JSON.stringify(body),
        });
        showSaveSuccess({ message: "\uC0AC\uC6D0 \uC815\uBCF4\uAC00 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
      }
      closeModal();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
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
    if (!window.confirm(\`\uC120\uD0DD\uD55C \${deletable.length}\uBA85\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?\`)) return;
    setSaving(true);
    try {
      for (const id of deletable) {
        await api(\`/api/admin/permissions/staff/\${id}\`, { method: "DELETE", token });
      }
      setSelectedIds(new Set());
      showSaveSuccess({ message: "\uC120\uD0DD\uD55C \uC0AC\uC6D0\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "\uC0AD\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
    } finally {
      setSaving(false);
    }
  }

  if (permLoading) {
    return (
      <ErpPageShell title="\uAD8C\uD55C\uAD00\uB9AC">
        <p className="text-sm text-gray-500">\uAD8C\uD55C \uD655\uC778 \uC911\u2026</p>
      </ErpPageShell>
    );
  }

  if (!canManage) {
    const who = stored?.email || loginEmail || "\uC54C \uC218 \uC5C6\uC74C";
    return (
      <ErpPageShell title="\uAD8C\uD55C\uAD00\uB9AC">
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          \uAD8C\uD55C \uAD00\uB9AC\uB294 \uB9C8\uC2A4\uD130 \uACC4\uC815({MASTER_EMAIL})\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
          <br />
          <span className="mt-1 inline-block text-amber-900/80">
            \uD604\uC7AC \uB85C\uADF8\uC778: <strong>{who}</strong> \u2014 \uD478\uD130 \u300C\uAD00\uB9AC\uC790\uD398\uC774\uC9C0\u300D\uC5D0\uC11C \uB9C8\uC2A4\uD130 \uACC4\uC815\uC73C\uB85C \uB2E4\uC2DC
            \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.
          </span>
        </p>
      </ErpPageShell>
    );
  }

  return (
    <ErpPageShell
      title="\uAD8C\uD55C\uAD00\uB9AC"
      description="\uB9C8\uC2A4\uD130 \uAD00\uB9AC\uC790\uAC00 ERP \uC9C1\uC6D0 ID\u00B7\uBE44\uBC00\uBC88\uD638\u00B7\uBA54\uB274 \uAD8C\uD55C\uC744 \uBD80\uC5EC\uD569\uB2C8\uB2E4."
    >
      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="-mx-3 -mb-3 flex flex-col sm:-mx-4 sm:-mb-4 lg:min-h-[calc(100vh-11rem)] lg:flex-row lg:items-stretch">
        <nav
          className="shrink-0 border-b border-[#d8d0c6] bg-[#f5f0e8] lg:w-[13.5rem] lg:border-b-0 lg:border-r"
          aria-label="\uAD8C\uD55C \uBD84\uB958"
        >
          <div className="sticky top-0 max-h-[calc(100vh-11rem)] overflow-y-auto px-2 py-3">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a7f72]">
              \uAD8C\uD55C \uBD84\uB958
            </p>
            <button
              type="button"
              onClick={() => setActiveGroup(null)}
              className={\`mb-0.5 flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm \${
                activeGroup === null
                  ? "bg-[#4a6b68] font-medium text-white shadow-sm"
                  : "text-gray-800 hover:bg-[#ebe4da]"
              }\`}
            >
              \uC804\uCCB4 \uC0AC\uC6D0
              <span className="text-xs tabular-nums opacity-80">{staff.length}\uBA85</span>
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
              <p className="text-xs text-gray-500">\uAD00\uB9AC\uC790 \uBAA8\uB4DC</p>
              <h3 className="text-base font-semibold text-gray-900">
                \uC804\uCCB4 \uC0AC\uC6D0 \uC870\uD68C{" "}
                <span className="ml-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  \uCD1D {filteredStaff.length}\uBA85
                </span>
              </h3>
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="\uC774\uB984 / \uBD80\uC11C / \uC9C1\uAE09"
              className="min-w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-lg bg-[#4a6b68] px-4 py-2 text-sm font-medium text-white"
            >
              + \uCD94\uAC00
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
              \uC218\uC815
            </button>
            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={deleteSelected}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-600 disabled:opacity-40"
            >
              \uC0AD\uC81C
            </button>
            <button
              type="button"
              onClick={load}
              className="ml-auto rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600"
            >
              \uC0C8\uB85C\uACE0\uCE68
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#d8d0c6] bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f3f4f6] text-left text-xs text-gray-600">
                <tr>
                  <th className="px-3 py-2.5">\uC120\uD0DD</th>
                  <th className="px-3 py-2.5">\uCD5C\uADFC \uC811\uC18D\uB0A0\uC9DC</th>
                  <th className="px-3 py-2.5">No</th>
                  <th className="px-3 py-2.5">\uC785\uC0AC\uC77C</th>
                  <th className="px-3 py-2.5">\uC9C1\uAE09</th>
                  <th className="px-3 py-2.5">\uBD80\uC11C</th>
                  <th className="px-3 py-2.5">\uC131\uBA85</th>
                  <th className="px-3 py-2.5">Role</th>
                  <th className="px-3 py-2.5">\uBA54\uC77C (ID)</th>
                  <th className="px-3 py-2.5">\uC5F0\uB77D\uCC98</th>
                  <th className="px-3 py-2.5">\uC8FC\uC18C</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-3 py-10 text-center text-gray-500">
                      \uBD88\uB7EC\uC624\uB294 \uC911\u2026
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-3 py-10 text-center text-gray-500">
                      \uB4F1\uB85D\uB41C \uC0AC\uC6D0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \u300C+ \uCD94\uAC00\u300D\uB85C \uC2E0\uADDC \uC0AC\uC6D0\uC744 \uB4F1\uB85D\uD558\uC138\uC694.
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
                      <td className="px-3 py-2">{row.position || "-"}</td>
                      <td className="px-3 py-2">{row.department || "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => row.role === "staff" && openEditModal(row)}
                          className={\`font-medium \${
                            row.role === "staff"
                              ? "text-[#0284c7] hover:underline"
                              : "text-gray-900"
                          }\`}
                        >
                          {row.name}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        {row.role === "master" ? (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                            Master
                          </span>
                        ) : (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                            Member
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

          <p className="mt-2 text-xs text-gray-500">
            \uCD5C\uADFC \uC811\uC18D\uB0A0\uC9DC\uB294 \uAD00\uB9AC\uC790 \uB300\uBB38(/admin-gate) ID \uB85C\uADF8\uC778 \uAE30\uC900\uC73C\uB85C \uBC31\uC5D4\uB4DC\uC5D0 \uC800\uC7A5\uB429\uB2C8\uB2E4.
          </p>
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
  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#4a6b68] px-5 py-3 text-white">
          <h3 className="font-semibold">
            {editingId === "new" ? "\uC2E0\uADDC \uC0AC\uC6D0 \uB4F1\uB85D" : "\uC0AC\uC6D0 \uC815\uBCF4 \uC218\uC815"}
          </h3>
          <button type="button" onClick={onClose} className="text-xl leading-none opacity-80">
            \u00D7
          </button>
        </div>

        <div className="space-y-3 p-5">
          <label className="block text-sm">
            \uC131\uBA85*
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              \uC785\uC0AC\uC77C
              <input
                type="date"
                value={form.hireDate}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              \uC9C1\uAE09
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
              >
                {POSITION_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            \uBD80\uC11C
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="\uC608: \uAE30\uD68D\uBD80"
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            \uC0C1\uD0DC
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as "active" | "leave" })
              }
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            >
              <option value="active">\uADFC\uBB34\uC911</option>
              <option value="leave">\uD734\uC9C1</option>
            </select>
          </label>

          {editingId === "new" ? (
            <label className="block text-sm">
              \uC774\uBA54\uC77C (\uB85C\uADF8\uC778 ID)*
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
              \uB85C\uADF8\uC778 ID: <span className="font-mono">{form.email}</span>
            </p>
          )}

          <label className="block text-sm">
            \uC5F0\uB77D\uCC98
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            \uC8FC\uC18C
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="\uC8FC\uC18C\uB97C \uC785\uB825\uD558\uC138\uC694"
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            {editingId === "new" ? "\uCD08\uAE30 \uBE44\uBC00\uBC88\uD638* (6\uC790 \uC774\uC0C1)" : "\uBE44\uBC00\uBC88\uD638 (\uBCC0\uACBD \uC2DC\uB9CC)"}
            <PasswordInput
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="\uB85C\uADF8\uC778\uC5D0 \uC0AC\uC6A9\uD560 \uBE44\uBC00\uBC88\uD638"
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2 pr-10"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-800">ERP \uBA54\uB274 \uAD8C\uD55C</p>
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
                    <span>{g.label}</span>
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
            \uCDE8\uC18C
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="rounded-lg bg-[#4a6b68] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "\uC800\uC7A5 \uC911\u2026" : "\uC800\uC7A5"}
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
  return (
    <button
      type="button"
      onClick={onClick}
      title={group.desc}
      className={\`mb-0.5 flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm \${
        active
          ? "bg-[#4a6b68] font-medium text-white shadow-sm"
          : "text-gray-800 hover:bg-[#ebe4da]"
      }\`}
    >
      <span className="min-w-0 truncate">{group.label}</span>
      <span className="shrink-0 text-xs tabular-nums opacity-80">{count}\uBA85</span>
    </button>
  );
}
`;

fs.writeFileSync(
  new URL("../src/app/erp/settings/permissions/page.tsx", import.meta.url),
  text,
  "utf8",
);
console.log("permissions page written");
