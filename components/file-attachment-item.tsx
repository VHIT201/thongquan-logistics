"use client"

import * as React from "react"
import { FileText, FileImage, FileSpreadsheet, FileCode, Download, Eye, Square, CheckSquare } from "lucide-react"

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
    return <FileImage className="h-3.5 w-3.5 text-primary" />
  if (type.includes("excel") || type.includes("csv") || type.includes("sheet"))
    return <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
  if (type.includes("json") || type.includes("xml") || type.includes("html"))
    return <FileCode className="h-3.5 w-3.5 text-primary" />
  return <FileText className="h-3.5 w-3.5 text-primary" />
}

export function FileAttachmentItem({
  fileName,
  fileType,
  fileSize,
  isChecked = false,
  onCheckChange,
  onViewExtract,
  onViewContent,
  onDownload,
}: FileAttachmentItemProps) {
  return (
    <div
      className={`group relative flex flex-col gap-2 rounded-xl border p-3 transition-colors ${
        isChecked
          ? "border-primary/40 bg-primary-50"
          : "border-neutral-100 bg-white hover:border-neutral-200"
      }`}
    >
      {/* Top: checkbox + icon + type */}
      <div className="flex items-start gap-2.5">
        {onCheckChange && (
          <button
            onClick={() => onCheckChange(!isChecked)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
              isChecked
                ? "border-primary bg-primary text-white"
                : "border-neutral-200 bg-white text-neutral-300 hover:border-primary/50"
            }`}
          >
            {isChecked ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
          </button>
        )}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
          {getFileIcon(fileType)}
        </div>
        <span className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
          {fileType}
        </span>
      </div>

      {/* Name */}
      <p className="line-clamp-2 text-xs font-medium leading-snug text-neutral-700" title={fileName}>
        {fileName}
      </p>

      {/* Bottom: size + actions */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-neutral-300">{fileSize}</span>
        <div className="flex items-center gap-1">
          {onViewContent && (
            <button
              onClick={onViewContent}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-neutral-100 bg-white px-2 py-1 text-[10px] font-medium text-neutral-400 hover:text-primary hover:border-primary/30 transition-colors"
            >
              <Eye className="h-3 w-3" /> Xem
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-neutral-300 hover:text-primary transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
