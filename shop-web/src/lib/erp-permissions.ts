import type { ErpModule } from "@/lib/erp-nav";

export const MASTER_EMAIL = "dayeon@naver.com";

export type ErpPermissionGroup = {
  id: string;
  label: string;
  desc: string;
};

export type ErpStaffRow = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phone: string;
  address: string;
  hireDate: string | null;
  status: "active" | "leave";
  role: "master" | "staff";
  permissions: string[];
  createdAt: string | null;
  lastLoginAt: string | null;
  loginCount: number;
};

export function formatStaffLoginAt(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yy}.${mm}.${dd} ${hh}:${mi}`;
}

export const POSITION_OPTIONS = ["사원", "주임", "대리", "과장", "팀장", "이사"] as const;

export const MODULE_PERMISSION: Record<string, string> = {
  dashboard: "dashboard",
  users: "users",
  orders: "orders",
  payments: "payments",
  products: "products",
  articles: "content",
  pages: "content",
  theme: "theme",
  settings: "settings",
};

export function canAccessModule(
  moduleId: string,
  permissions: string[],
  isMaster: boolean,
): boolean {
  if (isMaster) return true;
  const perm = MODULE_PERMISSION[moduleId];
  if (!perm) return true;
  return permissions.includes(perm);
}

export function filterErpModules(
  modules: ErpModule[],
  permissions: string[],
  isMaster: boolean,
): ErpModule[] {
  return modules
    .filter((m) => canAccessModule(m.id, permissions, isMaster))
    .map((m) => {
      if (m.id !== "settings") return m;
      const subs = m.subs.filter((sub) => {
        if (sub.href === "/erp/settings/permissions") {
          return isMaster || permissions.includes("permissions");
        }
        return isMaster || permissions.includes("settings");
      });
      return { ...m, subs };
    })
    .filter((m) => m.id !== "settings" || m.subs.length > 0);
}

export function permissionLabels(ids: string[], groups: ErpPermissionGroup[]) {
  const map = new Map(groups.map((g) => [g.id, g.label]));
  return ids.map((id) => map.get(id) || id);
}
