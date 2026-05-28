"use client"
// ADMIN ROUTE: Theo dõi chi phí và token AI sử dụng — chỉ admin

import { useState } from "react"
import dayjs from "dayjs"
import {
  BarChart3,
  Cpu,
  Loader,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import {
  useAiOpenaiUsageQuery,
  useAiOpenaiUsageCurrentMonthQuery,
  useAiOpenaiUsageUsersCurrentMonthQuery,
} from "@/hooks/use-mail-queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type UsageRecord = Record<string, unknown>

function normalizeData(raw: unknown): UsageRecord[] {
  if (Array.isArray(raw)) return raw as UsageRecord[]
  if (raw && typeof raw === "object" && "data" in raw) {
    const d = raw as Record<string, unknown>
    if (Array.isArray(d.data)) return d.data as UsageRecord[]
  }
  return []
}

function getValue(record: UsageRecord, ...keys: string[]): number {
  for (const key of keys) {
    const val = record[key]
    if (typeof val === "number") return val
  }
  return 0
}

function getString(record: UsageRecord, key: string): string {
  const val = record[key]
  return val != null ? String(val) : "—"
}

export default function AiUsagePage() {
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  })

  const usageQuery = useAiOpenaiUsageQuery(dateRange)
  const currentMonthQuery = useAiOpenaiUsageCurrentMonthQuery()
  const usersCurrentMonthQuery = useAiOpenaiUsageUsersCurrentMonthQuery()

  const usageRecords = normalizeData(usageQuery.data)
  const currentMonthData = (() => {
    const raw = currentMonthQuery.data
    if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>
    if (raw && typeof raw === "object" && "data" in raw) {
      const d = raw as Record<string, unknown>
      return (d.data ?? {}) as Record<string, unknown>
    }
    return null
  })()

  const usersRecords = normalizeData(usersCurrentMonthQuery.data)

  const totalRequests = usageRecords.reduce((sum, r) => sum + getValue(r, "totalRequests", "requestCount", "requests"), 0)
  const totalTokens = usageRecords.reduce((sum, r) => sum + getValue(r, "totalTokens", "tokenCount", "tokens"), 0)
  const totalCost = usageRecords.reduce((sum, r) => sum + getValue(r, "totalCost", "cost", "estimatedCost"), 0)
  const activeUsers = usersRecords.length

  const isLoading = usageQuery.isPending || currentMonthQuery.isPending || usersCurrentMonthQuery.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">AI Usage Dashboard</h1>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-200" />
          <span className="text-sm text-neutral-200">
            {dayjs(dateRange.startDate).format("DD/MM/YYYY")} - {dayjs(dateRange.endDate).format("DD/MM/YYYY")}
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-neutral-200">
          <Loader className="h-4 w-4 animate-spin" />
          Đang tải...
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-200">Tổng Requests</CardTitle>
            <div className="rounded-lg bg-primary-50 p-2">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-300">{totalRequests.toLocaleString("vi-VN")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-200">Tổng Tokens</CardTitle>
            <div className="rounded-lg bg-blue-50 p-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-300">{totalTokens.toLocaleString("vi-VN")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-200">Chi phí ước tính</CardTitle>
            <div className="rounded-lg bg-green-50 p-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-300">${totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-200">User active (tháng)</CardTitle>
            <div className="rounded-lg bg-purple-50 p-2">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-300">{activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Month Summary */}
      {currentMonthData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tháng hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-xs text-neutral-200">Requests</p>
                <p className="text-xl font-bold text-neutral-300">
                  {Number(currentMonthData["totalRequests"] ?? currentMonthData["requestCount"] ?? 0).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-xs text-neutral-200">Tokens</p>
                <p className="text-xl font-bold text-neutral-300">
                  {Number(currentMonthData["totalTokens"] ?? currentMonthData["tokenCount"] ?? 0).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-xs text-neutral-200">Chi phí</p>
                <p className="text-xl font-bold text-neutral-300">
                  ${Number(currentMonthData["totalCost"] ?? currentMonthData["cost"] ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage by User */}
      {usersRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Usage theo user (tháng này)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-white/80">User</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Requests</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Tokens</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Chi phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/15">
                  {usersRecords.map((u, i) => (
                    <tr key={i} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-neutral-300 font-medium">
                        {getString(u, "userName") || getString(u, "userId") || getString(u, "email")}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-200">
                        {getValue(u, "totalRequests", "requestCount", "requests").toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-200">
                        {getValue(u, "totalTokens", "tokenCount", "tokens").toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-200">
                        ${getValue(u, "totalCost", "cost", "estimatedCost").toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Usage */}
      {usageRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Chi tiết theo ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Ngày</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Requests</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Tokens</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Chi phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/15">
                  {usageRecords.map((r, i) => {
                    const dateVal = getString(r, "date") || getString(r, "usageDate") || getString(r, "day")
                    return (
                      <tr key={i} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 text-neutral-300">
                          {dateVal !== "—" ? dayjs(dateVal).format("DD/MM/YYYY") : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-200">
                          {getValue(r, "totalRequests", "requestCount", "requests").toLocaleString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-200">
                          {getValue(r, "totalTokens", "tokenCount", "tokens").toLocaleString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-200">
                          ${getValue(r, "totalCost", "cost", "estimatedCost").toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
