"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, FileSpreadsheet, AlertTriangle, CheckCircle, RotateCcw } from "lucide-react"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError("")
    setImported(false)

    // Simple preview reading first 10 lines as text
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split("\n").slice(0, 10)
      setPreview(lines.map((l) => l.split(",")))
    }
    reader.readAsText(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setError("")
    try {
      // Mock import - replace with real API when BE supports it
      await new Promise((r) => setTimeout(r, 1500))
      setImported(true)
    } catch {
      setError("Import thất bại. File có thể sai định dạng.")
    } finally {
      setImporting(false)
    }
  }

  const handleRollback = () => {
    setFile(null)
    setPreview([])
    setImported(false)
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-4">
      <Link href="/reports" className="flex items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
        <ArrowLeft className="h-4 w-4" /> Quay lại Báo cáo
      </Link>

      <h1 className="text-2xl font-bold text-neutral-300">Import Dữ liệu</h1>

      <div className="rounded-xl border border-neutral-100 bg-white p-6 space-y-4">
        {/* Upload */}
        <div
          id="tour-import-upload"
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-neutral-100 p-8 text-center hover:border-primary hover:bg-neutral-50"
        >
          <Upload className="mx-auto h-8 w-8 text-neutral-200" />
          <p className="mt-2 text-sm font-medium text-neutral-200">Click để chọn file Excel/CSV</p>
          <p className="text-xs text-neutral-200">Hỗ trợ .xlsx, .csv</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {file && (
          <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3">
            <FileSpreadsheet className="h-5 w-5 text-[#346538]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-300">{file.name}</p>
              <p className="text-xs text-neutral-200">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={handleRollback} className="text-sm text-accent-200 hover:text-accent-200/80">
              Xóa
            </button>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div id="tour-import-preview">
            <h3 className="mb-2 text-sm font-medium text-neutral-200">Preview (10 dòng đầu)</h3>
            <div className="overflow-auto rounded-lg border border-neutral-100">
              <table className="w-full text-xs">
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className={i === 0 ? "bg-neutral-50 font-medium" : "border-t border-neutral-100"}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-accent-50 p-3 text-sm text-accent-200">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        {imported && (
          <div className="flex items-center gap-2 rounded-lg bg-[#EDF3EC] p-3 text-sm text-[#346538]">
            <CheckCircle className="h-4 w-4" /> Import thành công! Dữ liệu đã được thêm vào Báo cáo Tổng.
          </div>
        )}

        <div className="flex gap-2">
          <button
            id="tour-import-btn"
            onClick={handleImport}
            disabled={!file || importing || imported}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
          >
            {importing ? "Đang import..." : "Thực hiện Import"}
          </button>
          {(imported || error) && (
            <button
              onClick={handleRollback}
              className="flex items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50"
            >
              <RotateCcw className="h-4 w-4" /> Rollback / Import lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
