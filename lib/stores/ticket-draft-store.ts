import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TicketDraftStatus = "draft" | "reviewing" | "pending_confirm" | "archived"

export interface TicketDraftAttachment {
  id: string
  fileName: string
  contentType?: string
  fileSize?: number
}

export interface TicketDraft {
  id: string
  emailId: string
  emailSubject?: string
  createdAt: string
  updatedAt: string
  extractedData: Record<string, string>
  extractedText?: string
  attachments: TicketDraftAttachment[]
  status: TicketDraftStatus
  aiSummary?: string | null
  notes?: string
}

interface TicketDraftState {
  drafts: TicketDraft[]
  createDraft: (draft: Omit<TicketDraft, "id" | "createdAt" | "updatedAt">) => string
  updateDraft: (id: string, patch: Partial<Omit<TicketDraft, "id" | "createdAt">>) => void
  deleteDraft: (id: string) => void
  getByEmailId: (emailId: string) => TicketDraft[]
  getById: (id: string) => TicketDraft | undefined
  searchDrafts: (query: string) => TicketDraft[]
  seedDummyData: () => void
}

export const useTicketDraftStore = create<TicketDraftState>()(
  persist(
    (set, get) => ({
      drafts: [],

      createDraft: (draft) => {
        const id = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const now = new Date().toISOString()
        const newDraft: TicketDraft = {
          ...draft,
          id,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ drafts: [newDraft, ...state.drafts] }))
        return id
      },

      updateDraft: (id, patch) => {
        set((state) => ({
          drafts: state.drafts.map((d) =>
            d.id === id
              ? { ...d, ...patch, updatedAt: new Date().toISOString() }
              : d
          ),
        }))
      },

      deleteDraft: (id) => {
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== id),
        }))
      },

      getByEmailId: (emailId) => {
        return get().drafts
          .filter((d) => d.emailId === emailId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      getById: (id) => {
        return get().drafts.find((d) => d.id === id)
      },

      searchDrafts: (query) => {
        const q = query.trim().toLowerCase()
        if (!q) return get().drafts
        const keywords = q.split(/\s+/).filter((w) => w.length > 1)
        if (keywords.length === 0) return get().drafts
        return get().drafts.filter((d) => {
          const text = [
            d.emailSubject,
            d.aiSummary,
            d.notes,
            d.extractedText,
            ...Object.values(d.extractedData),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          return keywords.some((kw) => text.includes(kw))
        })
      },

      seedDummyData: () => {
        const now = new Date()

        const customers = [
          "ABC Corporation","XYZ Logistics","Minh Phát Trading","Global Export Co.",
          "Fast Forward Ltd","Thành Công Group","Pacific Trade Inc","East Asia Shipping",
          "Viet Trade JSC","Mega Import LLC","Hoàng Gia Corp","Đông Phương Logistics",
          "Phát Đạt Trading","Việt Nam Export","Sài Gòn Forwarder","Hà Nội Logistics",
          "Nam Phong Corp","Thái Bình Dương","Kim Khánh Import","Bảo An Shipping",
          "Tân Phát Corp","Viễn Đông Trade","Phương Nam Logistics","Thiên Minh Group",
          "Đại Phúc Corp","Hưng Thịnh Forwarder","Ngọc Bích Trading","Quang Minh Logistics",
          "Tuấn Phát Corp","An Bình Shipping",
        ]

        const loaiHangs = [
          "Điện tử","Hàng tiêu dùng","Nguyên liệu","Dệt may","Máy móc","Nông sản",
          "Hóa chất","Gỗ","Linh kiện ô tô","Thực phẩm","Đồ gỗ","Dược phẩm","Nhựa",
          "Sắt thép","Giày dép","Túi xách","Đồ chơi","Sách báo","Mỹ phẩm","Đồ gia dụng",
        ]

        const cangs = [
          "Cát Lái - Long Beach","Hải Phòng - Tokyo","Bình Dương - Busan",
          "Cát Lái - Rotterdam","Đà Nẵng - Shanghai","Cần Thơ - Singapore",
          "Cát Lái - Busan","Hải Phòng - Los Angeles","Bình Dương - Nagoya",
          "Cát Lái - Sydney","Hải Phòng - Hamburg","Bình Dương - Kaohsiung",
          "Cát Lái - New York","Đà Nẵng - Busan","Cần Thơ - Bangkok",
          "Cát Lái - Dubai","Hải Phòng - Singapore","Bình Dương - Hong Kong",
        ]

        const statuses: TicketDraftStatus[] = ["draft","reviewing","pending_confirm","archived"]
        const luongs = ["Xanh","Vàng","Đỏ"]
        const loaiHinhs = ["NK","XK"]
        const haiQuans = [
          "Hải quan TP.HCM","Hải quan Hải Phòng","Hải quan Bình Dương",
          "Hải quan Đà Nẵng","Hải quan Cần Thơ",
        ]
        const congViecs = [
          "Thủ tục hải quan","Vận chuyển nội địa","Thông quan",
          "Xuất khẩu","Thủ tục nhanh","Logistics tổng hợp",
          "Thông quan khẩn","Vận chuyển quốc tế","Báo giá dịch vụ",
        ]
        const trangThais = [
          "Đang xử lý","Chờ xác nhận","Đang kiểm tra","Hoàn thành",
        ]

        function rand(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }
        function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

        const dummyRecords = Array.from({ length: 30 }, (_, i) => {
          const c20 = String(randInt(0, 5))
          const c40 = String(randInt(0, 3))
          const soTk = `TK${25 + i}/2025`
          const customer = customers[i % customers.length]
          const loaiHang = rand(loaiHangs)
          const cang = rand(cangs)
          const status = statuses[i % statuses.length]
          const luong = rand(luongs)
          const loaiHinh = rand(loaiHinhs)
          const haiQuan = rand(haiQuans)
          const congViec = rand(congViecs)
          const trangThai = rand(trangThais)
          const soKien = String(randInt(10, 500))
          const soKg = String(randInt(1000, 25000))
          const day = String((i % 30) + 1).padStart(2, "0")
          const month = String((i % 12) + 1).padStart(2, "0")

          return {
            emailId: `msg-${Date.now()}-${i + 1}`,
            emailSubject: `${rand(["Yêu cầu","Báo giá","Hồ sơ","Xác nhận","Đơn hàng"])} ${congViec.toLowerCase()} - ${customer}`,
            extractedData: {
              maKhachHang: `KH${String(i + 1).padStart(3, "0")}`,
              khachHang: customer,
              congViec: congViec,
              soToKhai: soTk,
              loaiHinh: loaiHinh,
              ngayToKhai: `${day}/${month}/2025`,
              loaiHang: loaiHang,
              luongTk: luong,
              haiQuan: haiQuan,
              soInvVat: `INV-${String(i + 1).padStart(3, "0")}-2025`,
              soBill: `${rand(["HLCU","MAEU","OOLU","COSU","HDMU","SITU","MSCU","TCLU","FSCU","ZIMU"])}${randInt(1000000, 9999999)}`,
              soBooking: Math.random() > 0.3 ? `BK-${randInt(100, 999)}` : "",
              soLuongKien: soKien,
              soLuongKg: soKg,
              soContainer20: c20,
              soContainer40: c40,
              cangXuatNhap: cang,
              trangThaiLoHang: trangThai,
              ghiChu: "",
              nhanVien: "",
              co: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: `Tờ khai ${soTk} ${customer}, ${loaiHang}, ${c20} cont 20' ${c40} cont 40', ${haiQuan}`,
            status: status,
            createdAtOffset: i + 1,
          }
        })

        const newDrafts: TicketDraft[] = dummyRecords.map((record, i) => {
          const created = new Date(now)
          created.setDate(created.getDate() - record.createdAtOffset)
          return {
            id: `dummy-${i + 1}`,
            emailId: record.emailId,
            emailSubject: record.emailSubject,
            createdAt: created.toISOString(),
            updatedAt: created.toISOString(),
            extractedData: record.extractedData,
            extractedText: record.extractedText,
            attachments: [
              {
                id: `att-${i + 1}`,
                fileName: `invoice_${record.extractedData.soToKhai}.pdf`,
                contentType: "application/pdf",
                fileSize: 1024000 + i * 10000,
              },
              {
                id: `att-${i + 1}-2`,
                fileName: `bill_of_lading_${record.extractedData.soToKhai}.pdf`,
                contentType: "application/pdf",
                fileSize: 512000 + i * 5000,
              },
            ],
            status: record.status,
            aiSummary: `Hồ sơ ${record.extractedData.soToKhai} của ${record.extractedData.khachHang}`,
          }
        })

        set({ drafts: newDrafts })
      },
    }),
    {
      name: "ticket-draft-storage",
    }
  )
)
