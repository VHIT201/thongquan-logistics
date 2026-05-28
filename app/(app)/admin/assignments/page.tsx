"use client"
// ADMIN ROUTE: Quản lý phân công xử lý email (gán mail cho user) — chỉ admin

import { useState, useMemo } from "react"
import {
  Loader,
  Mail,
  UserCheck,
  CheckCircle,
  Clock,
  Send,
  Eye,
  X,
  Calendar,
  AlertTriangle,
  Paperclip,
} from "lucide-react"
import dayjs from "dayjs"
import { toast } from "sonner"
import { useMailMessagesQuery, useMailMessageQuery } from "@/hooks/use-mail-queries"
import {
  useMailAssignmentsByStatusQuery,
  useAssignMailMutation,
  useUnassignMailMutation,
} from "@/hooks/use-mail-assignments-queries"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import { useUsersQuery } from "@/hooks/use-user-queries"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const TABS = [
  { key: "unassigned", label: "Chưa xử lý", icon: Mail },
  { key: "assigned", label: "Đang xử lý", icon: Clock },
  { key: "completed", label: "Hoàn thành", icon: CheckCircle },
]

function normalizeArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[]
  if (raw && typeof raw === "object" && "data" in raw) {
    const d = raw as unknown as Record<string, unknown>
    if (Array.isArray(d.data)) return d.data as Record<string, unknown>[]
  }
  return []
}

function getPagination(raw: unknown) {
  if (raw && typeof raw === "object" && "meta" in raw) {
    const m = raw as unknown as Record<string, unknown>
    const meta = m.meta as Record<string, unknown> | undefined
    if (meta && "pagination" in meta) {
      return meta.pagination as Record<string, unknown>
    }
  }
  return null
}

export default function AdminAssignmentsPage() {
  const [activeTab, setActiveTab] = useState("unassigned")
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Queries
  const assignmentsQuery = useMailAssignmentsByStatusQuery(
    activeTab === "unassigned" ? "assigned" : activeTab
  )
  // Fetch all assignments with status=assigned for checking "already assigned" in unassigned tab
  const allAssignedQuery = useMailAssignmentsByStatusQuery("assigned")
  const messagesQuery = useMailMessagesQuery({ page, pageSize })
  // Fetch more messages for subject lookup in assignment rows
  const allMessagesQuery = useMailMessagesQuery({ page: 1, pageSize: 500 })
  const usersQuery = useUsersQuery({ page: 1, pageSize: 100 })
  const assignMutation = useAssignMailMutation()
  const unassignMutation = useUnassignMailMutation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mailApi: any = getLogisticsPlatformAPI()

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [currentAssignedUserId, setCurrentAssignedUserId] = useState<string | null>(null)

  const detailMessageQuery = useMailMessageQuery(detailModalOpen ? selectedMessageId : null)

  // Normalized data
  const assignments = normalizeArray(assignmentsQuery.data)
  const allAssigned = normalizeArray(allAssignedQuery.data)
  const messages = normalizeArray(messagesQuery.data)
  const allMessages = normalizeArray(allMessagesQuery.data)
  const users = normalizeArray(usersQuery.data)

  const pagination = getPagination(messagesQuery.data)
  const totalPages = (pagination?.totalPages as number) ?? 1
  const totalItems = (pagination?.totalItems as number) ?? 0

  // Build lookup maps
  const messageMap = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>()
    // Merge messages from both queries (paginated + bulk lookup)
    for (const m of [...messages, ...allMessages]) {
      const id = String(m.id ?? "")
      if (id && !map.has(id)) map.set(id, m)
    }
    return map
  }, [messages, allMessages])

  // Merge all assignment sources (tab-specific + all assigned) for lookup
  const allAssignments = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>()
    for (const a of [...allAssigned, ...assignments]) {
      const id = String(a.mailConnectorMessageId ?? "")
      if (id && !map.has(id)) map.set(id, a)
    }
    return map
  }, [allAssigned, assignments])

  const assignedMessageIds = useMemo(() => {
    const set = new Set<string>()
    for (const a of allAssignments.values()) {
      const id = String(a.mailConnectorMessageId ?? "")
      if (id) set.add(id)
    }
    return set
  }, [allAssignments])

  const getUserName = (userId: string) => {
    const u = users.find((item) => String(item.id) === userId)
    if (u) return String(u.fullName ?? u.email ?? "—")
    return userId.slice(0, 8)
  }

  const getMessageSubject = (messageId: string) => {
    const msg = messageMap.get(messageId)
    if (msg) return String(msg.subject ?? "(Không tiêu đề)")
    return null
  }

  const getMessageFromEmail = (messageId: string) => {
    const msg = messageMap.get(messageId)
    if (msg) return String(msg.fromEmail ?? "—")
    return "—"
  }

  const getMessageReceivedAt = (messageId: string) => {
    const msg = messageMap.get(messageId)
    const val = msg?.receivedAt ?? msg?.sentAt ?? msg?.createdAt
    if (val) return dayjs(String(val)).format("DD/MM/YYYY HH:mm")
    return null
  }

  const openAssignModal = (messageId: string) => {
    setSelectedMessageId(messageId)
    setSelectedUserId("")
    const existing = allAssignments.get(messageId)
    setCurrentAssignedUserId(existing ? String(existing.assignedToUserId ?? "") : null)
    setAssignModalOpen(true)
  }

  const openDetailModal = (messageId: string) => {
    setSelectedMessageId(messageId)
    setDetailModalOpen(true)
  }

  const handleAssign = async () => {
    if (!selectedMessageId || !selectedUserId) return

    try {
      // Nếu mail đã gán cho người khác → unassign trước rồi assign mới
      if (currentAssignedUserId) {
        await unassignMutation.mutateAsync({
          messageId: selectedMessageId,
          payload: { userId: currentAssignedUserId },
        })
      }

      assignMutation.mutate(
        {
          messageId: selectedMessageId,
          payload: { toUserId: selectedUserId },
        },
        {
          onSuccess: () => {
            toast.success(currentAssignedUserId ? "Đã chuyển giao mail." : "Đã gán mail cho người dùng.")
            setAssignModalOpen(false)
            setSelectedMessageId(null)
            setSelectedUserId("")
            setCurrentAssignedUserId(null)
          },
          onError: (err: unknown) => {
            toast.error((currentAssignedUserId ? "Chuyển giao" : "Gán mail") + " thất bại: " + String(err))
          },
        }
      )
    } catch (err) {
      toast.error("Hủy gán cũ thất bại: " + String(err))
    }
  }

  const isLoading = activeTab === "unassigned"
    ? messagesQuery.isPending
    : assignmentsQuery.isPending

  const hasData = activeTab === "unassigned"
    ? messages.length > 0
    : assignments.length > 0

  const currentData = activeTab === "unassigned" ? messages : assignments

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý Phân công</h1>
      </div>

      <div className="flex gap-1 rounded-lg border border-neutral-100 bg-white p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-primary text-white"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-primary">
              <tr>
                {activeTab === "unassigned" ? (
                  <>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Tiêu đề</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Người gửi</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Thời gian nhận</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái xử lý</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Đang giao</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80"></th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Tiêu đề</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Người gửi</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Người được giao</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Thời gian</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80"></th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải...</p>
                  </td>
                </tr>
              )}
              {!isLoading && !hasData && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    Không có bản ghi nào.
                  </td>
                </tr>
              )}
              {activeTab === "unassigned" && messages.map((m) => {
                const messageId = String(m.id ?? "")
                const isAssigned = assignedMessageIds.has(messageId)
                return (
                  <tr key={messageId} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-neutral-300" />
                        <span className="max-w-[200px] truncate font-medium text-neutral-300">
                          {String(m.subject ?? "(Không tiêu đề)")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">{String(m.fromEmail ?? "—")}</td>
                    <td className="px-4 py-3 text-neutral-200 text-xs">
                      {m.receivedAt
                        ? dayjs(String(m.receivedAt)).format("DD/MM/YYYY HH:mm")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        m.processStatus === "completed"
                          ? "bg-green-50 text-green-700"
                          : m.processStatus === "processing"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {String(m.processStatus ?? "pending")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isAssigned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          <UserCheck className="h-3 w-3" />
                          Đã gán
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-200">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isAssigned && (
                          <button
                            onClick={() => openAssignModal(messageId)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 cursor-pointer"
                          >
                            <Send className="h-3 w-3" />
                            Chuyển
                          </button>
                        )}
                        <button
                          onClick={() => openDetailModal(messageId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          Xem
                        </button>
                        {!isAssigned && (
                          <button
                            onClick={() => openAssignModal(messageId)}
                            className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 cursor-pointer"
                          >
                            <Send className="h-3 w-3" />
                            Gán
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {activeTab !== "unassigned" && assignments.map((a) => {
                const messageId = String(a.mailConnectorMessageId ?? "")
                const userId = String(a.assignedToUserId ?? "")
                const status = String(a.status ?? "")
                const subject = getMessageSubject(messageId) ?? messageId.slice(0, 12) + "..."
                const fromEmail = getMessageFromEmail(messageId)
                const receivedAt = getMessageReceivedAt(messageId)
                const assignedUserName = String(a.assignedToUserName ?? a.assignedToUserEmail ?? userId.slice(0, 8))
                const assignedAt = a.assignedAt
                  ? dayjs(String(a.assignedAt)).format("DD/MM/YYYY HH:mm")
                  : "—"
                const completedAt = a.completedAt
                  ? dayjs(String(a.completedAt)).format("DD/MM/YYYY HH:mm")
                  : null

                return (
                  <tr key={messageId + userId} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-neutral-300" />
                        <span className="max-w-[200px] truncate font-medium text-neutral-300">
                          {subject}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">{fromEmail}</td>
                    <td className="px-4 py-3 text-neutral-300">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-neutral-300" />
                        {assignedUserName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        status === "completed"
                          ? "bg-green-50 text-green-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {status === "completed" ? "Hoàn thành" : "Đang xử lý"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-200 text-xs">
                      <div className="space-y-0.5">
                        {receivedAt && <div>Nhận: {receivedAt}</div>}
                        <div>Gán: {assignedAt}</div>
                        {completedAt && <div>Hoàn tất: {completedAt}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openAssignModal(messageId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 cursor-pointer"
                        >
                          <Send className="h-3 w-3" />
                          Chuyển
                        </button>
                        <button
                          onClick={() => openDetailModal(messageId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          Xem
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {activeTab === "unassigned" && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
            <p className="text-xs text-neutral-200">
              Trang {page} / {totalPages} ({totalItems} bản ghi)
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
      </div>

      {/* Assign Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-black">
              {selectedMessageId && assignedMessageIds.has(selectedMessageId) ? "Chuyển giao mail" : "Gán mail cho người dùng"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-neutral-300">
              {selectedMessageId && assignedMessageIds.has(selectedMessageId)
                ? "Chọn người dùng khác để chuyển giao email này."
                : "Chọn người dùng để xử lý email này."}
            </p>
            {currentAssignedUserId && (
              <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <span className="font-medium">Đang gán cho:</span>{" "}
                {(() => {
                  const u = users.find((user) => String(user.id ?? "") === currentAssignedUserId)
                  return u ? String(u.fullName ?? u.email ?? currentAssignedUserId) : currentAssignedUserId
                })()}
              </div>
            )}
            <div className="max-h-[300px] space-y-1 overflow-y-auto rounded-lg border border-neutral-100 p-2">
              {usersQuery.isPending && (
                <p className="text-sm text-neutral-200">Đang tải danh sách...</p>
              )}
              {users.map((u) => {
                const uid = String(u.id ?? "")
                const isCurrentAssignee = uid === currentAssignedUserId
                return (
                  <button
                    key={uid}
                    onClick={() => !isCurrentAssignee && setSelectedUserId(uid)}
                    disabled={isCurrentAssignee}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      isCurrentAssignee
                        ? "cursor-not-allowed opacity-40"
                        : selectedUserId === uid
                        ? "bg-primary-50 text-primary cursor-pointer"
                        : "text-neutral-300 hover:bg-neutral-50 cursor-pointer"
                    }`}
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      selectedUserId === uid
                        ? "border-primary bg-primary"
                        : "border-neutral-300"
                    }`}>
                      {selectedUserId === uid && (
                        <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{String(u.fullName ?? u.email ?? "—")}</p>
                      <p className="text-xs text-neutral-200">{String(u.email ?? "")}</p>
                    </div>
                    {isCurrentAssignee && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        Đang gán
                      </span>
                    )}
                  </button>
                )
              })}
              {!usersQuery.isPending && users.length === 0 && (
                <p className="text-sm text-neutral-200">Không có người dùng nào.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!selectedUserId || assignMutation.isPending || unassignMutation.isPending}
              >
                {assignMutation.isPending || unassignMutation.isPending ? "..." : "Xác nhận gán"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Thông tin phân công
            </DialogTitle>
            <DialogDescription className="text-neutral-500">
              Chi tiết email, file đính kèm và trạng thái xử lý
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {detailMessageQuery.isPending && (
              <div className="flex items-center gap-2 py-4 text-sm text-neutral-400">
                <Loader className="h-4 w-4 animate-spin" /> Đang tải nội dung mail...
              </div>
            )}

            {(() => {
              const msgData = detailMessageQuery.data as Record<string, unknown> | undefined
              const a = [...assignments, ...allAssigned].find(
                (item) => String(item.mailConnectorMessageId ?? "") === selectedMessageId
              )
              const msgId = selectedMessageId ?? ""
              const subject = getMessageSubject(msgId) ?? msgId
              const fromName = msgData ? String(msgData.fromName ?? "—") : getMessageFromEmail(msgId)
              const fromEmail = msgData ? String(msgData.fromEmail ?? "—") : getMessageFromEmail(msgId)
              const receivedAt = msgData?.receivedAt
                ? dayjs(String(msgData.receivedAt)).format("DD/MM/YYYY HH:mm")
                : getMessageReceivedAt(msgId) ?? "—"
              const body = msgData?.bodyText ?? msgData?.body ?? msgData?.htmlBody ?? ""
              const attachments = msgData?.attachments as Array<Record<string, unknown>> | undefined

              const assignedUserName = a ? String(a.assignedToUserName ?? a.assignedToUserEmail ?? "—") : "—"
              const assignedAt = a?.assignedAt
                ? dayjs(String(a.assignedAt)).format("DD/MM/YYYY HH:mm")
                : null
              const completedAt = a?.completedAt
                ? dayjs(String(a.completedAt)).format("DD/MM/YYYY HH:mm")
                : null
              const confirmedAt = a?.confirmedAt
                ? dayjs(String(a.confirmedAt)).format("DD/MM/YYYY HH:mm")
                : null
              const status = a ? String(a.status ?? "Chưa gán") : "Chưa gán"
              const notes = a?.notes ? String(a.notes) : null

              const statusMap: Record<string, { label: string; className: string }> = {
                unassigned: { label: "Chưa gán", className: "bg-neutral-100 text-neutral-600" },
                assigned: { label: "Đã gán", className: "bg-blue-50 text-blue-700" },
                confirmed: { label: "Đã xác nhận", className: "bg-amber-50 text-amber-700" },
                needSupplement: { label: "Cần bổ sung", className: "bg-red-50 text-red-700" },
                extracted: { label: "Đã bóc tách", className: "bg-purple-50 text-purple-700" },
                completed: { label: "Hoàn thành", className: "bg-green-50 text-green-700" },
                exported: { label: "Đã xuất", className: "bg-neutral-100 text-neutral-600" },
              }
              const normalizedStatus = status.toLowerCase()
              const statusInfo = statusMap[normalizedStatus] ?? { label: status, className: "bg-neutral-100 text-neutral-600" }

              return (
                <div className="space-y-4">
                  {/* Mail Info */}
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3 space-y-2">
                    <div>
                      <span className="text-xs text-neutral-400">Tiêu đề</span>
                      <p className="text-sm font-medium text-neutral-800">{subject}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-neutral-400">Người gửi</span>
                        <p className="text-sm text-neutral-700">{fromName} &lt;{fromEmail}&gt;</p>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-400">Nhận lúc</span>
                        <p className="text-sm text-neutral-700">{receivedAt}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Status */}
                  <div className="rounded-lg border border-neutral-100 bg-white p-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Trạng thái phân công</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      {assignedAt && <span className="text-xs text-neutral-400">Gán: {assignedAt}</span>}
                      {confirmedAt && <span className="text-xs text-neutral-400">Xác nhận: {confirmedAt}</span>}
                      {completedAt && <span className="text-xs text-green-600">Hoàn tất: {completedAt}</span>}
                    </div>
                    {notes && (
                      <div>
                        <span className="text-xs text-neutral-400">Ghi chú</span>
                        <p className="text-sm text-neutral-700">{notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  {attachments && attachments.length > 0 && (
                    <div className="rounded-lg border border-neutral-100 bg-white p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        File đính kèm ({attachments.length})
                      </p>
                      <div className="space-y-1">
                        {attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center gap-2 rounded-md bg-neutral-50 px-2 py-1.5 text-xs">
                            <Paperclip className="h-3 w-3 text-neutral-400" />
                            <span className="flex-1 truncate text-neutral-700">
                              {String(att.fileName ?? att.name ?? `attachment-${idx + 1}`)}
                            </span>
                            <span className="text-neutral-400">
                              {att.fileSize ? `${Math.round(Number(att.fileSize) / 1024)} KB` : ""}
                            </span>
                            <span className="text-neutral-400">
                              {String(att.contentType ?? att.mimeType ?? "")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Body */}
                  {body && (
                    <div className="rounded-lg border border-neutral-100 bg-white p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Nội dung mail</p>
                      <div className="max-h-[300px] overflow-y-auto rounded-md bg-neutral-50 p-2 text-xs text-neutral-700 whitespace-pre-wrap">
                        {String(body)}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
