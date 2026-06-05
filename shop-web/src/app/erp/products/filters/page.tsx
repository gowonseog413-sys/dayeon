"use client";

import { useState } from "react";
import { CatalogUsageModal } from "@/components/erp/CatalogUsageModal";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { getToken } from "@/lib/auth-store";
import {
  catalogApi,
  isInUseError,
  notifyCatalogUpdated,
  useProductCatalog,
  type CatalogItem,
  type CatalogUsageProduct,
} from "@/lib/product-catalog-store";

export default function ErpFilterCatalogPage() {
  const { catalog, loading, reload } = useProductCatalog();
  const [msg, setMsg] = useState("");
  const [catForm, setCatForm] = useState({ label: "" });
  const [editCat, setEditCat] = useState<CatalogItem | null>(null);
  const [editField, setEditField] = useState<CatalogItem | null>(null);
  const [fieldLabel, setFieldLabel] = useState("");

  const [usageOpen, setUsageOpen] = useState(false);
  const [usageAction, setUsageAction] = useState<"edit" | "delete">("delete");
  const [usageCount, setUsageCount] = useState(0);
  const [usageProducts, setUsageProducts] = useState<CatalogUsageProduct[]>([]);
  const [pendingEdit, setPendingEdit] = useState<{
    id: string;
    label: string;
    newId: string;
  } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      await catalogApi("/api/admin/catalog/filter-categories", {
        method: "POST",
        token: getToken(),
        body: JSON.stringify({ label: catForm.label }),
      });
      setCatForm({ label: "" });
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "추가 실패");
    }
  }

  async function saveCategory(item: CatalogItem, label: string, newId: string, force = false) {
    setMsg("");
    try {
      await catalogApi(`/api/admin/catalog/filter-categories/${item.id}`, {
        method: "PUT",
        token: getToken(),
        body: JSON.stringify({ label, newId, force }),
      });
      setEditCat(null);
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      if (!force && isInUseError(err)) {
        setUsageAction("edit");
        setUsageCount(err.data.count);
        setUsageProducts(err.data.products);
        setPendingEdit({ id: item.id, label, newId });
        setUsageOpen(true);
        return;
      }
      setMsg(err instanceof Error ? err.message : "저장 실패");
    }
  }

  async function deleteCategory(id: string, force = false) {
    setMsg("");
    try {
      await catalogApi(`/api/admin/catalog/filter-categories/${id}${force ? "?force=1" : ""}`, {
        method: "DELETE",
        token: getToken(),
      });
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      if (!force && isInUseError(err)) {
        setUsageAction("delete");
        setUsageCount(err.data.count);
        setUsageProducts(err.data.products);
        setPendingDeleteId(id);
        setUsageOpen(true);
        return;
      }
      setMsg(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  async function saveFieldLabel(item: CatalogItem, label: string) {
    setMsg("");
    try {
      await catalogApi(`/api/admin/catalog/filter-fields/${item.id}`, {
        method: "PUT",
        token: getToken(),
        body: JSON.stringify({ label }),
      });
      setEditField(null);
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "저장 실패");
    }
  }

  return (
    <ErpPageShell
      title="필터 카데고리"
      description="쇼핑몰 상품 목록 좌측 프레임(프레임왼쪽 카데고리)에 표시되는 필터 항목과 카테고리 옵션을 관리합니다."
    >
      {msg && <p className="mb-3 text-sm text-gray-700">{msg}</p>}
      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">프레임왼쪽 카데고리 · 필터 항목</h3>
            <p className="mb-3 text-xs text-gray-500">표시 이름만 수정할 수 있습니다. 코드는 시스템에서 고정됩니다.</p>
            <ul className="divide-y rounded-lg border">
              {catalog.filterFields.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  {editField?.id === f.id ? (
                    <div className="flex flex-1 gap-2">
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
                        저장
                      </button>
                      <button type="button" className="text-xs text-gray-500" onClick={() => setEditField(null)}>
                        취소
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium">{f.label}</p>
                        <p className="font-mono text-xs text-gray-400">{f.id}</p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-[var(--pink-accent)]"
                        onClick={() => {
                          setEditField(f);
                          setFieldLabel(f.label);
                        }}
                      >
                        수정
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">필터 카테고리 옵션</h3>
            <FilterCategoryList
              items={catalog.filterCategories}
              form={catForm}
              setForm={setCatForm}
              onAdd={addCategory}
              editing={editCat}
              setEditing={setEditCat}
              onSave={saveCategory}
              onDelete={deleteCategory}
            />
            <p className="mt-4 text-xs text-gray-400">
              쇼핑몰 좌측 프레임 제목은 &quot;프레임왼쪽 카데고리&quot;로 표시됩니다.
            </p>
          </section>
        </div>
      )}

      <CatalogUsageModal
        open={usageOpen}
        action={usageAction}
        typeLabel="필터 카테고리"
        count={usageCount}
        products={usageProducts}
        onConfirm={() => {
          if (usageAction === "edit" && pendingEdit) {
            const item = catalog.filterCategories.find((c) => c.id === pendingEdit.id);
            if (item) {
              saveCategory(item, pendingEdit.label, pendingEdit.newId, true);
            }
          } else if (usageAction === "delete" && pendingDeleteId) {
            deleteCategory(pendingDeleteId, true);
          }
          setUsageOpen(false);
          setPendingEdit(null);
          setPendingDeleteId(null);
        }}
        onCancel={() => {
          setUsageOpen(false);
          setPendingEdit(null);
          setPendingDeleteId(null);
        }}
      />
    </ErpPageShell>
  );
}

function FilterCategoryList({
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
  const [editLabel, setEditLabel] = useState("");

  return (
    <>
      <form onSubmit={onAdd} className="mb-3 grid gap-2">
        <input
          required
          placeholder="표시 이름*"
          value={form.label}
          onChange={(e) => setForm({ label: e.target.value })}
          className="rounded border px-2 py-1.5 text-sm"
        />
        <button type="submit" className="rounded bg-[var(--pink-accent)] py-1.5 text-xs text-white">
          추가
        </button>
      </form>
      <ul className="divide-y rounded-lg border">
        {items.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-gray-400">항목 없음</li>
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
                      저장
                    </button>
                    <button type="button" className="text-gray-500" onClick={() => setEditing(null)}>
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium">{item.label}</p>
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
                      수정
                    </button>
                    <button type="button" className="text-red-500" onClick={() => onDelete(item.id)}>
                      삭제
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
