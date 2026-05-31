# Tài liệu mô tả chức năng Route CEO

**Dự án:** Prototype hệ thống Email → AI bóc tách chứng từ → Ticket/Task → Báo cáo tổng hợp  
**Route chính:** `/ceo`  
**Đối tượng sử dụng:** CEO / Ban Giám đốc / Quản lý cấp cao  
**Mục tiêu:** Cung cấp màn hình điều hành tổng quan và chi tiết để CEO theo dõi tình hình xử lý email, chứng từ, ticket/task, hiệu suất nhân viên, cảnh báo rủi ro và báo cáo tổng hợp.

---

## 1. Mục tiêu của route `/ceo`

Route `/ceo` được xây dựng để CEO có thể theo dõi toàn bộ hoạt động vận hành của hệ thống mà không cần đi vào từng màn hình nghiệp vụ nhỏ.

CEO cần trả lời nhanh các câu hỏi:

- Hôm nay có bao nhiêu email/chứng từ phát sinh?
- Bao nhiêu ticket/task đã được tạo?
- Bao nhiêu việc đã xử lý, đang xử lý, chưa xử lý hoặc quá hạn?
- Nhân viên nào đang xử lý nhiều việc?
- Nhân viên nào bị tồn việc, quá hạn hoặc cần quản lý can thiệp?
- Khách hàng nào đang phát sinh nhiều hồ sơ/chứng từ?
- AI bóc tách chứng từ có hiệu quả không?
- Có bao nhiêu file bóc tách thành công, thiếu dữ liệu hoặc cần kiểm tra lại?
- Báo cáo tổng hợp đã đầy đủ chưa?
- Có rủi ro nào ảnh hưởng đến kế toán, công nợ hoặc tiến độ xử lý không?

Route `/ceo` không tập trung vào thao tác xử lý nghiệp vụ trực tiếp, mà tập trung vào:

- Giám sát.
- Theo dõi tiến độ.
- Phát hiện rủi ro.
- Xem chi tiết theo nhân viên/phòng ban/khách hàng.
- Xuất báo cáo.
- Hỗ trợ CEO ra quyết định nhanh.

---

## 2. Phạm vi chức năng

Route `/ceo` bao gồm các nhóm chức năng chính:

1. Tổng quan vận hành toàn hệ thống.
2. Cảnh báo cần CEO chú ý.
3. Hiệu suất theo phòng ban.
4. Hiệu suất theo nhân viên.
5. Chi tiết công việc của từng nhân viên.
6. Theo dõi email/chứng từ/ticket/task.
7. Theo dõi hiệu quả AI bóc tách dữ liệu.
8. Báo cáo tổng hợp.
9. Bộ lọc dữ liệu.
10. Xuất báo cáo.
11. Phân quyền truy cập route CEO.

---

## 3. Route đề xuất

### 3.1 Route chính

```txt
/ceo
```

Đây là route chính hiển thị dashboard CEO.

### 3.2 Route chi tiết nhân viên

```txt
/ceo/employees/:employeeId
```

Route này dùng để xem chi tiết hoạt động của một nhân viên cụ thể.

Trong giai đoạn prototype, có thể chưa cần tách route riêng. Có thể dùng drawer/modal trên chính màn hình `/ceo`.

### 3.3 Route chi tiết task

```txt
/ceo/tasks/:taskId
```

Route này dùng để xem chi tiết một task/ticket cụ thể.

CEO được phép xem chi tiết nhưng mặc định không trực tiếp sửa dữ liệu nghiệp vụ.

### 3.4 Route báo cáo

```txt
/ceo/reports
```

Route này dùng để xem báo cáo tổng hợp nâng cao.

Trong prototype, phần báo cáo có thể là một section nằm ngay trong `/ceo`.

---

## 4. Xác định role CEO

### 4.1 Prototype/demo mode

Trong giai đoạn prototype FE, chưa có backend phân quyền hoàn chỉnh, có thể dùng localStorage để giả lập user CEO.

Ví dụ:

```ts
localStorage.setItem("currentUser", JSON.stringify({
  id: "u-ceo-001",
  name: "CEO",
  role: "CEO"
}));
```

Khi vào hệ thống:

```ts
const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

if (user.role === "CEO") {
  // Allow access to /ceo
}
```

### 4.2 Production mode

Trong môi trường thật, role CEO không nên lấy từ localStorage vì user có thể tự chỉnh sửa.

Role/permission nên được lấy từ JWT token hoặc API `/me`.

Ví dụ JWT payload:

```json
{
  "userId": "u-001",
  "name": "Nguyễn Văn A",
  "role": "CEO",
  "permissions": [
    "VIEW_CEO_DASHBOARD",
    "VIEW_ALL_TASKS",
    "VIEW_ALL_REPORTS",
    "VIEW_EMPLOYEE_PERFORMANCE",
    "EXPORT_REPORT"
  ]
}
```

### 4.3 Permission đề xuất

| Permission | Ý nghĩa |
|---|---|
| `VIEW_CEO_DASHBOARD` | Được xem dashboard CEO |
| `VIEW_ALL_TASKS` | Được xem tất cả task/ticket |
| `VIEW_ALL_EMAILS` | Được xem danh sách email/chứng từ |
| `VIEW_ALL_REPORTS` | Được xem toàn bộ báo cáo |
| `VIEW_EMPLOYEE_PERFORMANCE` | Được xem hiệu suất nhân viên |
| `VIEW_AI_EXTRACTION_SUMMARY` | Được xem thống kê AI bóc tách |
| `EXPORT_REPORT` | Được xuất báo cáo |
| `SEND_REMINDER` | Được gửi nhắc nhở quản lý/nhân viên |
| `REASSIGN_TASK` | Được điều phối lại task nếu được cấu hình |

---

## 5. Bố cục tổng thể route `/ceo`

```txt
CEO Dashboard
│
├── 1. Header + Bộ lọc thời gian
│
├── 2. KPI tổng quan toàn công ty
│
├── 3. Cảnh báo cần chú ý
│
├── 4. Tổng quan theo phòng ban
│
├── 5. Hiệu suất nhân viên
│
├── 6. Biểu đồ vận hành
│
├── 7. Thống kê AI bóc tách chứng từ
│
├── 8. Danh sách task/email cần xử lý
│
├── 9. Báo cáo tổng hợp
│
└── 10. Hành động nhanh
```

---

## 6. Header route CEO

### 6.1 Thành phần UI

Header nên hiển thị:

- Tiêu đề: `CEO Dashboard`
- Lời chào: `Xin chào, CEO`
- Ngày hiện tại
- Bộ lọc thời gian
- Bộ lọc phòng ban
- Bộ lọc nhân viên
- Button xuất báo cáo

Ví dụ:

```txt
CEO Dashboard
Theo dõi tổng quan xử lý email, chứng từ, task và báo cáo nghiệp vụ

[Hôm nay] [Tuần này] [Tháng này] [Tùy chọn ngày]
[Phòng ban] [Nhân viên] [Khách hàng] [Trạng thái]
[Xuất báo cáo]
```

### 6.2 Bộ lọc thời gian

Các lựa chọn:

- Hôm nay
- Hôm qua
- Tuần này
- Tháng này
- Quý này
- Tùy chọn ngày

### 6.3 Bộ lọc dữ liệu

| Bộ lọc | Mô tả |
|---|---|
| Phòng ban | Lọc theo team/phòng xử lý |
| Nhân viên | Lọc theo nhân viên cụ thể |
| Khách hàng | Lọc theo khách hàng |
| Trạng thái | Lọc theo trạng thái task |
| Loại chứng từ | Invoice, Bill, Booking, Tờ khai, Khác |
| Mức cảnh báo | Bình thường, Cần chú ý, Quá hạn, Rủi ro cao |

---

## 7. KPI tổng quan toàn công ty

### 7.1 Danh sách KPI chính

| KPI | Mô tả |
|---|---|
| Tổng email nhận | Tổng số email hệ thống nhận trong khoảng thời gian lọc |
| Tổng file/chứng từ | Tổng số file đính kèm/chứng từ được ghi nhận |
| Tổng ticket/task | Tổng số ticket/task được tạo |
| Đã xử lý | Số task hoàn tất |
| Đang xử lý | Số task đang được nhân viên xử lý |
| Chưa xử lý | Số email/task chưa được xử lý |
| Quá hạn | Số task vượt SLA hoặc quá thời gian xử lý |
| Tỷ lệ hoàn thành | Số task hoàn tất / tổng task |
| AI bóc tách thành công | Tỷ lệ file AI đọc và bóc tách thành công |
| Báo cáo đã tổng hợp | Số dòng dữ liệu đã được đưa vào báo cáo |
| Dữ liệu thiếu/cần kiểm tra | Số chứng từ thiếu thông tin hoặc confidence thấp |

### 7.2 Ví dụ hiển thị

```txt
Tổng email hôm nay: 238
Tổng task phát sinh: 186
Đã xử lý: 142
Đang xử lý: 31
Chưa xử lý: 13
Quá hạn: 8
AI success rate: 82%
Tỷ lệ hoàn thành: 76%
```

### 7.3 Quy tắc tính toán

```txt
Tỷ lệ hoàn thành = Số task hoàn tất / Tổng task * 100

Tỷ lệ AI thành công = Số file bóc tách thành công / Tổng file AI xử lý * 100

Task quá hạn = Task chưa hoàn tất và thời gian hiện tại > dueAt

Task chưa xử lý = Task/email chưa có trạng thái processing/completed hoặc chưa có người xử lý
```

---

## 8. Cảnh báo cần CEO chú ý

### 8.1 Mục tiêu

Khu vực cảnh báo giúp CEO phát hiện nhanh các vấn đề có thể ảnh hưởng đến vận hành.

### 8.2 Các loại cảnh báo

| Loại cảnh báo | Ý nghĩa |
|---|---|
| Email chưa ai xử lý | Có nguy cơ sót mail |
| Task quá hạn | Có nguy cơ chậm tiến độ |
| Nhân viên quá tải | Một nhân viên có quá nhiều task đang xử lý |
| Nhân viên hiệu suất thấp | Tỷ lệ hoàn thành thấp hoặc nhiều task pending |
| File AI bóc tách lỗi | Chất lượng file/chứng từ hoặc model cần kiểm tra |
| Dữ liệu báo cáo thiếu | Có thể ảnh hưởng kế toán/công nợ |
| Khách hàng phát sinh nhiều pending | Cần ưu tiên theo dõi |
| Task chờ khách quá lâu | Cần nhắc khách hoặc nhân viên phụ trách |
| Task chờ hải quan quá lâu | Cần theo dõi tình trạng xử lý tờ khai |

### 8.3 Ví dụ cảnh báo

```txt
Cảnh báo hôm nay

1. Nguyễn Văn A có 5 task quá hạn.
2. Team Chứng từ còn 18 task pending.
3. Công ty ABC có 3 hồ sơ thiếu dữ liệu báo cáo.
4. Có 12 email chưa được tạo task.
5. 27 file AI bóc tách thiếu thông tin quan trọng.
```

### 8.4 Mức độ cảnh báo

| Mức | Tên | Mô tả |
|---|---|---|
| Low | Thấp | Chưa ảnh hưởng nghiêm trọng |
| Medium | Trung bình | Cần theo dõi |
| High | Cao | Cần quản lý can thiệp |
| Critical | Nghiêm trọng | Có nguy cơ ảnh hưởng báo cáo/công nợ/khách hàng |

---

## 9. Tổng quan theo phòng ban

### 9.1 Mục tiêu

CEO cần biết phòng ban nào đang xử lý ổn, phòng ban nào đang bị nghẽn.

### 9.2 Bảng phòng ban

| Phòng ban | Tổng task | Đã xử lý | Đang xử lý | Quá hạn | Tỷ lệ hoàn thành | Cảnh báo |
|---|---:|---:|---:|---:|---:|---|
| Chứng từ | 520 | 410 | 80 | 30 | 78.8% | Cần theo dõi |
| Khai báo | 380 | 320 | 45 | 15 | 84.2% | Ổn định |
| Kế toán | 160 | 130 | 20 | 10 | 81.2% | Cần kiểm tra |
| Nghiệp vụ | 240 | 190 | 35 | 15 | 79.1% | Cần theo dõi |

### 9.3 Chức năng

CEO có thể:

- Click vào phòng ban để lọc danh sách nhân viên thuộc phòng ban đó.
- Xem số lượng task theo trạng thái.
- Xem phòng ban có nhiều pending/quá hạn.
- Xem phòng ban nào ảnh hưởng nhiều đến báo cáo tổng hợp.

---

## 10. Hiệu suất nhân viên

### 10.1 Mục tiêu

Đây là phần quan trọng nhất của route CEO. CEO cần xem được nhân viên nào đang làm gì, làm bao nhiêu, có bị trễ không, đang phụ trách khách hàng nào.

### 10.2 Bảng hiệu suất nhân viên

| Nhân viên | Phòng ban | Tổng task | Đã xử lý | Đang xử lý | Chưa xử lý | Quá hạn | Tỷ lệ hoàn thành | Thời gian TB | Cảnh báo |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| Nguyễn Văn A | Chứng từ | 120 | 95 | 18 | 2 | 5 | 79% | 18 phút | 5 task quá hạn |
| Trần Thị B | Khai báo | 98 | 88 | 6 | 1 | 3 | 89% | 14 phút | Ổn định |
| Lê Văn C | Nghiệp vụ | 75 | 40 | 25 | 4 | 6 | 53% | 35 phút | Cần kiểm tra |
| Phạm Thị D | Kế toán | 60 | 52 | 5 | 1 | 2 | 86% | 20 phút | Ổn định |

### 10.3 Các chỉ số nhân viên

| Chỉ số | Mô tả |
|---|---|
| Tổng email liên quan | Tổng email nhân viên được giao hoặc phụ trách |
| Tổng task | Tổng task trong khoảng thời gian lọc |
| Đã xử lý | Task đã hoàn tất |
| Đang xử lý | Task đang xử lý |
| Chưa xử lý | Task chưa xử lý |
| Quá hạn | Task quá thời hạn |
| Tỷ lệ hoàn thành | Completed / Total |
| Thời gian xử lý trung bình | Trung bình từ lúc nhận đến lúc hoàn tất |
| Số file AI đã xử lý | Số file nhân viên dùng AI bóc tách |
| Số file cần kiểm tra lại | File thiếu dữ liệu hoặc confidence thấp |
| Khách hàng phụ trách | Danh sách khách hàng nhân viên đang xử lý |

### 10.4 Hành động trên bảng nhân viên

| Action | Mô tả |
|---|---|
| Xem chi tiết | Mở trang/drawer chi tiết nhân viên |
| Lọc task của nhân viên | Hiển thị task liên quan đến nhân viên |
| Xem khách hàng phụ trách | Hiển thị danh sách khách hàng của nhân viên |
| Xem task quá hạn | Hiển thị danh sách task quá hạn |
| Nhắc quản lý | Gửi thông báo cho quản lý phụ trách |
| Xuất báo cáo nhân viên | Xuất dữ liệu hiệu suất nhân viên |

---

## 11. Chi tiết nhân viên

### 11.1 Route

```txt
/ceo/employees/:employeeId
```

Hoặc dùng drawer trong route `/ceo`.

### 11.2 Header chi tiết nhân viên

Thông tin hiển thị:

```txt
Nguyễn Văn A
Phòng ban: Chứng từ
Vai trò: Nhân viên xử lý chứng từ
Email: nguyenvana@thongquan.com.vn
Trạng thái hôm nay: Đang xử lý 18 task, quá hạn 5 task
```

### 11.3 Tab chi tiết nhân viên

Màn hình chi tiết nhân viên nên có các tab:

1. Tổng quan.
2. Task đang xử lý.
3. Task quá hạn.
4. Email/chứng từ liên quan.
5. Khách hàng phụ trách.
6. Lịch sử xử lý.
7. Báo cáo cá nhân.

---

## 12. Tab Tổng quan nhân viên

### 12.1 KPI cá nhân

| Chỉ số | Giá trị |
|---|---:|
| Tổng email liên quan | 156 |
| Tổng task được giao | 120 |
| Đã hoàn tất | 95 |
| Đang xử lý | 18 |
| Chưa xử lý | 2 |
| Quá hạn | 5 |
| Tỷ lệ hoàn thành | 79% |
| Thời gian xử lý trung bình | 18 phút |
| File AI đã bóc tách | 86 |
| File cần kiểm tra lại | 14 |

### 12.2 Biểu đồ cá nhân

Có thể hiển thị:

- Task theo ngày.
- Tỷ lệ hoàn thành.
- Tỷ lệ quá hạn.
- Số file AI xử lý.
- Số task theo khách hàng.

---

## 13. Tab Task đang xử lý

### 13.1 Bảng task

| Mã task | Khách hàng | Loại chứng từ | Trạng thái | Thời gian nhận | Hạn xử lý | Cảnh báo |
|---|---|---|---|---|---|---|
| TK-001 | Công ty A | Invoice | Đang xử lý | 08:30 | 10:30 | Bình thường |
| TK-002 | Công ty B | Bill | Chờ khách hàng | 09:15 | 11:15 | Chờ bổ sung |
| TK-003 | Công ty C | Tờ khai | Chờ hải quan | 10:20 | 12:20 | Cần theo dõi |

### 13.2 Chức năng

CEO có thể:

- Xem chi tiết task.
- Xem file/chứng từ liên quan.
- Xem dữ liệu AI bóc tách.
- Xem trạng thái.
- Xem lý do chờ.
- Xem lịch sử cập nhật.

---

## 14. Tab Task quá hạn

### 14.1 Mục tiêu

Giúp CEO kiểm tra các việc đang có rủi ro chậm tiến độ.

### 14.2 Bảng task quá hạn

| Mã task | Khách hàng | Nhân viên | Trạng thái | Hạn xử lý | Quá hạn | Lý do |
|---|---|---|---|---|---|---|
| TK-010 | Công ty A | Nguyễn Văn A | Chờ khách hàng | 10:30 | 45 phút | Thiếu booking |
| TK-011 | Công ty C | Nguyễn Văn A | Chờ hải quan | 09:00 | 2 giờ | Chờ phản hồi |
| TK-012 | Công ty D | Nguyễn Văn A | Đang xử lý | 08:45 | 3 giờ | Chưa cập nhật |

### 14.3 Hành động

| Action | Mô tả |
|---|---|
| Xem chi tiết | Xem task đầy đủ |
| Nhắc quản lý | Gửi nhắc nhở cho quản lý |
| Theo dõi | Đưa vào danh sách theo dõi ưu tiên |
| Ghi chú điều hành | CEO/Manager ghi chú nội bộ |

---

## 15. Tab Email/chứng từ liên quan

### 15.1 Bảng email/chứng từ

| Thời gian nhận | Tiêu đề email | Khách hàng | File đính kèm | AI bóc tách | Trạng thái |
|---|---|---|---:|---|---|
| 08:15 | INV Công ty A - Bill 123 | Công ty A | 3 file | Thành công | Đã tạo task |
| 09:00 | Booking Công ty B | Công ty B | 2 file | Thiếu dữ liệu | Cần kiểm tra |
| 10:20 | Chứng từ nhập khẩu | Công ty C | 5 file | Thành công | Đang xử lý |

### 15.2 Thông tin cần xem khi click email

- Người gửi.
- Người nhận.
- CC/BCC nếu có.
- Tiêu đề.
- Nội dung email.
- File đính kèm.
- Task/ticket liên kết.
- Khách hàng nhận diện được.
- Mã invoice/bill/booking/DAT nếu có.
- Kết quả AI bóc tách.
- Trạng thái xử lý.

---

## 16. Tab Khách hàng phụ trách

### 16.1 Mục tiêu

CEO cần biết nhân viên đang phụ trách những khách hàng nào và khách nào đang phát sinh nhiều công việc/rủi ro.

### 16.2 Bảng khách hàng

| Khách hàng | Số email | Số task | Đang xử lý | Quá hạn | File AI lỗi | Ghi chú |
|---|---:|---:|---:|---:|---:|---|
| Công ty A | 35 | 28 | 5 | 1 | 2 | Phát sinh nhiều invoice |
| Công ty B | 22 | 18 | 3 | 0 | 1 | Ổn định |
| Công ty C | 18 | 15 | 6 | 3 | 4 | Cần quản lý kiểm tra |

### 16.3 Chức năng

CEO có thể:

- Xem khách hàng nào phát sinh nhiều việc.
- Xem khách hàng nào có nhiều task pending.
- Xem khách hàng nào có nhiều chứng từ thiếu dữ liệu.
- Lọc task/email theo khách hàng.
- Xuất báo cáo theo khách hàng.

---

## 17. Tab Lịch sử xử lý

### 17.1 Mục tiêu

Giúp CEO biết task có được xử lý thật hay đang bị treo.

### 17.2 Bảng lịch sử

| Thời gian | Hành động | Người thực hiện | Nội dung |
|---|---|---|---|
| 08:30 | Nhận task | Nguyễn Văn A | Nhận xử lý email INV Công ty A |
| 08:35 | AI bóc tách | Hệ thống | Bóc tách thành công invoice |
| 08:45 | Cập nhật trạng thái | Nguyễn Văn A | Chuyển sang đang xử lý |
| 09:20 | Ghi chú | Nguyễn Văn A | Thiếu thông tin booking, chờ khách bổ sung |
| 10:10 | Hoàn tất | Nguyễn Văn A | Đã cập nhật báo cáo tổng hợp |

### 17.3 Loại lịch sử cần lưu

- Nhận task.
- Assign task.
- Reassign task.
- Cập nhật trạng thái.
- AI bóc tách file.
- Sửa dữ liệu sau khi bóc tách.
- Ghi chú nội bộ.
- Xuất báo cáo.
- Hoàn tất task.
- Hủy task.
- Cảnh báo quá hạn.

---

## 18. Chi tiết task/ticket

### 18.1 Route

```txt
/ceo/tasks/:taskId
```

Hoặc mở drawer/modal từ bảng task.

### 18.2 Thông tin task

| Trường | Mô tả |
|---|---|
| Mã task | Mã định danh task |
| Tiêu đề | Tiêu đề task hoặc email |
| Khách hàng | Khách hàng liên quan |
| Nhân viên xử lý | Người đang phụ trách |
| Phòng ban | Phòng ban xử lý |
| Loại chứng từ | Invoice/Bill/Booking/Tờ khai/Khác |
| Trạng thái | Trạng thái hiện tại |
| Độ ưu tiên | Low/Medium/High/Critical |
| Ngày nhận | Thời gian nhận email/task |
| Hạn xử lý | SLA/dueAt |
| Thời gian hoàn tất | Nếu task đã xong |
| Cảnh báo | Có quá hạn/thiếu dữ liệu không |
| Ghi chú | Ghi chú nội bộ |
| File đính kèm | Danh sách chứng từ |
| Kết quả AI | Dữ liệu bóc tách |
| Lịch sử | Timeline xử lý |

### 18.3 Trạng thái task đề xuất

| Trạng thái | Ý nghĩa |
|---|---|
| `new` | Mới tiếp nhận |
| `unassigned` | Chưa có người xử lý |
| `assigned` | Đã phân công |
| `processing` | Đang xử lý |
| `waiting_customer` | Chờ khách hàng |
| `waiting_customs` | Chờ hải quan |
| `need_review` | Cần kiểm tra lại |
| `completed` | Hoàn tất |
| `overdue` | Quá hạn |
| `cancelled` | Đã hủy |

---

## 19. Thống kê AI bóc tách chứng từ

### 19.1 Mục tiêu

CEO cần biết AI đang giúp được bao nhiêu phần trăm công việc.

### 19.2 KPI AI

| Chỉ số | Mô tả |
|---|---|
| Tổng file AI xử lý | Tổng file đưa vào AI |
| Bóc tách thành công | File AI đọc được đầy đủ |
| Thiếu thông tin | File bóc tách thiếu field |
| Cần nhân viên kiểm tra | Confidence thấp hoặc dữ liệu nghi ngờ |
| Lỗi không đọc được | File lỗi, scan mờ, sai định dạng |
| Tỷ lệ thành công | Success / Total |
| Tỷ lệ cần review | Need review / Total |
| Thời gian xử lý trung bình | Trung bình thời gian AI xử lý/file |

### 19.3 Bảng thống kê theo loại chứng từ

| Loại chứng từ | Tổng file | Thành công | Cần kiểm tra | Lỗi | Tỷ lệ thành công |
|---|---:|---:|---:|---:|---:|
| Invoice | 520 | 450 | 55 | 15 | 86.5% |
| Bill | 310 | 250 | 45 | 15 | 80.6% |
| Booking | 220 | 170 | 38 | 12 | 77.2% |
| Tờ khai | 190 | 120 | 55 | 15 | 63.1% |

### 19.4 Field bóc tách đề xuất

Các field có thể dùng trong hệ thống logistics/thông quan:

- Tên khách hàng.
- Mã khách hàng.
- Số invoice.
- Số bill.
- Số booking.
- Số container.
- Số tờ khai.
- Ngày tờ khai.
- Loại hình xuất/nhập.
- Cảng nhập.
- Cảng xuất.
- Loại hàng.
- Số lượng kiện/kg.
- Số lượng container 20ft/40ft.
- Trạng thái lô hàng.
- Ghi chú.
- Nhân viên xử lý.
- Tình trạng tờ khai.
- Thông tin cần bổ sung.

---

## 20. Báo cáo tổng hợp

### 20.1 Mục tiêu

Báo cáo tổng hợp là mục tiêu quan trọng của route CEO. CEO cần xem được dữ liệu cuối cùng phục vụ quản lý, kế toán và theo dõi tiến độ.

### 20.2 Các loại báo cáo

| Báo cáo | Mục đích |
|---|---|
| Báo cáo tổng hợp ngày | Theo dõi toàn bộ phát sinh trong ngày |
| Báo cáo công việc phòng nghiệp vụ | Theo dõi số lượng xử lý theo phòng/team |
| Báo cáo theo nhân viên | Đánh giá hiệu suất nhân viên |
| Báo cáo theo khách hàng | Theo dõi khách hàng phát sinh nhiều |
| Báo cáo theo trạng thái | Biết số lượng pending/hoàn tất/quá hạn |
| Báo cáo AI bóc tách | Đánh giá hiệu quả AI |
| Báo cáo thiếu dữ liệu | Kiểm soát dữ liệu ảnh hưởng kế toán/công nợ |
| Báo cáo tờ khai | Theo dõi số lượng tờ khai và tình trạng xử lý |

### 20.3 Bảng báo cáo tổng hợp

| STT | Khách hàng | Invoice | Bill | Booking | Loại | Nhân viên | Trạng thái | Ngày nhận | Ngày hoàn tất | Ghi chú |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | Công ty A | INV001 | BILL001 | BK001 | Nhập | Nguyễn Văn A | Hoàn tất | 29/05/2026 | 29/05/2026 | Đủ dữ liệu |
| 2 | Công ty B | INV002 | BILL002 | BK002 | Xuất | Trần Thị B | Đang xử lý | 29/05/2026 | - | Chờ khách |
| 3 | Công ty C | INV003 | BILL003 | BK003 | Nhập | Lê Văn C | Quá hạn | 29/05/2026 | - | Thiếu booking |

### 20.4 Chức năng xuất báo cáo

CEO có thể:

- Xuất Excel.
- Xuất PDF.
- Xuất theo ngày.
- Xuất theo nhân viên.
- Xuất theo khách hàng.
- Xuất theo trạng thái.
- Xuất dữ liệu thiếu/cần kiểm tra.
- Lưu lịch sử xuất báo cáo.

Trong prototype, có thể làm trước export Excel từ mock data.

---

## 21. Hành động nhanh của CEO

### 21.1 Danh sách action

| Action | Mô tả | Mức ưu tiên |
|---|---|---|
| Xem báo cáo tổng hợp | Mở báo cáo chính | Cao |
| Xuất báo cáo | Xuất Excel/PDF | Cao |
| Xem task quá hạn | Xem danh sách task rủi ro | Cao |
| Xem email chưa xử lý | Xem email có nguy cơ sót | Cao |
| Xem nhân viên quá tải | Xem nhân viên workload cao | Trung bình |
| Nhắc quản lý | Gửi nhắc nhở cho quản lý phụ trách | Trung bình |
| Theo dõi task | Đánh dấu task cần quan tâm | Trung bình |
| Reassign task | Điều phối lại task nếu được phép | Tùy quyền |
| Xem dữ liệu AI lỗi | Kiểm tra file AI bóc tách lỗi | Trung bình |

### 21.2 CEO nên được làm gì?

CEO nên được:

- Xem dữ liệu.
- Lọc dữ liệu.
- Xem chi tiết.
- Xuất báo cáo.
- Gửi nhắc nhở.
- Theo dõi task quan trọng.

CEO không nên trực tiếp:

- Sửa dữ liệu chứng từ.
- Xóa task.
- Xóa email.
- Thay đổi dữ liệu báo cáo sau khi đã khóa sổ.
- Can thiệp nghiệp vụ chi tiết nếu chưa có quyền rõ ràng.

---

## 22. Data model mock đề xuất

### 22.1 CEO overview

```ts
export const ceoDashboardMock = {
  overview: {
    totalEmails: 238,
    totalAttachments: 412,
    totalTasks: 186,
    completedTasks: 142,
    processingTasks: 31,
    pendingTasks: 13,
    overdueTasks: 8,
    aiSuccessRate: 82,
    completionRate: 76,
    reportRows: 150,
    missingDataRows: 12
  }
};
```

### 22.2 Employee performance

```ts
export const ceoEmployeesMock = [
  {
    id: "emp-001",
    name: "Nguyễn Văn A",
    department: "Chứng từ",
    role: "Nhân viên chứng từ",
    email: "nguyenvana@thongquan.com.vn",
    totalEmails: 156,
    totalTasks: 120,
    completedTasks: 95,
    processingTasks: 18,
    pendingTasks: 2,
    overdueTasks: 5,
    completionRate: 79,
    averageProcessingTime: "18 phút",
    aiExtractedFiles: 86,
    aiNeedReviewFiles: 14,
    customers: [
      {
        customerName: "Công ty A",
        totalEmails: 35,
        totalTasks: 28,
        processingTasks: 5,
        overdueTasks: 1
      }
    ],
    currentTasks: [
      {
        id: "TK-001",
        customerName: "Công ty A",
        emailSubject: "INV Công ty A - Bill 123",
        documentType: "Invoice",
        status: "processing",
        receivedAt: "2026-05-29 08:30",
        dueAt: "2026-05-29 10:30",
        warning: "Bình thường"
      },
      {
        id: "TK-003",
        customerName: "Công ty C",
        emailSubject: "Tờ khai nhập khẩu - Booking 456",
        documentType: "Tờ khai",
        status: "overdue",
        receivedAt: "2026-05-29 07:20",
        dueAt: "2026-05-29 09:20",
        warning: "Quá hạn 45 phút"
      }
    ]
  }
];
```

### 22.3 Alert model

```ts
export const ceoAlertsMock = [
  {
    id: "alert-001",
    type: "overdue_task",
    level: "high",
    title: "Nguyễn Văn A có 5 task quá hạn",
    description: "Cần kiểm tra các task đang pending quá SLA.",
    relatedEmployeeId: "emp-001",
    relatedTaskIds: ["TK-003", "TK-010"],
    createdAt: "2026-05-29 10:30"
  },
  {
    id: "alert-002",
    type: "unprocessed_email",
    level: "medium",
    title: "Có 12 email chưa được xử lý",
    description: "Các email này chưa được tạo task hoặc chưa có người phụ trách.",
    createdAt: "2026-05-29 11:00"
  }
];
```

### 22.4 AI extraction summary

```ts
export const aiExtractionSummaryMock = {
  totalFiles: 1240,
  success: 980,
  needReview: 210,
  failed: 50,
  successRate: 79,
  byDocumentType: [
    {
      documentType: "Invoice",
      total: 520,
      success: 450,
      needReview: 55,
      failed: 15,
      successRate: 86.5
    },
    {
      documentType: "Bill",
      total: 310,
      success: 250,
      needReview: 45,
      failed: 15,
      successRate: 80.6
    }
  ]
};
```

---

## 23. API đề xuất cho giai đoạn production

### 23.1 Dashboard overview

```http
GET /api/ceo/dashboard/overview
```

Query params:

```txt
fromDate=
toDate=
departmentId=
employeeId=
customerId=
status=
```

Response:

```json
{
  "totalEmails": 238,
  "totalAttachments": 412,
  "totalTasks": 186,
  "completedTasks": 142,
  "processingTasks": 31,
  "pendingTasks": 13,
  "overdueTasks": 8,
  "aiSuccessRate": 82,
  "completionRate": 76,
  "reportRows": 150,
  "missingDataRows": 12
}
```

### 23.2 Employee performance

```http
GET /api/ceo/dashboard/employee-performance
```

### 23.3 Employee detail

```http
GET /api/ceo/employees/{employeeId}/summary
GET /api/ceo/employees/{employeeId}/tasks
GET /api/ceo/employees/{employeeId}/emails
GET /api/ceo/employees/{employeeId}/customers
GET /api/ceo/employees/{employeeId}/activity-logs
```

### 23.4 Alerts

```http
GET /api/ceo/dashboard/alerts
```

### 23.5 AI summary

```http
GET /api/ceo/dashboard/ai-extraction-summary
```

### 23.6 Reports

```http
GET /api/ceo/reports/summary
GET /api/ceo/reports/by-employee
GET /api/ceo/reports/by-customer
GET /api/ceo/reports/missing-data
GET /api/ceo/reports/export
```

---

## 24. Luồng xử lý dữ liệu

### 24.1 Luồng từ email đến CEO dashboard

```txt
1. Khách hàng gửi email/chứng từ
2. Hệ thống nhận email
3. Hệ thống đọc file đính kèm
4. AI bóc tách dữ liệu
5. Hệ thống tạo ticket/task
6. Nhân viên xử lý task
7. Cập nhật trạng thái xử lý
8. Dữ liệu được đưa vào báo cáo tổng hợp
9. CEO xem dashboard/report
```

### 24.2 Luồng theo dõi nhân viên

```txt
1. CEO vào /ceo
2. Xem bảng hiệu suất nhân viên
3. Click vào một nhân viên
4. Xem task đang xử lý/quá hạn
5. Xem email/chứng từ liên quan
6. Xem khách hàng nhân viên phụ trách
7. Xem lịch sử xử lý
8. CEO gửi nhắc nhở hoặc xuất báo cáo nếu cần
```

### 24.3 Luồng cảnh báo

```txt
1. Hệ thống định kỳ kiểm tra task/email
2. Nếu task quá hạn hoặc email chưa xử lý, tạo cảnh báo
3. Cảnh báo hiển thị trên CEO dashboard
4. CEO click vào cảnh báo để xem chi tiết
5. CEO có thể nhắc quản lý hoặc theo dõi task
```

---

## 25. UI/UX đề xuất

### 25.1 Phong cách giao diện

Nên dùng phong cách:

- Dashboard hiện đại.
- Rõ ràng, dễ scan nhanh.
- Ưu tiên số liệu lớn, dễ đọc.
- Cảnh báo nổi bật nhưng không gây rối.
- Bảng dữ liệu có filter/sort.
- Cho phép drill-down từ tổng quan đến chi tiết.

### 25.2 Component chính

| Component | Mô tả |
|---|---|
| `CeoDashboardPage` | Page chính route `/ceo` |
| `CeoHeader` | Header + filter |
| `CeoKpiCards` | Card KPI tổng quan |
| `CeoAlertPanel` | Panel cảnh báo |
| `DepartmentSummaryTable` | Bảng tổng quan phòng ban |
| `EmployeePerformanceTable` | Bảng hiệu suất nhân viên |
| `EmployeeDetailDrawer` | Drawer chi tiết nhân viên |
| `TaskDetailDrawer` | Drawer chi tiết task |
| `AiExtractionSummary` | Thống kê AI |
| `ReportSummaryTable` | Báo cáo tổng hợp |
| `ExportReportButton` | Button xuất báo cáo |

### 25.3 Layout đề xuất

```txt
+------------------------------------------------------+
| CEO Dashboard                         [Export Report] |
| [Today] [This Week] [This Month] [Custom Range]       |
+------------------------------------------------------+
| KPI Card | KPI Card | KPI Card | KPI Card | KPI Card |
+------------------------------------------------------+
| Alerts cần chú ý                                     |
+------------------------------------------------------+
| Department Summary      | AI Extraction Summary       |
+------------------------------------------------------+
| Employee Performance Table                           |
+------------------------------------------------------+
| Task/Email cần xử lý                                 |
+------------------------------------------------------+
| Report Summary                                        |
+------------------------------------------------------+
```

---

## 26. State management prototype

Nếu dùng Zustand:

```ts
type CeoDashboardState = {
  filters: {
    fromDate?: string;
    toDate?: string;
    departmentId?: string;
    employeeId?: string;
    customerId?: string;
    status?: string;
  };
  overview: CeoOverview | null;
  employees: CeoEmployeePerformance[];
  alerts: CeoAlert[];
  selectedEmployeeId?: string;
  selectedTaskId?: string;
  setFilters: (filters: Partial<CeoDashboardState["filters"]>) => void;
  selectEmployee: (employeeId: string) => void;
  selectTask: (taskId: string) => void;
};
```

---

## 27. Access control

### 27.1 Route guard prototype

```ts
export function canAccessCEO() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  return user.role === "CEO";
}
```

### 27.2 Route guard production

```ts
export function canAccessCEO(user: CurrentUser) {
  return user.permissions.includes("VIEW_CEO_DASHBOARD");
}
```

### 27.3 Redirect rule

| Role | Default route |
|---|---|
| CEO | `/ceo` |
| Manager | `/dashboard` |
| Staff | `/tickets` |
| Admin | `/admin` |

---

## 28. Acceptance Criteria

### 28.1 CEO Dashboard

- CEO truy cập được route `/ceo`.
- Không phải CEO thì không truy cập được route `/ceo`.
- Hiển thị được KPI tổng quan.
- Hiển thị được cảnh báo.
- Hiển thị được hiệu suất phòng ban.
- Hiển thị được hiệu suất nhân viên.
- Có thể lọc theo thời gian.
- Có thể lọc theo phòng ban, nhân viên, khách hàng, trạng thái.
- Có thể click vào nhân viên để xem chi tiết.
- Có thể click vào task để xem chi tiết.
- Có thể xem thống kê AI bóc tách.
- Có thể xem báo cáo tổng hợp.
- Có thể xuất báo cáo.

### 28.2 Employee Detail

- Hiển thị thông tin nhân viên.
- Hiển thị KPI cá nhân.
- Hiển thị task đang xử lý.
- Hiển thị task quá hạn.
- Hiển thị email/chứng từ liên quan.
- Hiển thị khách hàng phụ trách.
- Hiển thị lịch sử xử lý.
- Có thể lọc dữ liệu theo thời gian/trạng thái/khách hàng.

### 28.3 Report

- Hiển thị báo cáo tổng hợp.
- Có dữ liệu theo ngày.
- Có dữ liệu theo nhân viên.
- Có dữ liệu theo khách hàng.
- Có dữ liệu trạng thái.
- Có dữ liệu thiếu/cần kiểm tra.
- Có thể xuất Excel/PDF tùy phạm vi triển khai.

---

## 29. Kế hoạch triển khai

### Phase 1: Prototype FE

Mục tiêu: demo được route CEO với mock data.

Công việc:

- Tạo route `/ceo`.
- Tạo mock data.
- Tạo KPI cards.
- Tạo alert panel.
- Tạo employee performance table.
- Tạo employee detail drawer.
- Tạo task detail drawer.
- Tạo AI extraction summary.
- Tạo report summary table.
- Tạo export mock Excel.
- Dùng localStorage để giả lập role CEO.

### Phase 2: Kết nối dữ liệu thật

Mục tiêu: lấy dữ liệu từ email/ticket/AI extraction thật.

Công việc:

- Kết nối API overview.
- Kết nối API employee performance.
- Kết nối API task/email.
- Kết nối API AI summary.
- Kết nối API report.
- Tính overdue theo SLA.
- Tính completion rate.
- Tính AI success rate.

### Phase 3: Báo cáo tổng hợp

Mục tiêu: đáp ứng yêu cầu trọng tâm là ra báo cáo tổng hợp.

Công việc:

- Chốt danh sách field báo cáo.
- Mapping dữ liệu từ email/chứng từ/task.
- Cho phép chỉnh sửa dữ liệu thiếu trước khi tổng hợp.
- Export Excel.
- Lưu lịch sử báo cáo.
- Filter báo cáo theo ngày/nhân viên/khách hàng/trạng thái.

### Phase 4: Alert điều hành

Mục tiêu: CEO chỉ cần nhìn dashboard là biết vấn đề.

Công việc:

- Tạo rule cảnh báo.
- Cảnh báo task quá hạn.
- Cảnh báo email chưa xử lý.
- Cảnh báo dữ liệu thiếu.
- Cảnh báo AI confidence thấp.
- Cảnh báo workload cao.
- Gửi nhắc nhở cho quản lý/nhân viên.

---

## 30. Gợi ý ưu tiên làm trước

Để demo nhanh và đúng pain point, nên ưu tiên:

1. KPI tổng quan.
2. Bảng hiệu suất nhân viên.
3. Click nhân viên xem chi tiết.
4. Task quá hạn/chưa xử lý.
5. AI extraction summary.
6. Báo cáo tổng hợp.
7. Export báo cáo.

Chưa cần làm quá sâu:

- Reassign phức tạp.
- Phân quyền nâng cao nhiều cấp.
- Cảnh báo realtime.
- Tích hợp nhiều kênh Zalo/WeChat.
- Audit log quá chi tiết.

---

## 31. Kết luận

Route `/ceo` cần được thiết kế như một màn hình điều hành tổng quan nhưng có khả năng drill-down chi tiết.

CEO không chỉ xem số liệu tổng, mà cần xem được:

- Nhân viên nào đang làm gì.
- Nhân viên nào xử lý bao nhiêu task.
- Nhân viên nào có task quá hạn.
- Nhân viên nào đang phụ trách khách hàng nào.
- Phòng ban nào đang bị nghẽn.
- Khách hàng nào phát sinh nhiều chứng từ.
- Email/chứng từ nào chưa xử lý.
- AI bóc tách có hiệu quả không.
- Báo cáo tổng hợp đã đủ dữ liệu chưa.

Định hướng đúng cho route `/ceo` là:

```txt
CEO Dashboard = Tổng quan vận hành + Hiệu suất nhân viên + Cảnh báo rủi ro + Báo cáo tổng hợp + Drill-down chi tiết
```
