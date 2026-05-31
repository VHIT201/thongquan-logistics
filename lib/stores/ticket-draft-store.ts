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
        const dummyRecords = [
          {
            emailId: `msg-${Date.now()}-1`,
            emailSubject: "Yêu cầu làm thủ tục hải quan - Lô hàng ABC Corp",
            extractedData: {
              maKhachHang: "KH001",
              khachHang: "ABC Corporation",
              congViec: "Thủ tục hải quan",
              soToKhai: "TK25/2025",
              loaiHinh: "NK",
              ngayToKhai: "15/05/2025",
              loaiHang: "Điện tử",
              luongTk: "Xanh",
              haiQuan: "Hải quan TP.HCM",
              soInvVat: "INV-2025-001",
              soBill: "HLCU1234567",
              soBooking: "BK-789",
              soLuongKien: "50",
              soLuongKg: "2500",
              soContainer20: "2",
              soContainer40: "1",
              cangXuatNhap: "Cát Lái - Long Beach",
              trangThaiLoHang: "Đang xử lý",
              ghiChu: "",
              nhanVien: "",
              co: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: "Tờ khai TK25/2025 của khách hàng ABC Corporation, 2 cont 20' 1 cont 40', điện tử, cảng Cát Lái",
            status: "reviewing" as TicketDraftStatus,
            createdAtOffset: 1,
          },
          {
            emailId: `msg-${Date.now()}-2`,
            emailSubject: "Báo giá vận chuyển - XYZ Logistics",
            extractedData: {
              maKhachHang: "KH002",
              khachHang: "XYZ Logistics",
              congViec: "Vận chuyển nội địa",
              soToKhai: "TK26/2025",
              loaiHinh: "NK",
              ngayToKhai: "18/05/2025",
              loaiHang: "Hàng tiêu dùng",
              luongTk: "Vàng",
              haiQuan: "Hải quan Hải Phòng",
              soInvVat: "INV-2025-015",
              soBill: "MAEU9876543",
              soBooking: "",
              soLuongKien: "120",
              soLuongKg: "8000",
              soContainer20: "0",
              soContainer40: "2",
              cangXuatNhap: "Hải Phòng - Tokyo",
              trangThaiLoHang: "Chờ xác nhận",
              ghiChu: "",
              nhanVien: "",
              co: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: "Tờ khai TK26/2025 XYZ Logistics, hàng tiêu dùng, 2 cont 40', hải quan Hải Phòng",
            status: "pending_confirm" as TicketDraftStatus,
            createdAtOffset: 2,
          },
          {
            emailId: `msg-${Date.now()}-3`,
            emailSubject: "Hồ sơ nhập khẩu - Minh Phát Trading",
            extractedData: {
              maKhachHang: "KH003",
              khachHang: "Minh Phát Trading",
              congViec: "Thông quan",
              soToKhai: "TK27/2025",
              loaiHinh: "NK",
              ngayToKhai: "20/05/2025",
              loaiHang: "Nguyên liệu",
              luongTk: "Đỏ",
              haiQuan: "Hải quan Bình Dương",
              soInvVat: "INV-MP-2025-003",
              soBill: "OOLU5558882",
              soBooking: "BK-MP-112",
              soLuongKien: "200",
              soLuongKg: "15000",
              soContainer20: "3",
              soContainer40: "0",
              cangXuatNhap: "Bình Dương - Busan",
              trangThaiLoHang: "Đang kiểm tra",
              ghiChu: "",
              nhanVien: "",
              co: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: "Tờ khai TK27/2025 Minh Phát Trading, nguyên liệu, 3 cont 20', luồng đỏ, kiểm tra",
            status: "draft" as TicketDraftStatus,
            createdAtOffset: 3,
          },
          {
            emailId: `msg-${Date.now()}-4`,
            emailSubject: "Xác nhận đơn hàng - Global Export Co.",
            extractedData: {
              maKhachHang: "KH004",
              khachHang: "Global Export Co.",
              congViec: "Xuất khẩu",
              soToKhai: "TK28/2025",
              loaiHinh: "XK",
              ngayToKhai: "22/05/2025",
              loaiHang: "Dệt may",
              luongTk: "Xanh",
              haiQuan: "Hải quan TP.HCM",
              soInvVat: "INV-GX-2025-008",
              soBill: "COSU3337771",
              soLuongKien: "80",
              soLuongKg: "5000",
              soContainer20: "1",
              soContainer40: "1",
              cangXuatNhap: "Cát Lái - Rotterdam",
              trangThaiLoHang: "Hoàn thành",
              ghiChu: "",
              nhanVien: "",
              co: "",
              soBooking: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: "Tờ khai TK28/2025 Global Export Co., dệt may xuất khẩu, 1 cont 20' 1 cont 40', hoàn thành",
            status: "archived" as TicketDraftStatus,
            createdAtOffset: 4,
          },
          {
            emailId: `msg-${Date.now()}-5`,
            emailSubject: "Yêu cầu xử lý hàng nhanh - Fast Forward",
            extractedData: {
              maKhachHang: "KH005",
              khachHang: "Fast Forward Ltd",
              congViec: "Thủ tục nhanh",
              soToKhai: "TK29/2025",
              loaiHinh: "NK",
              ngayToKhai: "25/05/2025",
              loaiHang: "Máy móc",
              luongTk: "Xanh",
              haiQuan: "Hải quan Đà Nẵng",
              soInvVat: "INV-FF-2025-020",
              soBill: "HDMU4449995",
              soBooking: "BK-FF-334",
              soLuongKien: "15",
              soLuongKg: "3000",
              soContainer20: "0",
              soContainer40: "1",
              cangXuatNhap: "Đà Nẵng - Shanghai",
              trangThaiLoHang: "Đang xử lý",
              ghiChu: "",
              nhanVien: "",
              co: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: "Tờ khai TK29/2025 Fast Forward, máy móc nhập khẩu, 1 cont 40', hải quan Đà Nẵng",
            status: "reviewing" as TicketDraftStatus,
            createdAtOffset: 5,
          },
          {
            emailId: `msg-${Date.now()}-6`,
            emailSubject: "Báo giá logistics - Thành Công Group",
            extractedData: {
              maKhachHang: "KH006",
              khachHang: "Thành Công Group",
              congViec: " logistics tổng hợp",
              soToKhai: "TK30/2025",
              loaiHinh: "NK",
              ngayToKhai: "28/05/2025",
              loaiHang: "Nông sản",
              luongTk: "Vàng",
              haiQuan: "Hải quan Cần Thơ",
              soInvVat: "INV-TC-2025-012",
              soBill: "SITU7773330",
              soLuongKien: "300",
              soLuongKg: "12000",
              soContainer20: "2",
              soContainer40: "1",
              cangXuatNhap: "Cần Thơ - Singapore",
              trangThaiLoHang: "Chờ xác nhận",
              ghiChu: "",
              nhanVien: "",
              co: "",
              soBooking: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: "Tờ khai TK30/2025 Thành Công Group, nông sản, 2 cont 20' 1 cont 40', hải quan Cần Thơ",
            status: "pending_confirm" as TicketDraftStatus,
            createdAtOffset: 6,
          },
          {
            emailId: `msg-${Date.now()}-7`,
            emailSubject: "Đơn hàng khẩn - Pacific Trade",
            extractedData: {
              maKhachHang: "KH007",
              khachHang: "Pacific Trade Inc",
              congViec: "Thông quan khẩn",
              soToKhai: "TK31/2025",
              loaiHinh: "NK",
              ngayToKhai: "30/05/2025",
              loaiHang: "Hóa chất",
              luongTk: "Đỏ",
              haiQuan: "Hải quan TP.HCM",
              soInvVat: "INV-PT-2025-045",
              soBill: "MSCU6662228",
              soBooking: "BK-PT-556",
              soLuongKien: "40",
              soLuongKg: "6000",
              soContainer20: "2",
              soContainer40: "0",
              cangXuatNhap: "Cát Lái - Busan",
              trangThaiLoHang: "Đang kiểm tra",
              ghiChu: "",
              nhanVien: "",
              co: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: "Tờ khai TK31/2025 Pacific Trade, hóa chất, 2 cont 20', luồng đỏ, kiểm tra hải quan",
            status: "draft" as TicketDraftStatus,
            createdAtOffset: 7,
          },
          {
            emailId: `msg-${Date.now()}-8`,
            emailSubject: "Xác nhận vận chuyển - East Asia Shipping",
            extractedData: {
              maKhachHang: "KH008",
              khachHang: "East Asia Shipping",
              congViec: "Vận chuyển quốc tế",
              soToKhai: "TK32/2025",
              loaiHinh: "XK",
              ngayToKhai: "01/06/2025",
              loaiHang: "Gỗ",
              luongTk: "Xanh",
              haiQuan: "Hải quan Hải Phòng",
              soInvVat: "INV-EA-2025-067",
              soBill: "TCLU1114446",
              soLuongKien: "100",
              soLuongKg: "20000",
              soContainer20: "0",
              soContainer40: "2",
              cangXuatNhap: "Hải Phòng - Los Angeles",
              trangThaiLoHang: "Hoàn thành",
              ghiChu: "",
              nhanVien: "",
              co: "",
              soBooking: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: "Tờ khai TK32/2025 East Asia Shipping, gỗ xuất khẩu, 2 cont 40', hải quan Hải Phòng",
            status: "archived" as TicketDraftStatus,
            createdAtOffset: 8,
          },
          {
            emailId: `msg-${Date.now()}-9`,
            emailSubject: "Yêu cầu báo giá - Viet Trade JSC",
            extractedData: {
              maKhachHang: "KH009",
              khachHang: "Viet Trade JSC",
              congViec: "Báo giá dịch vụ",
              soToKhai: "TK33/2025",
              loaiHinh: "NK",
              ngayToKhai: "03/06/2025",
              loaiHang: "Linh kiện ô tô",
              luongTk: "Vàng",
              haiQuan: "Hải quan Bình Dương",
              soInvVat: "INV-VT-2025-089",
              soBill: "FSCU9991113",
              soBooking: "BK-VT-778",
              soLuongKien: "60",
              soLuongKg: "4500",
              soContainer20: "1",
              soContainer40: "1",
              cangXuatNhap: "Bình Dương - Nagoya",
              trangThaiLoHang: "Đang xử lý",
              ghiChu: "",
              nhanVien: "",
              co: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: "Tờ khai TK33/2025 Viet Trade JSC, linh kiện ô tô, 1 cont 20' 1 cont 40', hải quan Bình Dương",
            status: "reviewing" as TicketDraftStatus,
            createdAtOffset: 9,
          },
          {
            emailId: `msg-${Date.now()}-10`,
            emailSubject: "Hồ sơ hoàn thành - Mega Import",
            extractedData: {
              maKhachHang: "KH010",
              khachHang: "Mega Import LLC",
              congViec: "Thông quan hoàn thành",
              soToKhai: "TK34/2025",
              loaiHinh: "NK",
              ngayToKhai: "05/06/2025",
              loaiHang: "Thực phẩm",
              luongTk: "Xanh",
              haiQuan: "Hải quan TP.HCM",
              soInvVat: "INV-MI-2025-100",
              soBill: "ZIMU2228884",
              soLuongKien: "150",
              soLuongKg: "8000",
              soContainer20: "2",
              soContainer40: "0",
              cangXuatNhap: "Cát Lái - Sydney",
              trangThaiLoHang: "Hoàn thành",
              ghiChu: "",
              nhanVien: "",
              co: "",
              soBooking: "",
              soContainerLcl: "",
              soContainerTc: "",
            } as Record<string, string>,
            extractedText: "Tờ khai TK34/2025 Mega Import, thực phẩm nhập khẩu, 2 cont 20', hoàn thành thông quan",
            status: "archived" as TicketDraftStatus,
            createdAtOffset: 10,
          },
        ]

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
