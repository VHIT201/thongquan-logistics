"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import type { EmployeePerformance } from "@/lib/ceo/types"

interface Props {
  employees: EmployeePerformance[]
  onViewDetail: (emp: EmployeePerformance) => void
}

export function EmployeePerformanceTable({ employees, onViewDetail }: Props) {
  return (
    <Card className="border-neutral-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-neutral-700">Hiệu suất nhân viên</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="text-[11px] text-neutral-500">Nhân viên</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Phòng ban</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Tổng task</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Hoàn thành</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Đang xử lý</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Quá hạn</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Tỷ lệ</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Thời gian TB</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Cảnh báo</TableHead>
                <TableHead className="text-[11px] text-neutral-500 w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => {
                const warning =
                  emp.overdueTasks >= 5
                    ? "Cần kiểm tra"
                    : emp.completionRate < 60
                    ? "Hiệu suất thấp"
                    : "Ổn định"
                return (
                  <TableRow key={emp.id} className="text-xs">
                    <TableCell className="font-medium text-neutral-700">{emp.name}</TableCell>
                    <TableCell className="text-neutral-600">{emp.department}</TableCell>
                    <TableCell className="text-right text-neutral-600">{emp.totalTasks}</TableCell>
                    <TableCell className="text-right text-emerald-600">{emp.completedTasks}</TableCell>
                    <TableCell className="text-right text-amber-600">{emp.processingTasks}</TableCell>
                    <TableCell className="text-right text-rose-600">{emp.overdueTasks}</TableCell>
                    <TableCell className="text-right text-neutral-700">{emp.completionRate}%</TableCell>
                    <TableCell className="text-right text-neutral-600">{emp.averageProcessingTime}</TableCell>
                    <TableCell>
                      <Badge
                        variant={warning === "Ổn định" ? "secondary" : "destructive"}
                        className="text-[10px]"
                      >
                        {warning}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onViewDetail(emp)}
                      >
                        <Eye className="h-3.5 w-3.5 text-neutral-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
