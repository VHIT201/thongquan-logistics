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
  { label: "Tổng email", value: ceoOverviewMock.totalEmails },
  { label: "Tổng task", value: ceoOverviewMock.totalTasks },
  { label: "Đã xử lý", value: ceoOverviewMock.completedTasks },
  { label: "Đang xử lý", value: ceoOverviewMock.processingTasks },
  { label: "Quá hạn", value: ceoOverviewMock.overdueTasks, tone: "rose" as const },
  { label: "AI success", value: `${ceoOverviewMock.aiSuccessRate}%` },
  { label: "Hoàn thành", value: `${ceoOverviewMock.completionRate}%` },
  { label: "Thiếu data", value: ceoOverviewMock.missingDataRows },
]

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
    <>
      <div className="grain" />
      <motion.div variants={container} initial="hidden" animate="show" className="flex h-full flex-col gap-6 overflow-auto p-6 bg-[#f7f6f3]">
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">CEO Dashboard</h1>
            <p className="mt-0.5 text-sm text-zinc-500">Theo dõi tổng quan vận hành toàn công ty</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs rounded-full px-4 active:scale-[0.98] active:translate-y-px transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] bg-white shadow-[0_2px_12px_-4px_rgba(12,84,156,0.08)] ring-1 ring-zinc-100/80 border-0 hover:shadow-[0_4px_20px_-6px_rgba(12,84,156,0.12)]">
            Xuất báo cáo
          </Button>
        </motion.div>

        <motion.div variants={item} className="flex items-center gap-2">
          {timeOptions.map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.97, y: 1 }}
              onClick={() => setTimeFilter(opt.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                timeFilter === opt.value
                  ? "bg-[#0c549c] text-white shadow-[0_2px_12px_-4px_rgba(12,84,156,0.25)]"
                  : "bg-white text-zinc-600 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] ring-1 ring-zinc-100/80 hover:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)]"
              }`}
            >
              {opt.label}
            </motion.button>
          ))}
        </motion.div>

        {/* KPI Bento */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {kpiData.map((k) => (
            <motion.div
              key={k.label}
              whileHover={{ y: -2, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }}
              className="group flex flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_2px_20px_-8px_rgba(12,84,156,0.06)] ring-1 ring-zinc-100/80 cursor-default"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">{k.label}</p>
              <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${k.tone === "rose" ? "text-rose-600" : "text-[#0c549c]"}`}>{k.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.section
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-2xl bg-white p-5 shadow-[0_2px_24px_-10px_rgba(12,84,156,0.06)] ring-1 ring-zinc-100/80 lg:col-span-2"
          >
            <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#0c549c] bg-[#0c549c]/5 mb-2">Phân tích</span>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Trạng thái task</h2>
            <p className="text-[11px] text-zinc-500">Phân bổ task theo trạng thái xử lý</p>
            <div className="mt-4">
              <TaskStatusChart />
            </div>
          </motion.section>
          <motion.section
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
            className="rounded-2xl bg-white p-5 shadow-[0_2px_24px_-10px_rgba(12,84,156,0.06)] ring-1 ring-zinc-100/80"
          >
            <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#0c549c] bg-[#0c549c]/5 mb-2">Hiệu quả</span>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Tỷ lệ hoàn thành</h2>
            <p className="text-[11px] text-zinc-500">Tổng quan tiến độ công việc</p>
            <div className="mt-4">
              <CompletionRateChart />
            </div>
          </motion.section>
        </motion.div>

        {/* Alerts + Departments */}
        <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.section
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-2xl bg-white shadow-[0_2px_24px_-10px_rgba(12,84,156,0.06)] ring-1 ring-zinc-100/80 lg:col-span-1 overflow-hidden"
          >
            <div className="px-5 py-4">
              <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-rose-600 bg-rose-50 mb-1">Khẩn cấp</span>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Cảnh báo cần chú ý</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {ceoAlertsMock.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, type: "spring" as const, stiffness: 120, damping: 20 }}
                  className="px-5 py-3 transition-colors hover:bg-zinc-50/40 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${alert.level === "high" || alert.level === "critical" ? "bg-rose-500" : "bg-[#0c549c]"}`} />
                    <p className="flex-1 text-xs font-medium text-zinc-700">{alert.title}</p>
                    <Badge variant={levelBadge[alert.level].variant} className="text-[9px] px-1.5 py-0">
                      {levelBadge[alert.level].label}
                    </Badge>
                  </div>
                  <p className="mt-1 pl-3.5 text-[11px] text-zinc-500 leading-relaxed">{alert.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
            className="rounded-2xl bg-white p-5 shadow-[0_2px_24px_-10px_rgba(12,84,156,0.06)] ring-1 ring-zinc-100/80 lg:col-span-2"
          >
            <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#0c549c] bg-[#0c549c]/5 mb-1">Tổ chức</span>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Tổng quan theo phòng ban</h2>
            <div className="mt-4 rounded-xl overflow-hidden ring-1 ring-zinc-100/80">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                    <TableHead className="text-[11px] font-medium text-zinc-500">Phòng ban</TableHead>
                    <TableHead className="text-[11px] font-medium text-zinc-500 text-right tabular-nums">Tổng task</TableHead>
                    <TableHead className="text-[11px] font-medium text-zinc-500 text-right tabular-nums">Đã xử lý</TableHead>
                    <TableHead className="text-[11px] font-medium text-zinc-500 text-right tabular-nums">Đang xử lý</TableHead>
                    <TableHead className="text-[11px] font-medium text-zinc-500 text-right tabular-nums">Quá hạn</TableHead>
                    <TableHead className="text-[11px] font-medium text-zinc-500 text-right tabular-nums">Hoàn thành</TableHead>
                    <TableHead className="text-[11px] font-medium text-zinc-500">Cảnh báo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentSummaryMock.map((dept, i) => (
                    <motion.tr
                      key={dept.name}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, type: "spring" as const, stiffness: 120, damping: 20 }}
                      className="border-b border-zinc-100 text-xs transition-colors hover:bg-zinc-50/60 group"
                    >
                      <TableCell className="relative font-medium text-zinc-800">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-[#0c549c] scale-y-0 transition-transform duration-200 group-hover:scale-y-100 rounded-r" />
                        {dept.name}
                      </TableCell>
                      <TableCell className="text-right text-zinc-600 tabular-nums">{dept.totalTasks}</TableCell>
                      <TableCell className="text-right text-zinc-600 tabular-nums">{dept.completedTasks}</TableCell>
                      <TableCell className="text-right text-zinc-600 tabular-nums">{dept.processingTasks}</TableCell>
                      <TableCell className="text-right text-rose-600 tabular-nums">{dept.overdueTasks}</TableCell>
                      <TableCell className="text-right font-medium text-[#0c549c] tabular-nums">{dept.completionRate}%</TableCell>
                      <TableCell>
                        <Badge variant={dept.alert === "Ổn định" ? "secondary" : "outline"} className="text-[10px]">
                          {dept.alert}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.section>
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
        <motion.section
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-2xl bg-white p-5 shadow-[0_2px_24px_-10px_rgba(12,84,156,0.06)] ring-1 ring-zinc-100/80"
        >
          <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#0c549c] bg-[#0c549c]/5 mb-1">Trí tuệ nhân tạo</span>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Thống kê AI bóc tách chứng từ</h2>
          <p className="text-[11px] text-zinc-500">Hiệu quả AI theo loại chứng từ</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-zinc-50/60 p-3 ring-1 ring-zinc-100/60">
              <p className="text-xl font-bold text-zinc-800 tabular-nums">{aiExtractionSummaryMock.totalFiles}</p>
              <p className="text-[10px] text-zinc-500">Tổng file</p>
            </div>
            <div className="rounded-xl bg-[#0c549c]/3 p-3 ring-1 ring-[#0c549c]/10">
              <p className="text-xl font-bold text-[#0c549c] tabular-nums">{aiExtractionSummaryMock.success}</p>
              <p className="text-[10px] text-zinc-500">Thành công</p>
            </div>
            <div className="rounded-xl bg-zinc-50/60 p-3 ring-1 ring-zinc-100/60">
              <p className="text-xl font-bold text-zinc-800 tabular-nums">{aiExtractionSummaryMock.needReview}</p>
              <p className="text-[10px] text-zinc-500">Cần review</p>
            </div>
            <div className="rounded-xl bg-rose-50/40 p-3 ring-1 ring-rose-100/60">
              <p className="text-xl font-bold text-rose-700 tabular-nums">{aiExtractionSummaryMock.failed}</p>
              <p className="text-[10px] text-zinc-500">Lỗi</p>
            </div>
          </div>
          <div className="mt-5">
            <AiExtractionChart />
          </div>
        </motion.section>

        {/* Report */}
        <motion.section
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
          className="rounded-2xl bg-white p-5 shadow-[0_2px_24px_-10px_rgba(12,84,156,0.06)] ring-1 ring-zinc-100/80"
        >
          <div className="flex items-center justify-between pb-4">
            <div>
              <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#0c549c] bg-[#0c549c]/5 mb-1">Hồ sơ</span>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-800">Báo cáo tổng hợp</h2>
              <p className="text-[11px] text-zinc-500">Danh sách hồ sơ theo khách hàng</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs rounded-full px-4 active:scale-[0.98] active:translate-y-px transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] bg-white shadow-[0_2px_12px_-4px_rgba(12,84,156,0.08)] ring-1 ring-zinc-100/80 border-0 hover:shadow-[0_4px_20px_-6px_rgba(12,84,156,0.12)]">
              Xuất CSV
            </Button>
          </div>
          <div className="rounded-xl overflow-hidden ring-1 ring-zinc-100/80">
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
                {reportSummaryMock.map((row, i) => (
                  <motion.tr
                    key={row.stt}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, type: "spring" as const, stiffness: 120, damping: 20 }}
                    className="border-b border-zinc-100 text-xs transition-colors hover:bg-zinc-50/60 group"
                  >
                    <TableCell className="relative text-zinc-600 tabular-nums">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-[#0c549c] scale-y-0 transition-transform duration-200 group-hover:scale-y-100 rounded-r" />
                      {row.stt}
                    </TableCell>
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
                  </motion.tr>
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
    </>
  )
}
