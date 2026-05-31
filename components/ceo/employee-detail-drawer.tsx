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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-none border-2 border-[#111111] bg-[#F4F4F0] p-0">
        <DialogHeader className="border-b-2 border-[#111111] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-[#71717A]">[ NHAN VIEN ]</span>
            <div className="h-px w-12 bg-[#111111]" />
          </div>
          <DialogTitle className="mt-1 text-xl font-black uppercase text-[#111111]" style={{ letterSpacing: '-0.02em' }}>{employee.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-0">
          <div className="grid grid-cols-2 border-b border-[#111111] text-sm">
            <div className="flex items-center gap-2 border-r border-[#111111] px-5 py-2">
              <span className="text-[10px] font-bold uppercase text-[#71717A]">PB</span>
              <span className="font-bold text-[#111111]">{employee.department}</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2">
              <span className="text-[10px] font-bold uppercase text-[#71717A]">VI TRI</span>
              <span className="font-bold text-[#111111]">{employee.role}</span>
            </div>
            <div className="col-span-2 flex items-center gap-2 border-t border-[#111111] px-5 py-2">
              <span className="text-[10px] font-bold uppercase text-[#71717A]">EMAIL</span>
              <span className="text-[#111111]">{employee.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 border-b border-[#111111]">
            {[
              { label: "TONG TASK", value: employee.totalTasks, alert: false },
              { label: "HOAN THANH", value: employee.completedTasks, alert: false },
              { label: "DANG XL", value: employee.processingTasks, alert: false },
              { label: "QUA HAN", value: employee.overdueTasks, alert: true },
            ].map((kpi) => (
              <div key={kpi.label} className="border-r border-[#111111] p-3 text-center last:border-r-0">
                <p className={`text-xl font-black tabular-nums ${kpi.alert ? "text-[#E61919]" : "text-[#111111]"}`} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{kpi.value}</p>
                <p className="text-[10px] font-bold uppercase text-[#71717A]">{kpi.label}</p>
              </div>
            ))}
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 h-10 gap-0 rounded-none border-b border-[#111111] bg-transparent p-0 text-xs">
              <TabsTrigger value="tasks" className="cursor-pointer rounded-none border-r border-[#111111] text-[10px] font-bold uppercase data-[state=active]:bg-[#111111] data-[state=active]:text-white">Task dang XL</TabsTrigger>
              <TabsTrigger value="overdue" className="cursor-pointer rounded-none border-r border-[#111111] text-[10px] font-bold uppercase data-[state=active]:bg-[#111111] data-[state=active]:text-white">Task qua han</TabsTrigger>
              <TabsTrigger value="emails" className="cursor-pointer rounded-none border-r border-[#111111] text-[10px] font-bold uppercase data-[state=active]:bg-[#111111] data-[state=active]:text-white">Email/CT</TabsTrigger>
              <TabsTrigger value="customers" className="cursor-pointer rounded-none border-r border-[#111111] text-[10px] font-bold uppercase data-[state=active]:bg-[#111111] data-[state=active]:text-white">Khach hang</TabsTrigger>
              <TabsTrigger value="stats" className="cursor-pointer rounded-none border-r border-[#111111] text-[10px] font-bold uppercase data-[state=active]:bg-[#111111] data-[state=active]:text-white">Chi so</TabsTrigger>
              <TabsTrigger value="history" className="cursor-pointer rounded-none border-r border-[#111111] text-[10px] font-bold uppercase data-[state=active]:bg-[#111111] data-[state=active]:text-white">Lich su</TabsTrigger>
              <TabsTrigger value="ai" className="cursor-pointer rounded-none text-[10px] font-bold uppercase data-[state=active]:bg-[#111111] data-[state=active]:text-white">AI</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-0">
              {employee.currentTasks.filter(t => t.status !== "overdue").length === 0 ? (
                <p className="py-4 text-center text-xs font-bold uppercase text-[#71717A]">Khong co task dang xu ly.</p>
              ) : (
                <div className="border border-[#111111]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-[#111111] bg-[#F4F4F0] hover:bg-[#F4F4F0]">
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Ma</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Khach hang</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Loai</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Trang thai</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Canh bao</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.currentTasks.filter(t => t.status !== "overdue").map((task) => (
                        <TableRow key={task.id} className="border-b border-[#111111] text-sm cursor-pointer hover:bg-[#F4F4F0]">
                          <TableCell className="font-bold text-[#111111]">{task.id}</TableCell>
                          <TableCell className="text-[#71717A]">{task.customerName}</TableCell>
                          <TableCell className="text-[#71717A]">{task.documentType}</TableCell>
                          <TableCell>
                            <Badge className="rounded-none bg-[#F4F4F0] text-[10px] font-bold uppercase text-[#71717A]">Dang xu ly</Badge>
                          </TableCell>
                          <TableCell className="text-[#71717A]">{task.warning}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="overdue" className="mt-0">
              {employee.currentTasks.filter(t => t.status === "overdue").length === 0 ? (
                <p className="py-4 text-center text-xs font-bold uppercase text-[#71717A]">Khong co task qua han.</p>
              ) : (
                <div className="border border-[#111111]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-[#111111] bg-[#F4F4F0] hover:bg-[#F4F4F0]">
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Ma</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Khach hang</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Loai</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Nhan</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Han</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Canh bao</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.currentTasks.filter(t => t.status === "overdue").map((task) => (
                        <TableRow key={task.id} className="border-b border-[#111111] text-sm cursor-pointer hover:bg-[#F4F4F0]">
                          <TableCell className="font-bold text-[#111111]">{task.id}</TableCell>
                          <TableCell className="text-[#71717A]">{task.customerName}</TableCell>
                          <TableCell className="text-[#71717A]">{task.documentType}</TableCell>
                          <TableCell className="text-[#71717A]">{task.receivedAt}</TableCell>
                          <TableCell className="text-[#71717A]">{task.dueAt}</TableCell>
                          <TableCell className="text-[#E61919] font-bold">{task.warning}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="emails" className="mt-0">
              {employee.emails.length === 0 ? (
                <p className="py-4 text-center text-xs font-bold uppercase text-[#71717A]">Khong co email.</p>
              ) : (
                <div className="border border-[#111111]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-[#111111] bg-[#F4F4F0] hover:bg-[#F4F4F0]">
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Nhan</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Tieu de</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Khach hang</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right">File</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">AI</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Trang thai</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.emails.map((e, i) => (
                        <TableRow key={i} className="border-b border-[#111111] text-sm cursor-pointer hover:bg-[#F4F4F0]">
                          <TableCell className="text-[#71717A]">{e.receivedAt}</TableCell>
                          <TableCell className="font-bold text-[#111111]">{e.subject}</TableCell>
                          <TableCell className="text-[#71717A]">{e.customerName}</TableCell>
                          <TableCell className="text-right text-[#71717A]">{e.attachments} file</TableCell>
                          <TableCell className="text-[#71717A]">{e.aiStatus}</TableCell>
                          <TableCell>
                            <Badge className={`rounded-none text-[10px] px-2 py-0.5 font-bold uppercase ${e.status === "Quá hạn" ? "bg-[#E61919] text-white" : "bg-[#F4F4F0] text-[#71717A]"}`}>
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

            <TabsContent value="customers" className="mt-0">
              <div className="border border-[#111111]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-[#111111] bg-[#F4F4F0] hover:bg-[#F4F4F0]">
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A]">Khach hang</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right">Email</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right">Task</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right">Dang XL</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-[#71717A] text-right">Qua han</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.customers.map((c) => (
                      <TableRow key={c.customerName} className="border-b border-[#111111] text-sm cursor-pointer hover:bg-[#F4F4F0]">
                        <TableCell className="font-bold text-[#111111]">{c.customerName}</TableCell>
                        <TableCell className="text-right text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{c.totalEmails}</TableCell>
                        <TableCell className="text-right text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{c.totalTasks}</TableCell>
                        <TableCell className="text-right text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{c.processingTasks}</TableCell>
                        <TableCell className="text-right text-[#E61919] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{c.overdueTasks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
              <div className="grid grid-cols-2 border border-[#111111]">
                {[
                  { label: "TY LE HOAN THANH", value: `${employee.completionRate}%`, alert: false },
                  { label: "THOI GIAN XL TB", value: employee.averageProcessingTime, alert: false },
                  { label: "TASK QUA HAN", value: `${employee.overdueTasks}`, alert: true },
                  { label: "TASK CHUA XL", value: `${employee.pendingTasks}`, alert: false },
                ].map((s) => (
                  <div key={s.label} className="border-r border-b border-[#111111] p-3 last:border-r-0 even:border-r-0 sm:even:border-r sm:nth-last-child(-n+2):border-b-0">
                    <p className={`text-lg font-black tabular-nums ${s.alert ? "text-[#E61919]" : "text-[#111111]"}`} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{s.value}</p>
                    <p className="text-[10px] font-bold uppercase text-[#71717A]">{s.label}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              {employee.activityLogs.length === 0 ? (
                <p className="py-4 text-center text-xs font-bold uppercase text-[#71717A]">Khong co lich su.</p>
              ) : (
                <div className="border border-[#111111]">
                  {employee.activityLogs.map((log, i) => (
                    <div key={i} className={`flex items-start gap-3 px-5 py-3 ${i !== employee.activityLogs.length - 1 ? "border-b border-[#111111]" : ""}`}>
                      <div className="mt-0.5 size-2 shrink-0 bg-[#71717A]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#111111]">{log.time}</span>
                          <Badge className="rounded-none bg-[#F4F4F0] text-[10px] px-2 py-0.5 font-bold uppercase text-[#71717A]">{log.action}</Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-[#71717A]">{log.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              <div className="grid grid-cols-2 border border-[#111111]">
                <div className="border-r border-[#111111] p-3">
                  <p className="text-lg font-black text-[#111111] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{employee.aiExtractedFiles}</p>
                  <p className="text-[10px] font-bold uppercase text-[#71717A]">File AI da boc tach</p>
                </div>
                <div className="p-3">
                  <p className="text-lg font-black text-[#E61919] tabular-nums" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{employee.aiNeedReviewFiles}</p>
                  <p className="text-[10px] font-bold uppercase text-[#71717A]">File can kiem tra lai</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
