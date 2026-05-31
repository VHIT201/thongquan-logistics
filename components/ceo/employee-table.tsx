"use client"

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
import type { EmployeePerformance } from "@/lib/ceo/types"

interface Props {
  employees: EmployeePerformance[]
  onViewDetail: (emp: EmployeePerformance) => void
}

const rowVariant = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
}

export function EmployeePerformanceTable({ employees, onViewDetail }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl bg-white p-5 shadow-[0_2px_24px_-10px_rgba(12,84,156,0.06)] ring-1 ring-slate-200"
    >
      <span className="inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase  text-[#0c549c] bg-[#0c549c]/5 mb-1">Nhân sự</span>
      <h2 className="text-base font-semibold text-balance text-slate-800">Hiệu suất nhân viên</h2>
      <p className="text-sm text-slate-500 text-pretty">Theo dõi công việc và hiệu suất từng nhân viên</p>
      <div className="mt-4 rounded-xl overflow-hidden ring-1 ring-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-medium text-slate-500">Nhân viên</TableHead>
              <TableHead className="text-xs font-medium text-slate-500">Phòng ban</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 text-right tabular-nums">Tổng task</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 text-right tabular-nums">Hoàn thành</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 text-right tabular-nums">Đang xử lý</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 text-right tabular-nums">Quá hạn</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 text-right tabular-nums">Tỷ lệ</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 text-right">Thời gian TB</TableHead>
              <TableHead className="text-xs font-medium text-slate-500">Cảnh báo</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 w-16 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp, i) => {
              const warning =
                emp.overdueTasks >= 5
                  ? "Cần kiểm tra"
                  : emp.completionRate < 60
                  ? "Hiệu suất thấp"
                  : "Ổn định"
              return (
                <motion.tr
                  key={emp.id}
                  variants={rowVariant}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-100 text-sm transition-colors hover:bg-slate-50/60 cursor-pointer group"
                  onClick={() => onViewDetail(emp)}
                >
                  <TableCell className="relative font-medium text-slate-800">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-[#0c549c] scale-y-0 transition-transform duration-200 group-hover:scale-y-100 rounded-r" />
                    {emp.name}
                  </TableCell>
                  <TableCell className="text-slate-600">{emp.department}</TableCell>
                  <TableCell className="text-right text-slate-600 tabular-nums">{emp.totalTasks}</TableCell>
                  <TableCell className="text-right text-slate-600 tabular-nums">{emp.completedTasks}</TableCell>
                  <TableCell className="text-right text-slate-600 tabular-nums">{emp.processingTasks}</TableCell>
                  <TableCell className="text-right text-rose-600 tabular-nums">{emp.overdueTasks}</TableCell>
                  <TableCell className="text-right font-medium text-[#0c549c] tabular-nums">{emp.completionRate}%</TableCell>
                  <TableCell className="text-right text-slate-600">{emp.averageProcessingTime}</TableCell>
                  <TableCell>
                    <Badge
                      variant={warning === "Ổn định" ? "secondary" : "destructive"}
                      className="text-[10px]"
                    >
                      {warning}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] text-[#0c549c] opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); onViewDetail(emp) }}
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </motion.tr>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </motion.section>
  )
}
