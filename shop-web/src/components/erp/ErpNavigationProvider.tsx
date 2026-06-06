"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type Ctx = {
  startNavigation: () => void;
};

const ErpNavigationContext = createContext<Ctx | null>(null);

export function ErpNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(false);
  }, [pathname]);

  const startNavigation = useCallback(() => {
    setNavigating(true);
  }, []);

  return (
    <ErpNavigationContext.Provider value={{ startNavigation }}>
      {navigating ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-[#8b5a45]/15"
          aria-hidden
        >
          <div className="h-full w-1/3 animate-[erp-nav_0.9s_ease-in-out_infinite] bg-[#8b5a45]" />
        </div>
      ) : null}
      {children}
    </ErpNavigationContext.Provider>
  );
}

export function useErpNavigation() {
  const ctx = useContext(ErpNavigationContext);
  if (!ctx) throw new Error("useErpNavigation must be used within ErpNavigationProvider");
  return ctx;
}
