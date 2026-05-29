"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"
import * as XLSX from "xlsx"
import { toast } from "sonner"

export type ExtractionPreviewSources = {
  url?: string | null
  expiresAt?: string | null
  googleViewerUrl?: string | null
  officeViewerUrl?: string | null
  proxyUrl?: string | null
}

interface AttachmentItem {
  id: string
  fileName: string
  contentType?: string
  fileSize?: number
}

interface TemplateResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fields: Record<string, string>
  data: Record<string, string>
  onDataChange: (data: Record<string, string>) => void
  preview?: ExtractionPreviewSources | null
  fileName?: string | null
  templates?: Array<Record<string, unknown>>
  onExport?: () => void
  attachments?: AttachmentItem[]
  messageId?: string
}

export function TemplateResultModal({
  open,
  onOpenChange,
  fields,
  data,
  onDataChange,
  preview,
  fileName,
  templates,
  onExport,
  attachments = [],
  messageId,
}: TemplateResultModalProps) {
  const [localData, setLocalData] = useState<Record<string, string>>({})
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<ExtractionPreviewSources | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Sync localData when data changes
  const displayData = { ...data, ...localData }

  const handleChange = (key: string, value: string) => {
    const next = { ...localData, [key]: value }
    setLocalData(next)
    onDataChange({ ...data, ...next })
  }

  const exportToExcel = () => {
    const allEntries = fieldEntries.length > 0
      ? fieldEntries
      : Object.keys(displayData).map((k) => [k, k] as [string, string])
    if (allEntries.length === 0) {
      toast.error("Không có dữ liệu để xuất.")
      return
    }

    // Build a label map from all available templates to find Vietnamese labels
    const labelMap = new Map<string, string>()
    if (templates && templates.length > 0) {
      for (const t of templates) {
        const ef = t.expectedFields as Record<string, string> | null | undefined
        if (ef && typeof ef === "object") {
          for (const [key, label] of Object.entries(ef)) {
            if (!labelMap.has(key)) labelMap.set(key, label)
          }
        }
      }
    }

    const headers = allEntries.map(([key, label]) => {
      if (label && label !== key) return label
      const found = labelMap.get(key)
      return found || key
    })
    const values = allEntries.map(([key]) => displayData[key] || "")

    const ws = XLSX.utils.aoa_to_sheet([headers, values])

    // Auto-fit column widths
    const colWidths = headers.map((h, i) => {
      const headerLen = String(h).length
      const valueLen = String(values[i] || "").length
      const maxLen = Math.max(headerLen, valueLen)
      return { wch: Math.min(Math.max(maxLen + 2, 10), 60) }
    })
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Bóc tách")
    XLSX.writeFile(wb, `boc-tach-${Date.now()}.xlsx`)

    onExport?.()
  }

  const activePreview = attachmentPreview || preview

  const viewerSrc = useMemo(() => {
    return (
      activePreview?.googleViewerUrl?.trim() ||
      activePreview?.officeViewerUrl?.trim() ||
      activePreview?.proxyUrl?.trim() ||
      activePreview?.url?.trim() ||
      ""
    )
  }, [activePreview])

  const fetchPresignedUrl = async (attachmentId: string) => {
    if (!messageId) return
    setLoadingPreview(true)
    try {
      const response = await MAIL_CONNECTOR_AXIOS.get(
        `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/presigned-url`,
        { params: { expiryMinutes: 30 } }
      )
      const data =
        response.data && typeof response.data === "object"
          ? (response.data as Record<string, unknown>)
          : null
      const nestedData =
        data?.data && typeof data.data === "object"
          ? (data.data as Record<string, unknown>)
          : null
      const rawData = nestedData ?? data ?? {}
      const rawUrl =
        typeof rawData.url === "string" ? rawData.url : null
      const googleViewerUrlFromApi =
        typeof rawData.googleViewerUrl === "string" ? rawData.googleViewerUrl : null
      const officeViewerUrl =
        typeof rawData.officeViewerUrl === "string" ? rawData.officeViewerUrl : null
      const proxyUrl =
        typeof rawData.proxyUrl === "string" ? rawData.proxyUrl : null

      if (!rawUrl && !googleViewerUrlFromApi && !officeViewerUrl && !proxyUrl) {
        toast.error("Không có URL preview cho file này.")
        return
      }

      const att = attachments.find((a) => a.id === attachmentId)
      const ct = att?.contentType?.toLowerCase() ?? ""
      const isOfficeFile =
        ct.includes("word") || ct.includes("excel") || ct.includes("powerpoint") ||
        ct.includes("document") || ct.includes("sheet") || ct.includes("presentation")
      const googleViewerUrl =
        googleViewerUrlFromApi ||
        (isOfficeFile && rawUrl
          ? `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`
          : null)

      setAttachmentPreview({
        url: rawUrl,
        expiresAt: typeof rawData.expiresAt === "string" ? rawData.expiresAt : null,
        googleViewerUrl,
        officeViewerUrl,
        proxyUrl,
      })
    } catch {
      toast.error("Không thể tải preview file.")
    } finally {
      setLoadingPreview(false)
    }
  }

  // Reset khi modal đóng
  useEffect(() => {
    if (!open) {
      setSelectedAttachmentId(null)
      setAttachmentPreview(null)
    }
  }, [open])

  // Auto-select và fetch presigned URL khi modal mở lần đầu (chỉ khi preview prop không có URL)
  useEffect(() => {
    if (!open) return
    const hasPreviewUrl = !!(preview?.url || preview?.googleViewerUrl || preview?.officeViewerUrl || preview?.proxyUrl)
    if (hasPreviewUrl) {
      // preview prop đã có URL, không cần fetch
      setAttachmentPreview(null)
      return
    }
    if (attachments.length > 0 && messageId) {
      const first = attachments[0]
      setSelectedAttachmentId(first.id)
      void fetchPresignedUrl(first.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preview])

  // Build field entries: prefer passed fields, then merge from all templates, then fallback to data keys
  const templateFields = useMemo(() => {
    if (Object.entries(fields).length > 0) return Object.entries(fields)
    if (templates && templates.length > 0) {
      const merged: Record<string, string> = {}
      for (const t of templates) {
        const ef = t.expectedFields as Record<string, string> | null | undefined
        if (ef && typeof ef === "object") {
          for (const [key, label] of Object.entries(ef)) {
            if (!(key in merged)) merged[key] = label
          }
        }
      }
      if (Object.entries(merged).length > 0) return Object.entries(merged)
    }
    return Object.keys(data).map((k) => [k, k] as [string, string])
  }, [fields, templates, data])

  const fieldEntries = templateFields

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[94vh] max-w-[96vw] p-0">
        <DialogHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-black">Kết quả bóc tách</DialogTitle>
              {fileName ? (
                <p className="text-sm text-neutral-600">
                  Tệp: <span className="font-medium">{fileName}</span>
                </p>
              ) : null}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="cursor-pointer flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 shadow-sm hover:bg-neutral-100 hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
              Đóng
            </button>
          </div>
        </DialogHeader>

        <div className="grid h-[calc(94vh-88px)] grid-cols-1 md:grid-cols-[minmax(420px,40%)_1fr]">
          {/* Left: editable table */}
          <div className="overflow-y-auto border-r p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700">Thông tin đã bóc tách</p>
              <button
                type="button"
                onClick={exportToExcel}
                className="cursor-pointer rounded-md border border-emerald-600 bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
              >
                Xuất Excel
              </button>
            </div>
            {fieldEntries.length === 0 ? (
              <p className="text-sm text-neutral-400">Không có trường nào được định nghĩa trong template.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                  <tbody>
                    {fieldEntries.map(([key, label]) => (
                      <tr key={key} className="border-b last:border-b-0">
                        <th className="w-[40%] min-w-[120px] bg-neutral-50 px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500 wrap-break-word whitespace-normal align-top">
                          {label || key}
                        </th>
                        <td className="w-[60%] px-2 py-1 align-top">
                          <input
                            type="text"
                            value={displayData[key] || ""}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-xs text-neutral-800 outline-none hover:border-neutral-200 focus:border-primary focus:bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: file preview */}
          <div className="flex min-h-0 flex-col p-4">
            {/* Attachment list */}
            {attachments.length > 0 ? (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {attachments.map((att) => (
                  <button
                    key={att.id}
                    onClick={() => {
                      setSelectedAttachmentId(att.id)
                      void fetchPresignedUrl(att.id)
                    }}
                    className={`max-w-[200px] cursor-pointer truncate rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                      selectedAttachmentId === att.id
                        ? "border-primary bg-primary text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                    title={att.fileName}
                  >
                    {att.fileName}
                  </button>
                ))}
              </div>
            ) : null}

            {loadingPreview ? (
              <div className="flex h-full items-center justify-center rounded-lg border bg-neutral-50 text-sm text-neutral-500">
                Đang tải preview...
              </div>
            ) : viewerSrc ? (
              <>
                <iframe
                  src={viewerSrc}
                  className="min-h-0 w-full flex-1 rounded-lg border"
                  title={fileName || "File preview"}
                />
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <a
                    href={viewerSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-pointer rounded-md border border-neutral-200 px-2 py-1 text-neutral-700 hover:bg-neutral-50"
                  >
                    Mở tab mới
                  </a>
                  {activePreview?.expiresAt ? (
                    <span className="self-center text-neutral-500">Hết hạn: {activePreview.expiresAt}</span>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border bg-neutral-50 text-sm text-neutral-500">
                Chưa có URL preview từ presign.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
