"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const [activeTab, setActiveTab] = useState("overview")
  const [deptFilter, setDeptFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

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
      <div className="min-h-[100dvh] bg-[#FAFAFA]">
        <div className="grain" />
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          >
            <span className="inline-flex items-center rounded-full bg-[#0A84FF]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A84FF]">
              CEO Dashboard
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#18181B] sm:text-5xl" style={{ letterSpacing: '-0.03em' }}>
              Tổng quan vận hành
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#71717A] text-pretty">
              Theo dõi toàn bộ hoạt động logistics, hiệu suất nhân viên và cảnh báo theo thời gian thực.
            </p>
          </motion.div>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <div className="flex items-center rounded-full bg-white p-1.5 shadow-[0_2px_16px_-8px_rgba(24,24,27,0.08)] ring-1 ring-black/[0.04]">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimeFilter(opt.value)}
                  className={`cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    timeFilter === opt.value
                      ? "bg-[#18181B] text-white"
                      : "bg-transparent text-[#71717A] hover:text-[#18181B]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="cursor-pointer h-11 w-48 rounded-[1.25rem] border-0 bg-white text-[13px] font-medium text-[#18181B] shadow-[0_2px_16px_-8px_rgba(24,24,27,0.08)] ring-1 ring-black/[0.04] focus:ring-2 focus:ring-[#0A84FF]/30">
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent className="rounded-[1.25rem] border-0 bg-white shadow-[0_8px_32px_-8px_rgba(24,24,27,0.12)] ring-1 ring-black/[0.06]">
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                <SelectItem value="Khai báo hải quan">Khai báo hải quan</SelectItem>
                <SelectItem value="Chứng từ">Chứng từ</SelectItem>
                <SelectItem value="Kế toán">Kế toán</SelectItem>
                <SelectItem value="CSKH">CSKH</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="cursor-pointer h-11 w-44 rounded-[1.25rem] border-0 bg-white text-[13px] font-medium text-[#18181B] shadow-[0_2px_16px_-8px_rgba(24,24,27,0.08)] ring-1 ring-black/[0.04] focus:ring-2 focus:ring-[#0A84FF]/30">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-[1.25rem] border-0 bg-white shadow-[0_8px_32px_-8px_rgba(24,24,27,0.12)] ring-1 ring-black/[0.06]">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
            <Button className="cursor-pointer rounded-full bg-[#18181B] px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_16px_-8px_rgba(24,24,27,0.2)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:bg-[#18181B]/90 active:scale-[0.98]">
              Xuất báo cáo
            </Button>
          </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8 flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1], delay: 0.15 }}
          >
            <TabsList className="h-11 w-max gap-1 rounded-full bg-white p-1.5 shadow-[0_2px_16px_-8px_rgba(24,24,27,0.08)] ring-1 ring-black/[0.04]">
              {[
                { value: "overview", label: "Tổng quan" },
                { value: "alerts", label: "Cảnh báo" },
                { value: "personnel", label: "Nhân sự" },
                { value: "ai-reports", label: "AI & Báo cáo" },
              ].map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="cursor-pointer rounded-full px-5 py-2 text-[13px] font-semibold text-[#71717A] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=active]:bg-[#18181B] data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Bento KPIs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            >
              {kpiData.map((k, i) => {
                const spanClasses = [
                  "col-span-2",
                  "col-span-1",
                  "col-span-1",
                  "col-span-1",
                  "col-span-1",
                  "col-span-2",
                  "col-span-2",
                  "col-span-2",
                ]
                const isAlert = k.tone === "rose"
                return (
                  <div
                    key={k.label}
                    className={`rounded-[2rem] p-2 bg-black/[0.03] ring-1 ring-black/[0.04] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-12px_rgba(24,24,27,0.1)] ${spanClasses[i]}`}
                  >
                    <div className={`h-full rounded-[calc(2rem-0.5rem)] p-5 shadow-[0_2px_24px_-10px_rgba(24,24,27,0.04)] flex flex-col justify-between ${isAlert ? "bg-[#FF453A]/[0.03]" : "bg-white"}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#71717A]">{k.label}</p>
                      <p className={`mt-3 text-3xl font-black tabular-nums ${isAlert ? "text-[#FF453A]" : "text-[#18181B]"}`} style={{ fontFamily: 'var(--font-geist-mono)' }}>{k.value}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>

            {/* Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.3 }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              <div className="lg:col-span-2 rounded-[2rem] p-2 bg-black/[0.03] ring-1 ring-black/[0.04]">
                <div className="rounded-[calc(2rem-0.5rem)] bg-white p-6 shadow-[0_2px_24px_-10px_rgba(24,24,27,0.04)]">
                  <span className="inline-flex items-center rounded-full bg-[#0A84FF]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A84FF]">Phân tích</span>
                  <h2 className="mt-3 text-xl font-bold tracking-tight text-[#18181B]">Trạng thái task</h2>
                  <p className="mt-1 text-sm text-[#71717A] text-pretty">Phân bổ task theo trạng thái xử lý</p>
                  <div className="mt-5">
                    <TaskStatusChart />
                  </div>
                </div>
              </div>
              <div className="rounded-[2rem] p-2 bg-black/[0.03] ring-1 ring-black/[0.04]">
                <div className="rounded-[calc(2rem-0.5rem)] bg-white p-6 shadow-[0_2px_24px_-10px_rgba(24,24,27,0.04)]">
                  <span className="inline-flex items-center rounded-full bg-[#30D158]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#30D158]">Hiệu quả</span>
                  <h2 className="mt-3 text-xl font-bold tracking-tight text-[#18181B]">Tỷ lệ hoàn thành</h2>
                  <p className="mt-1 text-sm text-[#71717A] text-pretty">Tổng quan tiến độ công việc</p>
                  <div className="mt-5">
                    <CompletionRateChart />
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6 space-y-6">
            {/* Alert KPIs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {[
                { label: "Tổng cảnh báo", value: ceoAlertsMock.length, alert: false },
                { label: "Nghiêm trọng", value: ceoAlertsMock.filter(a => a.level === "critical").length, alert: true },
                { label: "Cao", value: ceoAlertsMock.filter(a => a.level === "high").length, alert: true },
                { label: "Task quá hạn", value: departmentSummaryMock.reduce((s, d) => s + d.overdueTasks, 0), alert: true },
              ].map((k) => (
                <div
                  key={k.label}
                  className="rounded-[2rem] p-2 bg-black/[0.03] ring-1 ring-black/[0.04] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-12px_rgba(24,24,27,0.1)]"
                >
                  <div className={`h-full rounded-[calc(2rem-0.5rem)] p-5 shadow-[0_2px_24px_-10px_rgba(24,24,27,0.04)] flex flex-col justify-between ${k.alert ? "bg-[#FF453A]/[0.03]" : "bg-white"}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#71717A]">{k.label}</p>
                    <p className={`mt-3 text-3xl font-black tabular-nums ${k.alert ? "text-[#FF453A]" : "text-[#18181B]"}`} style={{ fontFamily: 'var(--font-geist-mono)' }}>{k.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Alerts list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
              className="rounded-[2rem] p-2 bg-black/[0.03] ring-1 ring-black/[0.04]"
            >
              <div className="rounded-[calc(2rem-0.5rem)] bg-white p-6 shadow-[0_2px_24px_-10px_rgba(24,24,27,0.04)]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center rounded-full bg-[#FF453A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF453A]">Cảnh báo cần xử lý</span>
                    <h2 className="mt-3 text-xl font-bold tracking-tight text-[#18181B]">Danh sách cảnh báo</h2>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-[#FF453A]"><span className="inline-block size-2 rounded-full bg-[#FF453A]"/>Critical</span>
                    <span className="flex items-center gap-1.5 text-[#18181B]"><span className="inline-block size-2 rounded-full bg-[#18181B]"/>High</span>
                    <span className="flex items-center gap-1.5 text-[#71717A]"><span className="inline-block size-2 rounded-full bg-[#71717A]"/>Medium</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {ceoAlertsMock.map((alert) => {
                    const isCritical = alert.level === "critical"
                    const isHigh = alert.level === "high"
                    return (
                      <div
                        key={alert.id}
                        className="group cursor-pointer rounded-[1.25rem] px-5 py-4 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#FAFAFA]"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-1.5 size-2.5 shrink-0 rounded-full ${isCritical ? "bg-[#FF453A]" : isHigh ? "bg-[#18181B]" : "bg-[#71717A]"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`text-sm font-semibold ${isCritical ? "text-[#FF453A]" : isHigh ? "text-[#18181B]" : "text-[#71717A]"}`}>{alert.title}</p>
                              <Badge
                                className={`rounded-full text-[11px] px-2.5 py-0.5 font-semibold ${isCritical ? "bg-[#FF453A]/10 text-[#FF453A]" : isHigh ? "bg-[#18181B]/10 text-[#18181B]" : "bg-[#F4F4F5] text-[#71717A]"}`}
                              >
                                {levelBadge[alert.level].label}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-[#71717A]">{alert.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Departments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
              className="rounded-[2rem] p-2 bg-black/[0.03] ring-1 ring-black/[0.04]"
            >
              <div className="rounded-[calc(2rem-0.5rem)] bg-white p-6 shadow-[0_2px_24px_-10px_rgba(24,24,27,0.04)]">
                <span className="inline-flex items-center rounded-full bg-[#0A84FF]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A84FF]">Tổ chức</span>
                <h2 className="mt-3 text-xl font-bold tracking-tight text-[#18181B]">Tổng quan theo phòng ban</h2>
                <div className="mt-5">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-black/[0.06] bg-transparent hover:bg-transparent">
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Phòng ban</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right tabular-nums">Tổng task</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right tabular-nums">Đã xử lý</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right tabular-nums">Đang XL</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right tabular-nums">Quá hạn</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right tabular-nums">Hoàn thành</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Cảnh báo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentSummaryMock.map((dept) => (
                        <TableRow
                          key={dept.name}
                          className="border-b border-black/[0.04] text-sm transition-colors duration-300 hover:bg-black/[0.02] cursor-pointer"
                        >
                          <TableCell className="font-semibold text-[#18181B]">{dept.name}</TableCell>
                          <TableCell className="text-right text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{dept.totalTasks}</TableCell>
                          <TableCell className="text-right text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{dept.completedTasks}</TableCell>
                          <TableCell className="text-right text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{dept.processingTasks}</TableCell>
                          <TableCell className="text-right text-[#FF453A] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{dept.overdueTasks}</TableCell>
                          <TableCell className="text-right font-semibold text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{dept.completionRate}%</TableCell>
                          <TableCell>
                            <Badge className={`rounded-full text-[11px] px-2.5 py-0.5 font-semibold ${dept.alert === "Ổn định" ? "bg-[#F4F4F5] text-[#71717A]" : "bg-[#FF453A]/10 text-[#FF453A]"}`}>
                              {dept.alert}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="personnel" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
              <EmployeePerformanceTable
                employees={ceoEmployeesMock}
                onViewDetail={(emp) => {
                  setSelectedEmployee(emp)
                  setDrawerOpen(true)
                }}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="ai-reports" className="mt-6 space-y-6">
            {/* AI Extraction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="rounded-[2rem] p-2 bg-black/[0.03] ring-1 ring-black/[0.04]"
            >
              <div className="rounded-[calc(2rem-0.5rem)] bg-white p-6 shadow-[0_2px_24px_-10px_rgba(24,24,27,0.04)]">
                <span className="inline-flex items-center rounded-full bg-[#0A84FF]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A84FF]">Trí tuệ nhân tạo</span>
                <h2 className="mt-3 text-xl font-bold tracking-tight text-[#18181B]">Thống kê AI bóc tách chứng từ</h2>
                <p className="mt-1 text-sm text-[#71717A] text-pretty">Hiệu quả AI theo loại chứng từ</p>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Tổng file", value: aiExtractionSummaryMock.totalFiles, alert: false },
                    { label: "Thành công", value: aiExtractionSummaryMock.success, alert: false },
                    { label: "Cần review", value: aiExtractionSummaryMock.needReview, alert: false },
                    { label: "Lỗi", value: aiExtractionSummaryMock.failed, alert: true },
                  ].map((k) => (
                    <div key={k.label} className="rounded-[1.25rem] bg-[#FAFAFA] p-4">
                      <p className={`text-2xl font-black tabular-nums ${k.alert ? "text-[#FF453A]" : "text-[#18181B]"}`} style={{ fontFamily: 'var(--font-geist-mono)' }}>{k.value}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#71717A]">{k.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <AiExtractionChart />
                </div>
              </div>
            </motion.div>

            {/* Report */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
              className="rounded-[2rem] p-2 bg-black/[0.03] ring-1 ring-black/[0.04]"
            >
              <div className="rounded-[calc(2rem-0.5rem)] bg-white p-6 shadow-[0_2px_24px_-10px_rgba(24,24,27,0.04)]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center rounded-full bg-[#0A84FF]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A84FF]">Hồ sơ</span>
                    <h2 className="mt-3 text-xl font-bold tracking-tight text-[#18181B]">Báo cáo tổng hợp</h2>
                  </div>
                  <Button className="cursor-pointer rounded-full bg-[#18181B] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_16px_-8px_rgba(24,24,27,0.2)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:bg-[#18181B]/90 active:scale-[0.98]">
                    Xuất CSV
                  </Button>
                </div>
                <p className="mt-1 text-sm text-[#71717A] text-pretty">Danh sách hồ sơ theo khách hàng</p>
                <div className="mt-5">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-black/[0.06] bg-transparent hover:bg-transparent">
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] w-10">STT</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Khách hàng</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Invoice</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Bill</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Booking</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Loại</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Nhân viên</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Trạng thái</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Ghi chú</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportSummaryMock.map((row) => (
                        <TableRow
                          key={row.stt}
                          className="border-b border-black/[0.04] text-sm transition-colors duration-300 hover:bg-black/[0.02] cursor-pointer"
                        >
                          <TableCell className="text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{row.stt}</TableCell>
                          <TableCell className="font-semibold text-[#18181B]">{row.customerName}</TableCell>
                          <TableCell className="text-[#71717A]">{row.invoice}</TableCell>
                          <TableCell className="text-[#71717A]">{row.bill}</TableCell>
                          <TableCell className="text-[#71717A]">{row.booking}</TableCell>
                          <TableCell className="text-[#71717A]">{row.type}</TableCell>
                          <TableCell className="text-[#71717A]">{row.employee}</TableCell>
                          <TableCell>
                            <Badge className={`rounded-full text-[11px] px-2.5 py-0.5 font-semibold ${row.status === "Hoàn tất" ? "bg-[#F4F4F5] text-[#71717A]" : row.status === "Đang xử lý" ? "bg-[#18181B] text-white" : "bg-[#FF453A]/10 text-[#FF453A]"}`}>
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#71717A]">{row.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        <EmployeeDetailDrawer
          employee={selectedEmployee}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </div>
    </div>
  </>
  )
}
