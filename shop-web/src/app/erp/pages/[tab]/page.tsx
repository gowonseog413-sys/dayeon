"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ErpFooterDocEditor } from "@/components/erp/ErpFooterDocEditor";
import { isFooterDocTabKey } from "@/lib/erp-catalog";

export default function ErpFooterDocTabPage() {
  const params = useParams();
  const router = useRouter();
  const tab = typeof params.tab === "string" ? params.tab : "";

  useEffect(() => {
    if (!isFooterDocTabKey(tab)) {
      router.replace("/erp/pages/about");
    }
  }, [tab, router]);

  if (!isFooterDocTabKey(tab)) {
    return null;
  }

  return <ErpFooterDocEditor tab={tab} />;
}
