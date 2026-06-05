"use client";

import { useEffect } from "react";
import { useI18n } from "@/components/I18nProvider";

export function DocumentTitle() {
  const { locale, t } = useI18n();

  useEffect(() => {
    document.title = t("meta.title");
  }, [locale, t]);

  return null;
}
