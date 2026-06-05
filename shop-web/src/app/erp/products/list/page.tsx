"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { ErpPagination } from "@/components/erp/ErpPagination";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { filterProducts, PRODUCT_PAGE_SIZE } from "@/lib/erp-products";
import { productImageFallback } from "@/lib/product-image-fallback";
import type { Product } from "@/lib/types";

export default function ErpProductListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api<{ products: Product[] }>("/api/admin/products", { token: getToken() })
      .then((d) => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => [...filterProducts(products, filter)].reverse(), [products, filter]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PRODUCT_PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = sorted.slice((page - 1) * PRODUCT_PAGE_SIZE, page * PRODUCT_PAGE_SIZE);
  const total = sorted.length;

  function startEdit(p: Product) {
    router.push(`/erp/products?edit=${p.id}`);
  }

  async function remove(id: string) {
    if (!confirm("이 상품을 삭제할까요?")) return;
    await api(`/api/admin/products/${id}`, { method: "DELETE", token: getToken() });
    load();
  }

  return (
    <ErpPageShell
      title="상품목록리스트"
      description="등록된 상품을 확인·수정·삭제할 수 있습니다."
    >
      <input
        placeholder="상품명·브랜드 검색"
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setPage(1);
        }}
        className="mb-2 w-full max-w-xs rounded border px-3 py-1.5 text-sm"
      />

      <p className="mb-2 text-xs text-gray-500">
        총 {total}건 · {PRODUCT_PAGE_SIZE}개씩 · No. 역순 (최신이 큰 번호)
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-500">
                <tr>
                  <th className="w-12 px-2 py-1.5">No.</th>
                  <th className="px-2 py-1.5">이미지</th>
                  <th className="px-2 py-1.5">브랜드 / 이름</th>
                  <th className="px-2 py-1.5">카테고리</th>
                  <th className="px-2 py-1.5">가격</th>
                  <th className="px-2 py-1.5" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p, i) => {
                  const no = total - ((page - 1) * PRODUCT_PAGE_SIZE + i);
                  return (
                    <ProductRow
                      key={p.id}
                      no={no}
                      product={p}
                      onEdit={() => startEdit(p)}
                      onRemove={() => remove(p.id)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          <ErpPagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </ErpPageShell>
  );
}

function ProductRow({
  no,
  product: p,
  onEdit,
  onRemove,
}: {
  no: number;
  product: Product;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const fallback = productImageFallback(p);
  const [imgSrc, setImgSrc] = useState(p.image);

  return (
    <tr className="border-b border-gray-50">
      <td className="px-2 py-1.5 font-medium text-gray-600">{no}</td>
      <td className="px-2 py-1.5">
        <div className="relative h-10 w-10 overflow-hidden rounded bg-gray-50">
          <Image
            src={imgSrc}
            alt=""
            fill
            className="object-cover"
            unoptimized
            onError={() => setImgSrc(fallback)}
          />
        </div>
      </td>
      <td className="px-2 py-1.5">
        <p className="text-xs text-gray-500">{p.brand}</p>
        <p className="font-medium">{p.name}</p>
      </td>
      <td className="px-2 py-1.5 text-xs text-gray-500">
        {p.category}
        <br />
        {p.section}
      </td>
      <td className="px-2 py-1.5">{formatRp(p.priceSale)}</td>
      <td className="px-2 py-1.5 whitespace-nowrap text-right">
        <a
          href={`/product/${p.id}`}
          target="_blank"
          rel="noreferrer"
          className="mr-3 text-gray-500 hover:underline"
        >
          보기
        </a>
        <button type="button" className="mr-3 text-[var(--pink-accent)]" onClick={onEdit}>
          수정
        </button>
        <button type="button" className="text-red-500" onClick={onRemove}>
          삭제
        </button>
      </td>
    </tr>
  );
}
