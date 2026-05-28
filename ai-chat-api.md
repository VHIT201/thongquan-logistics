# AI Chat API Documentation

**Ngày:** 2026-05-28
**Dự án:** LogisticsPlatformBE
**Mục đích:** Tài liệu API đầy đủ cho module AI Chat - tính năng trò chuyện AI tích hợp với hệ thống logistics

---

## Tổng quan

Module AI Chat được thiết kế để hỗ trợ quá trình bóc tách dữ liệu logistics từ email và tài liệu đính kèm. Module cho phép người dùng:

- **Tư vấn bóc tách dữ liệu:** Hỏi AI về các trường cần bóc tách từ tài liệu logistics (invoice, BOL, AWB, etc.)
- **Xác định cấu trúc dữ liệu:** Nhận tư vấn về cách cấu trúc dữ liệu cho các loại tài liệu khác nhau
- **Phân tích tài liệu:** Upload tài liệu và yêu cầu AI phân tích nội dung để xác định các trường quan trọng
- **Tạo mapping schema:** Xây dựng mapping giữa các trường trong tài liệu và hệ thống
- **Review kết quả bóc tách:** So sánh kết quả bóc tách tự động với bản gốc để xác định các trường bị thiếu

### Use Case Chính

**Scenario:** Người dùng nhận email có đính kèm invoice vận chuyển và muốn bóc tách dữ liệu vào hệ thống logistics.

**Workflow:**
1. User tạo conversation mới liên kết với email/attachment từ MailConnector
2. User upload tài liệu (PDF, Excel, Word) hoặc link attachment từ MailConnector
3. User hỏi AI: "Tài liệu này có những trường nào cần bóc tách?"
4. AI phân tích tài liệu và liệt kê các trường: invoice_number, bill_of_lading, shipper_name, consignee_name, etc.
5. User hỏi thêm: "Làm sao để map trường 'Total Amount' sang hệ thống?"
6. AI tư vấn về mapping và validation rules
7. User sử dụng thông tin này để cấu hình MailConnector extraction rules

### Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                    LogisticsPlatformBE                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  AI Chat     │    │  Mail        │    │  Business    │      │
│  │  API         │───▶│  Connector   │───▶│  Entities    │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  AI Provider │    │  File        │    │  Context     │      │
│  │  (OpenAI/    │    │  Storage     │    │  Building    │      │
│  │   Azure)     │    │              │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Conversation Management API

### 1.1 Tạo Conversation Mới

```http
POST /api/v1/ai-chat/conversations
```

**Mô tả:** Tạo một cuộc hội thoại mới.

**Request Body:**
```json
{
  "title": "Hỏi về vận đơn #BOL-123456",
  "tenantId": "guid",
  "createdBy": "guid"
}
```

**Response:**
```json
{
  "correlationId": "guid",
  "traceId": "trace-id",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": {
    "id": "guid",
    "title": "Hỏi về vận đơn #BOL-123456",
    "description": null,
    "status": "active",
    "tenantId": "guid",
    "organizationId": null,
    "createdBy": "guid",
    "entityType": null,
    "entityId": null,
    "createdAt": "2026-05-28T10:00:00Z",
    "updatedAt": null
  },
  "meta": {},
  "errors": []
}
```

**Status Codes:**
- `200 OK`: Conversation được tạo thành công
- `400 Bad Request`: Request không hợp lệ

---

### 1.2 Lấy Conversation Theo ID

```http
GET /api/v1/ai-chat/conversations/{id}
```

**Mô tả:** Lấy thông tin chi tiết của một conversation.

**Path Parameters:**
- `id` (GUID): Conversation ID

**Response:**
```json
{
  "correlationId": "guid",
  "traceId": "trace-id",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": {
    "id": "guid",
    "title": "Hỏi về vận đơn #BOL-123456",
    "description": "Thảo luận về vận đơn BOL-123456",
    "status": "active",
    "tenantId": "guid",
    "organizationId": "guid",
    "createdBy": "guid",
    "entityType": "shipment",
    "entityId": "guid",
    "createdAt": "2026-05-28T10:00:00Z",
    "updatedAt": "2026-05-28T10:30:00Z"
  },
  "meta": {},
  "errors": []
}
```

**Status Codes:**
- `200 OK`: Thành công
- `404 Not Found`: Conversation không tồn tại

---

### 1.3 Lấy Danh sách Conversations

```http
GET /api/v1/ai-chat/conversations
```

**Mô tả:** Lấy danh sách conversations theo tenant hoặc user.

**Query Parameters:**
- `tenantId` (GUID, optional): Lọc theo tenant
- `createdBy` (GUID, optional): Lọc theo user tạo

**Lưu ý:** Phải cung cấp ít nhất một trong hai tham số.

**Response:**
```json
{
  "correlationId": "guid",
  "traceId": "trace-id",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": [
    {
      "id": "guid-1",
      "title": "Hỏi về vận đơn #BOL-123456",
      "description": null,
      "status": "active",
      "tenantId": "guid",
      "organizationId": null,
      "createdBy": "guid",
      "entityType": null,
      "entityId": null,
      "createdAt": "2026-05-28T10:00:00Z",
      "updatedAt": "2026-05-28T10:30:00Z"
    },
    {
      "id": "guid-2",
      "title": "Hỏi về đơn hàng #ORD-789",
      "description": "Thảo luận về đơn hàng",
      "status": "archived",
      "tenantId": "guid",
      "organizationId": "guid",
      "createdBy": "guid",
      "entityType": "order",
      "entityId": "guid",
      "createdAt": "2026-05-27T15:00:00Z",
      "updatedAt": "2026-05-27T16:00:00Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

**Status Codes:**
- `200 OK`: Thành công
- `400 Bad Request`: Không cung cấp tenantId hoặc createdBy

---

### 1.4 Cập nhật Conversation

```http
PUT /api/v1/ai-chat/conversations/{id}
```

**Mô tả:** Cập nhật tiêu đề và mô tả của conversation.

**Path Parameters:**
- `id` (GUID): Conversation ID

**Request Body:**
```json
{
  "title": "Tiêu đề mới",
  "description": "Mô tả chi tiết về cuộc hội thoại"
}
```

**Response:**
```json
{
  "correlationId": "guid",
  "traceId": "trace-id",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": {
    "id": "guid",
    "title": "Tiêu đề mới",
    "description": "Mô tả chi tiết về cuộc hội thoại",
    "status": "active",
    "tenantId": "guid",
    "organizationId": null,
    "createdBy": "guid",
    "entityType": null,
    "entityId": null,
    "createdAt": "2026-05-28T10:00:00Z",
    "updatedAt": "2026-05-28T10:35:00Z"
  },
  "meta": {},
  "errors": []
}
```

**Status Codes:**
- `200 OK`: Cập nhật thành công
- `404 Not Found`: Conversation không tồn tại

---

### 1.5 Archive Conversation

```http
POST /api/v1/ai-chat/conversations/{id}/archive
```

**Mô tả:** Archive một conversation (đánh dấu là archived).

**Path Parameters:**
- `id` (GUID): Conversation ID

**Response:**
```json
{
  "correlationId": "guid",
  "traceId": "trace-id",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": {
    "id": "guid",
    "title": "Hỏi về vận đơn #BOL-123456",
    "description": null,
    "status": "archived",
    "tenantId": "guid",
    "organizationId": null,
    "createdBy": "guid",
    "entityType": null,
    "entityId": null,
    "createdAt": "2026-05-28T10:00:00Z",
    "updatedAt": "2026-05-28T10:40:00Z"
  },
  "meta": {},
  "errors": []
}
```

**Status Codes:**
- `200 OK`: Archive thành công
- `404 Not Found`: Conversation không tồn tại

---

### 1.6 Xóa Conversation

```http
DELETE /api/v1/ai-chat/conversations/{id}
```

**Mô tả:** Xóa một conversation (đánh dấu là deleted).

**Path Parameters:**
- `id` (GUID): Conversation ID

**Response:**
```json
{
  "correlationId": "guid",
  "traceId": "trace-id",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": {
    "id": "guid",
    "title": "Hỏi về vận đơn #BOL-123456",
    "description": null,
    "status": "deleted",
    "tenantId": "guid",
    "organizationId": null,
    "createdBy": "guid",
    "entityType": null,
    "entityId": null,
    "createdAt": "2026-05-28T10:00:00Z",
    "updatedAt": "2026-05-28T10:45:00Z"
  },
  "meta": {},
  "errors": []
}
```

**Status Codes:**
- `200 OK`: Xóa thành công
- `404 Not Found`: Conversation không tồn tại

---

### 1.7 Liên kết Conversation với Business Entity

```http
POST /api/v1/ai-chat/conversations/{id}/link-entity
```

**Mô tả:** Liên kết conversation với một business entity (order, shipment, etc.).

**Path Parameters:**
- `id` (GUID): Conversation ID

**Request Body:**
```json
{
  "entityType": "shipment",
  "entityId": "guid"
}
```

**Entity Types hỗ trợ:**
- `order`: Đơn hàng
- `shipment`: Lô hàng
- `invoice`: Hóa đơn
- `customer`: Khách hàng

**Response:**
```json
{
  "correlationId": "guid",
  "traceId": "trace-id",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": {
    "id": "guid",
    "title": "Hỏi về vận đơn #BOL-123456",
    "description": null,
    "status": "active",
    "tenantId": "guid",
    "organizationId": null,
    "createdBy": "guid",
    "entityType": "shipment",
    "entityId": "guid",
    "createdAt": "2026-05-28T10:00:00Z",
    "updatedAt": "2026-05-28T10:50:00Z"
  },
  "meta": {},
  "errors": []
}
```

**Status Codes:**
- `200 OK`: Liên kết thành công
- `404 Not Found`: Conversation không tồn tại

---

## 2. Chat API

### 2.1 Gửi Tin Nhắn

```http
POST /api/v1/ai-chat/conversations/{conversationId}/messages
```

**Mô tả:** Gửi tin nhắn đến AI và nhận phản hồi.

**Path Parameters:**
- `conversationId` (GUID): Conversation ID

**Request Body:**
```json
{
  "message": "Hãy cho tôi biết thông tin về vận đơn BOL-123456",
  "selectedAttachmentIds": ["guid-1", "guid-2"],
  "provider": "openai",
  "model": "gpt-4",
  "tenantId": "guid",
  "createdBy": "guid"
}
```

**Parameters:**
- `message` (string, required): Nội dung tin nhắn
- `selectedAttachmentIds` (GUID[], optional): Danh sách attachment IDs để include trong context
- `provider` (string, optional): AI provider (`openai`, `azure`, default: `openai`)
- `model` (string, optional): AI model (`gpt-4`, `gpt-3.5-turbo`, default: `gpt-4`)
- `tenantId` (GUID, required): Tenant ID
- `createdBy` (GUID, required): User ID

**Response:**
```json
{
  "correlationId": "guid",
  "traceId": "trace-id",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": {
    "message": "Theo thông tin từ hệ thống, vận đơn BOL-123456 là một lô hàng vận chuyển từ Singapore đến Việt Nam...",
    "inputTokens": 1500,
    "outputTokens": 500,
    "totalTokens": 2000,
    "finishReason": "stop"
  },
  "meta": {},
  "errors": []
}
```

**Finish Reasons:**
- `stop`: AI hoàn thành phản hồi bình thường
- `length`: Đạt giới hạn token
- `content_filter`: Nội dung bị filter
- `error`: Có lỗi xảy ra

**Status Codes:**
- `200 OK`: Gửi tin nhắn thành công
- `400 Bad Request`: Request không hợp lệ
- `404 Not Found`: Conversation không tồn tại

---

## 3. Data Models

### 3.1 Conversation

```csharp
public class Conversation
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; }  // active, archived, deleted
    
    // Ownership
    public Guid TenantId { get; set; }
    public Guid? OrganizationId { get; set; }
    public Guid CreatedBy { get; set; }
    
    // Business Entity Link
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    
    // Timestamps
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}
```

**Status Values:**
- `active`: Đang hoạt động
- `archived`: Đã lưu trữ
- `deleted`: Đã xóa

---

### 3.2 Message

```csharp
public class Message
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public string Role { get; set; }  // user, assistant, system
    public string Content { get; set; }
    
    // AI Metadata
    public string? Provider { get; set; }
    public string? Model { get; set; }
    public int? InputTokens { get; set; }
    public int? OutputTokens { get; set; }
    public string? FinishReason { get; set; }
    
    // Timestamps
    public DateTime CreatedAtUtc { get; set; }
}
```

**Role Values:**
- `user`: Tin nhắn từ người dùng
- `assistant`: Phản hồi từ AI
- `system`: Tin nhắn hệ thống

---

### 3.3 ConversationAttachment

```csharp
public class ConversationAttachment
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public string FileName { get; set; }
    public string MimeType { get; set; }
    public long FileSize { get; set; }
    
    // Source
    public string Source { get; set; }  // upload, mailconnector
    public string? SourceReference { get; set; }
    
    // Extracted Text
    public string? ExtractedText { get; set; }
    public string? DocumentType { get; set; }
    public decimal? DocumentTypeConfidence { get; set; }
    
    // Timestamps
    public DateTime CreatedAtUtc { get; set; }
}
```

**Source Values:**
- `upload`: File được upload trực tiếp
- `mailconnector`: File từ MailConnector (email attachment)

---

### 3.4 AiRequestLog

```csharp
public class AiRequestLog
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid MessageId { get; set; }
    
    // AI Provider Info
    public string Provider { get; set; }
    public string Model { get; set; }
    
    // Token Usage
    public int InputTokens { get; set; }
    public int OutputTokens { get; set; }
    public int TotalTokens { get; set; }
    
    // Cost
    public decimal EstimatedCostUsd { get; set; }
    
    // Timestamps
    public DateTime CreatedAtUtc { get; set; }
}
```

---

## 4. Authentication & Authorization

### 4.1 Authentication

Tất cả các API endpoint yêu cầu authentication qua Bearer token:

```http
Authorization: Bearer {jwt_token}
```

Token phải chứa:
- `userId`: ID của user
- `tenantId`: ID của tenant
- `roles`: Danh sách quyền của user

### 4.2 Authorization

**Tenant Isolation:**
- Mọi request phải bao gồm `tenantId` trong request body
- User chỉ có thể truy cập conversations của tenant mình
- Cross-tenant access bị chặn

**Permission Checks:**
- `ai-chat:read`: Đọc conversations và messages
- `ai-chat:write`: Tạo/cập nhật/xóa conversations
- `ai-chat:send`: Gửi tin nhắn đến AI
- `ai-chat:manage`: Quản lý toàn bộ (admin)

---

## 5. Error Handling

### 5.1 Error Response Format

```json
{
  "correlationId": "guid",
  "traceId": "trace-id",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": "tenantId",
      "code": "INVALID_TENANT",
      "message": "Tenant không hợp lệ",
      "messageKey": "tenant.invalid",
      "severity": "high"
    }
  ]
}
```

### 5.2 Common Error Codes

| Code | Message | Severity |
|------|---------|----------|
| `NOT_FOUND` | Resource không tồn tại | high |
| `INVALID_REQUEST` | Request không hợp lệ | high |
| `UNAUTHORIZED` | Không có quyền truy cập | high |
| `FORBIDDEN` | Không có quyền thực hiện hành động | high |
| `VALIDATION_ERROR` | Dữ liệu không hợp lệ | medium |
| `AI_ERROR` | Lỗi từ AI provider | high |
| `QUOTA_EXCEEDED` | Vượt quá quota token | high |
| `FILE_TOO_LARGE` | File quá lớn | medium |
| `UNSUPPORTED_FILE_TYPE` | Loại file không hỗ trợ | medium |

---

## 6. Rate Limiting

### 6.1 Rate Limits

- **Messages per minute:** 60 requests/user
- **Messages per hour:** 1000 requests/user
- **Messages per day:** 10000 requests/user

### 6.2 Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1620000000
```

### 6.3 Rate Limit Exceeded Response

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1620000000
Retry-After: 60
```

---

## 7. Webhooks

### 7.1 Webhook Events

Các sự kiện webhook được gửi khi:

- `conversation.created`: Conversation được tạo mới
- `conversation.archived`: Conversation được archive
- `conversation.deleted`: Conversation bị xóa
- `message.sent`: Tin nhắn được gửi
- `message.received`: Phản hồi AI được nhận

### 7.2 Webhook Payload Format

```json
{
  "eventId": "guid",
  "eventType": "message.sent",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": {
    "conversationId": "guid",
    "messageId": "guid",
    "userId": "guid",
    "tenantId": "guid"
  }
}
```

---

## 8. Examples

### 8.1 Workflow Bóc Tách Dữ liệu Logistics

**Scenario:** User muốn bóc tách dữ liệu từ invoice vận chuyển đính kèm trong email.

#### Bước 1: Tạo Conversation liên kết với Email

```bash
curl -X POST https://api.example.com/api/v1/ai-chat/conversations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bóc tách invoice INV-2024-001",
    "tenantId": "tenant-guid",
    "createdBy": "user-guid"
  }'

# Response: { "data": { "id": "conv-guid", ... } }
```

#### Bước 2: Liên kết Conversation với Email từ MailConnector

```bash
curl -X POST https://api.example.com/api/v1/ai-chat/conversations/conv-guid/link-entity \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "mail_message",
    "entityId": "mail-message-guid"
  }'
```

#### Bước 3: Upload Attachment từ MailConnector vào Conversation

```bash
# Giả sử có endpoint để link attachment (cần implement)
curl -X POST https://api.example.com/api/v1/ai-chat/conversations/conv-guid/attachments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "mailconnector",
    "sourceReference": "attachment-guid",
    "fileName": "invoice.pdf"
  }'
```

#### Bước 4: Hỏi AI về các trường cần bóc tách

```bash
curl -X POST https://api.example.com/api/v1/ai-chat/conversations/conv-guid/messages \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tài liệu invoice này có những trường nào cần bóc tách cho hệ thống logistics? Hãy liệt kê kèm vị trí trong tài liệu.",
    "selectedAttachmentIds": ["attachment-guid"],
    "provider": "openai",
    "model": "gpt-4",
    "tenantId": "tenant-guid",
    "createdBy": "user-guid"
  }'

# Response:
{
  "data": {
    "message": "Dựa trên phân tích invoice INV-2024-001, các trường cần bóc tách bao gồm:\n\n1. **Invoice Number** (Trang 1, góc trên phải): INV-2024-001\n2. **Bill of Lading** (Trang 1, giữa): BOL-SG-VN-123456\n3. **Shipper Name** (Trang 1, cột trái): ABC Logistics Pte Ltd\n4. **Consignee Name** (Trang 1, cột phải): XYZ Corporation Vietnam\n5. **Gross Weight** (Trang 2, bảng hàng hóa): 5,000 KG\n6. **Commodity** (Trang 2, bảng hàng hóa): Electronics Components\n7. **Freight Amount** (Trang 3, tổng cộng): USD 2,500.00\n8. **Departure Date** (Trang 1): 2024-06-01\n9. **Arrival Date** (Trang 1): 2024-06-15\n\nCác trường này có thể map trực tiếp sang hệ thống logistics của bạn.",
    "inputTokens": 2500,
    "outputTokens": 350,
    "totalTokens": 2850,
    "finishReason": "stop"
  }
}
```

#### Bước 5: Hỏi thêm về Validation Rules

```bash
curl -X POST https://api.example.com/api/v1/ai-chat/conversations/conv-guid/messages \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Làm sao để validate trường Bill of Lading? Có format đặc biệt không?",
    "provider": "openai",
    "model": "gpt-4",
    "tenantId": "tenant-guid",
    "createdBy": "user-guid"
  }'

# Response:
{
  "data": {
    "message": "Bill of Lading (BOL) thường có các format sau:\n\n**Format phổ biến:**\n- BOL-{PortOrigin}-{PortDest}-{6 digits}\n- Ví dụ: BOL-SG-VN-123456\n\n**Validation Rules:**\n1. Bắt đầu bằng 'BOL-'\n2. Chứa mã port 3 chữ cái (ISO 3166-1 alpha-2)\n3. Kết thúc bằng 6 chữ số\n4. Regex: ^BOL-[A-Z]{2}-[A-Z]{2}-\\d{6}$\n\n**Ngoại lệ:**\n- Một số carrier dùng format riêng: MAERSK-XXXXX, COSCO-XXXXX\n- Nên cho phép custom regex trong cấu hình",
    "inputTokens": 800,
    "outputTokens": 200,
    "totalTokens": 1000,
    "finishReason": "stop"
  }
}
```

#### Bước 6: Hỏi về Mapping sang Hệ thống

```bash
curl -X POST https://api.example.com/api/v1/ai-chat/conversations/conv-guid/messages \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Làm sao để map trường 'Freight Amount' sang hệ thống? Cần convert currency không?",
    "provider": "openai",
    "model": "gpt-4",
    "tenantId": "tenant-guid",
    "createdBy": "user-guid"
  }'

# Response:
{
  "data": {
    "message": "Để map Freight Amount sang hệ thống:\n\n**Mapping Config:**\n```json\n{\n  \"sourceField\": \"Freight Amount\",\n  \"targetField\": \"freight_charge\",\n  \"dataType\": \"decimal\",\n  \"required\": true,\n  \"currencyConversion\": {\n    \"enabled\": true,\n    \"sourceCurrency\": \"USD\",\n    \"targetCurrency\": \"VND\",\n    \"rateProvider\": \"central_bank\"\n  },\n  \"validation\": {\n    \"min\": 0,\n    \"max\": 1000000\n  }\n}\n```\n\n**Lưu ý:**\n- Invoice này dùng USD, cần convert sang VND theo tỷ lệ hiện tại\n- Sử dụng API tỷ giá từ Ngân hàng Trung ương\n- Cache tỷ giá trong 1 giờ để tối ưu performance",
    "inputTokens": 900,
    "outputTokens": 250,
    "totalTokens": 1150,
    "finishReason": "stop"
  }
}
```

---

### 8.2 Review Kết quả Bóc Tách Tự Động

**Scenario:** MailConnector đã bóc tách tự động, user muốn review với AI.

```bash
curl -X POST https://api.example.com/api/v1/ai-chat/conversations/conv-guid/messages \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "MailConnector đã bóc tách các trường sau: invoice_number=INV-2024-001, bill_of_lading=BOL-SG-VN-123456, shipper=ABC Logistics. Hãy so sánh với tài liệu gốc và cho biết có trường nào bị thiếu không?",
    "selectedAttachmentIds": ["attachment-guid"],
    "provider": "openai",
    "model": "gpt-4",
    "tenantId": "tenant-guid",
    "createdBy": "user-guid"
  }'

# Response:
{
  "data": {
    "message": "So sánh kết quả bóc tách với tài liệu gốc:\n\n**Đúng:**\n- invoice_number: INV-2024-001 ✓\n- bill_of_lading: BOL-SG-VN-123456 ✓\n- shipper: ABC Logistics ✓\n\n**Thiếu:**\n- consignee_name: XYZ Corporation Vietnam (quan trọng)\n- gross_weight: 5,000 KG (quan trọng)\n- commodity: Electronics Components (quan trọng)\n- freight_amount: USD 2,500.00 (quan trọng)\n- departure_date: 2024-06-01 (quan trọng)\n- arrival_date: 2024-06-15 (quan trọng)\n\n**Khuyến nghị:**\n1. Cập nhật extraction rules để bóc tách thêm 6 trường bị thiếu\n2. Tăng confidence score threshold cho consignee_name\n3. Thêm validation cho gross_weight (> 0)",
    "inputTokens": 1800,
    "outputTokens": 300,
    "totalTokens": 2100,
    "finishReason": "stop"
  }
}
```

---

### 8.3 Lấy Danh sách Conversations theo Tenant

```bash
curl -X GET "https://api.example.com/api/v1/ai-chat/conversations?tenantId=tenant-guid" \
  -H "Authorization: Bearer {token}"

# Response: { "data": [ { "id": "conv-1", ... }, { "id": "conv-2", ... } ] }
```

---

## 9. Best Practices

### 9.1 Context Management

- **Giới hạn lịch sử tin nhắn:** Chỉ gửi 20 tin nhắn gần nhất để tiết kiệm token
- **Sử dụng selectedAttachmentIds:** Chỉ include attachment cần thiết
- **Archive conversations cũ:** Archive các conversation không còn sử dụng

### 9.2 Cost Optimization

- **Sử dụng model phù hợp:** GPT-3.5-turbo cho câu hỏi đơn giản, GPT-4 cho câu hỏi phức tạp
- **Giới hạn token output:** Thiết lập maxTokens hợp lý
- **Cache phản hồi:** Cache các câu hỏi lặp lại

### 9.3 Security

- **Validate input:** Luôn validate user input trước khi gửi đến AI
- **Sanitize output:** Sanitize phản hồi từ AI trước khi hiển thị
- **Prompt injection defense:** Sử dụng XML tags để ngăn chặn prompt injection

---

## 10. Limitations

### 10.1 Current Limitations (MVP)

- **File size limit:** 10MB per file
- **Supported file types:** PDF, DOCX, XLSX, PNG, JPG
- **Max attachments per conversation:** 50
- **Max messages per conversation:** 1000
- **Context window:** 128K tokens (GPT-4)

### 10.2 Future Enhancements

- Streaming responses
- Multi-turn conversations with context retention
- Voice input/output
- Image analysis (GPT-4 Vision)
- Custom AI models
- Fine-tuned models for logistics domain

---

## 11. Support

**Documentation Updates:** 2026-05-28
**Version:** 1.0.0 (MVP)
**Contact:** dev-team@example.com
