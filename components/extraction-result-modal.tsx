"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ExtractionResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: string | null
  previewUrl?: string | null
  fileName?: string | null
}

interface LogisticsData {
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

export function ExtractionResultModal({ open, onOpenChange, result, previewUrl, fileName }: ExtractionResultModalProps) {
  const [data, setData] = useState<LogisticsData[]>([])
  const [message, setMessage] = useState<string | null>(null)

  // Parse result string into structured data
  const parseResult = (resultStr: string): LogisticsData[] => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(resultStr)
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => ({
          stt: index + 1,
          maKhachHang: item.maKhachHang || item.customerCode || "",
          nhanVien: item.nhanVien || item.staff || "",
          khachHang: item.khachHang || item.customer || "",
          congViec: item.congViec || item.job || "",
          soToKhai: item.soToKhai || item.declarationNo || "",
          loaiHinh: item.loaiHinh || item.type || "",
          ngayToKhai: item.ngayToKhai || item.declarationDate || "",
          loaiHang: item.loaiHang || item.goodsType || "",
          luongTk: item.luongTk || item.customsStream || "",
          haiQuan: item.haiQuan || item.customs || "",
          co: item.co || item.certificate || "",
          soInvVat: item.soInvVat || item.invoiceNo || "",
          soBill: item.soBill || item.billNo || "",
          soBooking: item.soBooking || item.bookingNo || "",
          soLuongKien: item.soLuongKien || item.quantityPackages || "",
          soLuongKg: item.soLuongKg || item.quantityKg || "",
          soContainer20: item.soContainer20 || item.container20 || "",
          soContainer40: item.soContainer40 || item.container40 || "",
          soContainerLcl: item.soContainerLcl || item.containerLcl || "",
          soContainerTc: item.soContainerTc || item.containerTc || "",
          thongBaoPhiCsht: item.thongBaoPhiCsht || item.cshtNotice || "",
          soTienCsht: item.soTienCsht || item.cshtAmount || "",
          cangXuatNhap: item.cangXuatNhap || item.port || "",
          ghiChu: item.ghiChu || item.note || "",
          trangThaiLoHang: item.trangThaiLoHang || item.shipmentStatus || "",
        }))
      }
      return []
    } catch {
      // If not JSON, return empty array and set message
      return []
    }
  }

  // Update data when result changes using useEffect
  useEffect(() => {
    if (result) {
      const parsedData = parseResult(result)
      if (parsedData.length > 0) {
        setData(parsedData)
        setMessage(null)
      } else {
        setData([])
        setMessage(result)
      }
    } else {
      setData([])
      setMessage(null)
    }
  }, [result])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-black">Kết quả bóc tách thông tin logistics</DialogTitle>
        </DialogHeader>
        <div className="flex h-[calc(95vh-80px)]">
          {/* Left column: Extraction results */}
          <div className="w-1/2 p-4 overflow-y-auto border-r">
            {data.length > 0 ? (
              data.map((row) => (
                <div key={row.stt} className="space-y-3 p-4 border rounded-lg bg-white mb-4">
                  <h3 className="text-lg font-semibold text-primary">Lô hàng #{row.stt}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "MÃ KHÁCH HÀNG", value: row.maKhachHang },
                      { label: "NHÂN VIÊN", value: row.nhanVien },
                      { label: "KHÁCH HÀNG", value: row.khachHang },
                      { label: "CÔNG VIỆC", value: row.congViec },
                      { label: "SỐ TỜ KHAI", value: row.soToKhai },
                      { label: "LOẠI HÌNH", value: row.loaiHinh },
                      { label: "NGÀY TỜ KHAI", value: row.ngayToKhai },
                      { label: "LOẠI HÀNG", value: row.loaiHang },
                      { label: "LUỒNG TK", value: row.luongTk },
                      { label: "HẢI QUAN", value: row.haiQuan },
                      { label: "C/O", value: row.co },
                      { label: "SỐ INV/VAT", value: row.soInvVat },
                      { label: "SỐ BILL", value: row.soBill },
                      { label: "SỐ BOOKING", value: row.soBooking },
                      { label: "SỐ LƯỢNG (KIỆN)", value: row.soLuongKien },
                      { label: "SỐ LƯỢNG (KG)", value: row.soLuongKg },
                      { label: "CONT 20'", value: row.soContainer20 },
                      { label: "CONT 40'", value: row.soContainer40 },
                      { label: "CONT LCL", value: row.soContainerLcl },
                      { label: "CONT TC", value: row.soContainerTc },
                      { label: "THÔNG BÁO PHÍ CSHT", value: row.thongBaoPhiCsht },
                      { label: "SỐ TIỀN CSHT", value: row.soTienCsht },
                      { label: "CẢNG XUẤT - CẢNG NHẬP", value: row.cangXuatNhap },
                      { label: "GHI CHÚ", value: row.ghiChu },
                      { label: "TRẠNG THÁI LÔ HÀNG", value: row.trangThaiLoHang },
                    ].map((field, idx) => (
                      <div key={idx} className="space-y-1">
                        <Label>{field.label}</Label>
                        <Input value={field.value} readOnly />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : message ? (
              <div className="p-4 border rounded-lg bg-white">
                <p className="text-black whitespace-pre-wrap">{message}</p>
              </div>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-white">
                <h3 className="text-lg font-semibold text-primary">Lô hàng #1</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "MÃ KHÁCH HÀNG", "NHÂN VIÊN", "KHÁCH HÀNG", "CÔNG VIỆC",
                    "SỐ TỜ KHAI", "LOẠI HÌNH", "NGÀY TỜ KHAI", "LOẠI HÀNG",
                    "LUỒNG TK", "HẢI QUAN", "C/O", "SỐ INV/VAT",
                    "SỐ BILL", "SỐ BOOKING", "SỐ LƯỢNG (KIỆN)", "SỐ LƯỢNG (KG)",
                    "CONT 20'", "CONT 40'", "CONT LCL", "CONT TC",
                    "THÔNG BÁO PHÍ CSHT", "SỐ TIỀN CSHT", "CẢNG XUẤT - CẢNG NHẬP",
                    "GHI CHÚ", "TRẠNG THÁI LÔ HÀNG"
                  ].map((label, idx) => (
                    <div key={idx} className="space-y-1">
                      <Label>{label}</Label>
                      <Input value="" readOnly placeholder="Chưa có dữ liệu" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: File viewer */}
          <div className="w-1/2 p-4 overflow-hidden">
            {previewUrl ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
                className="w-full h-full border rounded-lg"
                title={fileName || "File preview"}
              />
            ) : (
              <div className="text-center py-8 text-black">
                Không có file để hiển thị
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
