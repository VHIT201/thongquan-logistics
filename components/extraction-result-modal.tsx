"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ViewerMode = "auto" | "google" | "office" | "proxy" | "direct"

export type ExtractionPreviewSources = {
  url?: string | null
  expiresAt?: string | null
  googleViewerUrl?: string | null
  officeViewerUrl?: string | null
  proxyUrl?: string | null
}

interface ExtractionResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: string | null
  preview?: ExtractionPreviewSources | null
  fileName?: string | null
}

type LogisticsData = {
  stt: number
  maKhachHang: string
  nhanVien: string
  khachHang: string
  congViec: string
  soToKhai: string
  loaiHinh: string
  ngayToKhai: string
  loaiHang: string
  luongTk: string
  haiQuan: string
  co: string
  soInvVat: string
  soBill: string
  soBooking: string
  soLuongKien: string
  soLuongKg: string
  soContainer20: string
  soContainer40: string
  soContainerLcl: string
  soContainerTc: string
  thongBaoPhiCsht: string
  soTienCsht: string
  cangXuatNhap: string
  ghiChu: string
  trangThaiLoHang: string
}

type LogisticsStringKey = Exclude<keyof LogisticsData, "stt">

type FieldConfig = {
  key: LogisticsStringKey
  label: string
  aliases: string[]
}

const FIELD_CONFIGS: FieldConfig[] = [
  { key: "maKhachHang", label: "MÃ KHÁCH HÀNG", aliases: ["maKhachHang", "customerCode"] },
  { key: "nhanVien", label: "NHÂN VIÊN", aliases: ["nhanVien", "staff"] },
  { key: "khachHang", label: "KHÁCH HÀNG", aliases: ["khachHang", "customer"] },
  { key: "congViec", label: "CÔNG VIỆC", aliases: ["congViec", "job"] },
  { key: "soToKhai", label: "SỐ TỜ KHAI", aliases: ["soToKhai", "declarationNo"] },
  { key: "loaiHinh", label: "LOẠI HÌNH", aliases: ["loaiHinh", "type"] },
  { key: "ngayToKhai", label: "NGÀY TỜ KHAI", aliases: ["ngayToKhai", "declarationDate"] },
  { key: "loaiHang", label: "LOẠI HÀNG", aliases: ["loaiHang", "goodsType"] },
  { key: "luongTk", label: "LUỒNG TK", aliases: ["luongTk", "customsStream"] },
  { key: "haiQuan", label: "HẢI QUAN", aliases: ["haiQuan", "customs"] },
  { key: "co", label: "C/O", aliases: ["co", "certificate"] },
  { key: "soInvVat", label: "SỐ INV/VAT", aliases: ["soInvVat", "invoiceNo"] },
  { key: "soBill", label: "SỐ BILL", aliases: ["soBill", "billNo"] },
  { key: "soBooking", label: "SỐ BOOKING", aliases: ["soBooking", "bookingNo"] },
  { key: "soLuongKien", label: "SỐ LƯỢNG (KIỆN)", aliases: ["soLuongKien", "quantityPackages"] },
  { key: "soLuongKg", label: "SỐ LƯỢNG (KG)", aliases: ["soLuongKg", "quantityKg"] },
  { key: "soContainer20", label: "CONT 20'", aliases: ["soContainer20", "container20"] },
  { key: "soContainer40", label: "CONT 40'", aliases: ["soContainer40", "container40"] },
  { key: "soContainerLcl", label: "CONT LCL", aliases: ["soContainerLcl", "containerLcl"] },
  { key: "soContainerTc", label: "CONT TC", aliases: ["soContainerTc", "containerTc"] },
  { key: "thongBaoPhiCsht", label: "THÔNG BÁO PHÍ CSHT", aliases: ["thongBaoPhiCsht", "cshtNotice"] },
  { key: "soTienCsht", label: "SỐ TIỀN CSHT", aliases: ["soTienCsht", "cshtAmount"] },
  { key: "cangXuatNhap", label: "CẢNG XUẤT - CẢNG NHẬP", aliases: ["cangXuatNhap", "port"] },
  { key: "ghiChu", label: "GHI CHÚ", aliases: ["ghiChu", "note"] },
  { key: "trangThaiLoHang", label: "TRẠNG THÁI LÔ HÀNG", aliases: ["trangThaiLoHang", "shipmentStatus"] },
]

const EMPTY_ROW: LogisticsData = {
  stt: 1,
  maKhachHang: "",
  nhanVien: "",
  khachHang: "",
  congViec: "",
  soToKhai: "",
  loaiHinh: "",
  ngayToKhai: "",
  loaiHang: "",
  luongTk: "",
  haiQuan: "",
  co: "",
  soInvVat: "",
  soBill: "",
  soBooking: "",
  soLuongKien: "",
  soLuongKg: "",
  soContainer20: "",
  soContainer40: "",
  soContainerLcl: "",
  soContainerTc: "",
  thongBaoPhiCsht: "",
  soTienCsht: "",
  cangXuatNhap: "",
  ghiChu: "",
  trangThaiLoHang: "",
}

function pickFirstString(item: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    const value = item[alias]
    if (value === null || value === undefined) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ""
}

function normalizeLogisticsRow(item: Record<string, unknown>, index: number): LogisticsData {
  const normalized: LogisticsData = { ...EMPTY_ROW, stt: index + 1 }
  for (const field of FIELD_CONFIGS) {
    normalized[field.key] = pickFirstString(item, field.aliases)
  }
  const explicitIndex = item.stt ?? item.index ?? item.no
  if (explicitIndex !== undefined && explicitIndex !== null && String(explicitIndex).trim()) {
    const parsedIndex = Number(explicitIndex)
    normalized.stt = Number.isFinite(parsedIndex) ? parsedIndex : index + 1
  }
  return normalized
}

function extractRecords(parsed: unknown): Record<string, unknown>[] {
  if (Array.isArray(parsed)) {
    return parsed.filter((entry) => entry && typeof entry === "object") as Record<string, unknown>[]
  }
  if (!parsed || typeof parsed !== "object") return []

  const asRecord = parsed as Record<string, unknown>
  const collectionCandidates = ["data", "items", "records", "results", "rows", "shipments"]
  for (const key of collectionCandidates) {
    const value = asRecord[key]
    if (Array.isArray(value)) {
      return value.filter((entry) => entry && typeof entry === "object") as Record<string, unknown>[]
    }
  }
  return [asRecord]
}

function parseResult(resultStr: string): { rows: LogisticsData[]; rawMessage: string | null } {
  try {
    const parsed = JSON.parse(resultStr) as unknown
    const records = extractRecords(parsed)
    if (records.length === 0) {
      return { rows: [], rawMessage: resultStr }
    }
    return {
      rows: records.map((record, index) => normalizeLogisticsRow(record, index)),
      rawMessage: null,
    }
  } catch {
    return { rows: [], rawMessage: resultStr }
  }
}

export function ExtractionResultModal({
  open,
  onOpenChange,
  result,
  preview,
  fileName,
}: ExtractionResultModalProps) {
  const [rows, setRows] = useState<LogisticsData[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [viewerMode, setViewerMode] = useState<ViewerMode>("auto")

  useEffect(() => {
    if (!result) {
      setRows([])
      setMessage(null)
      return
    }
    const parsed = parseResult(result)
    setRows(parsed.rows)
    setMessage(parsed.rawMessage)
  }, [result])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[94vh] max-w-[96vw] p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-black">Kết quả bóc tách thông tin logistics</DialogTitle>
          {fileName ? (
            <p className="text-sm text-neutral-600">
              Tệp: <span className="font-medium">{fileName}</span>
            </p>
          ) : null}
        </DialogHeader>

        <div className="grid h-[calc(94vh-88px)] grid-cols-1 md:grid-cols-[minmax(460px,45%)_1fr]">
          <div className="overflow-y-auto border-r p-4">
            {rows.length > 0 ? (
              <div className="space-y-4">
                {rows.map((row) => (
                  <section key={`${row.stt}-${row.soToKhai}-${row.soBill}`} className="rounded-lg border bg-white">
                    <div className="border-b bg-neutral-50 px-4 py-2">
                      <p className="text-sm font-semibold text-primary">Lô hàng #{row.stt}</p>
                    </div>
                    <div className="overflow-hidden">
                      <table className="w-full table-fixed text-sm">
                        <tbody>
                          {FIELD_CONFIGS.map((field) => (
                            <tr key={field.key} className="border-b last:border-b-0">
                              <th className="w-[46%] bg-neutral-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                {field.label}
                              </th>
                              <td className="px-3 py-2 text-neutral-800">
                                {row[field.key] ? row[field.key] : <span className="text-neutral-400">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))}
              </div>
            ) : message ? (
              <div className="rounded-lg border bg-white p-4">
                <p className="mb-2 text-sm font-medium text-neutral-700">Kết quả thô từ AI</p>
                <pre className="max-h-[68vh] overflow-auto whitespace-pre-wrap text-sm text-neutral-800">{message}</pre>
              </div>
            ) : (
              <section className="rounded-lg border bg-white">
                <div className="border-b bg-neutral-50 px-4 py-2">
                  <p className="text-sm font-semibold text-primary">Lô hàng #1</p>
                </div>
                <div className="overflow-hidden">
                  <table className="w-full table-fixed text-sm">
                    <tbody>
                      {FIELD_CONFIGS.map((field) => (
                        <tr key={field.key} className="border-b last:border-b-0">
                          <th className="w-[46%] bg-neutral-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            {field.label}
                          </th>
                          <td className="px-3 py-2 text-neutral-400">Chưa có dữ liệu</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

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
