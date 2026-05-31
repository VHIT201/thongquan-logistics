"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Crown } from "lucide-react"
import { CeoKpiCards } from "@/components/ceo/kpi-cards"
import { CeoAlertPanel } from "@/components/ceo/alert-panel"
import { DepartmentSummaryTable } from "@/components/ceo/department-table"
import { EmployeePerformanceTable } from "@/components/ceo/employee-table"
import { AiExtractionSummary } from "@/components/ceo/ai-extraction-summary"
import { ReportSummaryTable } from "@/components/ceo/report-summary-table"
import { EmployeeDetailDrawer } from "@/components/ceo/employee-detail-drawer"
import {
  ceoOverviewMock,
  ceoAlertsMock,
  ceoEmployeesMock,
  aiExtractionSummaryMock,
  departmentSummaryMock,
  reportSummaryMock,
} from "@/lib/ceo/mock-data"
import type { EmployeePerformance } from "@/lib/ceo/types"

export default function CeoPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePerformance | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const userRaw = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null
    const user = userRaw ? JSON.parse(userRaw) : null
    if (!user || user.role !== "CEO") {
      // Demo: tự động set CEO nếu chưa có để dễ test
      localStorage.setItem("currentUser", JSON.stringify({ id: "u-ceo-001", name: "CEO", role: "CEO" }))
    }
  }, [router])

  if (!mounted) return null

  return (
    <div className="flex h-full flex-col gap-5 overflow-auto p-5">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-amber-500" />
        <h1 className="text-lg font-bold text-neutral-800">CEO Dashboard</h1>
        <span className="ml-2 text-xs text-neutral-400">Theo dõi tổng quan vận hành</span>
      </div>

      <CeoKpiCards data={ceoOverviewMock} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CeoAlertPanel alerts={ceoAlertsMock} />
        </div>
        <div className="lg:col-span-2">
          <DepartmentSummaryTable departments={departmentSummaryMock} />
        </div>
      </div>

      <EmployeePerformanceTable
        employees={ceoEmployeesMock}
        onViewDetail={(emp) => {
          setSelectedEmployee(emp)
          setDrawerOpen(true)
        }}
      />

      <AiExtractionSummary data={aiExtractionSummaryMock} />

      <ReportSummaryTable rows={reportSummaryMock} />

      <EmployeeDetailDrawer
        employee={selectedEmployee}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
