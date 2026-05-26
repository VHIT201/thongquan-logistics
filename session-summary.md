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
