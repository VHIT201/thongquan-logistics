# CHANGELOG — 27/05/2026

## Email Detail Page Refactor — Chat-based AI Extraction

### Files Modified

#### `app/(app)/emails/[id]/page.tsx`
- **Layout**: Chuyển từ 2 cột → **3 cột ngang** (Desktop)
  - Trái `220px`: File đính kèm
  - Giữa `flex-1`: Nội dung email
  - Phải `300px`: AI Chat panel
  - Mobile: xếp dọc (email → files → chat)
- **Header**: Gọn thành 1 dòng ngang (subject, from, date, nút Trích xuất)
- **Chat panel**: Luôn hiển thị trong cột phải, không còn floating
  - Toggle mode: **Chat** / **Template**
  - Template chọn inline qua `<select>`
  - Messages hiển thị với avatar, loading dots, auto-scroll
  - 2 chế độ phản hồi AI:
    - **Chat mode**: AI trả lời text tự do trong khung chat
    - **Template mode**: AI trả về JSON → hiển thị nút "Xem chi tiết" mở modal
- **Xóa**: Floating chat button (`MessageCircle`, `Minimize2`), `chatOpen` state

#### `components/file-attachment-item.tsx`
- **Thiết kế lại dạng dọc card** (vertical card)
  - Top: Checkbox + Icon + Type badge
  - Middle: Tên file `line-clamp-2` (tối đa 2 dòng)
  - Bottom: Size + action buttons nhỏ (`Trích`, `Xem`, icon Download)
- Gọn gàng hơn, phù hợp sidebar hẹp `220px`
- Bỏ: status badge "Đã xong", `Card` import

#### `app/(app)/layout.tsx`
- Comment out navigation item "Webhooks" và breadcrumb logic

#### `app/(app)/webhooks/page.tsx`
- Comment out toàn bộ page content, thay bằng placeholder

### Prompt Engineering

#### `buildChatPrompt` (Chat mode)
```
Bạn là hệ thống hỗ trợ bóc tách chứng từ logistics.
Trả lời trực tiếp bằng văn bản tự nhiên, không bắt buộc JSON.
```

#### `buildTemplatePrompt` (Template mode)
```
Bạn là hệ thống bóc tách chứng từ logistics.
Trả về DUY NHẤT JSON hợp lệ, không markdown, không giải thích.
Định dạng bắt buộc: một mảng object (array of objects).
```

### API Integration
- Sử dụng `useProcessDocumentsMutation` từ `@/hooks/use-mail-queries`
- Payload: `{ files: [{fileName, content, type, mimeType}], prompt, model: "gpt-4" }`
- Kết quả được `extractResultStringFromProcessResponse` xử lý

### Responsive
- Desktop (`md+`): 3 cột ngang, chiều cao `calc(100dvh - 116px)`, scroll độc lập mỗi cột
- Mobile: 1 cột, thứ tự email → files → chat

### CSS Fixes
- `bg-gradient-to-r` → `bg-linear-to-r` (Tailwind v4 syntax)
- Không dùng `h-screen`, thay bằng `min-h-[100dvh]`

## Các công việc trước đó (26/05)
- Đổi API endpoint sang Logistics platform
- Login page gắn API, lưu token
- Emails list: đổi sortField, fix UI nowrap
- Email detail: 70/30 layout, chọn file cho AI
- Token interceptor (request + 401 redirect)
