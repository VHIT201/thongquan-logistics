"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, CheckCircle, FileSpreadsheet, Save } from "lucide-react"

const mockResult = {
  id: "res-1",
  status: "completed" as const,
  confidenceScore: 0.92,
  missingFields: ["dueDate", "taxCode"],
  warnings: ["Amount detected in multiple formats"],
  extractedFields: {
    "Invoice Number": "INV-001",
    "Amount": "12,500,000",
    "Currency": "VND",
    "Sender": "ABC Logistics",
    "Shipment ID": "SH-2026-001",
  },
  modelName: "gpt-4",
  inputTokenCount: 1240,
  outputTokenCount: 320,
  costEstimate: 0.0085,
}

export default function ExtractPage() {
  const [fields, setFields] = useState<Record<string, string>>(mockResult.extractedFields)
  const [saving, setSaving] = useState(false)

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 800)
  }

  const handleExport = () => {
    const csv = Object.entries(fields).map(([k, v]) => `${k},${v}`).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `extract-001.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/emails/1" className="flex items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại email
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Đang lưu..." : "Lưu chỉnh sửa"}
          </button>
          <button
            id="tour-extract-export"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div id="tour-extract-result" className="rounded-xl border border-neutral-100 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-neutral-300">Kết quả bóc tách</h1>
          <span className="rounded-full bg-[#EDF3EC] px-2.5 py-0.5 text-xs font-medium text-[#346538]">
            Hoàn thành
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-200">Độ tin cậy AI:</span>
          <div className="h-2 w-32 rounded-full bg-neutral-50">
            <div className="h-2 rounded-full bg-green-500" style={{ width: "92%" }} />
          </div>
          <span className="font-medium">92%</span>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Thiếu thông tin:</p>
            <p>{mockResult.missingFields.join(", ")}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Cảnh báo:</p>
            <ul className="list-disc list-inside">
              {mockResult.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        <div id="tour-extract-fields" className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-200">Dữ liệu trích xuất</h3>
          <div className="grid gap-3">
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-neutral-200">{key}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="rounded-lg border border-neutral-100 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-neutral-50 p-4 text-xs text-neutral-200 space-y-1">
          <p>Model: {mockResult.modelName}</p>
          <p>Input tokens: {mockResult.inputTokenCount}</p>
          <p>Output tokens: {mockResult.outputTokenCount}</p>
          <p>Chi phí ước tính: ${mockResult.costEstimate}</p>
        </div>
      </div>
    </div>
  )
}
