# Session Summary — 26/05/2026

## 1. Trang Emails (Danh sách)
- `@/app/(app)/emails/page.tsx`
  - Đổi `sortField` mặc định từ `"receivedAt"` → `"sentAt"`
  - Thêm `whitespace-nowrap` cho cột thời gian, badge trạng thái, cột đính kèm → fix UI xộc xệch
- `@/hooks/use-mail-queries.ts`
  - Đổi `SortField` mặc định trong hook thành `"sentAt"`
  - Đổi `syncType` từ `"full"` → `"MANUAL_RESYNC"`

## 2. API Endpoint — Chuyển sang Logistics
- `@/orval.config.ts`
  - Swagger spec: `gateway/mail-connector/...` → `gateway/logistics/...`
- `@/lib/orval/mail-connector-mutator.ts`
  - Base URL default: `gateway/mail-connector` → `gateway/logistics`
- `@/lib/api.ts`
  - `API_BASE`: `"/api/v1"` → `"https://vietprodev.duckdns.org/gateway/logistics/api/v1"`
  - Login type: cập nhật khớp response logistics (`accessToken`, `refreshToken`, `expiresIn`, `user.userId`, `permissions`)
- Chạy `pnpm run api:gen:mail-connector` → regenerate generated code
- User tự đổi `getMailConnectorAPI` → `getLogisticsPlatformAPI` trong hooks

## 3. Login Page
- `@/app/login/page.tsx`
  - Gắn API `login()` từ `@/lib/api`
  - Lưu `accessToken`, `refreshToken`, `userId` vào `localStorage`
  - Thêm loading state, error message, disable button khi đang xử lý
  - Thêm `text-neutral-800` cho input để chữ nhập hiện màu đen (thay vì xám)
  - Thêm `placeholder:text-neutral-200` cho placeholder

## 4. Trang Chi tiết Email (70/30 Layout)
- `@/app/(app)/emails/[id]/page.tsx`
  - Chia layout: **70%** nội dung email (trái) + **30%** file đính kèm (phải)
  - Thêm state `selectedForAI: Set<string>` để chọn file gửi AI
  - Mỗi file đính kèm có nút toggle **"AI"** (xanh khi chọn, xám khi không)
  - Thu gọn tên file + contentType bằng JS truncate (max 22 & 10 ký tự)
  - Rút gọn button: `AI | Text | Xem | ↓ | ✓` — text 11px, padding nhỏ
  - Thêm `min-w-0`, `overflow-hidden`, `w-full` cho chain flex để tránh tràn

## 5. Cơ chế Token
- Interceptor request: gắn `Authorization: Bearer <token>` từ `localStorage`
- Interceptor response: khi **401** → xóa token, redirect `/login`
- **Chưa có** auto-refresh token (backend có endpoint `/auth/refresh` nhưng chưa tích hợp tự động)

## 6. Lỗi đã fix
- **"Invalid sync type 'full'"** → đổi thành `MANUAL_RESYNC`
- **401 redirect liên tục** → sửa login lấy đúng field `accessToken` thay vì `token`
- **UI item file đính kèm tràn** → JS truncate + compact button + overflow-hidden chain

---

# Session Summary — 27/05/2026

## 1. Email Detail Page — Chat-based AI Extraction Refactor

### 1.1 Layout 3 cột ngang (Desktop)
- `@/app/(app)/emails/[id]/page.tsx`
  - **Trái `220px`**: File đính kèm (scroll riêng)
  - **Giữa `flex-1`**: Nội dung email (HTML iframe / text)
  - **Phải `300px`**: AI Chat panel (luôn hiển thị, không floating)
  - Mobile: xếp dọc email → files → chat
  - Chiều cao: `calc(100dvh - 116px)`, mỗi cột scroll độc lập

### 1.2 Header gọn
- 1 dòng ngang: ← Quay lại | Subject — From — Date | Trích xuất
- Bỏ card riêng, không còn `p-5` header

### 1.3 AI Chat panel
- Toggle **Chat** / **Template** mode
- Template chọn inline qua `<select>` dropdown
- Message list với avatar, loading dots, auto-scroll (`chatEndRef`)
- **Chat mode**: AI trả lời text tự do trong bubble
- **Template mode**: AI trả JSON → nút "Xem chi tiết" mở `ExtractionResultModal`
- Input + nút gửi ở bottom
- Bỏ hẳn floating chat button (`MessageCircle`, `Minimize2`), `chatOpen` state

### 1.4 Prompt engineering
- `buildChatPrompt`: Yêu cầu AI trả lời text tự do, không bắt JSON
- `buildTemplatePrompt`: Bắt JSON array theo `expectedFields` của template

## 2. File Attachment Item — Vertical Card Redesign
- `@/components/file-attachment-item.tsx`
  - Dạng **card dọc**: Top (checkbox + icon + type badge) → Middle (name `line-clamp-2`) → Bottom (size + actions)
  - Actions nhỏ gọn: "Trích", "Xem" text button + icon Download
  - Phù hợp sidebar hẹp `220px`
  - Bỏ: status badge "Đã xong", `Card` import

## 3. Webhooks page — Tạm ẩn
- `@/app/(app)/webhooks/page.tsx`: Comment toàn bộ content
- `@/app/(app)/layout.tsx`: Comment nav item "Webhooks" + breadcrumb

## 4. CSS Fixes
- `bg-gradient-to-r` → `bg-linear-to-r` (Tailwind v4)
- Dùng `100dvh` thay `100vh` cho mobile Safari

## 5. Files đã tạo/cập nhật
- `CHANGELOG-27-05-2026.md`: Tài liệu chi tiết các thay đổi hôm nay
- `luong-app.md`: Cập nhật Giai đoạn 4 & 5 theo flow chat-based mới
