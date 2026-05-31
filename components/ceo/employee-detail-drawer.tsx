"use client"

import { useState } from "react"
import { Mail, Building2, Briefcase, BarChart3, Clock, Bot, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  employee: EmployeePerformance | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeDetailDrawer({ employee, open, onOpenChange }: Props) {
  const [tab, setTab] = useState("tasks")
  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-neutral-800">{employee.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-neutral-400" />
              <span>{employee.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
              <span>{employee.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-neutral-400" />
              <span>{employee.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Tổng task", value: employee.totalTasks, color: "text-neutral-700" },
              { label: "Hoàn thành", value: employee.completedTasks, color: "text-emerald-600" },
              { label: "Đang xử lý", value: employee.processingTasks, color: "text-amber-600" },
              { label: "Quá hạn", value: employee.overdueTasks, color: "text-rose-600" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-lg border border-neutral-100 bg-neutral-50 p-2 text-center">
                <p className={`text-base font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[10px] text-neutral-500">{kpi.label}</p>
              </div>
            ))}
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-8 text-[11px]">
              <TabsTrigger value="tasks" className="text-[11px]">Task đang xử lý</TabsTrigger>
              <TabsTrigger value="customers" className="text-[11px]">Khách hàng</TabsTrigger>
              <TabsTrigger value="stats" className="text-[11px]">Chỉ số</TabsTrigger>
              <TabsTrigger value="ai" className="text-[11px]">AI</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-2">
              {employee.currentTasks.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">Không có task đang xử lý.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50">
                        <TableHead className="text-[11px] text-neutral-500">Mã</TableHead>
                        <TableHead className="text-[11px] text-neutral-500">Khách hàng</TableHead>
                        <TableHead className="text-[11px] text-neutral-500">Loại</TableHead>
                        <TableHead className="text-[11px] text-neutral-500">Trạng thái</TableHead>
                        <TableHead className="text-[11px] text-neutral-500">Cảnh báo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.currentTasks.map((task) => (
                        <TableRow key={task.id} className="text-xs">
                          <TableCell className="font-medium text-neutral-700">{task.id}</TableCell>
                          <TableCell className="text-neutral-600">{task.customerName}</TableCell>
                          <TableCell className="text-neutral-600">{task.documentType}</TableCell>
                          <TableCell>
                            <Badge
                              variant={task.status === "overdue" ? "destructive" : "secondary"}
                              className="text-[10px]"
                            >
                              {task.status === "overdue" ? "Quá hạn" : "Đang xử lý"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-neutral-500">{task.warning}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="customers" className="mt-2">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead className="text-[11px] text-neutral-500">Khách hàng</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 text-right">Email</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 text-right">Task</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 text-right">Đang xử lý</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 text-right">Quá hạn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.customers.map((c) => (
                      <TableRow key={c.customerName} className="text-xs">
                        <TableCell className="font-medium text-neutral-700">{c.customerName}</TableCell>
                        <TableCell className="text-right text-neutral-600">{c.totalEmails}</TableCell>
                        <TableCell className="text-right text-neutral-600">{c.totalTasks}</TableCell>
                        <TableCell className="text-right text-amber-600">{c.processingTasks}</TableCell>
                        <TableCell className="text-right text-rose-600">{c.overdueTasks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-2">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: BarChart3, label: "Tỷ lệ hoàn thành", value: `${employee.completionRate}%`, color: "text-emerald-600" },
                  { icon: Clock, label: "Thời gian xử lý TB", value: employee.averageProcessingTime, color: "text-blue-600" },
                  { icon: AlertTriangle, label: "Task quá hạn", value: `${employee.overdueTasks}`, color: "text-rose-600" },
                  { icon: AlertTriangle, label: "Task chưa xử lý", value: `${employee.pendingTasks}`, color: "text-amber-600" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <div>
                      <p className="text-sm font-bold text-neutral-800">{s.value}</p>
                      <p className="text-[10px] text-neutral-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 p-3">
                  <Bot className="h-4 w-4 text-violet-500" />
                  <div>
                    <p className="text-sm font-bold text-violet-700">{employee.aiExtractedFiles}</p>
                    <p className="text-[10px] text-violet-600">File AI đã bóc tách</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-amber-700">{employee.aiNeedReviewFiles}</p>
                    <p className="text-[10px] text-amber-600">File cần kiểm tra lại</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
