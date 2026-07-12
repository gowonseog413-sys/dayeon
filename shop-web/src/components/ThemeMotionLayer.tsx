"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ThemeMotionOverlay } from "@/components/ThemeMotionEffects";

/** 전체 화면(좌·우 배너 포함) 위에 모션 표시 */
export function ThemeMotionLayer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || pathname.startsWith("/erp") || pathname.startsWith("/admin-gate")) return null;

  return createPortal(<ThemeMotionOverlay />, document.body);
}
