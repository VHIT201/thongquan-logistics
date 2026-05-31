"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DepartmentSummary } from "@/lib/ceo/types"

interface Props {
  departments: DepartmentSummary[]
}

export function DepartmentSummaryTable({ departments }: Props) {
  return (
    <Card className="border-neutral-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-neutral-700">Tổng quan theo phòng ban</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="text-[11px] text-neutral-500">Phòng ban</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Tổng task</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Đã xử lý</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Đang xử lý</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Quá hạn</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Hoàn thành</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Cảnh báo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.name} className="text-xs">
                  <TableCell className="font-medium text-neutral-700">{dept.name}</TableCell>
                  <TableCell className="text-right text-neutral-600">{dept.totalTasks}</TableCell>
                  <TableCell className="text-right text-neutral-600">{dept.completedTasks}</TableCell>
                  <TableCell className="text-right text-neutral-600">{dept.processingTasks}</TableCell>
                  <TableCell className="text-right text-rose-600">{dept.overdueTasks}</TableCell>
                  <TableCell className="text-right text-emerald-600">{dept.completionRate}%</TableCell>
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
  )
}
