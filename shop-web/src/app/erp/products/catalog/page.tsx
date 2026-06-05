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
  const { catalog, loading, reload } = useProductCatalog();
  const [msg, setMsg] = useState("");

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
  const [usageTypeLabel, setUsageTypeLabel] = useState("카테고리");
  const [usageCount, setUsageCount] = useState(0);
  const [usageProducts, setUsageProducts] = useState<CatalogUsageProduct[]>([]);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const mainNode = catalog.categoryTree.find((m) => m.id === selectedMain) ?? null;
  const midNode = mainNode?.children?.find((m) => m.id === selectedMid) ?? null;

  const levelLabel: Record<Level, string> = {
    main: "대 카테고리",
    mid: "중 카테고리",
    sub: "소 카테고리",
  };

  function openUsage(action: "edit" | "delete", level: Level, count: number, products: CatalogUsageProduct[], next: PendingAction) {
    setUsageAction(action);
    setUsageTypeLabel(levelLabel[level]);
    setUsageCount(count);
    setUsageProducts(products);
    setPending(next);
    setUsageOpen(true);
  }

  async function runPending(force = false) {
    if (!pending) return;
    const token = getToken();
    setMsg("");
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
        setMsg("삭제되었습니다. 상품목록에서 확인해 주세요.");
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
        setMsg("수정되었습니다. 상품목록에서 확인해 주세요.");
      }
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "처리 실패");
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
        token: getToken(),
        body: JSON.stringify({ label: mainForm.label }),
      });
      setMainForm({ label: "" });
      setMsg("대 카테고리가 추가되었습니다.");
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "추가 실패");
    }
  }

  async function addMid(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMain) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid`, {
        method: "POST",
        token: getToken(),
        body: JSON.stringify({ label: midForm.label }),
      });
      setMidForm({ label: "" });
      setMsg("중 카테고리가 추가되었습니다.");
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "추가 실패");
    }
  }

  async function addSub(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMain || !selectedMid) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid/${selectedMid}/sub`, {
        method: "POST",
        token: getToken(),
        body: JSON.stringify({ label: subForm.label }),
      });
      setSubForm({ label: "" });
      setMsg("소 카테고리가 추가되었습니다.");
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "추가 실패");
    }
  }

  async function saveMain(item: CategoryTreeNode, label: string, newId: string) {
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${item.id}`, {
        method: "PUT",
        token: getToken(),
        body: JSON.stringify({ label, newId: newId !== item.id ? newId : undefined }),
      });
      setEditMain(null);
      if (selectedMain === item.id && newId !== item.id) setSelectedMain(newId);
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      if (await handleInUse(err, "edit", { level: "main", action: "edit", mainId: item.id, body: { label, newId: newId !== item.id ? newId : undefined } })) return;
      setMsg(err instanceof Error ? err.message : "수정 실패");
    }
  }

  async function deleteMain(id: string) {
    if (!confirm("이 대 카테고리를 삭제할까요?")) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${id}`, { method: "DELETE", token: getToken() });
      if (selectedMain === id) { setSelectedMain(null); setSelectedMid(null); }
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      if (await handleInUse(err, "delete", { level: "main", action: "delete", mainId: id })) return;
      setMsg(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  async function saveMid(item: CategoryTreeNode, label: string, newId: string) {
    if (!selectedMain) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid/${item.id}`, {
        method: "PUT",
        token: getToken(),
        body: JSON.stringify({ label, newId: newId !== item.id ? newId : undefined }),
      });
      setEditMid(null);
      if (selectedMid === item.id && newId !== item.id) setSelectedMid(newId);
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      if (await handleInUse(err, "edit", { level: "mid", action: "edit", mainId: selectedMain, midId: item.id, body: { label, newId: newId !== item.id ? newId : undefined } })) return;
      setMsg(err instanceof Error ? err.message : "수정 실패");
    }
  }

  async function deleteMid(id: string) {
    if (!selectedMain || !confirm("이 중 카테고리를 삭제할까요?")) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid/${id}`, { method: "DELETE", token: getToken() });
      if (selectedMid === id) setSelectedMid(null);
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      if (await handleInUse(err, "delete", { level: "mid", action: "delete", mainId: selectedMain, midId: id })) return;
      setMsg(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  async function saveSub(item: CategoryTreeNode, label: string, newId: string) {
    if (!selectedMain || !selectedMid) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid/${selectedMid}/sub/${item.id}`, {
        method: "PUT",
        token: getToken(),
        body: JSON.stringify({ label, newId: newId !== item.id ? newId : undefined }),
      });
      setEditSub(null);
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      if (await handleInUse(err, "edit", { level: "sub", action: "edit", mainId: selectedMain, midId: selectedMid, subId: item.id, body: { label, newId: newId !== item.id ? newId : undefined } })) return;
      setMsg(err instanceof Error ? err.message : "수정 실패");
    }
  }

  async function deleteSub(id: string) {
    if (!selectedMain || !selectedMid || !confirm("이 소 카테고리를 삭제할까요?")) return;
    try {
      await catalogApi(`/api/admin/catalog/tree/main/${selectedMain}/mid/${selectedMid}/sub/${id}`, { method: "DELETE", token: getToken() });
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      if (await handleInUse(err, "delete", { level: "sub", action: "delete", mainId: selectedMain, midId: selectedMid, subId: id })) return;
      setMsg(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    try {
      await catalogApi("/api/admin/catalog/sections", {
        method: "POST",
        token: getToken(),
        body: JSON.stringify({ label: secForm.label }),
      });
      setSecForm({ label: "" });
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "추가 실패");
    }
  }

  async function saveSection(item: CatalogItem, label: string, newId: string) {
    try {
      await catalogApi(`/api/admin/catalog/sections/${item.id}`, {
        method: "PUT",
        token: getToken(),
        body: JSON.stringify({ label, newId: newId !== item.id ? newId : undefined }),
      });
      setEditSec(null);
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      if (isInUseError(err)) {
        setUsageAction("edit");
        setUsageTypeLabel("홈 섹션");
        setUsageCount(err.data.count);
        setUsageProducts(err.data.products);
        setPending({ level: "main", action: "edit", mainId: item.id, body: { label, newId: newId !== item.id ? newId : undefined } });
        setUsageOpen(true);
        return;
      }
      setMsg(err instanceof Error ? err.message : "수정 실패");
    }
  }

  async function deleteSection(id: string) {
    if (!confirm("이 홈 섹션을 삭제할까요?")) return;
    try {
      await catalogApi(`/api/admin/catalog/sections/${id}`, { method: "DELETE", token: getToken() });
      notifyCatalogUpdated();
      await reload();
    } catch (err) {
      if (isInUseError(err)) {
        setUsageAction("delete");
        setUsageTypeLabel("홈 섹션");
        setUsageCount(err.data.count);
        setUsageProducts(err.data.products);
        setPending({ level: "main", action: "delete", mainId: id });
        setUsageOpen(true);
        return;
      }
      setMsg(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  return (
    <ErpPageShell
      title="카테고리 속성"
      description="대·중·소 카테고리를 관리합니다. 쇼핑몰 상단 메뉴 구조와 동일하며, 상품 등록에 바로 반영됩니다."
    >
      {msg && <p className="mb-3 text-sm text-gray-700">{msg}</p>}
      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <TreeColumn
              title="대 카테고리"
              items={catalog.categoryTree}
              selectedId={selectedMain}
              onSelect={(id) => { setSelectedMain(id); setSelectedMid(null); }}
              form={mainForm}
              setForm={setMainForm}
              onAdd={addMain}
              editing={editMain}
              setEditing={setEditMain}
              onSave={saveMain}
              onDelete={deleteMain}
            />
            <TreeColumn
              title="중 카테고리"
              subtitle={mainNode ? mainNode.label : "대 카테고리를 선택하세요"}
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
              title="소 카테고리"
              subtitle={midNode ? midNode.label : "중 카테고리를 선택하세요"}
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
            <h3 className="mb-3 text-sm font-semibold">홈 섹션 (캐러셀 위치)</h3>
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
          if (pending?.action === "edit" && usageTypeLabel === "홈 섹션" && pending.mainId) {
            catalogApi(`/api/admin/catalog/sections/${pending.mainId}`, {
              method: "PUT",
              token: getToken(),
              body: JSON.stringify({ ...pending.body, force: true }),
            }).then(() => { notifyCatalogUpdated(); reload(); setEditSec(null); });
            setUsageOpen(false);
            setPending(null);
            return;
          }
          if (pending?.action === "delete" && usageTypeLabel === "홈 섹션" && pending.mainId) {
            catalogApi(`/api/admin/catalog/sections/${pending.mainId}?force=1`, { method: "DELETE", token: getToken() })
              .then(() => { notifyCatalogUpdated(); reload(); });
            setUsageOpen(false);
            setPending(null);
            return;
          }
          runPending(true);
        }}
        onCancel={() => { setUsageOpen(false); setPending(null); }}
      />
    </ErpPageShell>
  );
}

function TreeColumn({
  title,
  subtitle,
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
  subtitle?: string;
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
  const [editLabel, setEditLabel] = useState("");

  function startEdit(item: CategoryTreeNode) {
    setEditing(item);
    setEditLabel(item.label);
  }

  const parentLabel =
    subtitle && !subtitle.endsWith("선택하세요") ? subtitle : null;

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
            placeholder="표시 이름*"
            value={form.label}
            onChange={(e) => setForm({ label: e.target.value })}
            className="rounded border px-2 py-1.5 text-sm"
          />
          <button type="submit" className="rounded bg-[var(--pink-accent)] py-1.5 text-xs text-white">
            추가
          </button>
        </form>
      )}

      <ul className="max-h-80 divide-y overflow-y-auto rounded-lg border">
        {items.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-gray-400">항목 없음</li>
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
                    <p className="font-medium">{item.label}</p>
                    <p className="font-mono text-[10px] text-gray-400">{item.id}</p>
                  </button>
                  {!disabled && (
                    <div className="shrink-0 text-xs">
                      <button type="button" className="mr-2 text-[var(--pink-accent)]" onClick={() => startEdit(item)}>
                        수정
                      </button>
                      <button type="button" className="text-red-500" onClick={() => onDelete(item.id)}>
                        삭제
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
  return (
    <div className="space-y-1">
      <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" />
      <div className="flex gap-2 text-xs">
        <button type="button" className="text-[var(--pink-accent)]" onClick={onSave}>저장</button>
        <button type="button" className="text-gray-500" onClick={onCancel}>취소</button>
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
  const [editLabel, setEditLabel] = useState("");

  return (
    <>
      <form onSubmit={onAdd} className="mb-3 grid gap-2 sm:grid-cols-2">
        <input required placeholder="표시 이름*" value={form.label} onChange={(e) => setForm({ label: e.target.value })} className="rounded border px-2 py-1.5 text-sm" />
        <button type="submit" className="rounded bg-gray-800 py-1.5 text-sm text-white">추가</button>
      </form>
      <ul className="divide-y rounded-lg border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
            {editing?.id === item.id ? (
              <EditRow editLabel={editLabel} setEditLabel={setEditLabel} onSave={() => onSave(item, editLabel, item.id)} onCancel={() => setEditing(null)} />
            ) : (
              <>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="font-mono text-xs text-gray-400">{item.id}</p>
                </div>
                <div className="text-xs">
                  <button type="button" className="mr-2 text-[var(--pink-accent)]" onClick={() => { setEditing(item); setEditLabel(item.label); }}>수정</button>
                  <button type="button" className="text-red-500" onClick={() => onDelete(item.id)}>삭제</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
