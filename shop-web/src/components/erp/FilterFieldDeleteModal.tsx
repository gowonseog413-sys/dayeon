"use client";

import type { CatalogUsageProduct } from "@/lib/product-catalog-store";

type Props = {
  open: boolean;
  fieldLabel: string;
  warn: boolean;
  productCount: number;
  optionCount: number;
  products: CatalogUsageProduct[];
  onConfirm: () => void;
  onCancel: () => void;
};

export function FilterFieldDeleteModal({
  open,
  fieldLabel,
  warn,
  productCount,
  optionCount,
  products,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {warn ? (
          <div className="border-b bg-amber-50 px-5 py-4">
            <h3 className="text-base font-semibold text-amber-900">필터 항목 삭제</h3>
            <p className="mt-2 text-sm text-amber-800">
              <strong>{fieldLabel}</strong> 항목에 연결된 데이터가 있습니다.
            </p>
            <p className="mt-2 text-sm text-amber-800">
              삭제 시{" "}
              {productCount > 0 ? (
                <>
                  등록 상품 <strong>{productCount}개</strong>
                </>
              ) : null}
              {productCount > 0 && optionCount > 0 ? " 및 " : null}
              {optionCount > 0 ? (
                <>
                  필터 옵션 <strong>{optionCount}개</strong>
                </>
              ) : null}
              가 <strong>모두 삭제</strong>됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        ) : (
          <div className="border-b px-5 py-4">
            <h3 className="text-base font-semibold text-gray-900">필터 항목 삭제</h3>
            <p className="mt-2 text-sm text-gray-600">
              <strong>{fieldLabel}</strong> 필터 항목을 삭제할까요?
            </p>
          </div>
        )}

        {warn && products.length > 0 ? (
          <ul className="max-h-48 overflow-y-auto px-5 py-3 text-sm">
            {products.slice(0, 20).map((p) => (
              <li key={p.id} className="border-b border-gray-50 py-1.5 last:border-0">
                <span className="text-gray-500">{p.brand}</span> · {p.name}
              </li>
            ))}
            {products.length > 20 && (
              <li className="py-1.5 text-xs text-gray-400">외 {products.length - 20}건…</li>
            )}
          </ul>
        ) : null}

        <div className="flex gap-2 border-t px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
