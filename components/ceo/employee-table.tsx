"use client"

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
import type { EmployeePerformance } from "@/lib/ceo/types"

interface Props {
  employees: EmployeePerformance[]
  onViewDetail: (emp: EmployeePerformance) => void
}

export function EmployeePerformanceTable({ employees, onViewDetail }: Props) {
  return (
    <div className="rounded-[2rem] p-2 bg-black/[0.03] ring-1 ring-black/[0.04]">
      <div className="rounded-[calc(2rem-0.5rem)] bg-white p-6 shadow-[0_2px_24px_-10px_rgba(24,24,27,0.04)]">
        <span className="inline-flex items-center rounded-full bg-[#0A84FF]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A84FF]">Nhân sự</span>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-[#18181B]">Hiệu suất nhân viên</h2>
        <p className="mt-1 text-sm text-[#71717A] text-pretty">Theo dõi công việc và hiệu suất từng nhân viên</p>
        <div className="mt-5">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black/[0.06] bg-transparent hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Nhân viên</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Phòng ban</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right tabular-nums">Tổng task</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right tabular-nums">Hoàn thành</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right tabular-nums">Đang XL</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right tabular-nums">Quá hạn</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right tabular-nums">Tỷ lệ</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right">Thời gian TB</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Cảnh báo</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] w-16 text-right"></TableHead>
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
                  <TableRow
                    key={emp.id}
                    className="border-b border-black/[0.04] text-sm transition-colors duration-300 hover:bg-black/[0.02] cursor-pointer"
                    onClick={() => onViewDetail(emp)}
                  >
                    <TableCell className="font-semibold text-[#18181B]">{emp.name}</TableCell>
                    <TableCell className="text-[#71717A]">{emp.department}</TableCell>
                    <TableCell className="text-right text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{emp.totalTasks}</TableCell>
                    <TableCell className="text-right text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{emp.completedTasks}</TableCell>
                    <TableCell className="text-right text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{emp.processingTasks}</TableCell>
                    <TableCell className="text-right text-[#FF453A] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{emp.overdueTasks}</TableCell>
                    <TableCell className="text-right font-semibold text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{emp.completionRate}%</TableCell>
                    <TableCell className="text-right text-[#71717A]">{emp.averageProcessingTime}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-full text-[11px] px-2.5 py-0.5 font-semibold ${warning === "Ổn định" ? "bg-[#F4F4F5] text-[#71717A]" : "bg-[#FF453A]/10 text-[#FF453A]"}`}>
                        {warning}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-full px-3 text-[11px] font-semibold text-[#18181B] opacity-0 transition-all duration-300 hover:bg-[#18181B] hover:text-white group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); onViewDetail(emp) }}
                      >
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
