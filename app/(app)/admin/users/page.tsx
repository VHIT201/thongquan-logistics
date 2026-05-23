"use client"

import { User as UserIcon, Plus, Trash2, Shield, UserCheck } from "lucide-react"

const users = [
  { id: "1", email: "admin@company.com", name: "Admin", role: "admin", createdAt: "2026-01-01" },
  { id: "2", email: "staff1@company.com", name: "Nhân viên A", role: "staff", createdAt: "2026-03-15" },
  { id: "3", email: "staff2@company.com", name: "Nhân viên B", role: "staff", createdAt: "2026-04-20" },
]

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Quản lý Tài khoản</h1>
        <button id="tour-users-add" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Thêm tài khoản
        </button>
      </div>

      <div id="tour-users-table" className="rounded-xl border border-blue-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Tên</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Email</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Vai trò</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Ngày tạo</th>
              <th className="px-4 py-3 text-right font-medium text-blue-700"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-blue-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <UserIcon className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="font-medium text-blue-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-blue-700">{u.email}</td>
                <td className="px-4 py-3">
                  {u.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      <UserCheck className="h-3 w-3" /> Nhân viên
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-blue-600">{u.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
