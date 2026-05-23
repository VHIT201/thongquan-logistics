"use client"

import Link from "next/link"
import { FileSpreadsheet, TrendingUp, Package, DollarSign } from "lucide-react"
import dayjs from "dayjs"

const reports = [
  { id: "1", invoiceNumber: "INV-001", sender: "ABC Logistics", amount: 12500000, currency: "VND", date: "2026-05-20", status: "completed", importedAt: "2026-05-21T10:00:00Z" },
  { id: "2", invoiceNumber: "INV-002", sender: "XYZ Shipping", amount: 8750000, currency: "VND", date: "2026-05-19", status: "completed", importedAt: "2026-05-20T09:30:00Z" },
  { id: "3", invoiceNumber: "INV-003", sender: "Global Freight", amount: 15200000, currency: "VND", date: "2026-05-18", status: "completed", importedAt: "2026-05-19T14:00:00Z" },
]

const totalAmount = reports.reduce((sum, r) => sum + (r.amount || 0), 0)

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Báo cáo Tổng</h1>
        <Link
          id="tour-reports-import-btn"
          href="/reports/import"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Import dữ liệu mới
        </Link>
      </div>

      <div id="tour-reports-stats" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2.5">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-200">Tổng bản ghi</p>
              <p className="text-2xl font-bold text-neutral-300">{reports.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#EDF3EC] p-2.5">
              <DollarSign className="h-5 w-5 text-[#346538]" />
            </div>
            <div>
              <p className="text-sm text-neutral-200">Tổng giá trị</p>
              <p className="text-2xl font-bold text-neutral-300">{totalAmount.toLocaleString("vi-VN")} VND</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FBF3DB] p-2.5">
              <TrendingUp className="h-5 w-5 text-[#956400]" />
            </div>
            <div>
              <p className="text-sm text-neutral-200">Bản ghi tháng này</p>
              <p className="text-2xl font-bold text-neutral-300">{reports.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div id="tour-reports-table" className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="font-semibold text-neutral-300">Dữ liệu đã import</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Invoice #</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Người gửi</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Ngày</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-200">Số tiền</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Import lúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-300">{r.invoiceNumber}</td>
                <td className="px-4 py-3 text-neutral-200">{r.sender}</td>
                <td className="px-4 py-3 text-neutral-200">{dayjs(r.date).format("DD/MM/YYYY")}</td>
                <td className="px-4 py-3 text-right font-medium text-neutral-300">
                  {r.amount.toLocaleString("vi-VN")} {r.currency}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#EDF3EC] px-2 py-0.5 text-xs font-medium text-[#346538]">
                    Hoàn thành
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-200">{dayjs(r.importedAt).format("DD/MM/YYYY HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
