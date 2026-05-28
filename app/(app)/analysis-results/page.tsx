"use client"
// USER ROUTE: Xem kết quả AI xử lý email (phân loại, trích xuất) — user

import { useState } from "react"
import Link from "next/link"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { useAnalysisResultsQuery } from "@/hooks/use-mail-queries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search, ThumbsUp, ThumbsDown, Eye, ChevronLeft, ChevronRight } from "lucide-react"

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "notStarted", label: "Chưa bắt đầu" },
  { value: "processing", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn thành" },
  { value: "pendingReview", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "failed", label: "Thất bại" },
]

const categoryOptions = [
  { value: "all", label: "Tất cả category" },
  { value: "businessDocument", label: "Business Document" },
  { value: "orderRequest", label: "Order Request" },
  { value: "supportRequest", label: "Support Request" },
  { value: "notification", label: "Notification" },
  { value: "systemMail", label: "System Mail" },
  { value: "spam", label: "Spam" },
  { value: "unknown", label: "Unknown" },
]

const statusLabelMap: Record<string, string> = {
  notStarted: "Chưa bắt đầu",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  pendingReview: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  failed: "Thất bại",
}

const statusColorMap: Record<string, string> = {
  notStarted: "bg-gray-50 text-gray-700",
  processing: "bg-blue-50 text-blue-700",
  completed: "bg-blue-50 text-blue-700",
  pendingReview: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  failed: "bg-red-50 text-red-700",
}

export default function AnalysisResultsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const analysisQuery = useAnalysisResultsQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    page,
    pageSize,
  })

  const results = analysisQuery.data ?? []

  const visibleResults = search.trim()
    ? results.filter((item) =>
        item.mailMessageId?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase())
      )
    : results

  const totalItems = visibleResults.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const visiblePageNumbers = pageNumbers.filter((pageNumber) => {
    if (totalPages <= 7) return true
    if (pageNumber <= 2 || pageNumber > totalPages - 2) return true
    if (Math.abs(pageNumber - page) <= 1) return true
    return false
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Kết quả phân tích AI</h1>
      </div>

      {analysisQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(analysisQuery.error, "Không tải được kết quả phân tích.")}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-100" />
          <input
            type="text"
            placeholder="Tìm kiếm theo message ID, category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-neutral-100 bg-white py-2 pl-9 pr-4 text-sm text-neutral-800 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
          <Filter className="h-4 w-4 text-neutral-200" />
          <Select
            value={statusFilter}
            onValueChange={(value: string) => {
              setStatusFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[170px] text-neutral-800">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(value: string) => {
              setCategoryFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[190px] text-neutral-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Email ID</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Category</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Intent</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Độ tin cậy</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Thời gian</th>
                <th className="px-4 py-3 text-right font-medium text-white/80">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {analysisQuery.isPending && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-200">
                    Đang tải...
                  </td>
                </tr>
              )}

              {!analysisQuery.isPending && visibleResults.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-200">
                    Không tìm thấy kết quả nào
                  </td>
                </tr>
              )}

              {visibleResults.map((result) => {
                const status = result.status ?? "notStarted"
                const statusClass = statusColorMap[status] ?? "bg-gray-50 text-gray-700"
                const confidence = result.confidenceScore ?? 0
                return (
                  <tr key={result.id} className="cursor-pointer transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-neutral-300">{result.mailMessageId || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-200 capitalize">{result.category || "—"}</td>
                    <td className="px-4 py-3 text-neutral-200 capitalize">{result.detectedIntent || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.round(confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-200">{Math.round(confidence * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                        {statusLabelMap[status] || status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">
                      {result.createdAt ? dayjs(result.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {result.mailMessageId && (
                          <Link
                            href={`/emails/${result.mailMessageId}/extract`}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                          >
                            <Eye className="h-3 w-3" /> Xem
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {analysisQuery.isPending && (
            <div className="px-4 py-8 text-center text-sm text-neutral-200">Đang tải...</div>
          )}

          {!analysisQuery.isPending && visibleResults.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-neutral-200">Không tìm thấy kết quả nào</div>
          )}

          {visibleResults.map((result) => {
            const status = result.status ?? "notStarted"
            const statusClass = statusColorMap[status] ?? "bg-gray-50 text-gray-700"
            const confidence = result.confidenceScore ?? 0
            return (
              <div key={result.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="wrap-break-word text-sm font-medium text-neutral-300">
                    {result.mailMessageId || "—"}
                  </p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                    {statusLabelMap[status] || status}
                  </span>
                </div>
                <p className="text-xs text-neutral-200 capitalize">
                  {result.category || "—"} · {result.detectedIntent || "—"}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(confidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-200">{Math.round(confidence * 100)}%</span>
                </div>
                <p className="text-xs text-neutral-200">
                  {result.createdAt ? dayjs(result.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                </p>
                {result.mailMessageId && (
                  <Link
                    href={`/emails/${result.mailMessageId}/extract`}
                    className="inline-flex cursor-pointer items-center rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    <Eye className="h-3 w-3" /> Xem
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-200 sm:text-sm">
            Trang <span className="font-medium text-neutral-300">{page}</span> /{" "}
            <span className="font-medium text-neutral-300">{totalPages}</span> · Tổng{" "}
            <span className="font-medium text-neutral-300">{totalItems}</span> kết quả
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setPage((previousPage) => Math.max(1, previousPage - 1))}
              disabled={page === 1}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {visiblePageNumbers.map((pageNumber, index) => {
              const previousPageNumber = visiblePageNumbers[index - 1]
              const shouldShowGap = previousPageNumber && pageNumber - previousPageNumber > 1
              return (
                <div key={pageNumber} className="flex items-center gap-1">
                  {shouldShowGap ? <span className="px-1 text-neutral-200">…</span> : null}
                  <button
                    onClick={() => setPage(pageNumber)}
                    className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                      pageNumber === page
                        ? "bg-primary text-white"
                        : "border border-neutral-100 bg-white text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                </div>
              )
            })}
            <button
              onClick={() => setPage((previousPage) => Math.min(totalPages, previousPage + 1))}
              disabled={page === totalPages}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
