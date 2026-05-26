"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { AlertTriangle, ArrowLeft, CheckCircle, FileSpreadsheet, Save, ThumbsDown, ThumbsUp } from "lucide-react"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAnalysisResultQuery,
  useApproveAnalysisMutation,
  useLatestAnalysisByMessageIdQuery,
  useRejectAnalysisMutation,
  useUpdateAnalysisFieldsMutation,
} from "@/hooks/use-mail-queries"

export default function ExtractPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const messageId = params.id
  const analysisIdFromQuery = searchParams.get("analysisId")
  const latestAnalysisQuery = useLatestAnalysisByMessageIdQuery(analysisIdFromQuery ? null : messageId)
  const analysisId = analysisIdFromQuery ?? latestAnalysisQuery.data?.id ?? null

  const analysisQuery = useAnalysisResultQuery(analysisId)
  const updateFieldsMutation = useUpdateAnalysisFieldsMutation(analysisId)
  const approveMutation = useApproveAnalysisMutation(analysisId)
  const rejectMutation = useRejectAnalysisMutation(analysisId)

  const [fields, setFields] = useState<Record<string, string>>({})
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    const extractedFields = analysisQuery.data?.extractedFields ?? {}
    setFields(extractedFields)
  }, [analysisQuery.data?.extractedFields])

  const missingFields = useMemo(() => analysisQuery.data?.missingFields ?? [], [analysisQuery.data?.missingFields])
  const warnings = useMemo(() => analysisQuery.data?.warnings ?? [], [analysisQuery.data?.warnings])

  const handleFieldChange = (key: string, value: string) => {
    setFields((previousState) => ({ ...previousState, [key]: value }))
  }

  const handleSave = async () => {
    try {
      if (!analysisId) return
      setSaveMessage(null)
      await updateFieldsMutation.mutateAsync(fields)
      setSaveMessage("Đã lưu chỉnh sửa.")
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Lưu chỉnh sửa thất bại."))
    }
  }

  const handleApprove = async () => {
    try {
      if (!analysisId) return
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "admin-ui" : "admin-ui"
      await approveMutation.mutateAsync(userId)
      setSaveMessage("Đã duyệt kết quả bóc tách.")
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Duyệt kết quả thất bại."))
    }
  }

  const handleReject = async () => {
    try {
      if (!analysisId) return
      const reason = window.prompt("Lý do từ chối (có thể bỏ trống):") ?? ""
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "admin-ui" : "admin-ui"
      await rejectMutation.mutateAsync({ userId, reason: reason || undefined })
      setSaveMessage("Đã từ chối kết quả bóc tách.")
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Từ chối kết quả thất bại."))
    }
  }

  const handleExport = () => {
    const csv = Object.entries(fields)
      .map(([key, value]) => `${key},${value}`)
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `extract-${messageId}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (latestAnalysisQuery.isPending && !analysisIdFromQuery) {
    return <div className="text-sm text-neutral-200">Đang tìm kết quả phân tích gần nhất...</div>
  }

  if (!analysisId) {
    return (
      <div className="space-y-3">
        <Link href={`/emails/${messageId}`} className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại email
        </Link>
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Chưa có kết quả phân tích. Vui lòng bấm <strong>Gửi AI bóc tách</strong> từ màn chi tiết email.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/emails/${messageId}`} className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại email
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            disabled={updateFieldsMutation.isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {updateFieldsMutation.isPending ? "Đang lưu..." : "Lưu chỉnh sửa"}
          </button>
          <button
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsUp className="h-4 w-4" />
            {approveMutation.isPending ? "Đang duyệt..." : "Duyệt"}
          </button>
          <button
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsDown className="h-4 w-4" />
            {rejectMutation.isPending ? "Đang từ chối..." : "Từ chối"}
          </button>
          <button
            id="tour-extract-export"
            onClick={handleExport}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{saveMessage}</div>
      )}

      {analysisQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(analysisQuery.error, "Không tải được kết quả bóc tách.")}
        </div>
      )}

      <div id="tour-extract-result" className="space-y-4 rounded-xl border border-neutral-100 bg-white p-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-neutral-300">Kết quả bóc tách</h1>
          <span className="rounded-full bg-[#EDF3EC] px-2.5 py-0.5 text-xs font-medium text-[#346538]">
            {analysisQuery.data?.status || "pending"}
          </span>
        </div>

        {analysisQuery.isPending && <p className="text-sm text-neutral-200">Đang tải dữ liệu phân tích...</p>}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-200">Độ tin cậy AI:</span>
          <div className="h-2 w-32 rounded-full bg-neutral-50">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${Math.round((analysisQuery.data?.confidenceScore ?? 0) * 100)}%` }}
            />
          </div>
          <span className="font-medium">
            {Math.round((analysisQuery.data?.confidenceScore ?? 0) * 100)}%
          </span>
        </div>

        {missingFields.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Thiếu thông tin:</p>
              <p>{missingFields.join(", ")}</p>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Cảnh báo:</p>
              <ul className="list-inside list-disc">
                {warnings.map((warningText, index) => (
                  <li key={index}>{warningText}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div id="tour-extract-fields" className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-200">Dữ liệu trích xuất</h3>
          <div className="grid gap-3">
            {Object.keys(fields).length === 0 && (
              <p className="text-sm text-neutral-200">Chưa có trường dữ liệu để hiển thị.</p>
            )}
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} className="grid grid-cols-1 gap-2 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
                <label className="text-sm font-medium text-neutral-200">{key}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(event) => handleFieldChange(key, event.target.value)}
                  className="rounded-lg border border-neutral-100 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1 rounded-lg bg-neutral-50 p-4 text-xs text-neutral-200">
          <p>Model: {analysisQuery.data?.modelName || "N/A"}</p>
          <p>Input tokens: {analysisQuery.data?.inputTokenCount ?? 0}</p>
          <p>Output tokens: {analysisQuery.data?.outputTokenCount ?? 0}</p>
          <p>Chi phí ước tính: ${analysisQuery.data?.costEstimate ?? 0}</p>
        </div>
      </div>
    </div>
  )
}
