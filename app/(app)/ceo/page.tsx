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
      <motion.div variants={container} initial="hidden" animate="show" className="flex h-full flex-col gap-0 overflow-auto bg-[#F4F4F0]">
        {/* Header */}
        <motion.div variants={item} className="border-b-2 border-[#111111] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#71717A]">REV 2.6 // UNIT / CEO-001</p>
              <h1 className="mt-1 text-4xl font-black uppercase text-[#111111]" style={{ letterSpacing: '-0.03em', lineHeight: 0.9 }}>CEO DASHBOARD</h1>
              <p className="mt-2 text-sm text-[#71717A] text-pretty max-w-xl">THEO DOI TONG QUAN VAN HANH TOAN CONG TY // LOGISTICS OPS CONTROL</p>
            </div>
            <Button size="sm" className="cursor-pointer rounded-none border-2 border-[#111111] bg-[#111111] px-6 py-2.5 text-xs font-bold uppercase text-white hover:bg-[#333333]">
              XUAT BAO CAO
            </Button>
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div variants={item} className="flex flex-wrap items-center gap-0 border-b border-[#111111] px-6 py-3">
          {timeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeFilter(opt.value)}
              className={`cursor-pointer border-r border-[#111111] px-4 py-2 text-xs font-bold uppercase transition-colors last:border-r-0 ${
                timeFilter === opt.value
                  ? "bg-[#111111] text-white"
                  : "bg-transparent text-[#111111] hover:bg-[#111111]/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <div className="mx-2 h-4 w-px bg-[#111111]" />
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="cursor-pointer h-8 w-44 rounded-none border-0 border-r border-[#111111] bg-transparent text-xs font-bold uppercase text-[#111111]">
              <SelectValue placeholder="PHONG BAN" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-[#111111]">
              <SelectItem value="all">TAT CA PHONG BAN</SelectItem>
              <SelectItem value="Khai báo hải quan">KHAI BAO HAI QUAN</SelectItem>
              <SelectItem value="Chứng từ">CHUNG TU</SelectItem>
              <SelectItem value="Kế toán">KE TOAN</SelectItem>
              <SelectItem value="CSKH">CSKH</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="cursor-pointer h-8 w-40 rounded-none border-0 border-r border-[#111111] bg-transparent text-xs font-bold uppercase text-[#111111]">
              <SelectValue placeholder="TRANG THAI" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-[#111111]">
              <SelectItem value="all">TAT CA TRANG THAI</SelectItem>
              <SelectItem value="completed">HOAN THANH</SelectItem>
              <SelectItem value="processing">DANG XU LY</SelectItem>
              <SelectItem value="overdue">QUA HAN</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <motion.div variants={item} className="border-b border-[#111111]">
            <TabsList className="h-10 w-max gap-0 rounded-none bg-transparent p-0">
              {[
                { value: "overview", label: "TONG QUAN" },
                { value: "alerts", label: "CANH BAO" },
                { value: "personnel", label: "NHAN SU" },
                { value: "ai-reports", label: "AI & BAO CAO" },
              ].map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="cursor-pointer rounded-none border-r border-[#111111] px-6 py-2.5 text-xs font-bold uppercase text-[#71717A] transition-colors data-[state=active]:bg-[#111111] data-[state=active]:text-white"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          <TabsContent value="overview" className="flex flex-col mt-0">
            {/* KPI Bento */}
            <div className="grid grid-cols-2 border-b border-[#111111] sm:grid-cols-4 lg:grid-cols-8">
              {kpiData.map((k) => (
                <div
                  key={k.label}
                  className={`flex flex-col justify-between border-r border-b border-[#111111] p-4 last:border-r-0 lg:last:border-r lg:nth-last-child(-n+4):border-b-0 ${k.tone === "rose" ? "bg-[#E61919]/5" : "bg-white"}`}
                >
                  <p className="text-[10px] font-bold uppercase text-[#71717A]">{k.label}</p>
                  <p className={`mt-3 text-3xl font-black tabular-nums ${k.tone === "rose" ? "text-[#E61919]" : "text-[#111111]"}`} style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' }}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <section className="border-b border-r border-[#111111] bg-white p-5 lg:col-span-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-[#71717A]">[ PHAN TICH ]</span>
                  <div className="h-px flex-1 bg-[#111111]" />
                </div>
                <h2 className="mt-2 text-lg font-black uppercase text-[#111111]">TRANG THAI TASK</h2>
                <p className="text-xs text-[#71717A] text-pretty">Phan bo task theo trang thai xu ly</p>
                <div className="mt-4">
                  <TaskStatusChart />
                </div>
              </section>
              <section className="border-b border-[#111111] bg-white p-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-[#71717A]">[ HIEU QUA ]</span>
                  <div className="h-px flex-1 bg-[#111111]" />
                </div>
                <h2 className="mt-2 text-lg font-black uppercase text-[#111111]">TY LE HOAN THANH</h2>
                <p className="text-xs text-[#71717A] text-pretty">Tong quan tien do cong viec</p>
                <div className="mt-4">
                  <CompletionRateChart />
                </div>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="flex flex-col mt-0">
            {/* Alert KPIs */}
            <div className="grid grid-cols-2 border-b border-[#111111] sm:grid-cols-4">
              {[
                { label: "TONG CANH BAO", value: ceoAlertsMock.length, alert: false },
                { label: "NGHIEM TRONG", value: ceoAlertsMock.filter(a => a.level === "critical").length, alert: true },
                { label: "CAO", value: ceoAlertsMock.filter(a => a.level === "high").length, alert: true },
                { label: "TASK QUA HAN", value: departmentSummaryMock.reduce((s, d) => s + d.overdueTasks, 0), alert: true },
              ].map((k) => (
                <div
                  key={k.label}
                  className={`flex flex-col justify-between border-r border-b border-[#111111] p-4 last:border-r-0 sm:last:border-r sm:nth-last-child(-n+4):border-b-0 ${k.alert ? "bg-[#E61919]/5" : "bg-white"}`}
                >
                  <p className="text-[10px] font-bold uppercase text-[#71717A]">{k.label}</p>
                  <p className={`mt-3 text-3xl font-black tabular-nums ${k.alert ? "text-[#E61919]" : "text-[#111111]"}`} style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' }}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Alerts list */}
            <div className="border-b border-[#111111] bg-white">
              <div className="flex items-center gap-2 border-b border-[#111111] px-5 py-3">
                <span className="text-[10px] font-bold uppercase text-[#E61919]">[ CANH BAO CAN XU LY ]</span>
                <div className="h-px flex-1 bg-[#111111]" />
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
                  <span className="flex items-center gap-1.5 text-[#E61919]"><span className="size-2 bg-[#E61919]"/>CRITICAL</span>
                  <span className="flex items-center gap-1.5 text-[#111111]"><span className="size-2 bg-[#111111]"/>HIGH</span>
                  <span className="flex items-center gap-1.5 text-[#71717A]"><span className="size-2 bg-[#71717A]"/>MEDIUM</span>
                </div>
              </div>
              <div>
                {ceoAlertsMock.map((alert) => {
                  const isCritical = alert.level === "critical"
                  const isHigh = alert.level === "high"
                  return (
                    <div
                      key={alert.id}
                      className={`border-b border-[#111111] px-5 py-3.5 cursor-pointer transition-colors last:border-b-0 ${isCritical ? "bg-[#E61919]/5" : isHigh ? "bg-[#111111]/[0.02]" : "hover:bg-[#111111]/[0.02]"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1.5 size-2 shrink-0 ${isCritical ? "bg-[#E61919]" : isHigh ? "bg-[#111111]" : "bg-[#71717A]"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-bold uppercase ${isCritical ? "text-[#E61919]" : isHigh ? "text-[#111111]" : "text-[#71717A]"}`}>{alert.title}</p>
                            <Badge
                              className={`rounded-none text-[10px] px-2 py-0.5 font-bold uppercase ${isCritical ? "bg-[#E61919] text-white hover:bg-[#E61919]" : isHigh ? "bg-[#111111] text-white hover:bg-[#111111]" : "bg-[#F4F4F0] text-[#71717A] hover:bg-[#F4F4F0]"}`}
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

            {/* Departments */}
            <div className="border-b border-[#111111] bg-white">
              <div className="flex items-center gap-2 border-b border-[#111111] px-5 py-3">
                <span className="text-[10px] font-bold uppercase text-[#71717A]">[ TO CHUC ]</span>
                <div className="h-px flex-1 bg-[#111111]" />
              </div>
              <h2 className="px-5 pt-3 text-lg font-black uppercase text-[#111111]">TONG QUAN THEO PHONG BAN</h2>
              <div className="mt-3">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-[#111111] bg-[#F4F4F0] hover:bg-[#F4F4F0]">
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Phong ban</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right tabular-nums">Tong task</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right tabular-nums">Da xu ly</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right tabular-nums">Dang XL</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right tabular-nums">Qua han</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right tabular-nums">Hoan thanh</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Canh bao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentSummaryMock.map((dept) => (
                      <TableRow
                        key={dept.name}
                        className="border-b border-[#111111] text-sm transition-colors hover:bg-[#F4F4F0] cursor-pointer"
                      >
                        <TableCell className="font-bold uppercase text-[#111111]">{dept.name}</TableCell>
                        <TableCell className="text-right text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{dept.totalTasks}</TableCell>
                        <TableCell className="text-right text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{dept.completedTasks}</TableCell>
                        <TableCell className="text-right text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{dept.processingTasks}</TableCell>
                        <TableCell className="text-right text-[#E61919] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{dept.overdueTasks}</TableCell>
                        <TableCell className="text-right font-bold text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{dept.completionRate}%</TableCell>
                        <TableCell>
                          <Badge className={`rounded-none text-[10px] px-2 py-0.5 font-bold uppercase ${dept.alert === "Ổn định" ? "bg-[#F4F4F0] text-[#71717A]" : "bg-[#E61919]/10 text-[#E61919]"}`}>
                            {dept.alert}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="personnel" className="flex flex-col mt-0">
            {/* Employee Table */}
            <EmployeePerformanceTable
              employees={ceoEmployeesMock}
              onViewDetail={(emp) => {
                setSelectedEmployee(emp)
                setDrawerOpen(true)
              }}
            />
          </TabsContent>

          <TabsContent value="ai-reports" className="flex flex-col mt-0">
            {/* AI Extraction */}
            <div className="border-b border-[#111111] bg-white">
              <div className="flex items-center gap-2 border-b border-[#111111] px-5 py-3">
                <span className="text-[10px] font-bold uppercase text-[#71717A]">[ TRI TUE NHAN TAO ]</span>
                <div className="h-px flex-1 bg-[#111111]" />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-black uppercase text-[#111111]">THONG KE AI BOCTACH CHUNG TU</h2>
                <p className="text-xs text-[#71717A] text-pretty">Hieu qua AI theo loai chung tu</p>
                <div className="mt-4 grid grid-cols-2 border border-[#111111] sm:grid-cols-4">
                  <div className="border-r border-b border-[#111111] p-3 sm:border-b-0 sm:last:border-r-0">
                    <p className="text-2xl font-black text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{aiExtractionSummaryMock.totalFiles}</p>
                    <p className="text-[10px] font-bold uppercase text-[#71717A]">Tong file</p>
                  </div>
                  <div className="border-b border-[#111111] p-3 sm:border-b-0 sm:border-r sm:last:border-r-0">
                    <p className="text-2xl font-black text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{aiExtractionSummaryMock.success}</p>
                    <p className="text-[10px] font-bold uppercase text-[#71717A]">Thanh cong</p>
                  </div>
                  <div className="border-r border-[#111111] p-3 sm:border-b-0">
                    <p className="text-2xl font-black text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{aiExtractionSummaryMock.needReview}</p>
                    <p className="text-[10px] font-bold uppercase text-[#71717A]">Can review</p>
                  </div>
                  <div className="p-3">
                    <p className="text-2xl font-black text-[#E61919] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{aiExtractionSummaryMock.failed}</p>
                    <p className="text-[10px] font-bold uppercase text-[#71717A]">Loi</p>
                  </div>
                </div>
                <div className="mt-5">
                  <AiExtractionChart />
                </div>
              </div>
            </div>

            {/* Report */}
            <div className="border-b border-[#111111] bg-white">
              <div className="flex items-center justify-between border-b border-[#111111] px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-[#71717A]">[ HO SO ]</span>
                  <div className="h-px w-24 bg-[#111111]" />
                </div>
                <Button size="sm" className="cursor-pointer rounded-none border-2 border-[#111111] bg-[#111111] px-5 py-2 text-[10px] font-bold uppercase text-white hover:bg-[#333333]">
                  XUAT CSV
                </Button>
              </div>
              <h2 className="px-5 pt-3 text-lg font-black uppercase text-[#111111]">BAO CAO TONG HOP</h2>
              <p className="px-5 text-xs text-[#71717A] text-pretty">Danh sach ho so theo khach hang</p>
              <div className="mt-3">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-[#111111] bg-[#F4F4F0] hover:bg-[#F4F4F0]">
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A] w-10">STT</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Khach hang</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Invoice</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Bill</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Booking</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Loai</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Nhan vien</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Trang thai</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Ghi chu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportSummaryMock.map((row) => (
                      <TableRow
                        key={row.stt}
                        className="border-b border-[#111111] text-sm transition-colors hover:bg-[#F4F4F0] cursor-pointer"
                      >
                        <TableCell className="text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{row.stt}</TableCell>
                        <TableCell className="font-bold text-[#111111]">{row.customerName}</TableCell>
                        <TableCell className="text-[#71717A]">{row.invoice}</TableCell>
                        <TableCell className="text-[#71717A]">{row.bill}</TableCell>
                        <TableCell className="text-[#71717A]">{row.booking}</TableCell>
                        <TableCell className="text-[#71717A]">{row.type}</TableCell>
                        <TableCell className="text-[#71717A]">{row.employee}</TableCell>
                        <TableCell>
                          <Badge className={`rounded-none text-[10px] px-2 py-0.5 font-bold uppercase ${row.status === "Hoàn tất" ? "bg-[#F4F4F0] text-[#71717A]" : row.status === "Đang xử lý" ? "bg-[#111111] text-white" : "bg-[#E61919]/10 text-[#E61919]"}`}>
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
          </TabsContent>
        </Tabs>

        <EmployeeDetailDrawer
          employee={selectedEmployee}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </motion.div>
    </>
  )
}
