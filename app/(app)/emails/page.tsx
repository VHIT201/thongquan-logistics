"use client"
// ROUTE: Danh sách email — dùng chung cho mọi user (gán theo /my API)

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Loader,
  Mail,
  Paperclip,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { useMailAssignmentsMyQuery, useConfirmMailAssignmentMutation } from "@/hooks/use-mail-assignments-queries"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 10

type MailAttachment = {
  id?: string | null
  fileName?: string | null
  contentType?: string | null
  fileSize?: number | null
}

type MailItem = {
  id?: string | null
  subject?: string | null
  fromEmail?: string | null
  fromName?: string | null
  receivedAt?: string | null
  attachments?: MailAttachment[] | null
}

type AssignmentItem = {
  id?: string | null
  mailConnectorMessageId?: string | null
  assignedAt?: string | null
  status?: string | null
  confirmedAt?: string | null
  completedAt?: string | null
  notes?: string | null
  mail?: MailItem | null
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    assigned: {
      label: "Đã giao",
      className: "bg-blue-50 text-blue-700",
      icon: <Mail className="h-3 w-3" />,
    },
    confirmed: {
      label: "Đã xác nhận",
      className: "bg-amber-50 text-amber-700",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    completed: {
      label: "Hoàn thành",
      className: "bg-green-50 text-green-700",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    needSupplement: {
      label: "Cần bổ sung",
      className: "bg-red-50 text-red-700",
      icon: <AlertCircle className="h-3 w-3" />,
    },
    extracted: {
      label: "Đã bóc tách",
      className: "bg-purple-50 text-purple-700",
      icon: <Paperclip className="h-3 w-3" />,
    },
    exported: {
      label: "Đã xuất",
      className: "bg-neutral-100 text-neutral-600",
      icon: <Clock className="h-3 w-3" />,
    },
  }
  const normalized = status?.toLowerCase() ?? ""
  const match = Object.entries(map).find(([key]) => normalized.includes(key))
  return match?.[1] ?? { label: status || "—", className: "bg-neutral-100 text-neutral-600", icon: null }
}

export default function EmailsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const assignmentsQuery = useMailAssignmentsMyQuery()
  const confirmMutation = useConfirmMailAssignmentMutation()

  const assignmentsRaw = assignmentsQuery.data
  const assignments: AssignmentItem[] = useMemo(() => {
    if (Array.isArray(assignmentsRaw)) return assignmentsRaw as AssignmentItem[]
    if (assignmentsRaw && typeof assignmentsRaw === "object" && "data" in (assignmentsRaw as Record<string, unknown>)) {
      const d = assignmentsRaw as unknown as Record<string, unknown>
      if (Array.isArray(d.data)) return d.data as AssignmentItem[]
    }
    return []
  }, [assignmentsRaw])

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim()
    if (!keyword) return assignments
    return assignments.filter((a) => {
      const subject = String(a.mail?.subject ?? "").toLowerCase()
      const fromEmail = String(a.mail?.fromEmail ?? "").toLowerCase()
      const fromName = String(a.mail?.fromName ?? "").toLowerCase()
      const status = String(a.status ?? "").toLowerCase()
      return (
        subject.includes(keyword) ||
        fromEmail.includes(keyword) ||
        fromName.includes(keyword) ||
        status.includes(keyword)
      )
    })
  }, [assignments, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const isLoading = assignmentsQuery.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Danh sách Email</h1>
      </div>

      {assignmentsQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(assignmentsQuery.error, "Không tải được danh sách.")}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-100" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề, người gửi, trạng thái..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-neutral-100 bg-white py-2 pl-9 pr-4 text-sm text-neutral-800 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-neutral-400">
          <Loader className="h-4 w-4 animate-spin" /> Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-neutral-100 bg-white p-6 text-center text-sm text-neutral-400">
          <Mail className="mx-auto mb-2 h-8 w-8 text-neutral-200" />
          <p>Chưa có email nào được giao cho bạn.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Tiêu đề</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Người gửi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Nhận lúc</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Ngày giao</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Xác nhận lúc</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Hoàn thành lúc</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paged.map((item) => {
                    const messageId = String(item.mailConnectorMessageId ?? "")
                    const badge = statusBadge(item.status ?? "")
                    const hasAttachments = (item.mail?.attachments?.length ?? 0) > 0
                    return (
                      <tr key={item.id || messageId} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0 text-neutral-300" />
                            <span className="max-w-[200px] truncate font-medium text-neutral-700">
                              {item.mail?.subject ?? "(Không tiêu đề)"}
                            </span>
                            {hasAttachments && (
                              <Paperclip className="h-3 w-3 text-neutral-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-500">
                          {item.mail?.fromName || item.mail?.fromEmail || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">
                          {item.mail?.receivedAt
                            ? dayjs(String(item.mail.receivedAt)).format("DD/MM/YYYY HH:mm")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">
                          {item.assignedAt
                            ? dayjs(String(item.assignedAt)).format("DD/MM/YYYY HH:mm")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">
                          {item.confirmedAt
                            ? dayjs(String(item.confirmedAt)).format("DD/MM/YYYY HH:mm")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">
                          {item.completedAt
                            ? dayjs(String(item.completedAt)).format("DD/MM/YYYY HH:mm")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {(() => {
                            const statusLower = item.status?.toLowerCase() ?? ""
                            const canConfirm = statusLower === "assigned"
                            const canProcess = ["confirmed", "needSupplement", "extracted", "exported"].includes(statusLower)
                            const isCompleted = statusLower === "completed"
                            return (
                              <div className="flex items-center justify-end gap-1">
                                {canConfirm && messageId && (
                                  <button
                                    onClick={() => {
                                      confirmMutation.mutate(
                                        { messageId, payload: {} },
                                        {
                                          onSuccess: () => toast.success("Đã xác nhận nhận mail."),
                                          onError: (err) => toast.error("Xác nhận thất bại: " + String(err)),
                                        }
                                      )
                                    }}
                                    disabled={confirmMutation.isPending}
                                    className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                                  >
                                    Xác nhận
                                  </button>
                                )}
                                {canProcess && messageId && (
                                  <Link
                                    href={`/emails/${messageId}`}
                                    className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-500"
                                  >
                                    Xử lý
                                  </Link>
                                )}
                                {isCompleted && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Hoàn thành
                                  </span>
                                )}
                                {!messageId && <span className="text-neutral-400">—</span>}
                              </div>
                            )
                          })()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
              <p className="text-xs text-neutral-200">
                Trang {page} / {totalPages} ({filtered.length} bản ghi)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
