"use client"

import { Bot, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AiExtractionSummary as AiSummaryType } from "@/lib/ceo/types"

interface Props {
  data: AiSummaryType
}

export function AiExtractionSummary({ data }: Props) {
  return (
    <Card className="border-neutral-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-neutral-700">Thống kê AI bóc tách chứng từ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <Bot className="h-4 w-4 text-violet-500" />
            <div>
              <p className="text-sm font-bold text-neutral-800">{data.totalFiles}</p>
              <p className="text-[10px] text-neutral-500">Tổng file</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-emerald-700">{data.success}</p>
              <p className="text-[10px] text-emerald-600">Thành công</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-amber-700">{data.needReview}</p>
              <p className="text-[10px] text-amber-600">Cần review</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 p-3">
            <XCircle className="h-4 w-4 text-rose-500" />
            <div>
              <p className="text-sm font-bold text-rose-700">{data.failed}</p>
              <p className="text-[10px] text-rose-600">Lỗi</p>
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="text-[11px] text-neutral-500">Loại chứng từ</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Tổng</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Thành công</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Cần review</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Lỗi</TableHead>
                <TableHead className="text-[11px] text-neutral-500 text-right">Tỷ lệ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byDocumentType.map((row) => (
                <TableRow key={row.documentType} className="text-xs">
                  <TableCell className="font-medium text-neutral-700">{row.documentType}</TableCell>
                  <TableCell className="text-right text-neutral-600">{row.total}</TableCell>
                  <TableCell className="text-right text-emerald-600">{row.success}</TableCell>
                  <TableCell className="text-right text-amber-600">{row.needReview}</TableCell>
                  <TableCell className="text-right text-rose-600">{row.failed}</TableCell>
                  <TableCell className="text-right text-neutral-700">{row.successRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
