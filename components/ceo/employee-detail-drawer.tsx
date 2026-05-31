"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">PB</span>
              <span>{employee.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Vị trí</span>
              <span>{employee.role}</span>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <span className="text-zinc-400">Email</span>
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
            <TabsList className="grid w-full grid-cols-7 h-8 text-[10px]">
              <TabsTrigger value="tasks" className="cursor-pointer text-[10px] px-1">Task đang XL</TabsTrigger>
              <TabsTrigger value="overdue" className="cursor-pointer text-[10px] px-1">Task quá hạn</TabsTrigger>
              <TabsTrigger value="emails" className="cursor-pointer text-[10px] px-1">Email/CT</TabsTrigger>
              <TabsTrigger value="customers" className="cursor-pointer text-[10px] px-1">Khách hàng</TabsTrigger>
              <TabsTrigger value="stats" className="cursor-pointer text-[10px] px-1">Chỉ số</TabsTrigger>
              <TabsTrigger value="history" className="cursor-pointer text-[10px] px-1">Lịch sử</TabsTrigger>
              <TabsTrigger value="ai" className="cursor-pointer text-[10px] px-1">AI</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-2">
              {employee.currentTasks.filter(t => t.status !== "overdue").length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">Không có task đang xử lý.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                        <TableHead className="text-[11px] font-medium text-neutral-500">Mã</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Khách hàng</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Loại</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Trạng thái</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Cảnh báo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.currentTasks.filter(t => t.status !== "overdue").map((task) => (
                        <TableRow key={task.id} className="text-xs cursor-pointer">
                          <TableCell className="font-medium text-neutral-700">{task.id}</TableCell>
                          <TableCell className="text-neutral-600">{task.customerName}</TableCell>
                          <TableCell className="text-neutral-600">{task.documentType}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px]">Đang xử lý</Badge>
                          </TableCell>
                          <TableCell className="text-neutral-500">{task.warning}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="overdue" className="mt-2">
              {employee.currentTasks.filter(t => t.status === "overdue").length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">Không có task quá hạn.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                        <TableHead className="text-[11px] font-medium text-neutral-500">Mã</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Khách hàng</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Loại</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Nhận</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Hạn</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Cảnh báo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.currentTasks.filter(t => t.status === "overdue").map((task) => (
                        <TableRow key={task.id} className="text-xs cursor-pointer">
                          <TableCell className="font-medium text-neutral-700">{task.id}</TableCell>
                          <TableCell className="text-neutral-600">{task.customerName}</TableCell>
                          <TableCell className="text-neutral-600">{task.documentType}</TableCell>
                          <TableCell className="text-neutral-500">{task.receivedAt}</TableCell>
                          <TableCell className="text-neutral-500">{task.dueAt}</TableCell>
                          <TableCell className="text-rose-600">{task.warning}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="emails" className="mt-2">
              {employee.emails.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">Không có email.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                        <TableHead className="text-[11px] font-medium text-neutral-500">Nhận</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Tiêu đề</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Khách hàng</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500 text-right">File</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">AI</TableHead>
                        <TableHead className="text-[11px] font-medium text-neutral-500">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.emails.map((e, i) => (
                        <TableRow key={i} className="text-xs cursor-pointer">
                          <TableCell className="text-neutral-600">{e.receivedAt}</TableCell>
                          <TableCell className="font-medium text-neutral-700">{e.subject}</TableCell>
                          <TableCell className="text-neutral-600">{e.customerName}</TableCell>
                          <TableCell className="text-right text-neutral-600">{e.attachments} file</TableCell>
                          <TableCell className="text-neutral-500">{e.aiStatus}</TableCell>
                          <TableCell>
                            <Badge variant={e.status === "Quá hạn" ? "destructive" : "secondary"} className="text-[10px]">
                              {e.status}
                            </Badge>
                          </TableCell>
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
                    <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                      <TableHead className="text-[11px] font-medium text-neutral-500">Khách hàng</TableHead>
                      <TableHead className="text-[11px] font-medium text-neutral-500 text-right">Email</TableHead>
                      <TableHead className="text-[11px] font-medium text-neutral-500 text-right">Task</TableHead>
                      <TableHead className="text-[11px] font-medium text-neutral-500 text-right">Đang xử lý</TableHead>
                      <TableHead className="text-[11px] font-medium text-neutral-500 text-right">Quá hạn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.customers.map((c) => (
                      <TableRow key={c.customerName} className="text-xs cursor-pointer">
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

            <TabsContent value="stats" className="mt-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tỷ lệ hoàn thành", value: `${employee.completionRate}%`, tone: "primary" as const },
                  { label: "Thời gian xử lý TB", value: employee.averageProcessingTime },
                  { label: "Task quá hạn", value: `${employee.overdueTasks}`, tone: "rose" as const },
                  { label: "Task chưa xử lý", value: `${employee.pendingTasks}` },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white shadow-[0_2px_12px_-4px_rgba(12,84,156,0.06)] ring-1 ring-zinc-100/80 p-3">
                    <p className={`text-sm font-bold tabular-nums ${s.tone === "rose" ? "text-rose-600" : s.tone === "primary" ? "text-[#0c549c]" : "text-zinc-800"}`}>{s.value}</p>
                    <p className="text-[10px] text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-3">
              {employee.activityLogs.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">Không có lịch sử.</p>
              ) : (
                <div className="space-y-2">
                  {employee.activityLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-white shadow-[0_2px_12px_-4px_rgba(12,84,156,0.04)] ring-1 ring-zinc-100/60 p-3">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-zinc-300 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-zinc-600">{log.time}</span>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{log.action}</Badge>
                        </div>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{log.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#0c549c]/3 p-3 ring-1 ring-[#0c549c]/10">
                  <p className="text-sm font-bold text-[#0c549c]">{employee.aiExtractedFiles}</p>
                  <p className="text-[10px] text-zinc-500">File AI đã bóc tách</p>
                </div>
                <div className="rounded-xl bg-rose-50/40 p-3 ring-1 ring-rose-100/60">
                  <p className="text-sm font-bold text-rose-700">{employee.aiNeedReviewFiles}</p>
                  <p className="text-[10px] text-zinc-500">File cần kiểm tra lại</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
