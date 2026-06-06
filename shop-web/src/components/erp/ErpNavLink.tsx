"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentProps } from "react";
import { useErpNavigation } from "@/components/erp/ErpNavigationProvider";

type Props = Omit<ComponentProps<typeof Link>, "prefetch"> & {
  active?: boolean;
  variant?: "side" | "sub";
};

/** ERP 메뉴 링크 — 프리페치 + 클릭 즉시 활성 표시 */
export function ErpNavLink({
  active,
  variant = "side",
  className,
  href,
  onClick,
  children,
  ...rest
}: Props) {
  const pathname = usePathname();
  const { startNavigation } = useErpNavigation();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  const highlighted = active || pending;

  const sideClass = highlighted
    ? "bg-[#8b5a45] font-medium text-white shadow-sm"
    : "text-[#4a4540] hover:bg-white/70 active:bg-white/90";

  const subClass = highlighted
    ? "bg-[#8b5a45] font-medium text-white shadow-sm"
    : "text-[#4a4540] hover:bg-white active:bg-white";

  const base =
    variant === "sub"
      ? `inline-flex min-h-[1.875rem] items-center rounded-md px-3 py-1 text-sm ${subClass}`
      : `flex min-h-[2.25rem] items-center rounded-lg px-3 py-1 text-sm ${sideClass}`;

  return (
    <Link
      {...rest}
      href={href}
      prefetch
      scroll={false}
      aria-current={active ? "page" : undefined}
      onClick={(e) => {
        if (!active) {
          setPending(true);
          startNavigation();
        }
        onClick?.(e);
      }}
      className={`${base}${className ? ` ${className}` : ""}${pending ? " opacity-90" : ""}`}
    >
      {children}
    </Link>
  );
}
