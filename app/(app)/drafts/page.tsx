"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  FileText,
  ArrowLeft,
  Calendar,
  Filter,
  Bot,
  Send,
  User,
  X,
} from "lucide-react"
import dayjs from "dayjs"
import { toast } from "sonner"
import {
  useTicketDraftStore,
  type TicketDraft,
  type TicketDraftStatus,
} from "@/lib/stores/ticket-draft-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STATUS_LABELS: Record<TicketDraftStatus, string> = {
  draft: "Nháp",
  reviewing: "Đang xem xét",
  pending_confirm: "Chờ xác nhận",
  archived: "Đã lưu",
}

const STATUS_COLORS: Record<TicketDraftStatus, string> = {
  draft: "bg-neutral-100 text-neutral-600",
  reviewing: "bg-blue-50 text-blue-700",
  pending_confirm: "bg-amber-50 text-amber-700",
  archived: "bg-green-50 text-green-700",
}

export default function DraftsPage() {
  const router = useRouter()
  const { drafts, searchDrafts, updateDraft, seedDummyData } = useTicketDraftStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketDraftStatus | "all">("all")
  const [selectedDraft, setSelectedDraft] = useState<TicketDraft | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // RAG Chat states
  const [ragQuery, setRagQuery] = useState("")
  const [ragLoading, setRagLoading] = useState(false)
  const [ragMessages, setRagMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([])

  // Auto-seed dummy data on first visit
  const [hasSeeded, setHasSeeded] = useState(false)
  useEffect(() => {
    if (!hasSeeded && drafts.length === 0) {
      seedDummyData()
      setHasSeeded(true)
    }
  }, [drafts.length, hasSeeded, seedDummyData])

  const filteredDrafts = useMemo(() => {
    let result = searchQuery.trim() ? searchDrafts(searchQuery) : drafts
    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter)
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [drafts, searchQuery, statusFilter, searchDrafts])

  const openDetail = (draft: TicketDraft) => {
    setSelectedDraft(draft)
    setDetailOpen(true)
  }

  const handleRagSearch = async () => {
    if (!ragQuery.trim()) return
    const query = ragQuery.trim()
    setRagQuery("")
    setRagLoading(true)

    const userMsg = { role: "user" as const, content: query }
    setRagMessages((prev) => [...prev, userMsg])

    // Client-side RAG: search drafts for relevant context
    const relevantDrafts = searchDrafts(query).slice(0, 3)
    const context = relevantDrafts
      .map((d, i) => {
        const dataText = Object.entries(d.extractedData)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
        return `[Hồ sơ ${i + 1}]\n${dataText}`
      })
      .join("\n\n")

    // Simulate AI response (in real implementation, call AI API with context)
    setTimeout(() => {
      const hasResults = relevantDrafts.length > 0
      const answer = hasResults
        ? `Dựa trên ${relevantDrafts.length} hồ sơ tìm thấy:\n\n${context}\n\nBạn có muốn tôi phân tích thêm thông tin gì không?`
        : "Không tìm thấy hồ sơ nào liên quan đến câu hỏi của bạn."

      setRagMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer },
      ])
      setRagLoading(false)
    }, 800)
  }

  return (
    <div className="flex h-[calc(100dvh-100px)] flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <Link
            href="/emails"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Email
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-neutral-900">
            Hồ sơ xử lý
          </h1>
          <p className="text-sm text-neutral-500">
            {filteredDrafts.length} hồ sơ đã lưu
          </p>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-1 gap-4 xl:grid-cols-[1fr_340px] overflow-hidden">
        {/* Left: Drafts list */}
        <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm hồ sơ..."
                className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-8 pr-3 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as TicketDraftStatus | "all")
                }
                className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-700 outline-none focus:border-primary"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Nháp</option>
                <option value="reviewing">Đang xem xét</option>
                <option value="pending_confirm">Chờ xác nhận</option>
                <option value="archived">Đã lưu</option>
              </select>
            </div>
          </div>

          {/* Drafts Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {filteredDrafts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-100 bg-white p-8 text-center">
                <FileText className="h-10 w-10 text-neutral-300" />
                <p className="mt-2 text-sm text-neutral-500">
                  {searchQuery || statusFilter !== "all"
                    ? "Không tìm thấy hồ sơ phù hợp"
                    : "Chưa có hồ sơ nào được lưu"}
                </p>
                <p className="text-xs text-neutral-400">
                  {searchQuery || statusFilter !== "all"
                    ? "Thử thay đổi bộ lọc"
                    : 'Bấm "Lưu hồ sơ" trong modal bóc tách để tạo hồ sơ mới'}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <button
                    onClick={() => {
                      seedDummyData()
                      toast.success("Đã tạo 10 hồ sơ mẫu")
                    }}
                    className="mt-3 cursor-pointer rounded-md border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
                  >
                    Tạo dữ liệu mẫu
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredDrafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => openDetail(draft)}
                    className="cursor-pointer rounded-xl border border-neutral-100 bg-white p-4 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[draft.status]}`}
                          >
                            {STATUS_LABELS[draft.status]}
                          </span>
                          <span className="truncate text-sm font-medium text-neutral-800">
                            {draft.extractedData?.khachHang ||
                              draft.extractedData?.customer ||
                              "Không tên"}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-neutral-500">
                          {draft.emailSubject || "Không tiêu đề"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(draft.extractedData)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex rounded bg-neutral-50 px-1.5 py-0.5 text-[10px] text-neutral-500"
                              >
                                {key}: {value || "—"}
                              </span>
                            ))}
                        </div>
                      </div>
                      <div className="shrink-0 text-[10px] text-neutral-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dayjs(draft.createdAt).format("DD/MM")}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: RAG Chat */}
        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="border-b border-neutral-100 p-3">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <Bot className="h-3.5 w-3.5" />
              AI Tra cứu (RAG)
            </h2>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              Hỏi về bất kỳ hồ sơ nào đã lưu
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-3">
            {ragMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bot className="h-8 w-8 text-neutral-300" />
                <p className="mt-2 text-sm text-neutral-500">
                  Bắt đầu tra cứu
                </p>
                <p className="text-xs text-neutral-400">
                  Ví dụ: "Tờ khai TK25 có bao nhiêu container?"
                </p>
              </div>
            )}
            {ragMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-primary text-white"
                      : "rounded-bl-md border border-neutral-100 bg-white text-neutral-700"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </pre>
                </div>
                {msg.role === "user" && (
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {ragLoading && (
              <div className="flex items-center gap-1 py-1">
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}
          </div>

          <div className="border-t border-neutral-100 p-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    void handleRagSearch()
                  }
                }}
                disabled={ragLoading}
                placeholder="Hỏi về hồ sơ đã lưu..."
                className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 outline-none focus:border-primary focus:bg-white disabled:opacity-50"
              />
              <button
                onClick={() => void handleRagSearch()}
                disabled={ragLoading || !ragQuery.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-[800px] overflow-y-auto p-0">
          <DialogHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-black">
                  Chi tiết hồ sơ xử lý
                </DialogTitle>
                {selectedDraft?.emailSubject && (
                  <p className="mt-0.5 text-sm text-neutral-500">
                    Email: {selectedDraft.emailSubject}
                  </p>
                )}
              </div>
              <button
                onClick={() => setDetailOpen(false)}
                className="cursor-pointer flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 shadow-sm hover:bg-neutral-100"
              >
                <X className="h-3.5 w-3.5" />
                Đóng
              </button>
            </div>
          </DialogHeader>

          {selectedDraft && (
            <div className="space-y-4 p-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">Trạng thái:</span>
                <select
                  value={selectedDraft.status}
                  onChange={(e) => {
                    updateDraft(selectedDraft.id, {
                      status: e.target.value as TicketDraftStatus,
                    })
                    setSelectedDraft({
                      ...selectedDraft,
                      status: e.target.value as TicketDraftStatus,
                    })
                  }}
                  className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 outline-none focus:border-primary"
                >
                  <option value="draft">Nháp</option>
                  <option value="reviewing">Đang xem xét</option>
                  <option value="pending_confirm">Chờ xác nhận</option>
                  <option value="archived">Đã lưu</option>
                </select>
              </div>

              {/* Data table */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-neutral-700">
                  Thông tin bóc tách
                </h3>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(selectedDraft.extractedData).map(
                        ([key, value]) => (
                          <tr key={key} className="border-b last:border-b-0">
                            <th className="w-[40%] bg-neutral-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                              {key}
                            </th>
                            <td className="px-3 py-2 text-neutral-800">
                              {value || (
                                <span className="text-neutral-400">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attachments */}
              {selectedDraft.attachments.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-neutral-700">
                    Tệp đính kèm ({selectedDraft.attachments.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDraft.attachments.map((att) => (
                      <span
                        key={att.id}
                        className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-600"
                      >
                        <FileText className="h-3 w-3" />
                        {att.fileName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Email link */}
              <div>
                <Link
                  href={`/emails/${selectedDraft.emailId}`}
                  className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Xem email gốc
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
