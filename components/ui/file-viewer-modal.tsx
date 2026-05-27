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
    // Prioritize explicit type parameter (for blob URLs)
    if (type) {
      const normalizedType = type.toLowerCase()
      if (normalizedType.includes('pdf')) return 'pdf'
      if (normalizedType.includes('image')) return 'image'
      if (normalizedType.includes('word') || normalizedType.includes('document')) return 'word'
      if (normalizedType.includes('excel') || normalizedType.includes('sheet')) return 'excel'
      if (normalizedType.includes('powerpoint') || normalizedType.includes('presentation')) return 'powerpoint'
    }
    
    // Fallback to URL-based detection
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
            className="w-full h-[calc(90vh-120px)] rounded-lg border"
            title={fileName || "PDF Preview"}
          />
        )

      case 'word':
      case 'excel':
      case 'powerpoint':
        // Office Online Viewer requires publicly accessible URLs, not blob URLs
        if (fileUrl.startsWith('blob:')) {
          return (
            <div className="flex flex-col items-center justify-center h-[calc(90vh-120px)] bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Download className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể xem trước file này</h3>
              <p className="text-gray-600 mb-6 max-w-md">File Office cần URL công khai để xem trước. Vui lòng tải xuống để xem nội dung.</p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                <Download className="h-4 w-4" />
                Tải xuống file
              </button>
            </div>
          )
        }
        // Sử dụng Office Online Viewer cho Office files với public URL
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
            <DialogTitle className="truncate pr-4 text-gray-900">{fileName || "Xem file"}</DialogTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Download className="h-4 w-4" />
                Tải xuống
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
                Đóng
              </button>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-2">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
