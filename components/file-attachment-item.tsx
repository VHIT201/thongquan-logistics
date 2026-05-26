"use client"

import * as React from "react"
import { FileText, FileImage, FileSpreadsheet, FileCode, Download, Check, Square, CheckSquare } from "lucide-react"
import { Card } from "@/components/ui/card"

interface FileAttachmentItemProps {
  id: string
  fileName: string
  fileType: string
  fileSize: string
  isChecked?: boolean
  onCheckChange?: (checked: boolean) => void
  onViewExtract?: () => void
  onViewContent?: () => void
  onDownload?: () => void
  status?: "pending" | "completed" | "error"
}

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase()
  if (type.includes("image") || ["png", "jpg", "jpeg", "gif", "webp"].some((ext) => type.includes(ext)))
    return <FileImage className="h-4 w-4 text-primary" />
  if (type.includes("excel") || type.includes("csv") || type.includes("sheet"))
    return <FileSpreadsheet className="h-4 w-4 text-primary" />
  if (type.includes("json") || type.includes("xml") || type.includes("html"))
    return <FileCode className="h-4 w-4 text-primary" />
  return <FileText className="h-4 w-4 text-primary" />
}

export function FileAttachmentItem({
  id,
  fileName,
  fileType,
  fileSize,
  isChecked = false,
  onCheckChange,
  onViewExtract,
  onViewContent,
  onDownload,
  status = "completed",
}: FileAttachmentItemProps) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 min-w-0 overflow-hidden hover:border-neutral-200 transition-colors">
      {/* Row 1: checkbox + icon + title + type/size + status */}
      <div className="flex items-start gap-3 min-w-0 overflow-hidden">
        {/* Selection */}
        {onCheckChange && (
          <button
            onClick={() => onCheckChange(!isChecked)}
            className={`flex shrink-0 h-8 w-8 mt-0.5 items-center justify-center rounded-md border transition-colors ${
              isChecked
                ? "border-primary bg-primary text-white"
                : "border-neutral-100 bg-white text-neutral-200 hover:border-primary/50 hover:text-primary"
            }`}
          >
            {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          </button>
        )}

        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 mt-0.5 items-center justify-center rounded-lg bg-primary-50">
          {getFileIcon(fileType)}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0 overflow-hidden" style={{ minWidth: 0 }}>
          <div className="text-sm font-medium text-neutral-300 leading-snug wrap-break-word overflow-hidden max-h-[3.9em]">
            {fileName}
          </div>
          <div className="flex items-center gap-2 mt-1 min-w-0">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wide truncate max-w-[100px]">
              {fileType}
            </span>
            <span className="text-[11px] text-neutral-200 shrink-0">{fileSize}</span>
          </div>
        </div>

        {/* Status */}
        {status === "completed" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 shrink-0 mt-0.5">
            <Check className="h-3 w-3" /> Đã xong
          </span>
        )}
      </div>

      {/* Row 2: actions */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-neutral-100">
        {onViewExtract && (
          <button
            onClick={onViewExtract}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-100 bg-white px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
          >
            <FileText className="h-3.5 w-3.5" />
            Trích xuất
          </button>
        )}
        {onViewContent && (
          <button
            onClick={onViewContent}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-100 bg-white px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
          >
            <FileText className="h-3.5 w-3.5" />
            Xem nội dung
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-100 bg-white px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Tải xuống
          </button>
        )}
      </div>
    </div>
  )
}
