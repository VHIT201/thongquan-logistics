# Logistics Platform — Tài Liệu Thuyết Trình

## 1. Tổng Quan Hệ Thống

Đây là nền tảng logistics giúp xử lý email chứa chứng từ hải quan, trích xuất thông tin tự động bằng AI, quản lý hồ sơ dưới dạng **Ticket Draft**, và tra cứu thông minh bằng **RAG Chatbot**.

**Tech Stack**: Next.js (App Router) · React 18 · TypeScript · Tailwind CSS · shadcn/ui · Zustand · TanStack Query · dayjs · Sonner

---

## 2. Luồng Nghiệp Vụ End-to-End

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  ❶ Email    │────▶│  ❷ Email    │────▶│  ❸ AI       │────▶│  ❹ Ticket   │────▶│  ❺ RAG      │
│   Inbox     │     │   Detail    │     │  Extraction │     │   Drafts    │     │  Chatbot    │
│  (/emails)  │     │(/emails/[id])│     │   (AI API)  │     │  (/drafts)  │     │  (/drafts)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

### ❶ Email Inbox (`/emails`)

- **Nguồn**: Email từ hệ thống Mail Connector được gán (assign) cho từng user.
- **Trạng thái**: `assigned` → `confirmed` → `completed`.
- **Thao tác**: Xem danh sách, phân trang (10 items/page), tìm kiếm, confirm/reassign.
- **Dữ liệu**: `subject`, `fromEmail`, `fromName`, `receivedAt`, `attachments[]`.

---

### ❷ Email Detail (`/emails/[id]`)

- **Xem nội dung**: Body email (text/html), danh sách attachments (PDF, Excel, Word, images).
- **AI Actions**:
  - **Normalize**: Chuẩn hóa nội dung email.
  - **Classify**: Phân loại loại email (báo giá, chứng từ, v.v.).
  - **Extract**: Trích xuất thông tin logistics từ attachment bằng AI backend.
  - **AI Chat**: Chat với AI về nội dung email (khác với RAG — đây là conversational AI trên single email).
- **Attachment Actions**: View (preview file), Extract Text (OCR), Select for AI (chọn file để AI xử lý).

---

### ❸ AI Extraction — Trích Xuất Thông Tin

**Kích hoạt**: User chọn 1-n attachments → bấm **Extract**.

**Luồng xử lý**:
```
User chọn file ──▶ Gọi API Extract ──▶ AI Backend (OCR + LLM) ──▶ Trả về JSON
                                                    │
                                                    ▼
                                    ┌───────────────────────────────┐
                                    │  LogisticsData (JSON)         │
                                    │  • soToKhai — Số tờ khai      │
                                    │  • khachHang — Khách hàng     │
                                    │  • loaiHang — Loại hàng       │
                                    │  • cangXuatNhap — Cảng        │
                                    │  • trangThaiLoHang — Trạng thái│
                                    │  • soContainer20 / soContainer40│
                                    │  • ngayToKhai, haiQuan, CO…   │
                                    └───────────────────────────────┘
                                                    │
                                                    ▼
                                    ┌───────────────────────────────┐
                                    │  ExtractionResultModal        │
                                    │  • Hiển thị bảng dữ liệu      │
                                    │  • Xem preview file gốc       │
                                    │  • Copy/Export JSON             │
                                    └───────────────────────────────┘
                                                    │
                                                    ▼
                                    ┌───────────────────────────────┐
                                    │  TemplateResultModal (Edit)   │
                                    │  • Sửa dữ liệu trước khi lưu  │
                                    │  • Map fields tự động         │
                                    └───────────────────────────────┘
```

**Lưu ý**: Dữ liệu extraction có thể được lưu thành **Ticket Draft** (qua export hoặc tự động) để đưa vào kho dữ liệu cho RAG.

---

### ❹ Ticket Drafts (`/drafts`) — Quản Lý Hồ Sơ

- **Nguồn**: Các hồ sơ đã trích xuất từ email, lưu trong Zustand Store (persist localStorage).
- **Dữ liệu**: `TicketDraft` chứa `extractedData: Record<string, string>` — toàn bộ trường logistics.
- **Trạng thái**:
  - `draft` — Nháp
  - `reviewing` — Đang xem xét
  - `pending_confirm` — Chờ xác nhận
  - `archived` — Đã lưu
- **Tính năng**:
  - Danh sách dạng grid/card, filter theo status, tìm kiếm full-text.
  - Pagination (8 items/page).
  - Xem chi tiết từng draft (Dialog modal).
  - 30 dummy records sẵn có để demo.

---

### ❺ RAG Chatbot — AI Tra Cứu Thông Minh

**Đây là nơi RAG được sử dụng**.

```
┌─────────────────────────────────────────────────────────────────────┐
│  VỊ TRÍ CỦA RAG TRONG LUỒNG NGHIỆP VỤ                              │
│                                                                     │
│  Email ──▶ AI Extract ──▶ Ticket Draft (Kho dữ liệu) ──▶ RAG Bot   │
│                              ▲                                      │
│                              └── RAG tìm kiếm & trả lời từ đây      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mục đích**: Cho phép user đặt câu hỏi tự nhiên bằng tiếng Việt về **toàn bộ hồ sơ đã có**, không cần mở từng email hay từng draft.

**Ví dụ câu hỏi**:
- "TK25 có bao nhiêu container?"
- "Khách hàng của TK25 là ai?"
- "Hồ sơ nào có nhiều container nhất?"
- "Danh sách hồ sơ đang xử lý"

**Kết quả**: Câu trả lời rút từ `extractedData` của draft phù hợp nhất.

---

## 3. Kiến Trúc RAG Pipeline (Chi Tiết)

RAG trong hệ thống này là **keyword-based / lightweight**, chạy hoàn toàn client-side — không cần LLM API hay Vector DB.

```
User Query (tiếng Việt)
    │
    ▼
┌─────────────────┐
│  Intent Detect  │  ← Regex: container, khách hàng, cảng, trạng thái, loại hàng, đếm…
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Smart Scoring  │  ← Tính điểm relevance trên toàn bộ drafts (30 records+)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Top-K Select   │  ← Chọn draft có điểm cao nhất (best match)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Templated Resp  │  ← Sinh câu trả lời định dạng theo intent, không dùng LLM
└─────────────────┘
         │
         ▼
    UI Render
```

### 3.1. Smart Scoring

Mỗi draft được chấm điểm dựa trên độ liên quan:

| Tiêu chí | Cách tính | Điểm |
|---|---|---|
| Keyword match | Tách query thành từ khóa, kiểm tra trong `extractedData` + `extractedText` + `emailSubject` | +1 / từ |
| Số tờ khai | Query chứa số, và số khớp với `soToKhai` | **+10** |
| Khách hàng exact | Toàn bộ query khớp với `khachHang` | **+5** |

### 3.2. Intent Detection

Regex tiếng Việt phân loại câu hỏi:

```typescript
const isCount      = /bao nhiêu|tổng|có bao nhiêu/.test(q)
const isContainer  = /container|cont/.test(q)
const isCustomer   = /khách hàng|tên khách|là ai/.test(q)
const isPort       = /cảng|port/.test(q)
const isStatus     = /trạng thái|tình trạng/.test(q)
const isCargo      = /loại hàng|hàng gì/.test(q)
```

### 3.3. Templated Response

Không dùng LLM. Câu trả lời được tổng hợp từ `extractedData` của draft tốt nhất:

| Intent | Output |
|---|---|
| Container + Đếm | Tờ khai, Khách hàng, Container 20', Container 40', Tổng |
| Khách hàng | "Khách hàng của tờ khai X là Y" |
| Cảng | "Tờ khai X: Cảng: Y" |
| Trạng thái | "Tờ khai X: Trạng thái: Y" |
| Loại hàng | "Tờ khai X: Loại hàng: Y" |
| Default | Tổng hợp đầy đủ các trường |

### 3.4. UX Nâng Cao

- **Sidebar Drawer**: Push layout (không overlay), giống tab Gemini.
- **Auto-scroll**: Luôn cuộn xuống tin nhắn mới nhất.
- **Timestamps**: `HH:mm` trên mỗi tin nhắn.
- **Suggested Questions**: 4 câu gợi ý sẵn.
- **Typing Indicator**: 3 chấm nhấp nháy khi AI "suy nghĩ".
- **Pulse Notification**: Nút chat nhấp nháy khi có tin nhắn mới khi drawer đang đóng.
- **Clear History**: Xóa toàn bộ lịch sử chat.

---

## 4. Data Model

### 4.1. Luồng Dữ Liệu

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Email     │────▶│  AI Extraction  │────▶│  ExtractedData  │
│  (MailItem) │     │   (Backend API) │     │ (Record<string,│
│             │     │                 │     │    string>)     │
└─────────────┘     └─────────────────┘     └───────┬─────────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │ TicketDraft   │
                                            │  • id         │
                                            │  • emailId    │
                                            │  • extractedData ◄── Dùng cho RAG
                                            │  • status     │
                                            │  • createdAt  │
                                            └───────┬───────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │  RAG Engine   │
                                            │ (Client-side) │
                                            └───────────────┘
```

### 4.2. Các Trường `extractedData` Dùng Cho RAG

| Trường | Ý nghĩa | Ví dụ query liên quan |
|---|---|---|
| `soToKhai` | Số tờ khai | "TK25 có bao nhiêu container?" |
| `khachHang` | Tên khách hàng | "Khách hàng của TK25 là ai?" |
| `loaiHang` | Loại hàng hóa | "Loại hàng trong TK25 là gì?" |
| `cangXuatNhap` | Cảng xuất/nhập | "TK25 qua cảng nào?" |
| `trangThaiLoHang` | Trạng thái lô hàng | "Trạng thái TK25?" |
| `soContainer20` / `soContainer40` | Số container | "TK25 có mấy container?" |

---

## 5. Vị Trí RAG Trong Kiến Trúc Tổng Thể

```
┌────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  /emails    │  │/emails/[id] │  │  /drafts    │  │ RAG Drawer │ │
│  │   (List)    │  │  (Detail)   │  │  (Grid)     │  │  (Chat)    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                │                │               │        │
│         └────────────────┴────────────────┴───────────────┘        │
│                              │                                     │
│                              ▼                                     │
│                    ┌─────────────────┐                             │
│                    │  Zustand Store  │                             │
│                    │  (ticket-draft) │                             │
│                    │  • drafts[]     │                             │
│                    │  • searchDrafts │                             │
│                    │  • seedDummyData│                             │
│                    └─────────────────┘                             │
│                              │                                     │
│                              ▼                                     │
│                    ┌─────────────────┐                             │
│                    │  RAG Engine     │  ◄── CHỈ CHẠY Ở ĐÂY       │
│                    │  (Client-side)  │                             │
│                    │  • Smart Scoring│                             │
│                    │  • Intent Detect│                             │
│                    │  • TemplatedResp│                             │
│                    └─────────────────┘                             │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                        BACKEND API                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Mail      │  │  Normalize  │  │  Extract    │  ← AI Extraction│
│  │ Connector   │  │  Classify   │  │  (OCR+LLM)  │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                    │
│  ┌─────────────┐  ┌─────────────┐                                  │
│  │ Attachment  │  │  AI Chat    │  ← Conversational AI (khác RAG) │
│  │   Proxy     │  │  (per email)│                                  │
│  └─────────────┘  └─────────────┘                                  │
└────────────────────────────────────────────────────────────────────┘
```

**Tóm lại**:
- **AI Extraction** (backend): Tạo dữ liệu cho RAG.
- **Ticket Drafts** (store): Kho dữ liệu mà RAG tìm kiếm.
- **RAG Chatbot** (frontend): Tra cứu thông tin từ kho dữ liệu đó.

---

## 6. So Sánh RAG Lightweight vs RAG Full

| Đặc điểm | RAG Lightweight (Hiện tại) | RAG Full (Production) |
|---|---|---|
| Embedding | Không — keyword-based | Có (OpenAI, sentence-transformers) |
| Vector DB | Không — tìm trên array in-memory | Pinecone, Weaviate, Chroma |
| LLM | Không — templated response | GPT-4, Claude, Gemini |
| Latency | ~800ms (giả lập) | 2–5s (thật) |
| Offline | ✅ Hoàn toàn offline | ❌ Cần API key + internet |
| Chi phí | $0 | Theo token/API call |
| Độ chính xác semantic | Trung bình | Cao |

> **Lý do chọn lightweight**: Prototype nhanh, zero cost, zero dependency. Dữ liệu logistics domain có cấu trúc rõ ràng (tờ khai, container, cảng…) nên keyword scoring + intent detection đủ dùng cho 90% query thường gặp.

---

## 7. Demo Script Thuyết Trình

**Mở đầu**:
> "Đây là nền tảng logistics xử lý email chứng từ. Luồng nghiệp vụ gồm 5 bước: Email → AI Trích Xuất → Hồ Sơ → RAG Chatbot. Tôi sẽ đi sâu vào RAG — cách chúng tôi dùng AI để tra cứu thông tin từ kho hồ sơ đã có."

**Bước 1 — Email & AI Extraction**:
> "User nhận email có attachment PDF/Excel. Hệ thống gọi API backend để AI trích xuất thông tin: số tờ khai, khách hàng, loại hàng, container, cảng… Kết quả là JSON chứa ~30 trường logistics."

**Bước 2 — Ticket Drafts**:
> "Dữ liệu được lưu thành Ticket Draft trong Zustand Store. Hiện tại có 30 hồ sơ mẫu. User có thể filter theo trạng thái: Nháp, Đang xem xét, Chờ xác nhận, Đã lưu."

**Bước 3 — RAG (Điểm chính)**:
> "Đây là RAG — Retrieval-Augmented Generation. Khi user hỏi 'TK25 có bao nhiêu container?', hệ thống:
> 1. **Smart Scoring**: Chạy qua 30 hồ sơ, tính điểm relevance. Keyword match +1, số tờ khai khớp +10, tên khách hàng khớp +5.
> 2. **Intent Detection**: Regex tiếng Việt nhận ra đây là câu hỏi về container + đếm.
> 3. **Templated Response**: Lấy dữ liệu từ `extractedData` của draft tốt nhất, format thành câu trả lời sạch sẽ.
> Không cần GPT. Không cần Vector DB. Chạy hoàn toàn client-side."

**Bước 4 — UX**:
> "Drawer đẩy layout giống Gemini. Có typing indicator, suggested questions, pulse notification. Toàn bộ zero cost, zero latency API."

**Kết luận**:
> "RAG ở đây không phải là một hệ thống riêng biệt — nó là **lớp tra cứu thông minh** nằm trên kho dữ liệu đã được AI trích xuất. Bước khởi đầu hoàn hảo trước khi migrate sang vector DB + LLM."
