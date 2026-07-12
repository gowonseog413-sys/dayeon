"use client";

import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { resolveCatalogItemLabel } from "@/lib/catalog-i18n";
import { CatalogUsageModal } from "@/components/erp/CatalogUsageModal";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { getErpToken } from "@/lib/auth-store";
import {
  catalogApi,
  isInUseError,
  notifyCatalogUpdated,
  useProductCatalog,
  type CatalogItem,
  type CatalogUsageProduct,
  type CategoryTreeNode,
} from "@/lib/product-catalog-store";

type Level = "main" | "mid" | "sub";

type PendingAction = {
  level: Level;
  action: "edit" | "delete";
  mainId: string;
  midId?: string;
  subId?: string;
  body?: { label: string; newId?: string };
};

export default function ErpProductCatalogPage() {
  const { t, locale } = useI18n();
  const { catalog, loading, reload } = useProductCatalog();
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedMid, setSelectedMid] = useState<string | null>(null);

  const [mainForm, setMainForm] = useState({ label: "" });
  const [midForm, setMidForm] = useState({ label: "" });
  const [subForm, setSubForm] = useState({ label: "" });
  const [secForm, setSecForm] = useState({ label: "" });

  const [editMain, setEditMain] = useState<CategoryTreeNode | null>(null);
  const [editMid, setEditMid] = useState<CategoryTreeNode | null>(null);
  const [editSub, setEditSub] = useState<CategoryTreeNode | null>(null);
  const [editSec, setEditSec] = useState<CatalogItem | null>(null);

  const [usageOpen, setUsageOpen] = useState(false);
  const [usageAction, setUsageAction] = useState<"edit" | "delete">("delete");
  const [usageTypeLabel, setUsageTypeLabel] = useState("");
  const [usageIsHomeSection, setUsageIsHomeSection] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [usageProducts, setUsageProducts] = useState<CatalogUsageProduct[]>([]);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const mainNode = catalog.categoryTree.find((m) => m.id === selectedMain) ?? null;
  const midNode = mainNode?.children?.find((m) => m.id === selectedMid) ?? null;

  const levelLabelKey: Record<Level, string> = {
    main: "erp.products.catalog.categoryMain",
    mid: "erp.products.catalog.categoryMid",
    sub: "erp.products.catalog.categorySub",
  };

  function openUsage(
    action: "edit" | "delete",
    level: Level,
    count: number,
    products: CatalogUsageProduct[],
    next: PendingAction,
  ) {
    setUsageAction(action);
    setUsageTypeLabel(t(levelLabelKey[level]));
    setUsageIsHomeSection(false);
    setUsageCount(count);
    setUsageProducts(products);
    setPending(next);
    setUsageOpen(true);
  }

  async function runPending(force = false) {
    if (!pending) return;
    const token = getErpToken();
    setErrorMsg("");
    try {
      const { level, action, mainId, midId, subId, body } = pending;
      const q = force ? "?force=1" : "";

      if (action === "delete") {
        let path = `/api/admin/catalog/tree/main/${mainId}${q}`;
        if (level === "mid" && midId) path = `/api/admin/catalog/tree/main/${mainId}/mid/${midId}${q}`;
        if (level === "sub" && midId && subId) {
          path = `/api/admin/catalog/tree/main/${mainId}/mid/${midId}/sub/${subId}${q}`;
        }
        await catalogApi(path, { method: "DELETE", token });
        if (level === "main") setSelectedMain(null);
        if (level === "mid") setSelectedMid(null);
        showSaveSuccess({
          message: t("erp.common.deletedTitle"),
          subMessage: t("erp.products.catalog.checkListMsg"),
        });
      } else {
        let path = `/api/admin/catalog/tree/main/${mainId}`;
        let payload = { ...body, force };
        if (level === "main") path = `/api/admin/catalog/tree/main/${mainId}`;
        if (level === "mid" && midId) path = `/api/admin/catalog/tree/main/${mainId}/mid/${midId}`;
        if (level === "sub" && midId && subId) {
          path = `/api/admin/catalog/tree/main/${mainId}/mid/${midId}/sub/${subId}`;
        }
        await catalogApi(path, { method: "PUT", token, body: JSON.stringify(payload) });
        setEditMain(null);
        setEditMid(null);
        setEditSub(null);
        showSaveSuccess({ subMessage: t("erp.products.catalog.checkListMsg") });
      }
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.processFailed"));
    } finally {
      setUsageOpen(false);
      setPending(null);
    }
  }

  async function handleInUse(err: unknown, action: "edit" | "delete", pendingAction: PendingAction) {
    if (isInUseError(err)) {
      openUsage(action, pendingAction.level, err.data.count, err.data.products, pendingAction);
      return true;
    }
    return false;
  }

  async function addMain(e: React.FormEvent) {
    e.preventDefault();
    try {
      await catalogApi("/api/admin/catalog/tree/main", {
        method: "POST",
        token: getErpToken(),
        body: JSON.stringify({ label: mainForm.label }),
      });
      setMainForm({ label: "" });
      showSaveSuccess({
        message: t("erp.common.registeredTitle"),
        subMessage: t("erp.products.catalog.mainAdded"),
      });
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.addFailed"));
    }
  }

  async function addMid(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMain) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid`, {
        method: "POST",
        token: getErpToken(),
        body: JSON.stringify({ label: midForm.label }),
      });
      setMidForm({ label: "" });
      showSaveSuccess({
        message: t("erp.common.registeredTitle"),
        subMessage: t("erp.products.catalog.midAdded"),
      });
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.addFailed"));
    }
  }

  async function addSub(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMain || !selectedMid) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid/${selectedMid}/sub`, {
        method: "POST",
        token: getErpToken(),
        body: JSON.stringify({ label: subForm.label }),
      });
      setSubForm({ label: "" });
      showSaveSuccess({
        message: t("erp.common.registeredTitle"),
        subMessage: t("erp.products.catalog.subAdded"),
      });
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.addFailed"));
    }
  }

  async function saveMain(item: CategoryTreeNode, label: string, newId: string) {
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${item.id}`, {
        method: "PUT",
        token: getErpToken(),
        body: JSON.stringify({ label, newId: newId !== item.id ? newId : undefined }),
      });
      setEditMain(null);
      if (selectedMain === item.id && newId !== item.id) setSelectedMain(newId);
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess();
    } catch (err) {
      if (
        await handleInUse(err, "edit", {
          level: "main",
          action: "edit",
          mainId: item.id,
          body: { label, newId: newId !== item.id ? newId : undefined },
        })
      )
        return;
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.editFailed"));
    }
  }

  async function deleteMain(id: string) {
    if (!confirm(t("erp.products.catalog.confirmDeleteMain"))) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${id}`, { method: "DELETE", token: getErpToken() });
      if (selectedMain === id) {
        setSelectedMain(null);
        setSelectedMid(null);
      }
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess({ message: t("erp.common.deletedTitle") });
    } catch (err) {
      if (await handleInUse(err, "delete", { level: "main", action: "delete", mainId: id })) return;
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.deleteFailed"));
    }
  }

  async function saveMid(item: CategoryTreeNode, label: string, newId: string) {
    if (!selectedMain) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid/${item.id}`, {
        method: "PUT",
        token: getErpToken(),
        body: JSON.stringify({ label, newId: newId !== item.id ? newId : undefined }),
      });
      setEditMid(null);
      if (selectedMid === item.id && newId !== item.id) setSelectedMid(newId);
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess();
    } catch (err) {
      if (
        await handleInUse(err, "edit", {
          level: "mid",
          action: "edit",
          mainId: selectedMain,
          midId: item.id,
          body: { label, newId: newId !== item.id ? newId : undefined },
        })
      )
        return;
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.editFailed"));
    }
  }

  async function deleteMid(id: string) {
    if (!selectedMain || !confirm(t("erp.products.catalog.confirmDeleteMid"))) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid/${id}`, {
        method: "DELETE",
        token: getErpToken(),
      });
      if (selectedMid === id) setSelectedMid(null);
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess({ message: t("erp.common.deletedTitle") });
    } catch (err) {
      if (await handleInUse(err, "delete", { level: "mid", action: "delete", mainId: selectedMain, midId: id }))
        return;
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.deleteFailed"));
    }
  }

  async function saveSub(item: CategoryTreeNode, label: string, newId: string) {
    if (!selectedMain || !selectedMid) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid/${selectedMid}/sub/${item.id}`, {
        method: "PUT",
        token: getErpToken(),
        body: JSON.stringify({ label, newId: newId !== item.id ? newId : undefined }),
      });
      setEditSub(null);
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess();
    } catch (err) {
      if (
        await handleInUse(err, "edit", {
          level: "sub",
          action: "edit",
          mainId: selectedMain,
          midId: selectedMid,
          subId: item.id,
          body: { label, newId: newId !== item.id ? newId : undefined },
        })
      )
        return;
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.editFailed"));
    }
  }

  async function deleteSub(id: string) {
    if (!selectedMain || !selectedMid || !confirm(t("erp.products.catalog.confirmDeleteSub"))) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid/${selectedMid}/sub/${id}`, {
        method: "DELETE",
        token: getErpToken(),
      });
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess({ message: t("erp.common.deletedTitle") });
    } catch (err) {
      if (
        await handleInUse(err, "delete", {
          level: "sub",
          action: "delete",
          mainId: selectedMain,
          midId: selectedMid,
          subId: id,
        })
      )
        return;
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.deleteFailed"));
    }
  }

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    try {
      await catalogApi("/api/admin/catalog/sections", {
        method: "POST",
        token: getErpToken(),
        body: JSON.stringify({ label: secForm.label }),
      });
      setSecForm({ label: "" });
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess({
        message: t("erp.common.registeredTitle"),
        subMessage: t("erp.products.catalog.sectionAdded"),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.addFailed"));
    }
  }

  async function saveSection(item: CatalogItem, label: string, newId: string) {
    try {
      await catalogApi(`/api/admin/catalog/sections/${item.id}`, {
        method: "PUT",
        token: getErpToken(),
        body: JSON.stringify({ label, newId: newId !== item.id ? newId : undefined }),
      });
      setEditSec(null);
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess();
    } catch (err) {
      if (isInUseError(err)) {
        setUsageAction("edit");
        setUsageTypeLabel(t("erp.products.catalog.homeSection"));
        setUsageIsHomeSection(true);
        setUsageCount(err.data.count);
        setUsageProducts(err.data.products);
        setPending({
          level: "main",
          action: "edit",
          mainId: item.id,
          body: { label, newId: newId !== item.id ? newId : undefined },
        });
        setUsageOpen(true);
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.editFailed"));
    }
  }

  async function deleteSection(id: string) {
    if (!confirm(t("erp.products.catalog.confirmDeleteSection"))) return;
    try {
      await catalogApi(`/api/admin/catalog/sections/${id}`, { method: "DELETE", token: getErpToken() });
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess({ message: t("erp.common.deletedTitle") });
    } catch (err) {
      if (isInUseError(err)) {
        setUsageAction("delete");
        setUsageTypeLabel(t("erp.products.catalog.homeSection"));
        setUsageIsHomeSection(true);
        setUsageCount(err.data.count);
        setUsageProducts(err.data.products);
        setPending({ level: "main", action: "delete", mainId: id });
        setUsageOpen(true);
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.deleteFailed"));
    }
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.productsCatalog"
      descriptionKey="erp.products.catalog.description"
    >
      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}
      {loading ? (
        <p className="text-sm text-gray-400">{t("erp.common.loading")}</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <TreeColumn
              title={t("erp.products.catalog.categoryMain")}
              items={catalog.categoryTree}
              selectedId={selectedMain}
              onSelect={(id) => {
                setSelectedMain(id);
                setSelectedMid(null);
              }}
              form={mainForm}
              setForm={setMainForm}
              onAdd={addMain}
              editing={editMain}
              setEditing={setEditMain}
              onSave={saveMain}
              onDelete={deleteMain}
            />
            <TreeColumn
              title={t("erp.products.catalog.categoryMid")}
              parentLabel={mainNode ? resolveCatalogItemLabel(mainNode, locale) : undefined}
              items={mainNode?.children ?? []}
              disabled={!selectedMain}
              selectedId={selectedMid}
              onSelect={setSelectedMid}
              form={midForm}
              setForm={setMidForm}
              onAdd={addMid}
              editing={editMid}
              setEditing={setEditMid}
              onSave={saveMid}
              onDelete={deleteMid}
            />
            <TreeColumn
              title={t("erp.products.catalog.categorySub")}
              parentLabel={midNode ? resolveCatalogItemLabel(midNode, locale) : undefined}
              items={midNode?.children ?? []}
              disabled={!selectedMid}
              selectedId={null}
              onSelect={() => {}}
              form={subForm}
              setForm={setSubForm}
              onAdd={addSub}
              editing={editSub}
              setEditing={setEditSub}
              onSave={saveSub}
              onDelete={deleteSub}
              hideSelect
            />
          </div>

          <section className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold">{t("erp.products.catalog.homeSection")}</h3>
            <SectionList
              items={catalog.sections}
              form={secForm}
              setForm={setSecForm}
              onAdd={addSection}
              editing={editSec}
              setEditing={setEditSec}
              onSave={saveSection}
              onDelete={deleteSection}
            />
          </section>
        </>
      )}

      <CatalogUsageModal
        open={usageOpen}
        action={usageAction}
        typeLabel={usageTypeLabel}
        count={usageCount}
        products={usageProducts}
        onConfirm={() => {
          if (usageIsHomeSection && pending?.action === "edit" && pending.mainId) {
            catalogApi(`/api/admin/catalog/sections/${pending.mainId}`, {
              method: "PUT",
              token: getErpToken(),
              body: JSON.stringify({ ...pending.body, force: true }),
            }).then(() => {
              notifyCatalogUpdated();
              reload();
              setEditSec(null);
            });
            setUsageOpen(false);
            setPending(null);
            return;
          }
          if (usageIsHomeSection && pending?.action === "delete" && pending.mainId) {
            catalogApi(`/api/admin/catalog/sections/${pending.mainId}?force=1`, {
              method: "DELETE",
              token: getErpToken(),
            }).then(() => {
              notifyCatalogUpdated();
              reload();
            });
            setUsageOpen(false);
            setPending(null);
            return;
          }
          runPending(true);
        }}
        onCancel={() => {
          setUsageOpen(false);
          setPending(null);
        }}
      />
    </ErpPageShell>
  );
}

function TreeColumn({
  title,
  parentLabel,
  items,
  disabled,
  selectedId,
  onSelect,
  form,
  setForm,
  onAdd,
  editing,
  setEditing,
  onSave,
  onDelete,
  hideSelect,
}: {
  title: string;
  parentLabel?: string;
  items: CategoryTreeNode[];
  disabled?: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  form: { label: string };
  setForm: (v: { label: string }) => void;
  onAdd: (e: React.FormEvent) => void;
  editing: CategoryTreeNode | null;
  setEditing: (v: CategoryTreeNode | null) => void;
  onSave: (item: CategoryTreeNode, label: string, newId: string) => void;
  onDelete: (id: string) => void;
  hideSelect?: boolean;
}) {
  const { t, locale } = useI18n();
  const [editLabel, setEditLabel] = useState("");

  function startEdit(item: CategoryTreeNode) {
    setEditing(item);
    setEditLabel(item.label);
  }

  function displayLabel(item: CategoryTreeNode) {
    return resolveCatalogItemLabel(item, locale);
  }

  return (
    <section className={`rounded-xl border bg-white p-4 ${disabled ? "opacity-60" : ""}`}>
      <h3 className="mb-2 text-sm font-semibold text-gray-900">
        {parentLabel ? (
          <>
            {title}
            <span className="mx-1.5 font-normal text-gray-400">&gt;</span>
            <span className="font-normal text-gray-700">{parentLabel}</span>
          </>
        ) : (
          title
        )}
      </h3>

      {!disabled && (
        <form onSubmit={onAdd} className="mb-3 grid gap-2">
          <input
            required
            placeholder={t("erp.products.catalog.displayNamePlaceholder")}
            value={form.label}
            onChange={(e) => setForm({ label: e.target.value })}
            className="rounded border px-2 py-1.5 text-sm"
          />
          <button type="submit" className="rounded bg-[var(--pink-accent)] py-1.5 text-xs text-white">
            {t("erp.common.add")}
          </button>
        </form>
      )}

      <ul className="max-h-80 divide-y overflow-y-auto rounded-lg border">
        {items.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-gray-400">{t("erp.products.catalog.noItems")}</li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className={`px-3 py-2 text-sm ${!hideSelect && selectedId === item.id ? "bg-[var(--pink-bg)]/50" : ""}`}
            >
              {editing?.id === item.id ? (
                <EditRow
                  editLabel={editLabel}
                  setEditLabel={setEditLabel}
                  onSave={() => onSave(item, editLabel, item.id)}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className={`min-w-0 flex-1 text-left ${hideSelect ? "cursor-default" : ""}`}
                    onClick={() => !hideSelect && onSelect(item.id)}
                  >
                    <p className="font-medium">{displayLabel(item)}</p>
                    <p className="font-mono text-[10px] text-gray-400">{item.id}</p>
                  </button>
                  {!disabled && (
                    <div className="shrink-0 text-xs">
                      <button type="button" className="mr-2 text-[var(--pink-accent)]" onClick={() => startEdit(item)}>
                        {t("erp.common.edit")}
                      </button>
                      <button type="button" className="text-red-500" onClick={() => onDelete(item.id)}>
                        {t("erp.common.delete")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function EditRow({
  editLabel,
  setEditLabel,
  onSave,
  onCancel,
}: {
  editLabel: string;
  setEditLabel: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-1">
      <input
        value={editLabel}
        onChange={(e) => setEditLabel(e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <div className="flex justify-end gap-2 text-xs">
        <button type="button" className="text-[var(--pink-accent)]" onClick={onSave}>
          {t("erp.common.save")}
        </button>
        <button type="button" className="text-gray-500" onClick={onCancel}>
          {t("erp.common.cancel")}
        </button>
      </div>
    </div>
  );
}

function SectionList({
  items,
  form,
  setForm,
  onAdd,
  editing,
  setEditing,
  onSave,
  onDelete,
}: {
  items: CatalogItem[];
  form: { label: string };
  setForm: (v: { label: string }) => void;
  onAdd: (e: React.FormEvent) => void;
  editing: CatalogItem | null;
  setEditing: (v: CatalogItem | null) => void;
  onSave: (item: CatalogItem, label: string, newId: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t, locale } = useI18n();
  const [editLabel, setEditLabel] = useState("");

  return (
    <>
      <form onSubmit={onAdd} className="mb-3 grid gap-2 sm:grid-cols-2">
        <input
          required
          placeholder={t("erp.products.catalog.displayNamePlaceholder")}
          value={form.label}
          onChange={(e) => setForm({ label: e.target.value })}
          className="rounded border px-2 py-1.5 text-sm"
        />
        <button type="submit" className="rounded bg-gray-800 py-1.5 text-sm text-white">
          {t("erp.common.add")}
        </button>
      </form>
      <ul className="divide-y rounded-lg border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
            {editing?.id === item.id ? (
              <EditRow
                editLabel={editLabel}
                setEditLabel={setEditLabel}
                onSave={() => onSave(item, editLabel, item.id)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <div>
                  <p className="font-medium">
                    {resolveCatalogItemLabel(item, locale, { kind: "section" })}
                  </p>
                  <p className="font-mono text-xs text-gray-400">{item.id}</p>
                </div>
                <div className="text-xs">
                  <button
                    type="button"
                    className="mr-2 text-[var(--pink-accent)]"
                    onClick={() => {
                      setEditing(item);
                      setEditLabel(item.label);
                    }}
                  >
                    {t("erp.common.edit")}
                  </button>
                  <button type="button" className="text-red-500" onClick={() => onDelete(item.id)}>
                    {t("erp.common.delete")}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
