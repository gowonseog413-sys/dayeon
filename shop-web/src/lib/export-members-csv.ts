import type { AdminMember } from "@/lib/types";
import { tierLabel } from "@/lib/tier";

function escapeCsv(value: string | number) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR");
}

function formatDateTime(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR");
}

export function downloadMembersCsv(users: AdminMember[], filename = "회원목록.csv") {
  const headers = [
    "No",
    "가입일",
    "이름",
    "성",
    "이름(영문)",
    "연락처",
    "주소",
    "메일",
    "등급",
    "총구매금액",
    "구매건수",
    "적립금액",
    "사용금액",
    "장바구니",
    "최근로그인",
    "접속횟수",
    "역할",
    "가입방식",
  ];

  const rows = users.map((u, i) => [
    users.length - i,
    formatDate(u.createdAt),
    u.name,
    u.lastName,
    u.firstName,
    u.phone || "-",
    u.address || "-",
    u.email,
    tierLabel(u.tier),
    u.totalPurchaseAmount,
    u.purchaseCount,
    u.points,
    u.pointsUsed || 0,
    u.cartCount > 0 ? u.cartCount : "-",
    formatDateTime(u.lastLoginAt),
    u.loginCount,
    u.role === "admin" ? "관리자" : "회원",
    u.authProvider || "local",
  ]);

  const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
