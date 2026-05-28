"use client"
// ADMIN ROUTE: Xem logs và lỗi hệ thống — chỉ admin

import { useState } from "react"
import { AlertTriangle, Info, XCircle, Filter } from "lucide-react"
import dayjs from "dayjs"

const allLogs = [
  { id: "1", level: "error" as const, source: "sync", message: "Gmail sync failed: rate limit exceeded", details: "Account: logistics@company.com", createdAt: "2026-05-22T10:30:00Z" },
  { id: "2", level: "warning" as const, source: "ai", message: "AI extraction confidence low (45%)", details: "Email ID: 550e8400-e29b", createdAt: "2026-05-22T09:15:00Z" },
  { id: "3", level: "info" as const, source: "import", message: "Successfully imported 25 records", details: "File: report_may.xlsx", createdAt: "2026-05-21T16:00:00Z" },
  { id: "4", level: "error" as const, source: "import", message: "Import failed: invalid row 12", details: "Missing required field 'amount'", createdAt: "2026-05-21T15:45:00Z" },
]

export default function LogsPage() {
  const [filterLevel, setFilterLevel] = useState<string>("all")

  const filtered = filterLevel === "all" ? allLogs : allLogs.filter((l) => l.level === filterLevel)

  const levelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const levelBadge = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-700"
      case "warning":
        return "bg-amber-100 text-amber-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Logs & Lỗi</h1>
        <div id="tour-logs-filter" className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-500" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-blue-50/50 focus:bg-white transition-colors"
          >
            <option value="all">Tất cả</option>
            <option value="error">Lỗi</option>
            <option value="warning">Cảnh báo</option>
            <option value="info">Thông tin</option>
          </select>
        </div>
      </div>

      <div id="tour-logs-table" className="rounded-xl border border-blue-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Level</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Nguồn</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Thông báo</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Chi tiết</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {levelIcon(log.level)}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelBadge(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-blue-700 font-medium">{log.source}</td>
                <td className="px-4 py-3 text-blue-900">{log.message}</td>
                <td className="px-4 py-3 text-blue-600 text-xs">{log.details}</td>
                <td className="px-4 py-3 text-blue-600 whitespace-nowrap">
                  {dayjs(log.createdAt).format("DD/MM/YYYY HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
