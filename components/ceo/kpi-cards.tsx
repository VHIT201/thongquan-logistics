"use client"

import { Mail, FileText, CheckCircle, Clock, AlertTriangle, Bot, BarChart3, FileSpreadsheet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { CeoOverview } from "@/lib/ceo/types"

interface Props {
  data: CeoOverview
}

const items = [
  { label: "Tổng email", valueKey: "totalEmails" as const, icon: Mail, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Tổng task", valueKey: "totalTasks" as const, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Đã xử lý", valueKey: "completedTasks" as const, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Đang xử lý", valueKey: "processingTasks" as const, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Quá hạn", valueKey: "overdueTasks" as const, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
  { label: "AI success", valueKey: "aiSuccessRate" as const, icon: Bot, color: "text-violet-600", bg: "bg-violet-50", suffix: "%" },
  { label: "Hoàn thành", valueKey: "completionRate" as const, icon: BarChart3, color: "text-cyan-600", bg: "bg-cyan-50", suffix: "%" },
  { label: "Thiếu data", valueKey: "missingDataRows" as const, icon: FileSpreadsheet, color: "text-orange-600", bg: "bg-orange-50" },
]

export function CeoKpiCards({ data }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {items.map((item) => {
        const Icon = item.icon
        const value = data[item.valueKey]
        return (
          <Card key={item.label} className="border-neutral-200">
            <CardContent className="flex flex-col items-start gap-2 p-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-800">{value}{item.suffix ?? ""}</p>
                <p className="text-[11px] text-neutral-500">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
