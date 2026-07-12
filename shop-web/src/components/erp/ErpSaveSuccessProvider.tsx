"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
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
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [subMessage, setSubMessage] = useState<string | undefined>();

  const showSaveSuccess = useCallback((options?: ErpSaveSuccessOptions) => {
    setMessage(options?.message ?? t("erp.save.title"));
    setSubMessage(options?.subMessage);
    setOpen(true);
  }, [t]);

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
