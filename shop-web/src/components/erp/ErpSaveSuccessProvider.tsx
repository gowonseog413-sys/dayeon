"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ErpSaveSuccessModal } from "@/components/erp/ErpSaveSuccessModal";

export type ErpSaveSuccessOptions = {
  message?: string;
  subMessage?: string;
};

type ErpSaveSuccessContextValue = {
  showSaveSuccess: (options?: ErpSaveSuccessOptions) => void;
};

const ErpSaveSuccessContext = createContext<ErpSaveSuccessContextValue | null>(null);

export function ErpSaveSuccessProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("저장되었습니다.");
  const [subMessage, setSubMessage] = useState<string | undefined>();

  const showSaveSuccess = useCallback((options?: ErpSaveSuccessOptions) => {
    setMessage(options?.message ?? "저장되었습니다.");
    setSubMessage(options?.subMessage);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ showSaveSuccess }), [showSaveSuccess]);

  return (
    <ErpSaveSuccessContext.Provider value={value}>
      {children}
      <ErpSaveSuccessModal
        open={open}
        message={message}
        subMessage={subMessage}
        onClose={close}
      />
    </ErpSaveSuccessContext.Provider>
  );
}

export function useErpSaveSuccess() {
  const ctx = useContext(ErpSaveSuccessContext);
  if (!ctx) {
    return { showSaveSuccess: () => {} };
  }
  return ctx;
}
