"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import type { User } from "@/lib/types";

export default function ErpUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api<{ users: User[] }>("/api/admin/users", { token: getToken() })
      .then((d) => setUsers(d.users))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">회원 관리</h2>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3">이름</th>
              <th className="p-3">이메일</th>
              <th className="p-3">역할</th>
              <th className="p-3">가입일</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50">
                <td className="p-3">
                  {u.firstName} {u.lastName}
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3 text-gray-500">
                  {(u as User & { createdAt?: string }).createdAt
                    ? new Date((u as User & { createdAt: string }).createdAt).toLocaleDateString("ko-KR")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
