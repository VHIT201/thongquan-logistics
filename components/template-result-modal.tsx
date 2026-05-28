"use client"

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type ExtractionPreviewSources = {
  url?: string | null
  expiresAt?: string | null
  googleViewerUrl?: string | null
  officeViewerUrl?: string | null
  proxyUrl?: string | null
}

interface TemplateResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fields: Record<string, string>
  data: Record<string, string>
  onDataChange: (data: Record<string, string>) => void
  preview?: ExtractionPreviewSources | null
  fileName?: string | null
}

type ViewerMode = "auto" | "google" | "office" | "proxy" | "direct"

export function TemplateResultModal({
  open,
  onOpenChange,
  fields,
  data,
  onDataChange,
  preview,
  fileName,
}: TemplateResultModalProps) {
  const [viewerMode, setViewerMode] = useState<ViewerMode>("auto")
  const [localData, setLocalData] = useState<Record<string, string>>({})

  // Sync localData when data changes
  const displayData = { ...data, ...localData }

  const handleChange = (key: string, value: string) => {
    const next = { ...localData, [key]: value }
    setLocalData(next)
    onDataChange({ ...data, ...next })
  }

  const sources = useMemo(
    () => ({
      google: preview?.googleViewerUrl?.trim() || "",
      office: preview?.officeViewerUrl?.trim() || "",
      proxy: preview?.proxyUrl?.trim() || "",
      direct: preview?.url?.trim() || "",
    }),
    [preview]
  )

  const viewerSrc = useMemo(() => {
    if (viewerMode === "google" && sources.google) return sources.google
    if (viewerMode === "office" && sources.office) return sources.office
    if (viewerMode === "proxy" && sources.proxy) return sources.proxy
    if (viewerMode === "direct" && sources.direct) return sources.direct
    return sources.google || sources.office || sources.proxy || sources.direct || ""
  }, [sources, viewerMode])

  const fieldEntries = Object.entries(fields)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[94vh] max-w-[96vw] p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-black">Kết quả bóc tách</DialogTitle>
          {fileName ? (
            <p className="text-sm text-neutral-600">
              Tệp: <span className="font-medium">{fileName}</span>
            </p>
          ) : null}
        </DialogHeader>

        <div className="grid h-[calc(94vh-88px)] grid-cols-1 md:grid-cols-[minmax(420px,40%)_1fr]">
          {/* Left: editable table */}
          <div className="overflow-y-auto border-r p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700">Thông tin đã bóc tách</p>
              <p className="text-[11px] text-neutral-400">Click để sửa</p>
            </div>
            {fieldEntries.length === 0 ? (
              <p className="text-sm text-neutral-400">Không có trường nào được định nghĩa trong template.</p>
            ) : (
              <table className="w-full table-fixed text-sm">
                <tbody>
                  {fieldEntries.map(([key, label]) => (
                    <tr key={key} className="border-b last:border-b-0">
                      <th className="w-[45%] bg-neutral-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        {label || key}
                      </th>
                      <td className="px-2 py-1">
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
            )}
          </div>

          {/* Right: file preview */}
          <div className="flex min-h-0 flex-col p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewerMode("auto")}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "auto" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
              >
                Auto
              </button>
              {sources.google ? (
                <button
                  onClick={() => setViewerMode("google")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "google" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  Google Viewer
                </button>
              ) : null}
              {sources.office ? (
                <button
                  onClick={() => setViewerMode("office")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "office" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  Office Viewer
                </button>
              ) : null}
              {sources.proxy ? (
                <button
                  onClick={() => setViewerMode("proxy")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "proxy" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  Proxy
                </button>
              ) : null}
              {sources.direct ? (
                <button
                  onClick={() => setViewerMode("direct")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "direct" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  URL gốc
                </button>
              ) : null}
            </div>

            {viewerSrc ? (
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
                    className="rounded-md border border-neutral-200 px-2 py-1 text-neutral-700 hover:bg-neutral-50"
                  >
                    Mở tab mới
                  </a>
                  {preview?.expiresAt ? (
                    <span className="self-center text-neutral-500">Hết hạn: {preview.expiresAt}</span>
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
