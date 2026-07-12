"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { api } from "@/lib/api";
import {
  ERP_AUTH_UPDATED_EVENT,
  getErpStoredUser,
  getErpToken,
} from "@/lib/auth-store";
import { MASTER_EMAIL } from "@/lib/erp-permissions";
import type { ErpPermissionGroup } from "@/lib/erp-permissions";

type MePermissions = {
  email: string;
  isMaster: boolean;
  permissions: string[];
  groups: ErpPermissionGroup[];
};

export function useErpPermissions() {
  const { t } = useI18n();
  const [data, setData] = useState<MePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const token = getErpToken();
    if (!token) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api<MePermissions>("/api/admin/permissions/me", { token });
      setData(res);
      setError("");
    } catch (err) {
      const stored = getErpStoredUser();
      const fallbackMaster = stored?.email?.toLowerCase() === MASTER_EMAIL;
      setData(
        stored?.role === "admin"
          ? {
              email: stored.email,
              isMaster: fallbackMaster,
              permissions: fallbackMaster ? [] : [],
              groups: [],
            }
          : null,
      );
      setError(err instanceof Error ? err.message : t("erp.permissions.errorPermLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    reload();
    const onAuth = () => reload();
    window.addEventListener(ERP_AUTH_UPDATED_EVENT, onAuth);
    return () => window.removeEventListener(ERP_AUTH_UPDATED_EVENT, onAuth);
  }, [reload]);

  const stored = getErpStoredUser();
  const localMaster = stored?.email?.toLowerCase() === MASTER_EMAIL;

  return {
    loading,
    error,
    email: data?.email ?? stored?.email ?? "",
    isMaster: (data?.isMaster ?? false) || localMaster,
    permissions: data?.permissions ?? [],
    groups: data?.groups ?? [],
    reload,
  };
}
