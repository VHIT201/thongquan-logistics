"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Mail, Clock, CheckCircle, AlertTriangle, ArrowRight, TrendingUp, Package, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import dayjs from "dayjs"

const myStats = [
  { label: "Email được giao", value: 12, icon: Mail, color: "text-primary", bg: "bg-primary-50" },
  { label: "Đang xử lý", value: 3, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Đã hoàn tất", value: 8, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  { label: "Cần chú ý", value: 1, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
]

const myTasks = [
  { id: "1", subject: "Invoice #INV-001 - ABC Logistics", fromName: "ABC Logistics", deadline: "2026-05-23T17:00:00Z", priority: "high", status: "unprocessed" },
  { id: "3", subject: "Freight quote request", fromName: "Global Freight", deadline: "2026-05-23T12:00:00Z", priority: "medium", status: "processing" },
  { id: "6", subject: "Customs declaration #CD-1122", fromName: "Customs Dept", deadline: "2026-05-24T09:00:00Z", priority: "high", status: "unprocessed" },
  { id: "8", subject: "Warehouse inbound notice", fromName: "Saigon Depot", deadline: "2026-05-24T15:00:00Z", priority: "low", status: "processing" },
  { id: "10", subject: "Container release order", fromName: "Hapag-Lloyd", deadline: "2026-05-25T10:00:00Z", priority: "medium", status: "unprocessed" },
  { id: "14", subject: "Delivery delay notice", fromName: "FedEx Logistics", deadline: "2026-05-25T08:00:00Z", priority: "high", status: "unprocessed" },
]

const weeklyProgress = [
  { day: "T2", completed: 3, assigned: 4 },
  { day: "T3", completed: 5, assigned: 5 },
  { day: "T4", completed: 2, assigned: 3 },
  { day: "T5", completed: 4, assigned: 6 },
  { day: "T6", completed: 6, assigned: 6 },
  { day: "T7", completed: 1, assigned: 2 },
  { day: "CN", completed: 0, assigned: 1 },
]

export default function NhanVienPage() {
  const params = useParams<{ employeeId: string }>()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-300 tracking-tight">Khu vực Nhân viên</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            ID: {params.employeeId}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {dayjs().format("DD/MM/YYYY")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {myStats.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">{card.label}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-300">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card id="tour-staff-tasks">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Công việc của tôi
                </CardTitle>
                <CardDescription>Danh sách email được giao xử lý</CardDescription>
              </div>
              <Link href="/emails">
                <Badge variant="outline" className="hover:bg-neutral-50 cursor-pointer">
                  Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-neutral-300 text-sm">{task.subject}</p>
                      {task.priority === "high" && (
                        <Badge variant="destructive" className="text-[10px] h-5">Cao</Badge>
                      )}
                      {task.priority === "medium" && (
                        <Badge variant="outline" className="text-[10px] h-5 text-amber-600 border-amber-200 bg-amber-50">TB</Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-200 mt-1">{task.fromName} · Hạn: {dayjs(task.deadline).format("DD/MM HH:mm")}</p>
                  </div>
                  <div className="ml-3 shrink-0">
                    {task.status === "unprocessed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <Clock className="h-3 w-3" /> Chờ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                        <TrendingUp className="h-3 w-3" /> Đang xử lý
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tiến độ tuần này
            </CardTitle>
            <CardDescription>Số công việc hoàn thành / được giao</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyProgress.map((w) => {
                const pct = w.assigned > 0 ? (w.completed / w.assigned) * 100 : 0
                return (
                  <div key={w.day} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-medium text-neutral-300">{w.day}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-neutral-200">{w.completed}/{w.assigned}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-primary-50 p-3">
              <span className="text-sm font-medium text-primary">Tỷ lệ hoàn thành</span>
              <span className="text-lg font-bold text-primary">
                {Math.round((weeklyProgress.reduce((a, b) => a + b.completed, 0) / weeklyProgress.reduce((a, b) => a + b.assigned, 0)) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
