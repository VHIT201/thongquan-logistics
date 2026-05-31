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
    <div className="border-b border-[#111111] bg-white">
      <div className="flex items-center gap-2 border-b border-[#111111] px-5 py-3">
        <span className="text-[10px] font-bold uppercase text-[#71717A]">[ NHAN SU ]</span>
        <div className="h-px flex-1 bg-[#111111]" />
      </div>
      <h2 className="px-5 pt-3 text-lg font-black uppercase text-[#111111]">HIEU SUAT NHAN VIEN</h2>
      <p className="px-5 text-xs text-[#71717A] text-pretty">Theo doi cong viec va hieu suat tung nhan vien</p>
      <div className="mt-3">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-[#111111] bg-[#F4F4F0] hover:bg-[#F4F4F0]">
              <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Nhan vien</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Phong ban</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right tabular-nums">Tong task</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right tabular-nums">Hoan thanh</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right tabular-nums">Dang XL</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right tabular-nums">Qua han</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right tabular-nums">Ty le</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right">Thoi gian TB</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Canh bao</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-[#71717A] w-16 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => {
              const warning =
                emp.overdueTasks >= 5
                  ? "CAN KIEM TRA"
                  : emp.completionRate < 60
                  ? "HIEU SUAT THAP"
                  : "ON DINH"
              return (
                <TableRow
                  key={emp.id}
                  className="border-b border-[#111111] text-sm transition-colors hover:bg-[#F4F4F0] cursor-pointer"
                  onClick={() => onViewDetail(emp)}
                >
                  <TableCell className="font-bold text-[#111111]">{emp.name}</TableCell>
                  <TableCell className="text-[#71717A]">{emp.department}</TableCell>
                  <TableCell className="text-right text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{emp.totalTasks}</TableCell>
                  <TableCell className="text-right text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{emp.completedTasks}</TableCell>
                  <TableCell className="text-right text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{emp.processingTasks}</TableCell>
                  <TableCell className="text-right text-[#E61919] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{emp.overdueTasks}</TableCell>
                  <TableCell className="text-right font-bold text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{emp.completionRate}%</TableCell>
                  <TableCell className="text-right text-[#71717A]">{emp.averageProcessingTime}</TableCell>
                  <TableCell>
                    <Badge className={`rounded-none text-[10px] px-2 py-0.5 font-bold uppercase ${warning === "ON DINH" ? "bg-[#F4F4F0] text-[#71717A]" : "bg-[#E61919]/10 text-[#E61919]"}`}>
                      {warning}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 rounded-none px-2 text-[10px] font-bold uppercase text-[#111111] opacity-0 transition-opacity hover:bg-[#111111] hover:text-white group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); onViewDetail(emp) }}
                    >
                      CHI TIET
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
