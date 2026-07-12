"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { ErpPagination } from "@/components/erp/ErpPagination";
import { api, formatRp } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import { filterProducts, formatProductDate, PRODUCT_PAGE_SIZE } from "@/lib/erp-products";
import { productImageFallback } from "@/lib/product-image-fallback";
import type { Product } from "@/lib/types";

export default function ErpProductListPage() {
  const { t, tFmt } = useI18n();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api<{ products: Product[] }>("/api/admin/products", { token: getErpToken() })
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
    if (!confirm(t("erp.products.list.confirmDelete"))) return;
    await api(`/api/admin/products/${id}`, { method: "DELETE", token: getErpToken() });
    load();
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.productsList"
      descriptionKey="erp.products.list.description"
    >
      <input
        placeholder={t("erp.products.list.searchPlaceholder")}
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setPage(1);
        }}
        className="mb-2 w-full max-w-xs rounded border px-3 py-1.5 text-sm"
      />

      <p className="mb-2 text-xs text-gray-500">
        {tFmt("erp.products.list.summary", { total, size: PRODUCT_PAGE_SIZE })}
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">{t("erp.common.loading")}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-500">
                <tr>
                  <th className="w-12 px-2 py-1.5">{t("erp.products.col.no")}</th>
                  <th className="w-24 px-2 py-1.5 whitespace-nowrap">{t("erp.products.col.createdAt")}</th>
                  <th className="px-2 py-1.5">{t("erp.products.col.image")}</th>
                  <th className="px-2 py-1.5">{t("erp.products.col.brandName")}</th>
                  <th className="px-2 py-1.5">{t("erp.products.col.category")}</th>
                  <th className="px-2 py-1.5">{t("erp.products.col.price")}</th>
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
  const { t } = useI18n();
  const fallback = productImageFallback(p);
  const [imgSrc, setImgSrc] = useState(p.image);

  return (
    <tr className="border-b border-gray-50">
      <td className="px-2 py-1.5 font-medium text-gray-600">{no}</td>
      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-600">
        {formatProductDate(p.createdAt)}
      </td>
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
          {t("erp.products.col.view")}
        </a>
        <button type="button" className="mr-3 text-[var(--pink-accent)]" onClick={onEdit}>
          {t("erp.common.edit")}
        </button>
        <button type="button" className="text-red-500" onClick={onRemove}>
          {t("erp.common.delete")}
        </button>
      </td>
    </tr>
  );
}
