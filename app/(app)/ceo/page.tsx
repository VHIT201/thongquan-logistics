"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
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
  { label: "Tổng email", value: ceoOverviewMock.totalEmails, tone: "zinc" },
  { label: "Tổng task", value: ceoOverviewMock.totalTasks, tone: "zinc" },
  { label: "Đã xử lý", value: ceoOverviewMock.completedTasks, tone: "emerald" },
  { label: "Đang xử lý", value: ceoOverviewMock.processingTasks, tone: "amber" },
  { label: "Quá hạn", value: ceoOverviewMock.overdueTasks, tone: "rose" },
  { label: "AI success", value: `${ceoOverviewMock.aiSuccessRate}%`, tone: "zinc" },
  { label: "Hoàn thành", value: `${ceoOverviewMock.completionRate}%`, tone: "emerald" },
  { label: "Thiếu data", value: ceoOverviewMock.missingDataRows, tone: "zinc" },
]

const toneValue: Record<string, string> = {
  zinc: "text-zinc-900",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
}

const levelBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "Thấp", variant: "secondary" },
  medium: { label: "Trung bình", variant: "default" },
  high: { label: "Cao", variant: "destructive" },
  critical: { label: "Nghiêm trọng", variant: "destructive" },
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
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
    <motion.div variants={container} initial="hidden" animate="show" className="flex h-full flex-col gap-6 overflow-auto p-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">CEO Dashboard</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Theo dõi tổng quan vận hành toàn công ty</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs active:scale-[0.98] active:translate-y-px">
          Xuất báo cáo
        </Button>
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-2">
        {timeOptions.map((opt) => (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.97, y: 1 }}
            onClick={() => setTimeFilter(opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              timeFilter === opt.value
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {opt.label}
          </motion.button>
        ))}
      </motion.div>

      {/* KPI Bento */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {kpiData.map((k) => (
          <div
            key={k.label}
            className="flex flex-col justify-between rounded-lg border border-zinc-100 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <p className="text-xs text-zinc-500">{k.label}</p>
            <p className={`mt-2 text-2xl font-semibold tracking-tight ${toneValue[k.tone]}`}>{k.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-zinc-100 bg-white p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Trạng thái task</h2>
          <p className="text-[11px] text-zinc-500">Phân bổ task theo trạng thái xử lý</p>
          <div className="mt-3">
            <TaskStatusChart />
          </div>
        </section>
        <section className="rounded-lg border border-zinc-100 bg-white p-4">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Tỷ lệ hoàn thành</h2>
          <p className="text-[11px] text-zinc-500">Tổng quan tiến độ công việc</p>
          <div className="mt-3">
            <CompletionRateChart />
          </div>
        </section>
      </motion.div>

      {/* Alerts + Departments */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-zinc-100 bg-white lg:col-span-1">
          <div className="px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Cảnh báo cần chú ý</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {ceoAlertsMock.map((alert) => {
              const cfg = levelBadge[alert.level]
              return (
                <div key={alert.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${alert.level === "high" || alert.level === "critical" ? "bg-rose-500" : "bg-amber-500"}`} />
                    <p className="flex-1 text-xs font-medium text-zinc-700">{alert.title}</p>
                    <Badge variant={cfg.variant} className="text-[9px] px-1.5 py-0">
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="mt-1 pl-3.5 text-[11px] text-zinc-500 leading-relaxed">{alert.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-100 bg-white p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Tổng quan theo phòng ban</h2>
          <div className="mt-3 rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                  <TableHead className="text-[11px] font-medium text-zinc-500">Phòng ban</TableHead>
                  <TableHead className="text-[11px] font-medium text-zinc-500 text-right">Tổng task</TableHead>
                  <TableHead className="text-[11px] font-medium text-zinc-500 text-right">Đã xử lý</TableHead>
                  <TableHead className="text-[11px] font-medium text-zinc-500 text-right">Đang xử lý</TableHead>
                  <TableHead className="text-[11px] font-medium text-zinc-500 text-right">Quá hạn</TableHead>
                  <TableHead className="text-[11px] font-medium text-zinc-500 text-right">Hoàn thành</TableHead>
                  <TableHead className="text-[11px] font-medium text-zinc-500">Cảnh báo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentSummaryMock.map((dept) => (
                  <TableRow key={dept.name} className="text-xs">
                    <TableCell className="font-medium text-zinc-700">{dept.name}</TableCell>
                    <TableCell className="text-right text-zinc-600">{dept.totalTasks}</TableCell>
                    <TableCell className="text-right text-emerald-600">{dept.completedTasks}</TableCell>
                    <TableCell className="text-right text-amber-600">{dept.processingTasks}</TableCell>
                    <TableCell className="text-right text-rose-600">{dept.overdueTasks}</TableCell>
                    <TableCell className="text-right font-medium text-zinc-700">{dept.completionRate}%</TableCell>
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
        </section>
      </motion.div>

      {/* Employee Table */}
      <motion.div variants={item}>
        <EmployeePerformanceTable
          employees={ceoEmployeesMock}
          onViewDetail={(emp) => {
            setSelectedEmployee(emp)
            setDrawerOpen(true)
          }}
        />
      </motion.div>

      {/* AI Extraction */}
      <motion.section variants={item} className="rounded-lg border border-zinc-100 bg-white p-4">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Thống kê AI bóc tách chứng từ</h2>
        <p className="text-[11px] text-zinc-500">Hiệu quả AI theo loại chứng từ</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-zinc-100 bg-zinc-50/50 p-3">
            <p className="text-xl font-bold text-zinc-800">{aiExtractionSummaryMock.totalFiles}</p>
            <p className="text-[10px] text-zinc-500">Tổng file</p>
          </div>
          <div className="rounded-md border border-emerald-100 bg-emerald-50/50 p-3">
            <p className="text-xl font-bold text-emerald-700">{aiExtractionSummaryMock.success}</p>
            <p className="text-[10px] text-zinc-500">Thành công</p>
          </div>
          <div className="rounded-md border border-amber-100 bg-amber-50/50 p-3">
            <p className="text-xl font-bold text-amber-700">{aiExtractionSummaryMock.needReview}</p>
            <p className="text-[10px] text-zinc-500">Cần review</p>
          </div>
          <div className="rounded-md border border-rose-100 bg-rose-50/50 p-3">
            <p className="text-xl font-bold text-rose-700">{aiExtractionSummaryMock.failed}</p>
            <p className="text-[10px] text-zinc-500">Lỗi</p>
          </div>
        </div>
        <div className="mt-4">
          <AiExtractionChart />
        </div>
      </motion.section>

      {/* Report */}
      <motion.section variants={item} className="rounded-lg border border-zinc-100 bg-white p-4">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Báo cáo tổng hợp</h2>
            <p className="text-[11px] text-zinc-500">Danh sách hồ sơ theo khách hàng</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs active:scale-[0.98] active:translate-y-px">
            Xuất CSV
          </Button>
        </div>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-[11px] font-medium text-zinc-500 w-10">STT</TableHead>
                <TableHead className="text-[11px] font-medium text-zinc-500">Khách hàng</TableHead>
                <TableHead className="text-[11px] font-medium text-zinc-500">Invoice</TableHead>
                <TableHead className="text-[11px] font-medium text-zinc-500">Bill</TableHead>
                <TableHead className="text-[11px] font-medium text-zinc-500">Booking</TableHead>
                <TableHead className="text-[11px] font-medium text-zinc-500">Loại</TableHead>
                <TableHead className="text-[11px] font-medium text-zinc-500">Nhân viên</TableHead>
                <TableHead className="text-[11px] font-medium text-zinc-500">Trạng thái</TableHead>
                <TableHead className="text-[11px] font-medium text-zinc-500">Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportSummaryMock.map((row) => (
                <TableRow key={row.stt} className="text-xs">
                  <TableCell className="text-zinc-600">{row.stt}</TableCell>
                  <TableCell className="font-medium text-zinc-700">{row.customerName}</TableCell>
                  <TableCell className="text-zinc-600">{row.invoice}</TableCell>
                  <TableCell className="text-zinc-600">{row.bill}</TableCell>
                  <TableCell className="text-zinc-600">{row.booking}</TableCell>
                  <TableCell className="text-zinc-600">{row.type}</TableCell>
                  <TableCell className="text-zinc-600">{row.employee}</TableCell>
                  <TableCell>
                    <Badge
                      variant={row.status === "Hoàn tất" ? "secondary" : row.status === "Đang xử lý" ? "default" : "destructive"}
                      className="text-[10px]"
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500">{row.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.section>

      <EmployeeDetailDrawer
        employee={selectedEmployee}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </motion.div>
  )
}
