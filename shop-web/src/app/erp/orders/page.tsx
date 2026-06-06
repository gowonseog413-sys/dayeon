"use client";

import { Suspense } from "react";
import { ErpOrderList } from "@/components/erp/ErpOrderList";
import { ErpPageShell } from "@/components/erp/ErpPageShell";

function ErpOrdersIncoming() {
  return <ErpOrderList tab="incoming" basePath="/erp/orders" title="주문 목록" />;
}

export default function ErpOrdersPage() {
  return (
    <Suspense
      fallback={
        <ErpPageShell title="주문 목록">
          <p className="text-sm text-gray-500">불러오는 중…</p>
        </ErpPageShell>
      }
    >
      <ErpOrdersIncoming />
    </Suspense>
  );
}
