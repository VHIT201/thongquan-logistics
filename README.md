# Logistics Platform

Hệ thống quản lý vận hành logistics/thông quan tích hợp AI — từ email nhận chứng từ, bóc tách dữ liệu tự động, tạo task/ticket, đến báo cáo tổng hợp và giám sát hiệu suất nhân viên.

## Tổng quan

Platform hỗ trợ doanh nghiệp logistics xử lý quy trình:

```
Email khách hàng → AI bóc tách chứng từ → Tạo Ticket/Task → Nhân viên xử lý → Báo cáo tổng hợp
```

**Đối tượng sử dụng chính:**
- **CEO / Ban Giám đốc** — Theo dõi tổng quan vận hành, hiệu suất nhân viên, cảnh báo rủi ro
- **Nhân viên nghiệp vụ** — Xử lý email, chứng từ, task được phân công
- **Quản trị viên** — Quản lý người dùng, phân quyền, cấu hình hệ thống

## Công nghệ

| Layer | Công nghệ |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16.2.6 (App Router) |
| Runtime | React 19.2.4, TypeScript 5.9.3 |
| Styling | Tailwind CSS v4, PostCSS |
| UI Components | Radix UI primitives (Dialog, Dropdown, Tabs, Select, Toast, ...) |
| State & Data | Zustand, TanStack Query v5 |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |
| Fonts | Geist (Sans + Mono) — Next.js built-in |
| API Client | Axios, Orval (OpenAPI codegen) |
| Date | Dayjs |
| Office Docs | docx-preview, mammoth, xlsx |
| Dev Tools | ESLint 9, sharp |

## Chức năng chính

### 1. Dashboard tổng quan (`/`)
- Thống kê email, task, trạng thái xử lý theo thời gian thực
- Biểu đồ xu hướng (Line, Bar, Pie) — Recharts
- Top khách hàng phát sinh nhiều công việc

### 2. CEO Dashboard (`/ceo`)
- **KPI tổng quan** toàn công ty: email, task, tỷ lệ hoàn thành, AI success rate
- **Cảnh báo** theo mức độ: task quá hạn, email chưa xử lý, nhân viên quá tải
- **Hiệu suất theo phòng ban**: Chứng từ, Khai báo, Kế toán, Nghiệp vụ
- **Bảng nhân viên**: task, completion rate, thời gian xử lý TB, cảnh báo
- **Chi tiết nhân viên** (drawer): task đang XL, quá hạn, email, khách hàng phụ trách, lịch sử, chỉ số, AI
- **Thống kê AI bóc tách**: tỷ lệ thành công, thiếu dữ liệu, cần review theo loại chứng từ
- **Báo cáo tổng hợp**: xuất Excel theo ngày / nhân viên / khách hàng / trạng thái
- Bộ lọc thời gian, phòng ban, nhân viên, khách hàng, trạng thái

> **Agency Redesign:** CEO Dashboard đã được redesign theo phong cách *Soft Structuralism* — double-bezel cards, spring physics animation, Geist Mono cho dữ liệu, pill-shaped tabs, glass island dialogs.

### 3. Email & Chứng từ (`/emails`)
- Danh sách email nhận từ khách hàng
- Xem chi tiết email, file đính kèm, dữ liệu AI bóc tách
- Preview file Office (docx, xlsx) trong trình duyệt
- Cập nhật trạng thái xử lý, tạo task từ email

### 4. Nhân viên (`/employees`)
- Danh sách nhân viên toàn công ty
- Theo dõi task, email, hiệu suất từng người

### 5. Báo cáo (`/reports`, `/reports/import`)
- Báo cáo tổng hợp ngày / tuần / tháng
- Báo cáo theo nhân viên, khách hàng, phòng ban
- Import dữ liệu báo cáo

### 6. Quản trị (`/admin`)
- Quản lý người dùng, vai trò, phân quyền
- Quản lý mail accounts, mail templates
- Cấu hình AI prompts / templates
- Nhật ký hệ thống (logs)
- AI usage analytics

### 7. Cấu hình & Tài khoản
- `/mail-accounts` — Kết nối & quản lý tài khoản email
- `/mail-templates` — Mẫu email phản hồi
- `/templates` — Mẫu chứng từ / báo cáo
- `/user` — Thông tin cá nhân
- `/webhooks` — Tích hợp webhook bên ngoài

## Chạy dự án

### Yêu cầu
- Node.js 20+
- pnpm (khuyến nghị)

### Cài đặt

```bash
pnpm install
```

> Nếu gặp warning "Ignored build scripts: esbuild@..., sharp@...", chạy `pnpm approve-builds` trước.

### Chạy dev

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

### Build production

```bash
pnpm build
pnpm start
```

### Lint

```bash
pnpm lint
```

### API client generation (Orval)

```bash
pnpm api:gen
```

## Cấu trúc thư mục

```
app/
  (app)/           # App shell (layout, sidebar, header)
    page.tsx        # Dashboard chính
    ceo/            # CEO Dashboard
    emails/         # Quản lý email
    employees/      # Quản lý nhân viên
    reports/        # Báo cáo
    admin/          # Trang quản trị
    ...
  api/              # Route handlers (Next.js API)
  globals.css       # Global styles + design tokens
  layout.tsx        # Root layout + Geist font config
components/
  ui/               # Shadcn / Radix UI primitives
  ceo/              # CEO-specific components (employee-table, detail-drawer, ...)
  ...
lib/                # Utilities, hooks, stores (Zustand)
```

## Luồng dữ liệu tổng thể

```
Khách hàng gửi email/chứng từ
    ↓
Hệ thống nhận email (Mail Connector)
    ↓
AI bóc tách dữ liệu (Invoice, Bill, Booking, Tờ khai, ...)
    ↓
Tạo Ticket / Task tự động
    ↓
Nhân viên xử lý task, cập nhật trạng thái
    ↓
Dữ liệu đưa vào báo cáo tổng hợp
    ↓
CEO giám sát qua Dashboard / Reports
```

## Tài liệu tham khảo

- `ceo_route_function_description.md` — Mô tả chi tiết chức năng route `/ceo`
- `DESIGN.md` — Design system specs (Agency Redesign: palette, typography, spacing, motion)

## License

Private — Internal use only.
