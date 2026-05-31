"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
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
  Sparkles,
  ChevronRight,
  Clock,
  FileCheck,
  Archive,
  Eye,
  Package,
  Ship,
  Hash,
  MessageCircle,
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

const STATUS_CONFIG: Record<
  TicketDraftStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Nháp",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: <FileText className="h-3 w-3" />,
  },
  reviewing: {
    label: "Đang xem xét",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    icon: <Eye className="h-3 w-3" />,
  },
  pending_confirm: {
    label: "Chờ xác nhận",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    icon: <Clock className="h-3 w-3" />,
  },
  archived: {
    label: "Đã lưu",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    icon: <Archive className="h-3 w-3" />,
  },
}

export default function DraftsPage() {
  const { drafts, searchDrafts, updateDraft, seedDummyData } = useTicketDraftStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketDraftStatus | "all">("all")
  const [selectedDraft, setSelectedDraft] = useState<TicketDraft | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // RAG Chat
  const [ragQuery, setRagQuery] = useState("")
  const [ragLoading, setRagLoading] = useState(false)
  const [ragMessages, setRagMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([])
  const [chatOpen, setChatOpen] = useState(false)

  // Auto-seed
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

  const stats = useMemo(() => {
    return {
      total: drafts.length,
      draft: drafts.filter((d) => d.status === "draft").length,
      reviewing: drafts.filter((d) => d.status === "reviewing").length,
      pending: drafts.filter((d) => d.status === "pending_confirm").length,
      archived: drafts.filter((d) => d.status === "archived").length,
    }
  }, [drafts])

  const openDetail = (draft: TicketDraft) => {
    setSelectedDraft(draft)
    setDetailOpen(true)
  }

  const handleRagSearch = async () => {
    if (!ragQuery.trim()) return
    const query = ragQuery.trim()
    setRagQuery("")
    setRagLoading(true)

    setRagMessages((prev) => [...prev, { role: "user" as const, content: query }])

    const relevantDrafts = searchDrafts(query).slice(0, 3)
    const context = relevantDrafts
      .map((d, i) => {
        const dataText = Object.entries(d.extractedData)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
        return `[Hồ sơ ${i + 1}]\n${dataText}`
      })
      .join("\n\n")

    setTimeout(() => {
      const hasResults = relevantDrafts.length > 0
      const answer = hasResults
        ? `Dựa trên ${relevantDrafts.length} hồ sơ tìm thấy:\n\n${context}\n\nBạn có muốn tôi phân tích thêm không?`
        : "Không tìm thấy hồ sơ nào liên quan."
      setRagMessages((prev) => [...prev, { role: "assistant", content: answer }])
      setRagLoading(false)
    }, 800)
  }

  return (
    <div className="flex h-full max-h-full flex-col gap-5 overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <Link
          href="/emails"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-neutral-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại Email
        </Link>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Hồ sơ xử lý
            </h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              {filteredDrafts.length} hồ sơ đã lưu · Quản lý và tra cứu bằng AI
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "Tổng", value: stats.total, color: "bg-white border-neutral-200 text-neutral-700" },
            { label: "Nháp", value: stats.draft, color: "bg-slate-50 border-slate-200 text-slate-600" },
            { label: "Đang xem xét", value: stats.reviewing, color: "bg-blue-50 border-blue-200 text-blue-600" },
            { label: "Chờ xác nhận", value: stats.pending, color: "bg-amber-50 border-amber-200 text-amber-600" },
            { label: "Đã lưu", value: stats.archived, color: "bg-emerald-50 border-emerald-200 text-emerald-600" },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() =>
                setStatusFilter(
                  s.label === "Tổng"
                    ? "all"
                    : s.label === "Nháp"
                      ? "draft"
                      : s.label === "Đang xem xét"
                        ? "reviewing"
                        : s.label === "Chờ xác nhận"
                          ? "pending_confirm"
                          : "archived"
                )
              }
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:shadow-sm ${s.color} ${
                (s.label === "Tổng" && statusFilter === "all") ||
                (s.label === "Nháp" && statusFilter === "draft") ||
                (s.label === "Đang xem xét" && statusFilter === "reviewing") ||
                (s.label === "Chờ xác nhận" && statusFilter === "pending_confirm") ||
                (s.label === "Đã lưu" && statusFilter === "archived")
                  ? "ring-2 ring-primary/30 shadow-sm"
                  : ""
              }`}
            >
              <span>{s.label}</span>
              <span className="rounded-full bg-white/80 px-1.5 py-0 text-[10px] font-bold">
                {s.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        {/* Search */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tờ khai, khách hàng, mã hàng..."
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 shadow-sm">
            <Filter className="h-3.5 w-3.5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TicketDraftStatus | "all")
              }
              className="bg-transparent text-xs font-medium text-neutral-700 outline-none"
            >
              <option value="all">Tất cả</option>
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50">
                <FileText className="h-6 w-6 text-neutral-300" />
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-600">
                {searchQuery || statusFilter !== "all"
                  ? "Không tìm thấy hồ sơ phù hợp"
                  : "Chưa có hồ sơ nào được lưu"}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
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
                  className="mt-4 cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 hover:shadow"
                >
                  Tạo dữ liệu mẫu
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredDrafts.map((draft) => {
                const status = STATUS_CONFIG[draft.status]
                return (
                  <button
                    key={draft.id}
                    onClick={() => openDetail(draft)}
                    className="group cursor-pointer rounded-2xl border border-neutral-100 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.bg} ${status.text} ${status.border}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Calendar className="h-3 w-3" />
                        {dayjs(draft.createdAt).format("DD/MM/YY")}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 text-sm font-semibold text-neutral-800">
                      {draft.extractedData?.khachHang ||
                        draft.extractedData?.customer ||
                        "Không tên"}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {draft.emailSubject || "Không tiêu đề"}
                    </p>

                    {/* Fields */}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        {
                          icon: <Hash className="h-3 w-3" />,
                          label: "Tờ khai",
                          value: draft.extractedData?.soToKhai,
                        },
                        {
                          icon: <Package className="h-3 w-3" />,
                          label: "Loại hàng",
                          value: draft.extractedData?.loaiHang,
                        },
                        {
                          icon: <Ship className="h-3 w-3" />,
                          label: "Cảng",
                          value: draft.extractedData?.cangXuatNhap,
                        },
                      ].map((field) => (
                        <div
                          key={field.label}
                          className="rounded-lg bg-neutral-50 px-2.5 py-2"
                        >
                          <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                            {field.icon}
                            {field.label}
                          </div>
                          <p className="mt-0.5 truncate text-[11px] font-medium text-neutral-700">
                            {field.value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                        <FileText className="h-3 w-3" />
                        {draft.attachments.length} tệp
                      </div>
                      <ChevronRight className="h-4 w-4 text-neutral-300 transition group-hover:text-primary" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Chat Widget */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/30 transition hover:scale-105 hover:shadow-2xl hover:shadow-primary/40"
          title="AI Tra cứu"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      )}

      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-2xl shadow-neutral-200">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 bg-primary px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">AI Tra cứu</h2>
                <p className="text-[10px] text-white/70">RAG — Tìm kiếm trong hồ sơ</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {ragMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <Bot className="h-6 w-6 text-primary/70" />
                </div>
                <p className="mt-3 text-sm font-medium text-neutral-600">
                  Bắt đầu tra cứu
                </p>
                <p className="mt-1 max-w-[220px] text-[11px] leading-relaxed text-neutral-400">
                  Ví dụ: “Tờ khai TK25 có bao nhiêu container?”
                </p>
              </div>
            )}
            {ragMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-primary text-white shadow-sm"
                      : "rounded-bl-md border border-neutral-100 bg-white text-neutral-700 shadow-sm"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </pre>
                </div>
                {msg.role === "user" && (
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {ragLoading && (
              <div className="flex items-center gap-1.5 py-1 pl-9">
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

          {/* Input */}
          <div className="shrink-0 border-t border-neutral-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 transition focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10">
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
                className="flex-1 bg-transparent text-xs text-neutral-800 outline-none placeholder:text-neutral-400"
              />
              <button
                onClick={() => void handleRagSearch()}
                disabled={ragLoading || !ragQuery.trim()}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-[800px] overflow-y-auto rounded-2xl border border-neutral-200 p-0 shadow-xl">
          <DialogHeader className="border-b border-neutral-100 bg-gradient-to-r from-primary/5 to-transparent px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-neutral-900">
                  Chi tiết hồ sơ
                </DialogTitle>
                {selectedDraft?.emailSubject && (
                  <p className="mt-1 text-xs text-neutral-500">
                    {selectedDraft.emailSubject}
                  </p>
                )}
              </div>
              <button
                onClick={() => setDetailOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          {selectedDraft && (
            <div className="space-y-5 px-6 py-5">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-500">Trạng thái:</span>
                <select
                  value={selectedDraft.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as TicketDraftStatus
                    updateDraft(selectedDraft.id, { status: newStatus })
                    setSelectedDraft({ ...selectedDraft, status: newStatus })
                  }}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="draft">Nháp</option>
                  <option value="reviewing">Đang xem xét</option>
                  <option value="pending_confirm">Chờ xác nhận</option>
                  <option value="archived">Đã lưu</option>
                </select>
              </div>

              {/* Data */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-800">
                  <FileCheck className="h-4 w-4 text-primary" />
                  Thông tin bóc tách
                </h3>
                <div className="overflow-hidden rounded-xl border border-neutral-100">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(selectedDraft.extractedData).map(
                        ([key, value]) => (
                          <tr key={key} className="border-b border-neutral-50 last:border-b-0">
                            <th className="w-[38%] bg-neutral-50/50 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                              {key}
                            </th>
                            <td className="px-4 py-2.5 text-sm font-medium text-neutral-800">
                              {value || <span className="text-neutral-300">—</span>}
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
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-800">
                    <FileText className="h-4 w-4 text-primary" />
                    Tệp đính kèm
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDraft.attachments.map((att) => (
                      <span
                        key={att.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs text-neutral-600"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary/60" />
                        {att.fileName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Link */}
              <Link
                href={`/emails/${selectedDraft.emailId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Xem email gốc
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
