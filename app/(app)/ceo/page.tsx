"use client"

import { useEffect, useState } from "react"
import { Crown, Mail, FileText, CheckCircle, Clock, AlertTriangle, Bot, BarChart3, FileSpreadsheet, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmployeePerformanceTable } from "@/components/ceo/employee-table"
import { EmployeeDetailDrawer } from "@/components/ceo/employee-detail-drawer"
import { TaskStatusChart } from "@/components/ceo/task-status-chart"
import { CompletionRateChart } from "@/components/ceo/completion-rate-chart"
import { AiExtractionChart } from "@/components/ceo/ai-extraction-chart"
import {
  ceoOverviewMock,
  ceoAlertsMock,
  ceoEmployeesMock,
  aiExtractionSummaryMock,
  departmentSummaryMock,
  reportSummaryMock,
} from "@/lib/ceo/mock-data"
import type { EmployeePerformance } from "@/lib/ceo/types"

const kpiData = [
  { label: "Tổng email", value: ceoOverviewMock.totalEmails, icon: Mail, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { label: "Tổng task", value: ceoOverviewMock.totalTasks, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
  { label: "Đã xử lý", value: ceoOverviewMock.completedTasks, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { label: "Đang xử lý", value: ceoOverviewMock.processingTasks, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  { label: "Quá hạn", value: ceoOverviewMock.overdueTasks, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  { label: "AI success", value: `${ceoOverviewMock.aiSuccessRate}%`, icon: Bot, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  { label: "Hoàn thành", value: `${ceoOverviewMock.completionRate}%`, icon: BarChart3, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
  { label: "Thiếu data", value: ceoOverviewMock.missingDataRows, icon: FileSpreadsheet, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
]

const levelBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "Thấp", variant: "secondary" },
  medium: { label: "Trung bình", variant: "default" },
  high: { label: "Cao", variant: "destructive" },
  critical: { label: "Nghiêm trọng", variant: "destructive" },
}

export default function CeoPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePerformance | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState("today")

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const userRaw = localStorage.getItem("currentUser")
      const user = userRaw ? JSON.parse(userRaw) : null
      if (!user || user.role !== "CEO") {
        localStorage.setItem("currentUser", JSON.stringify({ id: "u-ceo-001", name: "CEO", role: "CEO" }))
      }
    }
  }, [])

  if (!mounted) return null

  const timeOptions = [
    { value: "today", label: "Hôm nay" },
    { value: "week", label: "Tuần này" },
    { value: "month", label: "Tháng này" },
    { value: "custom", label: "Tùy chọn" },
  ]

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <Crown className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">CEO Dashboard</h1>
            <p className="text-xs text-neutral-500">Theo dõi tổng quan vận hành toàn công ty</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-3.5 w-3.5" />
          Xuất báo cáo
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {timeOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={timeFilter === opt.value ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setTimeFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {kpiData.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className={`${item.border} overflow-hidden`}>
              <CardContent className="p-4">
                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <p className="text-2xl font-bold text-neutral-900">{item.value}</p>
                <p className="text-[11px] text-neutral-500">{item.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-700">Trạng thái task</CardTitle>
            <CardDescription className="text-[11px]">Phân bổ task theo trạng thái xử lý</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskStatusChart />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-700">Tỷ lệ hoàn thành</CardTitle>
            <CardDescription className="text-[11px]">Tổng quan tiến độ công việc</CardDescription>
          </CardHeader>
          <CardContent>
            <CompletionRateChart />
          </CardContent>
        </Card>
      </div>

      {/* Alerts + Departments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-700">Cảnh báo cần chú ý</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ceoAlertsMock.map((alert) => {
              const cfg = levelBadge[alert.level]
              return (
                <div key={alert.id} className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${alert.level === "high" || alert.level === "critical" ? "bg-rose-500" : "bg-amber-500"}`} />
                    <p className="flex-1 text-xs font-medium text-neutral-700">{alert.title}</p>
                    <Badge variant={cfg.variant} className="text-[9px] px-1.5 py-0">
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="mt-1 pl-4 text-[11px] text-neutral-500 leading-relaxed">{alert.description}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-700">Tổng quan theo phòng ban</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                    <TableHead className="text-[11px] font-medium text-neutral-500">Phòng ban</TableHead>
                    <TableHead className="text-[11px] font-medium text-neutral-500 text-right">Tổng task</TableHead>
                    <TableHead className="text-[11px] font-medium text-neutral-500 text-right">Đã xử lý</TableHead>
                    <TableHead className="text-[11px] font-medium text-neutral-500 text-right">Đang xử lý</TableHead>
                    <TableHead className="text-[11px] font-medium text-neutral-500 text-right">Quá hạn</TableHead>
                    <TableHead className="text-[11px] font-medium text-neutral-500 text-right">Hoàn thành</TableHead>
                    <TableHead className="text-[11px] font-medium text-neutral-500">Cảnh báo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentSummaryMock.map((dept) => (
                    <TableRow key={dept.name} className="text-xs">
                      <TableCell className="font-medium text-neutral-700">{dept.name}</TableCell>
                      <TableCell className="text-right text-neutral-600">{dept.totalTasks}</TableCell>
                      <TableCell className="text-right text-emerald-600">{dept.completedTasks}</TableCell>
                      <TableCell className="text-right text-amber-600">{dept.processingTasks}</TableCell>
                      <TableCell className="text-right text-rose-600">{dept.overdueTasks}</TableCell>
                      <TableCell className="text-right font-medium text-neutral-700">{dept.completionRate}%</TableCell>
                      <TableCell>
                        <Badge variant={dept.alert === "Ổn định" ? "secondary" : "outline"} className="text-[10px]">
                          {dept.alert}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <EmployeePerformanceTable
        employees={ceoEmployeesMock}
        onViewDetail={(emp) => {
          setSelectedEmployee(emp)
          setDrawerOpen(true)
        }}
      />

      {/* AI Extraction */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-neutral-700">Thống kê AI bóc tách chứng từ</CardTitle>
          <CardDescription className="text-[11px]">Hiệu quả AI theo loại chứng từ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Tổng file", value: aiExtractionSummaryMock.totalFiles, color: "text-violet-700", bg: "bg-violet-50" },
              { label: "Thành công", value: aiExtractionSummaryMock.success, color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Cần review", value: aiExtractionSummaryMock.needReview, color: "text-amber-700", bg: "bg-amber-50" },
              { label: "Lỗi", value: aiExtractionSummaryMock.failed, color: "text-rose-700", bg: "bg-rose-50" },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-0 shadow-none">
                <CardContent className={`p-3 ${kpi.bg}`}>
                  <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-[10px] text-neutral-500">{kpi.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <AiExtractionChart />
        </CardContent>
      </Card>

      {/* Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-neutral-700">Báo cáo tổng hợp</CardTitle>
            <CardDescription className="text-[11px]">Danh sách hồ sơ theo khách hàng</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Download className="h-3.5 w-3.5" />
            Xuất CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                  <TableHead className="text-[11px] font-medium text-neutral-500 w-10">STT</TableHead>
                  <TableHead className="text-[11px] font-medium text-neutral-500">Khách hàng</TableHead>
                  <TableHead className="text-[11px] font-medium text-neutral-500">Invoice</TableHead>
                  <TableHead className="text-[11px] font-medium text-neutral-500">Bill</TableHead>
                  <TableHead className="text-[11px] font-medium text-neutral-500">Booking</TableHead>
                  <TableHead className="text-[11px] font-medium text-neutral-500">Loại</TableHead>
                  <TableHead className="text-[11px] font-medium text-neutral-500">Nhân viên</TableHead>
                  <TableHead className="text-[11px] font-medium text-neutral-500">Trạng thái</TableHead>
                  <TableHead className="text-[11px] font-medium text-neutral-500">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportSummaryMock.map((row) => (
                  <TableRow key={row.stt} className="text-xs">
                    <TableCell className="text-neutral-600">{row.stt}</TableCell>
                    <TableCell className="font-medium text-neutral-700">{row.customerName}</TableCell>
                    <TableCell className="text-neutral-600">{row.invoice}</TableCell>
                    <TableCell className="text-neutral-600">{row.bill}</TableCell>
                    <TableCell className="text-neutral-600">{row.booking}</TableCell>
                    <TableCell className="text-neutral-600">{row.type}</TableCell>
                    <TableCell className="text-neutral-600">{row.employee}</TableCell>
                    <TableCell>
                      <Badge
                        variant={row.status === "Hoàn tất" ? "secondary" : row.status === "Đang xử lý" ? "default" : "destructive"}
                        className="text-[10px]"
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500">{row.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EmployeeDetailDrawer
        employee={selectedEmployee}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
