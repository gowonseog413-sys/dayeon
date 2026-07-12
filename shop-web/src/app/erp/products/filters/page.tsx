"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { resolveCatalogItemLabel, resolveFilterFieldLabel } from "@/lib/catalog-i18n";
import { CatalogUsageModal } from "@/components/erp/CatalogUsageModal";
import { FilterFieldDeleteModal } from "@/components/erp/FilterFieldDeleteModal";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { getErpToken } from "@/lib/auth-store";
import {
  FILTER_FIELDS_WITH_OPTIONS,
  type FilterOptionFieldId,
} from "@/lib/default-filter-catalog";
import {
  catalogApi,
  isInUseError,
  notifyCatalogUpdated,
  useProductCatalog,
  type CatalogItem,
  type CatalogUsageProduct,
} from "@/lib/product-catalog-store";

type SelectedFieldId = "category" | FilterOptionFieldId;

export default function ErpFilterCatalogPage() {
  const { t, locale } = useI18n();
  const { catalog, loading, reload } = useProductCatalog();
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedFieldId, setSelectedFieldId] = useState<SelectedFieldId>("category");
  const [optionForm, setOptionForm] = useState({ label: "" });
  const [editOption, setEditOption] = useState<CatalogItem | null>(null);
  const [editField, setEditField] = useState<CatalogItem | null>(null);
  const [fieldLabel, setFieldLabel] = useState("");

  const [usageOpen, setUsageOpen] = useState(false);
  const [usageAction, setUsageAction] = useState<"edit" | "delete">("delete");
  const [usageCount, setUsageCount] = useState(0);
  const [usageProducts, setUsageProducts] = useState<CatalogUsageProduct[]>([]);
  const [usageTypeLabel, setUsageTypeLabel] = useState("");
  const [pendingEdit, setPendingEdit] = useState<{
    fieldId: SelectedFieldId;
    id: string;
    label: string;
    newId: string;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    fieldId: SelectedFieldId;
    id: string;
  } | null>(null);

  const [fieldDeleteOpen, setFieldDeleteOpen] = useState(false);
  const [fieldDeleteWarn, setFieldDeleteWarn] = useState(false);
  const [fieldDeleteTarget, setFieldDeleteTarget] = useState<CatalogItem | null>(null);
  const [fieldDeleteProductCount, setFieldDeleteProductCount] = useState(0);
  const [fieldDeleteOptionCount, setFieldDeleteOptionCount] = useState(0);
  const [fieldDeleteProducts, setFieldDeleteProducts] = useState<CatalogUsageProduct[]>([]);

  const selectedField = useMemo(
    () => catalog.filterFields.find((f) => f.id === selectedFieldId),
    [catalog.filterFields, selectedFieldId],
  );

  const currentOptions = useMemo(() => {
    if (selectedFieldId === "category") {
      return [...catalog.filterCategories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    return [...(catalog.filterFieldOptions[selectedFieldId] || [])].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  }, [catalog.filterCategories, catalog.filterFieldOptions, selectedFieldId]);

  const hasOptionList = FILTER_FIELDS_WITH_OPTIONS.has(selectedFieldId);

  function selectField(fieldId: string) {
    if (editField) return;
    setSelectedFieldId(fieldId as SelectedFieldId);
    setOptionForm({ label: "" });
    setEditOption(null);
    setErrorMsg("");
  }

  async function addOption(e: React.FormEvent) {
    e.preventDefault();
    if (!hasOptionList) return;
    setErrorMsg("");
    try {
      if (selectedFieldId === "category") {
        await catalogApi("/api/admin/catalog/filter-categories", {
          method: "POST",
          token: getErpToken(),
          body: JSON.stringify({ label: optionForm.label }),
        });
      } else {
        await catalogApi(`/api/admin/catalog/filter-options/${selectedFieldId}`, {
          method: "POST",
          token: getErpToken(),
          body: JSON.stringify({ label: optionForm.label }),
        });
      }
      setOptionForm({ label: "" });
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess({
        message: t("erp.common.registeredTitle"),
        subMessage: t("erp.products.filters.optionAdded"),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.catalog.addFailed"));
    }
  }

  async function saveOption(
    fieldId: SelectedFieldId,
    item: CatalogItem,
    label: string,
    newId: string,
    force = false,
  ) {
    setErrorMsg("");
    try {
      if (fieldId === "category") {
        await catalogApi(`/api/admin/catalog/filter-categories/${item.id}`, {
          method: "PUT",
          token: getErpToken(),
          body: JSON.stringify({ label, newId, force }),
        });
      } else {
        await catalogApi(`/api/admin/catalog/filter-options/${fieldId}/${item.id}`, {
          method: "PUT",
          token: getErpToken(),
          body: JSON.stringify({ label, newId, force }),
        });
      }
      setEditOption(null);
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess();
    } catch (err) {
      if (!force && isInUseError(err)) {
        setUsageAction("edit");
        setUsageTypeLabel(
          selectedField
            ? resolveFilterFieldLabel(selectedField, locale)
            : t("erp.products.filters.defaultOptionLabel"),
        );
        setUsageCount(err.data.count);
        setUsageProducts(err.data.products);
        setPendingEdit({ fieldId, id: item.id, label, newId });
        setUsageOpen(true);
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    }
  }

  async function deleteOption(fieldId: SelectedFieldId, id: string, force = false) {
    setErrorMsg("");
    try {
      if (fieldId === "category") {
        await catalogApi(`/api/admin/catalog/filter-categories/${id}${force ? "?force=1" : ""}`, {
          method: "DELETE",
          token: getErpToken(),
        });
      } else {
        await catalogApi(
          `/api/admin/catalog/filter-options/${fieldId}/${id}${force ? "?force=1" : ""}`,
          { method: "DELETE", token: getErpToken() },
        );
      }
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess({ message: t("erp.common.deletedTitle") });
    } catch (err) {
      if (!force && isInUseError(err)) {
        setUsageAction("delete");
        setUsageTypeLabel(
          selectedField
            ? resolveFilterFieldLabel(selectedField, locale)
            : t("erp.products.filters.defaultOptionLabel"),
        );
        setUsageCount(err.data.count);
        setUsageProducts(err.data.products);
        setPendingDelete({ fieldId, id });
        setUsageOpen(true);
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.deleteFailed"));
    }
  }

  async function requestDeleteField(item: CatalogItem) {
    setErrorMsg("");
    try {
      const data = await catalogApi<{
        hasDependencies: boolean;
        productCount: number;
        optionCount: number;
        products: CatalogUsageProduct[];
      }>(`/api/admin/catalog/filter-fields/${item.id}/usage`, { token: getErpToken() });
      setFieldDeleteTarget(item);
      setFieldDeleteWarn(data.hasDependencies);
      setFieldDeleteProductCount(data.productCount);
      setFieldDeleteOptionCount(data.optionCount);
      setFieldDeleteProducts(data.products);
      setFieldDeleteOpen(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.filters.deleteCheckFailed"));
    }
  }

  async function confirmDeleteField(force = false) {
    if (!fieldDeleteTarget) return;
    setErrorMsg("");
    try {
      await catalogApi(`/api/admin/catalog/filter-fields/${fieldDeleteTarget.id}${force ? "?force=1" : ""}`, {
        method: "DELETE",
        token: getErpToken(),
      });
      if (selectedFieldId === fieldDeleteTarget.id) {
        const remaining = catalog.filterFields.filter((f) => f.id !== fieldDeleteTarget.id);
        setSelectedFieldId((remaining[0]?.id as SelectedFieldId) || "category");
      }
      setFieldDeleteOpen(false);
      setFieldDeleteTarget(null);
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess({
        message: t("erp.common.deletedTitle"),
        subMessage: t("erp.products.filters.fieldDeleted"),
      });
    } catch (err) {
      if (!force && isInUseError(err)) {
        setFieldDeleteWarn(true);
        setFieldDeleteProductCount(err.data.productCount ?? err.data.count ?? 0);
        setFieldDeleteOptionCount(err.data.optionCount ?? fieldDeleteOptionCount);
        setFieldDeleteProducts(err.data.products);
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.deleteFailed"));
    }
  }

  async function saveFieldLabel(item: CatalogItem, label: string) {
    setErrorMsg("");
    try {
      await catalogApi(`/api/admin/catalog/filter-fields/${item.id}`, {
        method: "PUT",
        token: getErpToken(),
        body: JSON.stringify({ label }),
      });
      setEditField(null);
      notifyCatalogUpdated();
      await reload();
      showSaveSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    }
  }

  async function confirmUsage() {
    if (usageAction === "edit" && pendingEdit) {
      const items =
        pendingEdit.fieldId === "category"
          ? catalog.filterCategories
          : catalog.filterFieldOptions[pendingEdit.fieldId];
      const item = items.find((c) => c.id === pendingEdit.id);
      if (item) {
        await saveOption(pendingEdit.fieldId, item, pendingEdit.label, pendingEdit.newId, true);
      }
    } else if (usageAction === "delete" && pendingDelete) {
      await deleteOption(pendingDelete.fieldId, pendingDelete.id, true);
    }
    setUsageOpen(false);
    setPendingEdit(null);
    setPendingDelete(null);
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.productsFilters"
      descriptionKey="erp.products.filters.description"
    >
      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}
      {loading ? (
        <p className="text-sm text-gray-400">{t("erp.common.loading")}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">{t("erp.products.filters.fieldsTitle")}</h3>
            <p className="mb-3 text-xs text-gray-500">{t("erp.products.filters.fieldsDesc")}</p>
            <ul className="divide-y rounded-lg border">
              {catalog.filterFields.map((f) => (
                <li key={f.id}>
                  {editField?.id === f.id ? (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <input
                        value={fieldLabel}
                        onChange={(e) => setFieldLabel(e.target.value)}
                        className="flex-1 rounded border px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        className="text-xs text-[var(--pink-accent)]"
                        onClick={() => saveFieldLabel(f, fieldLabel)}
                      >
                        {t("erp.common.save")}
                      </button>
                      <button type="button" className="text-xs text-gray-500" onClick={() => setEditField(null)}>
                        {t("erp.common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm transition ${
                        selectedFieldId === f.id
                          ? "border-l-4 border-[var(--pink-accent)] bg-[var(--pink-bg)]/60"
                          : "border-l-4 border-transparent hover:bg-gray-50"
                      }`}
                      onClick={() => selectField(f.id)}
                    >
                      <div>
                        <p className="font-medium">{resolveFilterFieldLabel(f, locale)}</p>
                        <p className="font-mono text-xs text-gray-400">{f.id}</p>
                      </div>
                      <div className="flex shrink-0 gap-2 text-xs">
                        <button
                          type="button"
                          className="text-[var(--pink-accent)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditField(f);
                            setFieldLabel(f.label);
                          }}
                        >
                          {t("erp.common.edit")}
                        </button>
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            void requestDeleteField(f);
                          }}
                        >
                          {t("erp.common.delete")}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-1 text-sm font-semibold text-gray-800">
              {t("erp.products.filters.optionsTitle")}
              {selectedField ? (
                <span className="ml-1.5 font-normal text-[var(--pink-accent)]">
                  · {selectedField ? resolveFilterFieldLabel(selectedField, locale) : ""}
                </span>
              ) : null}
            </h3>
            <p className="mb-3 text-xs text-gray-500">
              {hasOptionList
                ? t("erp.products.filters.optionsDescWithList")
                : t("erp.products.filters.optionsDescNoList")}
            </p>

            {hasOptionList ? (
              <FilterOptionList
                fieldId={selectedFieldId}
                items={currentOptions}
                form={optionForm}
                setForm={setOptionForm}
                onAdd={addOption}
                editing={editOption}
                setEditing={setEditOption}
                onSave={(item, label, newId) => saveOption(selectedFieldId, item, label, newId)}
                onDelete={(id) => deleteOption(selectedFieldId, id)}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                {t("erp.products.filters.noOptions")}
              </div>
            )}

            <p className="mt-4 text-xs text-gray-400">{t("erp.products.filters.footerNote")}</p>
          </section>
        </div>
      )}

      <CatalogUsageModal
        open={usageOpen}
        action={usageAction}
        typeLabel={usageTypeLabel}
        count={usageCount}
        products={usageProducts}
        onConfirm={() => void confirmUsage()}
        onCancel={() => {
          setUsageOpen(false);
          setPendingEdit(null);
          setPendingDelete(null);
        }}
      />

      <FilterFieldDeleteModal
        open={fieldDeleteOpen}
        fieldLabel={fieldDeleteTarget?.label || ""}
        warn={fieldDeleteWarn}
        productCount={fieldDeleteProductCount}
        optionCount={fieldDeleteOptionCount}
        products={fieldDeleteProducts}
        onConfirm={() => void confirmDeleteField(fieldDeleteWarn)}
        onCancel={() => {
          setFieldDeleteOpen(false);
          setFieldDeleteTarget(null);
        }}
      />
    </ErpPageShell>
  );
}

function FilterOptionList({
  fieldId,
  items,
  form,
  setForm,
  onAdd,
  editing,
  setEditing,
  onSave,
  onDelete,
}: {
  fieldId: SelectedFieldId;
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

  function displayOptionLabel(item: CatalogItem) {
    return resolveCatalogItemLabel(item, locale, {
      kind: fieldId === "category" ? "filterCategory" : "filterOption",
      fieldId,
    });
  }

  return (
    <>
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
      <ul className="divide-y rounded-lg border">
        {items.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-gray-400">{t("erp.products.catalog.noItems")}</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              {editing?.id === item.id ? (
                <div className="w-full space-y-1">
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full rounded border px-2 py-1 text-sm"
                  />
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      className="text-[var(--pink-accent)]"
                      onClick={() => onSave(item, editLabel, item.id)}
                    >
                      {t("erp.common.save")}
                    </button>
                    <button type="button" className="text-gray-500" onClick={() => setEditing(null)}>
                      {t("erp.common.cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium">{displayOptionLabel(item)}</p>
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
          ))
        )}
      </ul>
    </>
  );
}
