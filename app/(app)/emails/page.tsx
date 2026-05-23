"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Search, Filter, AlertCircle, Clock, ChevronLeft, ChevronRight, Paperclip, Loader } from "lucide-react"
import dayjs from "dayjs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const allEmails = [
  { id: "1", subject: "Invoice #INV-001 - ABC Logistics", fromName: "ABC Logistics", fromEmail: "billing@abclogistics.com", receivedAt: "2026-05-22T09:30:00Z", processStatus: "unprocessed", hasAttachments: true },
  { id: "2", subject: "Shipping confirmation XYZ-2026", fromName: "XYZ Shipping", fromEmail: "ops@xyzshipping.com", receivedAt: "2026-05-22T08:15:00Z", processStatus: "processed", hasAttachments: false },
  { id: "3", subject: "Freight quote request", fromName: "Global Freight", fromEmail: "sales@globalfreight.com", receivedAt: "2026-05-21T16:45:00Z", processStatus: "processing", hasAttachments: false },
  { id: "4", subject: "Cargo manifest - Voyage 4521", fromName: "Ocean Cargo", fromEmail: "manifest@oceancargo.com", receivedAt: "2026-05-21T14:20:00Z", processStatus: "processed", hasAttachments: true },
  { id: "5", subject: "Delivery receipt #DR-8821", fromName: "Fast Delivery", fromEmail: "receipts@fastdelivery.com", receivedAt: "2026-05-21T11:00:00Z", processStatus: "processing", hasAttachments: true },
  { id: "6", subject: "Customs declaration #CD-1122", fromName: "Customs Dept", fromEmail: "customs@gov.vn", receivedAt: "2026-05-20T15:30:00Z", processStatus: "unprocessed", hasAttachments: true },
  { id: "7", subject: "Booking confirmation BL-7723", fromName: "Maersk Line", fromEmail: "booking@maersk.com", receivedAt: "2026-05-20T12:10:00Z", processStatus: "processed", hasAttachments: true },
  { id: "8", subject: "Warehouse inbound notice", fromName: "Saigon Depot", fromEmail: "inbound@saigondepot.vn", receivedAt: "2026-05-20T09:00:00Z", processStatus: "processing", hasAttachments: false },
  { id: "9", subject: "Payment reminder PO-4451", fromName: "Vietnam Freight", fromEmail: "finance@vietnamfreight.vn", receivedAt: "2026-05-19T17:20:00Z", processStatus: "processed", hasAttachments: true },
  { id: "10", subject: "Container release order", fromName: "Hapag-Lloyd", fromEmail: "release@hlag.com", receivedAt: "2026-05-19T14:00:00Z", processStatus: "unprocessed", hasAttachments: false },
  { id: "11", subject: "Airway bill AWB-998712", fromName: "DHL Express", fromEmail: "docs@dhl.com", receivedAt: "2026-05-19T10:45:00Z", processStatus: "processed", hasAttachments: true },
  { id: "12", subject: "Import license renewal", fromName: "Ministry of Trade", fromEmail: "licensing@moit.gov.vn", receivedAt: "2026-05-18T16:30:00Z", processStatus: "processing", hasAttachments: true },
  { id: "13", subject: "Quotation #QT-5567", fromName: "Pacific Shipping", fromEmail: "quotes@pacificship.com", receivedAt: "2026-05-18T11:15:00Z", processStatus: "processed", hasAttachments: false },
  { id: "14", subject: "Delivery delay notice", fromName: "FedEx Logistics", fromEmail: "alerts@fedex.com", receivedAt: "2026-05-18T08:00:00Z", processStatus: "unprocessed", hasAttachments: false },
  { id: "15", subject: "Insurance policy #IP-3321", fromName: "Bao Viet Insurance", fromEmail: "marine@baoviet.vn", receivedAt: "2026-05-17T15:00:00Z", processStatus: "processed", hasAttachments: true },
  { id: "16", subject: "Port clearance document", fromName: "Hai Phong Port", fromEmail: "clearance@haiphongport.vn", receivedAt: "2026-05-17T10:30:00Z", processStatus: "processing", hasAttachments: true },
]

const ITEMS_PER_PAGE = 10

const allSenders = [...new Set(allEmails.map((e) => e.fromName))].sort()

export default function EmailsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [senderFilter, setSenderFilter] = useState("all")
  const [page, setPage] = useState(1)

  const filtered = allEmails.filter((e) => {
    const matchSearch =
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.fromEmail.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (statusFilter !== "all" && statusFilter !== "hasAttachment") {
      if (e.processStatus !== statusFilter) return false
    }
    if (statusFilter === "hasAttachment" && !e.hasAttachments) return false
    if (senderFilter !== "all" && e.fromName !== senderFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const start = (page - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Danh sách Email</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div id="tour-emails-search" className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-100" />
          <input
            type="text"
            placeholder="Tìm kiếm email, người gửi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-100 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors"
          />
        </div>
        <div id="tour-emails-filter" className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-200" />
          <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[160px] h-9">
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
          <Select value={senderFilter} onValueChange={(v: string) => { setSenderFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Nhân sự" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhân sự</SelectItem>
              {allSenders.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div id="tour-emails-table" className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">Không tìm thấy email nào</td>
              </tr>
            )}
            {paginated.map((email) => {
              const status = email.processStatus
              const needsAttention = status === "unprocessed" || status === "processing"
              return (
                <tr key={email.id} className={`hover:bg-neutral-50 transition-colors ${needsAttention ? "border-l-2 border-l-primary bg-primary-50/30" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className={`h-4 w-4 ${needsAttention ? "text-primary" : "text-neutral-200"}`} />
                      <span className="font-medium text-neutral-300">{email.subject}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-200">{email.fromName}</td>
                  <td className="px-4 py-3 text-neutral-200">{dayjs(email.receivedAt).format("DD/MM/YYYY HH:mm")}</td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">
                    {email.hasAttachments ? (
                      <Paperclip className="h-4 w-4 text-primary" />
                    ) : (
                      <span className="text-neutral-100">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/emails/${email.id}`} className="inline-flex items-center rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors">
                      Xử lý
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
          <p className="text-sm text-neutral-200">
            Hiển thị <span className="font-medium text-neutral-300">{paginated.length}</span> / <span className="font-medium text-neutral-300">{filtered.length}</span> email
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-primary text-white"
                    : "border border-neutral-100 bg-white text-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
