"use client";

import { useEffect, useState } from "react";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import type { Product } from "@/lib/types";

export default function ErpProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    brand: "Bloominc",
    name: "",
    section: "bloominc",
    priceOriginal: 169000,
    priceSale: 129000,
  });

  function load() {
    api<{ products: Product[] }>("/api/admin/products", { token: getToken() })
      .then((d) => setProducts(d.products))
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    await api("/api/admin/products", {
      method: "POST",
      token: getToken(),
      body: JSON.stringify({
        ...form,
        category: "contact-lenses",
        image: "/placeholders/lens-gray.svg",
        badge: "NEW",
      }),
    });
    setForm({ ...form, name: "" });
    load();
  }

  async function remove(id: string) {
    if (!confirm("삭제할까요?")) return;
    await api(`/api/admin/products/${id}`, { method: "DELETE", token: getToken() });
    load();
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">상품 관리</h2>
      <form onSubmit={addProduct} className="mb-8 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2">
        <input
          placeholder="브랜드"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="rounded border px-3 py-2 text-sm"
        />
        <input
          placeholder="상품명"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded border px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="정가"
          value={form.priceOriginal}
          onChange={(e) => setForm({ ...form, priceOriginal: Number(e.target.value) })}
          className="rounded border px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="할인가"
          value={form.priceSale}
          onChange={(e) => setForm({ ...form, priceSale: Number(e.target.value) })}
          className="rounded border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-full bg-[var(--pink-accent)] px-4 py-2 text-sm text-white sm:col-span-2">
          상품 추가
        </button>
      </form>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3">브랜드</th>
              <th className="p-3">이름</th>
              <th className="p-3">가격</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-50">
                <td className="p-3">{p.brand}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{formatRp(p.priceSale)}</td>
                <td className="p-3 text-right">
                  <button type="button" className="text-red-500" onClick={() => remove(p.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
