# Excel Export/Import API Documentation - Simple MVP

## Tổng quan

API đơn giản hóa - bỏ job pattern và webhook, nhưng giữ preview flow, error file, column mapping, private storage.

**Base Path:** `/api/v1`
**Authentication:** Required (Bearer Token)
**Module:** `LogisticsPlatform.MailIntegration.Api.Controllers`

## Tính năng

- **Export**: Xuất mail assignments ra file Excel với filter và columns (synchronous)
- **Import**: Nhập dữ liệu từ file Excel, validate và return preview (synchronous)
- **Import Commit**: Commit valid rows sau khi review preview
- **Error File**: Download file Excel chứa các row bị lỗi
- **Column Mapping**: Quản lý template column mapping để dùng lại
- **Private Storage**: Error files được lưu trong private-storage
- **File Expiry**: Preview expires sau 24h, error files expires sau 7 days
- **Limitations**: Max 50MB, max 1000 rows, synchronous processing

**Bỏ:**
- ❌ Job tracking (export-jobs, import-jobs tables)
- ❌ Webhook handling

**Giữ:**
- ✅ Preview flow (synchronous, không cần job table)
- ✅ Error file download
- ✅ Column mapping UI/templates
- ✅ Private storage
- ✅ File expiry/cleanup
- ✅ Ownership checks

---

## Endpoints

### 1. Export - POST /api/v1/export

Xuất mail assignments ra file Excel.

**Endpoint:** `POST /api/v1/export`

**Request Body:**
```json
{
  "filter": {
    "status": "string (optional)",
    "assignedToUserId": "guid (optional)",
    "dateFrom": "datetime (optional)",
    "dateTo": "datetime (optional)"
  },
  "columns": [
    "CustomerName",
    "OrderId",
    "PickupAddress",
    "DeliveryAddress"
  ]
}
```

**Filter Values:**
- `status`: string - value từ enum/status của mail assignments (ví dụ: "Assigned", "Pending", "Completed")
- `assignedToUserId`: GUID - ID của user được assign
- `dateFrom`, `dateTo`: datetime - ISO 8601 format (ví dụ: "2026-01-01T00:00:00Z" hoặc "2026-01-01")

**Columns Values:**
- Array of strings - mỗi string là tên field/property của entity (phải match chính xác với C# property name)
- User chọn từ UI (checkbox, drag-drop, hoặc multi-select)

**UI Flow:**
1. User mở Export dialog
2. UI hiển thị list tất cả field có sẵn
3. User tick chọn các field cần thiết
4. User điền filter (optional)
5. Frontend gửi request với filter và columns đã chọn

**Authentication:** Required

**Authorization:** 
- Role: Admin, Manager, hoặc User với quyền export

**Response:** File Excel (stream)
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="mail-assignments-{timestamp}.xlsx"`

**Error Responses:**
- `400 Bad Request`: Filter hoặc columns không hợp lệ
- `401 Unauthorized`: User không authenticated
- `403 Forbidden`: User không có quyền export
- `500 Internal Server Error`: Server error (timeout, DB error, etc.)

**Use Case:**
- Admin muốn export danh sách mail assignments để báo cáo
- User muốn export dữ liệu đã assign cho mình để xử lý offline

**Limitations:**
- HTTP timeout: max 30-120s
- File size: max 50MB
- Row limit: max 1000 rows

---

### 2. Import - POST /api/v1/import

Nhập dữ liệu từ file Excel, validate và return preview.

**Endpoint:** `POST /api/v1/import`

**Request Body (multipart/form-data):**
- `file`: File Excel (.xlsx)
- `mapping`: JSON string (optional) - column mapping
- `mappingId`: GUID (optional) - ID của saved mapping

**Mapping Format:**
```json
{
  "columns": {
    "A": "CustomerName",
    "B": "OrderId",
    "C": "PickupAddress",
    "D": "DeliveryAddress"
  }
}
```

**Authentication:** Required

**Authorization:**
- Role: Admin hoặc Manager

**Response (200 OK):**
```json
{
  "previewId": "guid",
  "totalRows": 1000,
  "successCount": 950,
  "errorCount": 50,
  "previewResults": [
    {
      "rowNumber": 1,
      "isSuccess": true,
      "errors": [],
      "entity": {
        "customerName": "string",
        "orderId": "string",
        "pickupAddress": "string"
      }
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: File không hợp lệ (không phải .xlsx, quá lớn, format sai)
- `401 Unauthorized`: User không authenticated
- `403 Forbidden`: User không có quyền import
- `500 Internal Server Error`: Server error (timeout, DB error, etc.)

**Validation Rules:**
- File type: Chỉ chấp nhận .xlsx
- File size: Max 50MB
- Magic bytes: PK\x03\x04
- ClosedXML parse: Validate file là valid Excel
- Required columns: Tùy theo mapping configuration
- Business rules: Validate từng row theo business logic

**Use Case:**
- Admin muốn import danh sách orders từ Excel
- Manager muốn bulk update mail assignments

**Limitations:**
- HTTP timeout: max 30-120s
- File size: max 50MB
- Row limit: max 1000 rows
- Preview synchronous - trả về ngay trong cùng request
- Preview expires sau 24h

---

### 3. Import Commit - POST /api/v1/import/commit

Commit valid rows sau khi review preview.

**Endpoint:** `POST /api/v1/import/commit`

**Request Body:**
```json
{
  "previewId": "guid"
}
```

**Authentication:** Required

**Authorization:**
- Chỉ user tạo preview có thể commit

**Response (200 OK):**
```json
{
  "committedCount": 950
}
```

**Error Responses:**
- `400 Bad Request`: PreviewId không hợp lệ hoặc đã expired
- `401 Unauthorized`: User không authenticated
- `403 Forbidden`: User không có quyền commit preview này
- `500 Internal Server Error`: Server error

**Use Case:**
- User review preview và commit valid rows
- Idempotent: nếu previewId đã committed, return committedCount

---

### 4. Download Error File - GET /api/v1/import/errors

Tải file Excel chứa các row bị lỗi.

**Endpoint:** `GET /api/v1/import/errors`

**Query Parameters:**
- `previewId`: GUID của preview

**Authentication:** Required

**Authorization:**
- Chỉ user tạo preview có thể download

**Response (200 OK):** File Excel download

**Error Responses:**
- `400 Bad Request`: PreviewId không hợp lệ hoặc không có lỗi
- `401 Unauthorized`: User không authenticated
- `403 Forbidden`: User không có quyền download
- `404 Not Found`: Error file không tồn tại

**Error File Format:**
- Column 1: Row Number
- Column 2: Error Message
- Column 3: Original Data

**Use Case:**
- User muốn xem chi tiết lỗi để sửa file Excel
- Admin debug import failures

---

### 5. Save Column Mapping - POST /api/v1/import-mappings

Lưu template column mapping để dùng lại cho các import sau.

**Endpoint:** `POST /api/v1/import-mappings`

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)",
  "columns": {
    "A": "CustomerName",
    "B": "OrderId",
    "C": "PickupAddress",
    "D": "DeliveryAddress"
  },
  "isDefault": false
}
```

**Authentication:** Required

**Authorization:**
- Role: Admin hoặc Manager

**Response (201 Created):**
```json
{
  "id": "guid",
  "name": "string",
  "description": "string",
  "columns": {},
  "isDefault": false,
  "createdAt": "datetime",
  "createdBy": "guid"
}
```

**Error Responses:**
- `400 Bad Request`: Mapping data không hợp lệ
- `401 Unauthorized`: User không authenticated
- `403 Forbidden`: User không có quyền tạo mapping

**Use Case:**
- Admin tạo template mapping cho import định kỳ
- Manager lưu mapping structure để team dùng chung

---

### 6. List Column Mappings - GET /api/v1/import-mappings

Lấy danh sách tất cả column mappings.

**Endpoint:** `GET /api/v1/import-mappings`

**Query Parameters:**
- `isDefault` (boolean, optional): Filter theo default mapping
- `createdBy` (guid, optional): Filter theo user tạo

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": "guid",
    "name": "string",
    "description": "string",
    "columns": {},
    "isDefault": false,
    "createdAt": "datetime",
    "createdBy": "guid"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: User không authenticated

**Use Case:**
- User chọn mapping template khi import
- Admin quản lý tất cả mappings

---

### 7. Get Column Mapping - GET /api/v1/import-mappings/{id}

Lấy chi tiết một column mapping.

**Endpoint:** `GET /api/v1/import-mappings/{id}`

**Parameters:**
- `id` (path, GUID): ID của mapping

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": "guid",
  "name": "string",
  "description": "string",
  "columns": {},
  "isDefault": false,
  "createdAt": "datetime",
  "createdBy": "guid"
}
```

**Error Responses:**
- `404 Not Found`: Mapping không tồn tại
- `403 Forbidden`: User không có quyền xem mapping này

**Use Case:**
- User xem chi tiết mapping trước khi dùng
- Admin edit mapping

---

## Request Models

### ExportRequest
```csharp
public class ExportRequest
{
    public ExportFilter Filter { get; set; }
    public List<string> Columns { get; set; }
}

public class ExportFilter
{
    public string? Status { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
}
```

### CommitImportRequest
```csharp
public class CommitImportRequest
{
    public Guid PreviewId { get; set; }
}
```

### SaveMappingRequest
```csharp
public class SaveMappingRequest
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public Dictionary<string, string> Columns { get; set; }
    public bool IsDefault { get; set; }
}
```

---

## Response Models

### ImportPreviewResponse
```csharp
public class ImportPreviewResponse
{
    public Guid PreviewId { get; set; }
    public int TotalRows { get; set; }
    public int SuccessCount { get; set; }
    public int ErrorCount { get; set; }
    public List<ImportRowResult> PreviewResults { get; set; }
}

public class ImportRowResult
{
    public int RowNumber { get; set; }
    public bool IsSuccess { get; set; }
    public List<string> Errors { get; set; }
    public object? Entity { get; set; }
}
```

### CommitImportResponse
```csharp
public class CommitImportResponse
{
    public int CommittedCount { get; set; }
}
```

---

## Luồng Export (Export Flow)

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │
         │ POST /api/v1/export
         │    { filter, columns }
         ▼
┌─────────────────┐
│   Backend API   │
│  - Query DB     │
│  - Generate Excel│
│  - Return file  │
└─────────────────┘
```

**Steps:**
1. Frontend gửi request tạo export với filter và columns
2. Backend query database theo filter
3. Backend generate Excel file với columns đã chọn
4. Backend return file trực tiếp trong HTTP response
5. Frontend download file

**Note:** Synchronous processing - thường completed ngay trong cùng request. Nếu file quá lớn hoặc timeout, sẽ return 500 error.

---

## Luồng Import (Import Flow)

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │
         │ POST /api/v1/import
         │    { file, mapping }
         ▼
┌─────────────────┐
│   Backend API   │
│  - Validate file│
│  - Parse Excel  │
│  - Validate rows│
│  - Return preview│
└────────┬────────┘
         │
         │ User review
         ▼
┌─────────────────┐
│   Frontend      │
│  - Show preview │
│  - Show errors  │
└────────┬────────┘
         │
         │ POST /api/v1/import/commit
         ▼
┌─────────────────┐
│   Backend API   │
│  - Commit valid │
│    rows         │
│  - Return summary│
└─────────────────┘
```

**Steps:**
1. Frontend upload file Excel + mapping
2. Backend validate file (magic bytes + ClosedXML parse)
3. Backend parse Excel và validate từng row
4. Backend return preview results (valid/invalid rows) với previewId
5. Frontend hiển thị preview table cho user review
6. User review và commit (hoặc download error file nếu có lỗi)
7. Backend commit valid rows vào database trong transaction
8. Backend return committedCount

**Note:** Synchronous processing - preview trả về ngay trong cùng request. Preview data lưu trong cache (Redis/memory) với previewId, expires sau 24h.

---

## Error Handling

### Common Error Codes
- `400 Bad Request`: Request data không hợp lệ
- `401 Unauthorized`: User không authenticated
- `403 Forbidden`: User không có quyền
- `500 Internal Server Error`: Server error (timeout, DB error, etc.)

### Import Validation Errors
- `INVALID_FILE_TYPE`: File không phải .xlsx
- `FILE_TOO_LARGE`: File vượt quá 50MB
- `INVALID_FILE_FORMAT`: File không phải valid Excel (magic bytes hoặc ClosedXML parse failed)
- `MISSING_REQUIRED_COLUMN`: Thiếu column bắt buộc (CustomerName)
- `BUSINESS_RULE_VIOLATION`: Vi phạm business rule

---

## Security Considerations

- **Authentication**: Tất cả endpoints require Bearer token
- **Authorization**: Role-based access control (Admin/Manager cho import, User cho export)
- **Ownership Check**: Users chỉ có thể truy cập previews do chính họ tạo (commit, error download)
- **File Validation**: Validate file type, size, magic bytes, và ClosedXML parse trước khi xử lý
- **Excel Formula Injection**: Sanitize cell values bắt đầu bằng =, +, -, @
- **Row Limit**: Max 1000 rows để tránh timeout
- **File Size Limit**: Max 50MB
- **Private Storage**: Error files được lưu trong private-storage (không phải wwwroot), chỉ truy cập qua authorized endpoints
- **Preview Expiry**: Preview data expires sau 24h trong cache
- **File Expiry**: Error files expires sau 7 days, cleanup task xóa files cũ

---

## Usage Examples

### Export Workflow

```javascript
// Export file
const response = await fetch('/api/v1/export', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    filter: {
      status: 'Assigned',
      dateFrom: '2026-01-01'
    },
    columns: ['CustomerName', 'OrderId', 'PickupAddress', 'DeliveryAddress']
  })
});

if (response.ok) {
  // Download file
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mail-assignments-${Date.now()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
} else {
  console.error('Export failed:', await response.text());
}
```

### Import Workflow

```javascript
// 1. Upload file và tạo import preview
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('mapping', JSON.stringify({
  columns: {
    'A': 'CustomerName',
    'B': 'OrderId',
    'C': 'PickupAddress'
  }
}));

const response = await fetch('/api/v1/import', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { previewId, totalRows, successCount, errorCount, previewResults } = await response.json();

// 2. Hiển thị preview table
displayPreviewTable(previewResults);  // Chỉ 50 rows đầu tiên
displaySummary(totalRows, successCount, errorCount);

// 3. User review và commit
if (userApproves) {
  const commitResponse = await fetch('/api/v1/import/commit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ previewId })
  });
  
  const { committedCount } = await commitResponse.json();
  console.log(`Committed ${committedCount} rows`);
}

// 4. Download error file nếu có lỗi
if (errorCount > 0) {
  window.location.href = `/api/v1/import/errors?previewId=${previewId}`;
}
```

---

## Best Practices

### Frontend
- **File Size**: Validate file size ở frontend trước khi upload (max 50MB)
- **Loading State**: Hiển thị loading indicator khi đang export/import
- **Error Handling**: Hiển thị error message rõ ràng cho user
- **Timeout Handling**: Handle timeout errors và hiển thị message phù hợp

### Backend
- **Validation**: Validate file type, size, magic bytes, ClosedXML parse trước khi xử lý
- **Sanitization**: Sanitize Excel values để prevent formula injection
- **Transaction**: Commit import trong transaction để đảm bảo atomicity
- **Error Handling**: Return clear error messages

---

## Limitations (MVP)

- **File Size**: Max 50MB per file
- **Row Limit**: Max 1000 rows per file
- **HTTP Timeout**: Max 30-120s (tùy server config)
- **Preview Sync**: Preview synchronous - trả về ngay trong cùng request
- **Cancel Best-Effort**: Cancel là best-effort (synchronous processing)
- **No Tracking**: Không có job history trong database
- **No Retry**: Không có retry mechanism
- **Cache Dependency**: Preview data lưu trong cache (Redis/memory), cần cache infrastructure
- **Total APIs**: 7 APIs (export, import preview, import commit, error download, 3 column mapping APIs)

---

## Post-MVP Enhancements

Nếu cần nâng cấp lên full MVP với job pattern:
- **Job Tracking**: Thêm export-jobs và import-jobs tables để tracking history
- **Job APIs**: Thêm GET job status, cancel job APIs
- **Async Processing**: Chuyển sang Hangfire background jobs để xử lý file lớn
- **Webhook Handling**: Thêm webhook receiver cho mail connector integration
- **Object Storage**: MinIO/S3 cho distributed storage
- **Signed URL**: Secure file access với expiration
- **Staging Rollback**: Transaction safety cho large imports
- **Parallel Validation**: Pipeline pattern cho faster processing
- **Rate Limiting**: Advanced rate limiting per endpoint
- **PII Masking**: Configurable PII masking based on role
