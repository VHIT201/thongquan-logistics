"use client"

import { useState } from "react"
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2rem] border-0 bg-white p-0 shadow-[0_24px_64px_-16px_rgba(24,24,27,0.15)]">
        <DialogHeader className="px-6 py-5">
          <span className="inline-flex items-center rounded-full bg-[#0A84FF]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A84FF] w-fit">Nhân viên</span>
          <DialogTitle className="mt-2 text-2xl font-bold tracking-tight text-[#18181B]">{employee.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          <div className="rounded-[1.25rem] bg-[#FAFAFA] p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">PB</span>
                <span className="font-semibold text-[#18181B]">{employee.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Vị trí</span>
                <span className="font-semibold text-[#18181B]">{employee.role}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Email</span>
                <span className="text-[#18181B]">{employee.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Tổng task", value: employee.totalTasks, alert: false },
              { label: "Hoàn thành", value: employee.completedTasks, alert: false },
              { label: "Đang XL", value: employee.processingTasks, alert: false },
              { label: "Quá hạn", value: employee.overdueTasks, alert: true },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-[1.25rem] bg-[#FAFAFA] p-4 text-center">
                <p className={`text-xl font-black tabular-nums ${kpi.alert ? "text-[#FF453A]" : "text-[#18181B]"}`} style={{ fontFamily: 'var(--font-geist-mono)' }}>{kpi.value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">{kpi.label}</p>
              </div>
            ))}
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="h-10 w-full gap-1 rounded-full bg-[#FAFAFA] p-1">
              <TabsTrigger value="tasks" className="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#71717A] transition-all data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">Task đang XL</TabsTrigger>
              <TabsTrigger value="overdue" className="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#71717A] transition-all data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">Quá hạn</TabsTrigger>
              <TabsTrigger value="emails" className="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#71717A] transition-all data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">Email</TabsTrigger>
              <TabsTrigger value="customers" className="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#71717A] transition-all data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">KH</TabsTrigger>
              <TabsTrigger value="stats" className="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#71717A] transition-all data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">Chỉ số</TabsTrigger>
              <TabsTrigger value="history" className="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#71717A] transition-all data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">Lịch sử</TabsTrigger>
              <TabsTrigger value="ai" className="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#71717A] transition-all data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">AI</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-4">
              {employee.currentTasks.filter(t => t.status !== "overdue").length === 0 ? (
                <p className="py-6 text-center text-sm text-[#71717A]">Không có task đang xử lý.</p>
              ) : (
                <div className="rounded-[1.25rem] bg-[#FAFAFA] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-black/[0.06] bg-transparent hover:bg-transparent">
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Mã</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Khách hàng</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Loại</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Trạng thái</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Cảnh báo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.currentTasks.filter(t => t.status !== "overdue").map((task) => (
                        <TableRow key={task.id} className="border-b border-black/[0.04] text-sm cursor-pointer transition-colors duration-300 hover:bg-black/[0.02]">
                          <TableCell className="font-semibold text-[#18181B]">{task.id}</TableCell>
                          <TableCell className="text-[#71717A]">{task.customerName}</TableCell>
                          <TableCell className="text-[#71717A]">{task.documentType}</TableCell>
                          <TableCell>
                            <Badge className="rounded-full bg-[#F4F4F5] text-[11px] px-2.5 py-0.5 font-semibold text-[#71717A]">Đang xử lý</Badge>
                          </TableCell>
                          <TableCell className="text-[#71717A]">{task.warning}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="overdue" className="mt-4">
              {employee.currentTasks.filter(t => t.status === "overdue").length === 0 ? (
                <p className="py-6 text-center text-sm text-[#71717A]">Không có task quá hạn.</p>
              ) : (
                <div className="rounded-[1.25rem] bg-[#FAFAFA] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-black/[0.06] bg-transparent hover:bg-transparent">
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Mã</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Khách hàng</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Loại</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Nhận</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Hạn</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Cảnh báo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.currentTasks.filter(t => t.status === "overdue").map((task) => (
                        <TableRow key={task.id} className="border-b border-black/[0.04] text-sm cursor-pointer transition-colors duration-300 hover:bg-black/[0.02]">
                          <TableCell className="font-semibold text-[#18181B]">{task.id}</TableCell>
                          <TableCell className="text-[#71717A]">{task.customerName}</TableCell>
                          <TableCell className="text-[#71717A]">{task.documentType}</TableCell>
                          <TableCell className="text-[#71717A]">{task.receivedAt}</TableCell>
                          <TableCell className="text-[#71717A]">{task.dueAt}</TableCell>
                          <TableCell className="text-[#FF453A] font-semibold">{task.warning}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="emails" className="mt-4">
              {employee.emails.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#71717A]">Không có email.</p>
              ) : (
                <div className="rounded-[1.25rem] bg-[#FAFAFA] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-black/[0.06] bg-transparent hover:bg-transparent">
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Nhận</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Tiêu đề</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Khách hàng</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right">File</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">AI</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.emails.map((e, i) => (
                        <TableRow key={i} className="border-b border-black/[0.04] text-sm cursor-pointer transition-colors duration-300 hover:bg-black/[0.02]">
                          <TableCell className="text-[#71717A]">{e.receivedAt}</TableCell>
                          <TableCell className="font-semibold text-[#18181B]">{e.subject}</TableCell>
                          <TableCell className="text-[#71717A]">{e.customerName}</TableCell>
                          <TableCell className="text-right text-[#71717A]">{e.attachments} file</TableCell>
                          <TableCell className="text-[#71717A]">{e.aiStatus}</TableCell>
                          <TableCell>
                            <Badge className={`rounded-full text-[11px] px-2.5 py-0.5 font-semibold ${e.status === "Quá hạn" ? "bg-[#FF453A]/10 text-[#FF453A]" : "bg-[#F4F4F5] text-[#71717A]"}`}>
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

            <TabsContent value="customers" className="mt-4">
              <div className="rounded-[1.25rem] bg-[#FAFAFA] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-black/[0.06] bg-transparent hover:bg-transparent">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">Khách hàng</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right">Email</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right">Task</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right">Đang XL</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A] text-right">Quá hạn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.customers.map((c) => (
                      <TableRow key={c.customerName} className="border-b border-black/[0.04] text-sm cursor-pointer transition-colors duration-300 hover:bg-black/[0.02]">
                        <TableCell className="font-semibold text-[#18181B]">{c.customerName}</TableCell>
                        <TableCell className="text-right text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{c.totalEmails}</TableCell>
                        <TableCell className="text-right text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{c.totalTasks}</TableCell>
                        <TableCell className="text-right text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{c.processingTasks}</TableCell>
                        <TableCell className="text-right text-[#FF453A] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{c.overdueTasks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tỷ lệ hoàn thành", value: `${employee.completionRate}%`, alert: false },
                  { label: "Thời gian XL TB", value: employee.averageProcessingTime, alert: false },
                  { label: "Task quá hạn", value: `${employee.overdueTasks}`, alert: true },
                  { label: "Task chưa XL", value: `${employee.pendingTasks}`, alert: false },
                ].map((s) => (
                  <div key={s.label} className="rounded-[1.25rem] bg-[#FAFAFA] p-4">
                    <p className={`text-lg font-black tabular-nums ${s.alert ? "text-[#FF453A]" : "text-[#18181B]"}`} style={{ fontFamily: 'var(--font-geist-mono)' }}>{s.value}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">{s.label}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {employee.activityLogs.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#71717A]">Không có lịch sử.</p>
              ) : (
                <div className="rounded-[1.25rem] bg-[#FAFAFA] overflow-hidden space-y-0">
                  {employee.activityLogs.map((log, i) => (
                    <div key={i} className={`flex items-start gap-3 px-5 py-3 ${i !== employee.activityLogs.length - 1 ? "border-b border-black/[0.04]" : ""}`}>
                      <div className="mt-1 size-2 shrink-0 rounded-full bg-[#71717A]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#18181B]">{log.time}</span>
                          <Badge className="rounded-full bg-[#F4F4F5] text-[11px] px-2.5 py-0.5 font-semibold text-[#71717A]">{log.action}</Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-[#71717A]">{log.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] bg-[#FAFAFA] p-4">
                  <p className="text-lg font-black text-[#18181B] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{employee.aiExtractedFiles}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">File AI đã bóc tách</p>
                </div>
                <div className="rounded-[1.25rem] bg-[#FAFAFA] p-4">
                  <p className="text-lg font-black text-[#FF453A] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{employee.aiNeedReviewFiles}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717A]">File cần kiểm tra lại</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
