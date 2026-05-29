"use client"

import * as React from "react"
import { X, Loader } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getErrorMessage } from "@/lib/get-error-message"

interface AttachmentViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  isLoading: boolean
  error: Error | null
  content: string | null
}

export function AttachmentViewerModal({
  open,
  onOpenChange,
  title,
  isLoading,
  error,
  content,
}: AttachmentViewerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-neutral-300 truncate pr-4">
              {title}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="cursor-pointer flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 shadow-sm hover:bg-neutral-100 hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
              Đóng
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-neutral-50 p-4 min-h-0">
          {isLoading && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="flex items-center gap-2 text-sm text-neutral-200">
                <Loader className="h-4 w-4 animate-spin" />
                Đang tải nội dung...
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-sm text-red-600">
                {String(getErrorMessage(error, "Không tải được nội dung tệp."))}
              </p>
            </div>
          )}

          {!isLoading && !error && content && (
            <pre className="h-full overflow-auto whitespace-pre-wrap rounded-lg bg-white border border-neutral-100 p-4 text-xs text-neutral-300 leading-relaxed">
              {content}
            </pre>
          )}

          {!isLoading && !error && !content && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-sm text-neutral-200">Không có nội dung.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
