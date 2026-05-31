"use client"

import { AlertTriangle, Bell, Info, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CeoAlert, AlertLevel } from "@/lib/ceo/types"

interface Props {
  alerts: CeoAlert[]
}

const levelConfig: Record<AlertLevel, { label: string; icon: typeof AlertTriangle; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "Thấp", icon: Info, variant: "secondary" },
  medium: { label: "Trung bình", icon: Bell, variant: "default" },
  high: { label: "Cao", icon: AlertTriangle, variant: "destructive" },
  critical: { label: "Nghiêm trọng", icon: ShieldAlert, variant: "destructive" },
}

export function CeoAlertPanel({ alerts }: Props) {
  return (
    <Card className="border-neutral-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-neutral-700">Cảnh báo cần chú ý</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 && (
          <p className="text-xs text-neutral-400">Không có cảnh báo nào.</p>
        )}
        {alerts.map((alert) => {
          const cfg = levelConfig[alert.level]
          const Icon = cfg.icon
          return (
            <div
              key={alert.id}
              className="flex items-start gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-2.5"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${alert.level === "high" || alert.level === "critical" ? "text-rose-500" : "text-amber-500"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-neutral-700">{alert.title}</p>
                  <Badge variant={cfg.variant} className="text-[9px] px-1 py-0">
                    {cfg.label}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-neutral-500 leading-relaxed">{alert.description}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
