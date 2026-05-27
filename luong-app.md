# Luồng Ứng Dụng Bóc Tách Dữ Liệu Logistics

## Tổng quan
Ứng dụng xử lý email logistics tự động bằng AI, từ việc đồng bộ email đến bóc tách dữ liệu và xuất báo cáo.

---

## Giai đoạn 1: Đồng bộ Email

### 1.1 Kết nối Gmail
- **Đầu vào**: Tài khoản Gmail
- **Hành động**: Đồng bộ email về hệ thống

### 1.2 Kiểm tra đồng bộ
- **Điều kiện**: Đồng bộ thành công?
  - **❌ Không**: Ghi log lỗi & Thông báo Admin → Quay lại bước 1.1
  - **✅ Có**: Tiếp tục

---

## Giai đoạn 2: Lọc Email

### 2.1 Kiểm tra trùng lặp
- **Điều kiện**: Email trùng lặp?
  - **✅ Có**: Bỏ qua / Gộp vào email đã tồn tại → Kết thúc luồng
  - **❌ Không**: Tiếp tục

### 2.2 Lọc tiêu đề email
- **Hành động**: AI / Rule Engine lọc tiêu đề email

### 2.3 Kiểm tra nhóm Logistics
- **Điều kiện**: Thuộc nhóm Logistics?
  - **❌ Không**: Không xử lý → Kết thúc luồng
  - **✅ Có**: Tiếp tục

---

## Giai đoạn 3: Xử lý bởi Nhân viên

### 3.1 Xem danh sách email
- **Hành động**: Nhân viên xem danh sách email

### 3.2 Chọn email xử lý
- **Điều kiện**: Chọn email để xử lý?
  - **❌ Không**: Quay lại xem danh sách
  - **✅ Có**: Tiếp tục

### 3.3 Kiểm tra trạng thái email
- **Điều kiện**: Email đã được nhân viên khác xác nhận?
  - **✅ Rồi**: Thông báo "Email đã có người xử lý" → Quay lại danh sách
  - **❌ Chưa**: Tiếp tục

---

## Giai đoạn 4: Xem Chi tiết Email

### 4.1 Mở chi tiết
- **Hành động**: Mở Chi tiết Email
- **Layout**: 3 cột ngang (Desktop) / xếp dọc (Mobile)
  - 📎 **Cột trái**: Tệp đính kèm — chọn checkbox để gửi AI
  - 📝 **Cột giữa**: Nội dung email (HTML/Text/Auto)
  - 🤖 **Cột phải**: AI Chat — luôn hiển thị, không floating

### 4.2 Chọn file đính kèm cho AI
- **Hành động**: Click checkbox bên cạnh từng file
- **Hiển thị**: Badge đếm số file đã chọn trong header AI panel
- **Điều kiện**: Chưa chọn file?
  - **❌ Chưa**: Chat hiển thị "Chọn file đính kèm trước"
  - **✅ Đã chọn**: Có thể gửi yêu cầu AI

### 4.3 Chat với AI bóc tách
- **Hành động**: Nhập yêu cầu vào input box, nhấn Enter hoặc nút gửi
- **2 chế độ**:
  - **Chat mode**: AI trả lời text tự do trong khung chat (hỏi gì đáp nấy)
  - **Template mode**: AI trả về JSON theo template đã chọn → hiển thị nút "Xem chi tiết" mở modal

#### 4.3.1 Chuyển đổi mode
- **Chat**: Trả lời tự do, không bắt JSON
- **Template**: Chọn template từ dropdown → AI trả về dữ liệu cấu trúc theo `expectedFields`

---

## Giai đoạn 5: Bóc Tách bằng AI (Chat-based)

### 5.1 Chuẩn bị dữ liệu
- **File đã chọn**: Lấy file từ `selectedForAI` (Set của attachment IDs)
- **Download & encode**: Tải nội dung file, base64 encode
- **DOCX đặc biệt**: Dùng `mammoth` để extract text raw trước khi gửi AI

### 5.2 Gửi prompt vào AI
- **API**: `POST /document-processor/process-multiple`
- **Payload**:
  ```json
  {
    "files": [{"fileName", "content": "base64", "type", "mimeType"}],
    "prompt": "Yêu cầu bóc tách từ người dùng",
    "model": "gpt-4"
  }
  ```
- **2 loại prompt**:
  - **Chat**: Trả lời tự do text, không bắt JSON
  - **Template**: Bắt buộc JSON array theo `expectedFields` của template

### 5.3 Nhận kết quả trong chat
- **Chat mode**: AI trả lời text → hiển thị trực tiếp trong message bubble
- **Template mode**: AI trả JSON → hiển thị "Đã bóc tách xong" + nút **"Xem chi tiết"**
- **Lỗi**: Hiển thị error message inline trong chat

### 5.4 Xem kết quả chi tiết (Template mode)
- **Hành động**: Click "Xem chi tiết" trong chat message
- **Mở modal**: `ExtractionResultModal` hiển thị bảng dữ liệu logistics
- **Chức năng modal**:
  - Hiển thị dạng bảng (có thể chỉnh sửa)
  - Xem raw JSON
  - Sao chép JSON
  - Preview file đính kèm

---

## Giai đoạn 6: Xử lý Dữ Liệu Bóc Tách

### 6.1 Nhận dữ liệu
- **Hành động**: Dữ liệu bóc tách được trả về

### 6.2 Kiểm tra dữ liệu
- **Điều kiện**: Dữ liệu thiếu / sai cấu trúc?
  - **✅ Có**: Cảnh báo & Cho phép chỉnh sửa → Export
  - **❌ Không**: Export trực tiếp

---

## Giai đoạn 7: Export Dữ Liệu

### 7.1 Export Excel
- **Hành động**: Export dữ liệu ra file Excel

### 7.2 Kiểm tra export
- **Điều kiện**: Export thành công?
  - **❌ Không**: Ghi log lỗi export lại → Quay lại export
  - **✅ Có**: Tiếp tục

---

## Giai đoạn 8: Import vào Báo cáo Tổng

### 8.1 Chọn file import
- **Hành động**: Người dùng chọn Import vào Báo cáo Tổng

### 8.2 Kiểm tra file Excel
- **Điều kiện**: File Excel hợp lệ?
  - **❌ Không**: Thông báo lỗi file sai định dạng / hỏng → Dừng import
  - **✅ Có**: Tiếp tục

### 8.3 Thực hiện import
- **Hành động**: Thực hiện Import dữ liệu

### 8.4 Kiểm tra import
- **Điều kiện**: Import thành công?
  - **❌ Không**: Rollback / Ghi log thông báo dòng lỗi
  - **✅ Có**: Hoàn thành

---

## Trạng thái Kết thúc

### 🟢 TRẠNG THÁI: Đã bóc tách
- Email đã được xử lý hoàn tất
- Dữ liệu đã được import vào Báo cáo Tổng

---

## Các điểm lưu ý

1. **Xử lý lỗi**: Mỗi bước đều có cơ chế xử lý lỗi và ghi log
2. **Kiểm tra trùng lặp**: Tránh xử lý email nhiều lần
3. **Kiểm tra đồng thời**: Tránh xung đột khi nhiều nhân viên xử lý cùng một email
4. **Validation**: Kiểm tra tính hợp lệ của tệp đính kèm trước khi gửi AI
5. **Rollback**: Có cơ chế rollback khi import thất bại
