"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Loader,
  Mail,
  Paperclip,
  Search,
} from "lucide-react"
import dayjs from "dayjs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getErrorMessage } from "@/lib/get-error-message"
import { useMailAccountsQuery, useMailMessagesQuery } from "@/hooks/use-mail-queries"

const ITEMS_PER_PAGE = 10

type MailListItem = {
  id?: string | null
  subject?: string | null
  fromName?: string | null
  fromEmail?: string | null
  receivedAt?: string | null
  processStatus?: string | null
  hasAttachments?: boolean | null
}

type MailListEnvelope = {
  data?: MailListItem[]
  meta?: {
    pagination?: {
      totalPages?: number
      totalItems?: number
    }
  }
}

type MailAccountItem = {
  id?: string | null
  emailAddress?: string | null
}

export default function EmailsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [senderFilter, setSenderFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState("sentAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const { data: accountsData = [], isPending: accountsPending } = useMailAccountsQuery()
  const accounts: MailAccountItem[] = accountsData as MailAccountItem[]
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (accounts.length > 0 && !activeAccountId) {
      setActiveAccountId(accounts[0].id ?? undefined)
    }
  }, [accounts, activeAccountId])

  const processStatusFilter =
    statusFilter !== "all" && statusFilter !== "hasAttachment" ? statusFilter : undefined

  const mailQuery = useMailMessagesQuery({
    accountId: activeAccountId,
    page,
    pageSize: ITEMS_PER_PAGE,
    hasAttachment: statusFilter === "hasAttachment" ? true : undefined,
    processStatus: processStatusFilter,
    sortField,
    sortOrder,
  })

  const mailEnvelope = mailQuery.data as MailListEnvelope | undefined
  const pagedEmails = mailEnvelope?.data ?? []
  const pagination = mailEnvelope?.meta?.pagination
  const totalPages = Math.max(1, pagination?.totalPages ?? 1)
  const totalItems = pagination?.totalItems ?? pagedEmails.length

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const allSenders = useMemo(
    () => [...new Set(pagedEmails.map((email) => email.fromName).filter(Boolean) as string[])].sort(),
    [pagedEmails]
  )

  const visibleEmails = useMemo(() => {
    return pagedEmails.filter((email) => {
      const subject = email.subject || ""
      const senderEmail = email.fromEmail || ""
      const senderName = email.fromName || ""

      const keyword = search.toLowerCase()
      const matchSearch =
        subject.toLowerCase().includes(keyword) ||
        senderEmail.toLowerCase().includes(keyword) ||
        senderName.toLowerCase().includes(keyword)

      if (!matchSearch) return false
      if (senderFilter !== "all" && senderName !== senderFilter) {
        return false
      }
      return true
    })
  }, [pagedEmails, search, senderFilter])

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
    const pages = new Set([1, totalPages, page - 1, page, page + 1])
    return Array.from(pages)
      .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
      .sort((firstPage, secondPage) => firstPage - secondPage)
  }, [page, totalPages])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Danh sách Email</h1>
      </div>

      {mailQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(mailQuery.error, "Không tải được danh sách email.")}
        </div>
      )}

      {!accountsPending && !activeAccountId && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Chưa có mail account khả dụng. Kết nối account trước để tải email.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div id="tour-emails-search" className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-100" />
          <input
            type="text"
            placeholder="Tìm kiếm email, người gửi..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-neutral-100 bg-white py-2 pl-9 pr-4 text-sm text-neutral-800 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div id="tour-emails-filter" className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
          <Select
            value={activeAccountId || ""}
            onValueChange={(value: string) => {
              setActiveAccountId(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[220px] text-neutral-800">
              <SelectValue placeholder="Chọn tài khoản" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id || ""}>
                  {account.emailAddress || account.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="unprocessed">Chưa xử lý</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="processed">Đã xử lý</SelectItem>
              <SelectItem value="hasAttachment">Có đính kèm</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={senderFilter}
            onValueChange={(value: string) => {
              setSenderFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[180px] text-neutral-800">
              <SelectValue placeholder="Người gửi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả người gửi</SelectItem>
              {allSenders.map((senderName) => (
                <SelectItem key={senderName} value={senderName}>
                  {senderName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => {
              setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              setPage(1)
            }}
            title={`Sắp xếp: ${sortOrder === "desc" ? "mới nhất trước" : "cũ nhất trước"}`}
            className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-neutral-100 bg-white px-3 text-sm text-neutral-300 transition-colors hover:bg-neutral-50"
          >
            {sortOrder === "desc" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
            <span className="hidden sm:inline">{sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}</span>
          </button>
        </div>
      </div>

      <div id="tour-emails-table" className="overflow-hidden rounded-xl border border-neutral-100 bg-white">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Tiêu đề</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Người gửi</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Nhận lúc</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Đính kèm</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {(accountsPending || mailQuery.isPending) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    Đang tải email...
                  </td>
                </tr>
              )}

              {!accountsPending && !mailQuery.isPending && visibleEmails.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    Không tìm thấy email nào
                  </td>
                </tr>
              )}

              {visibleEmails.map((email) => {
                const status = email.processStatus
                const needsAttention = status === "unprocessed" || status === "processing"
                return (
                  <tr
                    key={email.id}
                    className={`cursor-pointer transition-colors hover:bg-neutral-50 ${
                      needsAttention ? "border-l-2 border-l-primary bg-primary-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className={`h-4 w-4 ${needsAttention ? "text-primary" : "text-neutral-200"}`} />
                        <span className="font-medium text-neutral-300">{email.subject || "(Không có tiêu đề)"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">{email.fromName || email.fromEmail || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-200">
                      {email.receivedAt ? dayjs(email.receivedAt).format("DD/MM/YYYY HH:mm") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {status === "unprocessed" ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <Clock className="h-3 w-3" /> Chờ xử lý
                        </span>
                      ) : status === "processing" ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                          <Loader className="h-3 w-3" /> Đang xử lý
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          <AlertCircle className="h-3 w-3" /> Đã xử lý
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {email.hasAttachments ? (
                        <Paperclip className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-neutral-100">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/emails/${email.id}`}
                        className="inline-flex cursor-pointer items-center rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                      >
                        Xử lý
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-primary/15 md:hidden">
          {(accountsPending || mailQuery.isPending) && (
            <div className="px-4 py-8 text-center text-sm text-neutral-200">Đang tải email...</div>
          )}

          {!accountsPending && !mailQuery.isPending && visibleEmails.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-neutral-200">Không tìm thấy email nào</div>
          )}

          {visibleEmails.map((email) => {
            const status = email.processStatus
            const needsAttention = status === "unprocessed" || status === "processing"
            return (
              <div key={email.id} className={`space-y-2 p-4 ${needsAttention ? "bg-primary-50/30" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="wrap-break-word text-sm font-medium text-neutral-300">
                    {email.subject || "(Không có tiêu đề)"}
                  </p>
                  {email.hasAttachments ? <Paperclip className="h-4 w-4 shrink-0 text-primary" /> : null}
                </div>
                <p className="text-xs text-neutral-200">{email.fromName || email.fromEmail || "—"}</p>
                <p className="text-xs text-neutral-200">
                  {email.receivedAt ? dayjs(email.receivedAt).format("DD/MM/YYYY HH:mm") : "—"}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    {status === "unprocessed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <Clock className="h-3 w-3" /> Chờ xử lý
                      </span>
                    ) : status === "processing" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                        <Loader className="h-3 w-3" /> Đang xử lý
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        <AlertCircle className="h-3 w-3" /> Đã xử lý
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/emails/${email.id}`}
                    className="inline-flex cursor-pointer items-center rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    Xử lý
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-200 sm:text-sm">
            Trang <span className="font-medium text-neutral-300">{page}</span> /{" "}
            <span className="font-medium text-neutral-300">{totalPages}</span> · Tổng{" "}
            <span className="font-medium text-neutral-300">{totalItems}</span> email
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setPage((previousPage) => Math.max(1, previousPage - 1))}
              disabled={!activeAccountId || page === 1}
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
              disabled={!activeAccountId || page === totalPages}
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
