"use client"

import * as React from "react"
import { X, Download, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface FileViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileUrl: string
  fileName?: string
  fileType?: string
}

export function FileViewerModal({ open, onOpenChange, fileUrl, fileName, fileType }: FileViewerModalProps) {
  const getFileType = (url: string, type?: string) => {
    if (type) return type
    const ext = url.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) return 'image'
    if (['doc', 'docx'].includes(ext || '')) return 'word'
    if (['xls', 'xlsx'].includes(ext || '')) return 'excel'
    if (['ppt', 'pptx'].includes(ext || '')) return 'powerpoint'
    return 'unknown'
  }

  const type = getFileType(fileUrl, fileType)

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <div className="flex items-center justify-center bg-black/5 rounded-lg p-4">
            <img 
              src={fileUrl} 
              alt={fileName || "Preview"} 
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        )

      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-[85vh] rounded-lg border"
            title={fileName || "PDF Preview"}
          />
        )

      case 'word':
      case 'excel':
      case 'powerpoint':
        // Sử dụng Office Online Viewer cho Office files
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
        return (
          <iframe
            src={officeViewerUrl}
            className="w-full h-[85vh] rounded-lg border"
            title={fileName || "Office Document Preview"}
          />
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[85vh] bg-muted rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-muted-foreground mb-4">Không thể xem trước file này</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              Mở file trong tab mới
            </a>
          </div>
        )
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4">{fileName || "Xem file"}</DialogTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Tải xuống
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
                Đóng
              </button>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
