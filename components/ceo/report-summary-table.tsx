"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReportRow } from "@/lib/ceo/types"

interface Props {
  rows: ReportRow[]
}

export function ReportSummaryTable({ rows }: Props) {
  const handleExport = () => {
    const headers = ["STT", "Khách hàng", "Invoice", "Bill", "Booking", "Loại", "Nhân viên", "Trạng thái", "Ngày nhận", "Ngày hoàn tất", "Ghi chú"]
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [r.stt, r.customerName, r.invoice, r.bill, r.booking, r.type, r.employee, r.status, r.receivedDate, r.completedDate, r.notes]
          .map((v) => `"${String(v).replace(/"/g, "\"\"")}"`)
          .join(",")
      ),
    ].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bao-cao-tong-hop.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-neutral-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-neutral-700">Báo cáo tổng hợp</CardTitle>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />
          Xuất CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="text-[11px] text-neutral-500 w-10">STT</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Khách hàng</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Invoice</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Bill</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Booking</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Loại</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Nhân viên</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Trạng thái</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Ngày nhận</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Ngày HT</TableHead>
                <TableHead className="text-[11px] text-neutral-500">Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.stt} className="text-xs">
                  <TableCell className="text-neutral-600">{row.stt}</TableCell>
                  <TableCell className="font-medium text-neutral-700">{row.customerName}</TableCell>
                  <TableCell className="text-neutral-600">{row.invoice}</TableCell>
                  <TableCell className="text-neutral-600">{row.bill}</TableCell>
                  <TableCell className="text-neutral-600">{row.booking}</TableCell>
                  <TableCell className="text-neutral-600">{row.type}</TableCell>
                  <TableCell className="text-neutral-600">{row.employee}</TableCell>
                  <TableCell className="text-neutral-600">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        row.status === "Hoàn tất"
                          ? "bg-emerald-50 text-emerald-700"
                          : row.status === "Đang xử lý"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-neutral-600">{row.receivedDate}</TableCell>
                  <TableCell className="text-neutral-600">{row.completedDate}</TableCell>
                  <TableCell className="text-neutral-500">{row.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
