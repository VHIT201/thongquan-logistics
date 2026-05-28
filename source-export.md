# Logistics Platform – Source Export

Generated: 2026-05-28T11:14:23.088Z

---

## File: `.windsurf\workflows\emails.md`

```md

```

---

## File: `AGENTS.md`

```md
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

Luôn trả lời bằng tiếng Việt
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

```

---

## File: `ai-chat-api (1).md`

```md
# AI Chat API Documentation

**Ngày:** 2026-05-28
**Phiên bản:** 1.1.0
**Dự án:** LogisticsPlatformBE
**Mục đích:** Tài liệu API đầy đủ cho module AI Chat - tính năng trò chuyện AI tích hợp với hệ thống logistics

**Changelog v1.1.0:**
- Thêm GET messages endpoint để lấy lịch sử tin nhắn
- Thêm responseFormat parameter để hỗ trợ JSON response cho template mode
- Thêm idempotencyKey để tránh tạo duplicate conversation
- Thêm mail_message entity type với context từ MailConnector
- Thêm GET conversations by entity endpoint để tìm conversation theo entity (mail_message, order, etc.)
- Cập nhật LinkAttachmentRequest model đầy đủ

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
  "createdBy": "guid",
  "idempotencyKey": "optional-client-generated-key"
}
```

**Parameters:**
- `title` (string, required): Tiêu đề conversation
- `tenantId` (GUID, required): Tenant ID
- `createdBy` (GUID, required): User ID
- `idempotencyKey` (string, optional): Client-generated key để tránh tạo duplicate conversation

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

### 1.4 Lấy Conversation Theo Entity

```http
GET /api/v1/ai-chat/conversations/by-entity?entityType={entityType}&entityId={entityId}
```

**Mô tả:** Lấy conversation đã link với một entity cụ thể (ví dụ: mail message).

**Query Parameters:**
- `entityType` (string, required): Loại entity (`mail_message`, `order`, `shipment`, `invoice`, `customer`)
- `entityId` (GUID, required): Entity ID

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
    "entityType": "mail_message",
    "entityId": "guid",
    "createdAt": "2026-05-28T10:00:00Z",
    "updatedAt": "2026-05-28T10:00:00Z"
  },
  "meta": {},
  "errors": []
}
```

**Status Codes:**
- `200 OK`: Thành công
- `404 Not Found`: Không tìm thấy conversation cho entity được chỉ định

**Use Case:**
FE có thể dùng endpoint này để check xem conversation cho một mail message đã tồn tại chưa trước khi tạo mới, giúp tránh duplicate conversations.

---

### 1.5 Cập nhật Conversation

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

### 1.6 Archive Conversation

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

### 1.7 Xóa Conversation

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

### 1.8 Liên kết Conversation với Business Entity

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
- `mail_message`: Email từ MailConnector (trả về context: subject, from, to, date, body preview, attachment list)

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

### 2.1 Lấy Tin Nhắn

```http
GET /api/v1/ai-chat/conversations/{conversationId}/messages
```

**Mô tả:** Lấy danh sách tin nhắn của một conversation.

**Path Parameters:**
- `conversationId` (GUID): Conversation ID

**Response:**
```json
{
  "correlationId": "guid",
  "traceId": "trace-id",
  "timestamp": "2026-05-28T10:00:00Z",
  "data": [
    {
      "id": "guid-1",
      "conversationId": "guid",
      "role": "user",
      "content": "Hãy cho tôi biết thông tin về vận đơn BOL-123456",
      "contentType": "text",
      "inputTokens": null,
      "outputTokens": null,
      "totalTokens": null,
      "model": null,
      "provider": null,
      "finishReason": null,
      "createdAt": "2026-05-28T10:00:00Z"
    },
    {
      "id": "guid-2",
      "conversationId": "guid",
      "role": "assistant",
      "content": "Theo thông tin từ hệ thống, vận đơn BOL-123456 là một lô hàng vận chuyển từ Singapore đến Việt Nam...",
      "contentType": "text",
      "inputTokens": 1500,
      "outputTokens": 500,
      "totalTokens": 2000,
      "model": "gpt-4",
      "provider": "openai",
      "finishReason": "stop",
      "createdAt": "2026-05-28T10:00:05Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

**Status Codes:**
- `200 OK`: Thành công
- `404 Not Found`: Conversation không tồn tại

---

### 2.2 Gửi Tin Nhắn

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
  "responseFormat": "text",
  "tenantId": "guid",
  "createdBy": "guid"
}
```

**Parameters:**
- `message` (string, required): Nội dung tin nhắn
- `selectedAttachmentIds` (GUID[], optional): Danh sách attachment IDs để include trong context
- `provider` (string, optional): AI provider (`openai`, `azure`, default: `openai`)
- `model` (string, optional): AI model (`gpt-4`, `gpt-3.5-turbo`, default: `gpt-4`)
- `responseFormat` (string, optional): Format phản hồi (`text` hoặc `json`, default: `text`)
- `tenantId` (GUID, required): Tenant ID
- `createdBy` (GUID, required): User ID

**Response Format:**
- Khi `responseFormat = "text"`: AI trả về text tự do (mặc định)
- Khi `responseFormat = "json"`: AI được hướng dẫn trả về JSON có cấu trúc, BE sẽ parse và validate JSON trước khi trả về

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
    public string? ContentType { get; set; }
    public long? FileSize { get; set; }
    
    // Source
    public string Source { get; set; }  // upload, mailconnector
    public string? SourceReference { get; set; }
    
    // Storage
    public string? FileHash { get; set; }
    public string? StorageBucket { get; set; }
    public string? StoragePath { get; set; }
    
    // Extracted Text
    public string? ExtractedText { get; set; }
    public int ExtractedTextVersion { get; set; }
    
    // Ownership
    public Guid TenantId { get; set; }
    public Guid CreatedBy { get; set; }
    
    // Timestamps
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}
```

**Source Values:**
- `upload`: File được upload trực tiếp
- `mailconnector`: File từ MailConnector (email attachment)

**LinkAttachment Request Model:**
```csharp
public record LinkAttachmentRequest
{
    public string Source { get; init; } = string.Empty;  // 'mailconnector' or 'upload'
    public Guid? MessageId { get; init; }  // Required for mailconnector
    public Guid? AttachmentId { get; init; }  // Required for mailconnector
    public string FileName { get; init; } = string.Empty;
    public string? ContentType { get; init; }
    public long? FileSize { get; init; }
    public string? FileHash { get; init; }
    public string? StorageBucket { get; init; }
    public string? StoragePath { get; init; }
    public Guid TenantId { get; init; }
    public Guid CreatedBy { get; init; }
}
```

**Attachment Response Model:**
```csharp
public record AttachmentDto
{
    public Guid Id { get; init; }  // Conversation attachment ID - use this in selectedAttachmentIds
    public Guid ConversationId { get; init; }
    public string Source { get; init; } = string.Empty;
    public string? SourceReference { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string? ContentType { get; init; }
    public long? FileSize { get; init; }
    public string? FileHash { get; init; }
    public string? StorageBucket { get; init; }
    public string? StoragePath { get; init; }
    public string? ExtractedText { get; init; }
    public int ExtractedTextVersion { get; init; }
    public Guid TenantId { get; init; }
    public Guid CreatedBy { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
```

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

```

---

## File: `ai-chat-api-fe-be-gap-analysis.md`

```md
# AI Chat API - FE/BE Gap Analysis

**Ngày:** 2026-05-28
**Dự án:** LogisticsPlatformBE
**Mục đích:** Phân tích sự khác biệt giữa Frontend plan và Backend implementation cho AI Chat API

---

## Tổng quan

FE đã báo cáo 7 lỗ hổng trong plan. Bài phân tích này kiểm tra từng vấn đề để xác định lỗi FE hay lỗi BE, và đề xuất giải pháp.

---

## 1. entityType: "mail_message" không có trong docs (Nghiêm trọng)

### FE Claim
Docs AI Chat chỉ liệt kê: order, shipment, invoice, customer. Không có mail_message. Nếu BE chưa implement entity type này, link-entity sẽ trả về lỗi.

### BE Implementation Check

**File:** `src/Modules/AIChat/Domain/Conversation.cs`
```csharp
public string? EntityType { get; private set; }  // Optional: Link to business entity (order, shipment, etc.)
```

**File:** `src/Modules/AIChat/Infrastructure/Persistence/AIChatDbContext.cs`
```csharp
entity.Property(e => e.EntityType).HasMaxLength(50);
```

**File:** `src/Modules/AIChat/Infrastructure/Services/BusinessEntityContextClient.cs`
```csharp
public Task<string> GetEntityContextAsync(string entityType, Guid entityId, CancellationToken cancellationToken = default)
{
    // TODO: Implement actual business entity context fetching
    // This will integrate with the Business Logic Module to fetch order, shipment, etc. details
    // For now, return empty string as placeholder
    
    var context = $"Entity: {entityType} (ID: {entityId})\n" +
                 "Context not yet implemented. This will be populated with actual entity data " +
                 "from the Business Logic Module (orders, shipments, customers, etc.).";
    // ...
}
```

### Kết luận
- **Lỗi BE:** EntityType là string không có validation
- **Trạng thái hiện tại:** BE chấp nhận bất kỳ string nào (bao gồm "mail_message")
- **Vấn đề thực tế:** Context fetching cho "mail_message" chưa được implement (trả về placeholder)
- **Độ nghiêm trọng:** Trung bình - API sẽ không lỗi nhưng context sẽ không có dữ liệu thực

### Giải pháp đề xuất
**Option 1 (Khuyên dùng):** Implement mail_message context trong BusinessEntityContextClient
- Thêm logic để fetch mail message data từ MailConnector module
- Cập nhật docs để thêm "mail_message" vào danh sách entity types hỗ trợ

**Option 2 (Tạm thời):** Dùng entityType: "order" hoặc không link entity
- Link entity không bắt buộc, conversation vẫn hoạt động
- Nhưng mất context về email gốc

---

## 2. Template mode không còn trả về JSON (Nghiêm trọng)

### FE Claim
processDocumentsMutation hiện tại gọi DocumentProcessor — module chuyên bóc tách, trả về JSON có cấu trúc. sendMessageMutation qua AI Chat API trả về data.message là text tự do. Template mode cần JSON để parse, nếu BE không xử lý đặc biệt cho template prompt thì extraction bị hỏng.

### BE Implementation Check

**File:** `src/Modules/AIChat/Api/Controllers/ChatController.cs`
```csharp
public record ChatResponseDto
{
    public string Message { get; init; } = string.Empty;  // Chỉ có string
    public int InputTokens { get; init; }
    public int OutputTokens { get; init; }
    public int TotalTokens { get; init; }
    public string? FinishReason { get; init; }
}
```

**File:** `src/Modules/AIChat/Application/Services/ChatService.cs`
```csharp
public async Task<ChatResponse> SendMessageAsync(...)
{
    // ...
    var sanitizedResponse = SanitizeAiResponse(aiResponse.Content);
    
    return new ChatResponse
    {
        Message = sanitizedResponse,  // Luôn là string
        InputTokens = aiResponse.InputTokens,
        OutputTokens = aiResponse.OutputTokens,
        TotalTokens = aiResponse.TotalTokens,
        FinishReason = aiResponse.FinishReason
    };
}
```

**Grep check:** Không tìm thấy bất kỳ code nào liên quan đến "template" hoặc "json response"

### Kết luận
- **Lỗi BE:** ChatService không hỗ trợ trả về JSON
- **Trạng thái hiện tại:** Luôn trả về text string
- **Độ nghiêm trọng:** Nghiêm trọng - Template mode không thể hoạt động

### Giải pháp đề xuất
**Option 1 (Khuyên dùng):** Thêm parameter `responseFormat` vào SendMessageRequest
```csharp
public record SendMessageRequest
{
    public string Message { get; init; } = string.Empty;
    public Guid[]? SelectedAttachmentIds { get; init; }
    public string? Provider { get; init; }
    public string? Model { get; init; }
    public string? ResponseFormat { get; init; }  // "text" hoặc "json"
    public Guid TenantId { get; init; }
    public Guid CreatedBy { get; init; }
}
```

- Khi `responseFormat = "json"`, BE sẽ:
  - Thêm instruction vào system prompt để AI trả về JSON
  - Parse AI response và validate JSON
  - Trả về `data.message` là JSON string (hoặc field riêng `data.jsonData`)

**Option 2:** Giữ processDocumentsMutation riêng cho Template mode
- FE tiếp tục dùng DocumentProcessor cho template mode
- Chỉ dùng AI Chat API cho tư vấn (consultation mode)
- 2 luồng riêng biệt, không merge

---

## 3. selectedAttachmentIds là conversation attachment IDs (Nghiêm trọng)

### FE Claim
SendMessageRequest.selectedAttachmentIds theo Swagger là ID của attachment đã được link vào conversation (qua POST /attachments), không phải MailConnector attachment IDs.

Luồng đúng phải là:
1. Link MailConnector attachment → conversation (POST /attachments)
2. BE trả về conversation attachment ID
3. Dùng ID đó trong sendMessage
4. Nhưng Swagger return type void cho POST /attachments → không lấy được ID.

### BE Implementation Check

**File:** `src/Modules/AIChat/Api/Controllers/AttachmentsController.cs`
```csharp
[HttpPost]
public async Task<IActionResult> LinkAttachment(Guid conversationId, [FromBody] LinkAttachmentRequest request)
{
    // ... validation logic ...
    
    return Ok(new ApiResponse<AttachmentDto>
    {
        CorrelationId = HttpContext.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString(),
        TraceId = HttpContext.TraceIdentifier,
        Timestamp = DateTime.UtcNow.ToString("o"),
        Data = MapToDto(attachment),  // TRẢ VỀ AttachmentDto với Id
        Meta = new ApiMeta(),
        Errors = new List<ApiError>()
    });
}
```

**File:** `src/Modules/AIChat/Api/Controllers/AttachmentsController.cs` (AttachmentDto)
```csharp
public record AttachmentDto
{
    public Guid Id { get; init; }  // Conversation attachment ID
    public Guid ConversationId { get; init; }
    public string Source { get; init; } = string.Empty;
    public string? SourceReference { get; init; }
    // ... other fields
}
```

**File:** `src/Modules/AIChat/Api/Controllers/AttachmentsController.cs` (LinkAttachmentRequest)
```csharp
public record LinkAttachmentRequest
{
    public string Source { get; init; } = string.Empty;  // 'mailconnector' or 'upload'
    public Guid? MessageId { get; init; }  // Required for mailconnector
    public Guid? AttachmentId { get; init; }  // Required for mailconnector
    public string FileName { get; init; } = string.Empty;
    // ... other fields
}
```

### Kết luận
- **Lỗi FE:** FE claim sai về return type void
- **Trạng thái hiện tại:** BE CÓ trả về AttachmentDto với Id (conversation attachment ID)
- **Độ nghiêm trọng:** Không nghiêm trọng - BE đã implement đúng
- **Vấn đề docs:** Docs có thể outdated hoặc FE đọc docs sai

### Giải pháp đề xuất
**Cập nhật docs:** Đảm bảo docs phản ánh đúng implementation
- POST /attachments trả về `ApiResponse<AttachmentDto>`
- AttachmentDto.Id là conversation attachment ID để dùng trong selectedAttachmentIds

**Luồng đúng:**
1. POST /attachments với `source: "mailconnector"`, `messageId`, `attachmentId`
2. Response trả về `data.id` (conversation attachment ID)
3. Dùng `data.id` trong POST /messages `selectedAttachmentIds`

---

## 4. Không có endpoint GET messages (Trung bình)

### FE Claim
BE lưu message qua POST /messages nhưng FE không thể lấy lại. localStorage chỉ lưu FE-side:
- Mất khi đổi browser/máy
- Không share giữa user
- Không đồng bộ nếu user mở 2 tab

### BE Implementation Check

**File:** `src/Modules/AIChat/Api/Controllers/ChatController.cs`
```csharp
[HttpPost("conversations/{conversationId:guid}/messages")]
public async Task<IActionResult> SendMessage(Guid conversationId, [FromBody] SendMessageRequest request)
{
    // Chỉ có POST, không có GET
}
```

**Grep check:** Không tìm thấy GET endpoint cho messages trong AIChat module

**File:** `src/Modules/AIChat/Infrastructure/Persistence/MessageRepository.cs`
```csharp
public async Task<List<Message>> GetByConversationIdAsync(Guid conversationId)
{
    // Repository CÓ method để lấy messages
    return await _context.Messages
        .Where(m => m.ConversationId == conversationId)
        .OrderBy(m => m.CreatedAtUtc)
        .ToListAsync();
}
```

### Kết luận
- **Lỗi BE:** Không có GET endpoint cho messages
- **Trạng thái hiện tại:** Repository có method nhưng Controller không expose
- **Độ nghiêm trọng:** Trung bình - FE phải dùng localStorage thay vì server-side storage
- **Impact:** User experience kém, không sync giữa tabs/devices

### Giải pháp đề xuất
**Thêm GET endpoint:**
```csharp
[HttpGet("conversations/{conversationId:guid}/messages")]
public async Task<IActionResult> GetMessages(Guid conversationId)
{
    var messages = await _messageRepository.GetByConversationIdAsync(conversationId);
    
    return Ok(new ApiResponse<List<MessageDto>>
    {
        CorrelationId = HttpContext.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString(),
        TraceId = HttpContext.TraceIdentifier,
        Timestamp = DateTime.UtcNow.ToString("o"),
        Data = messages.Select(MapToDto).ToList(),
        Meta = new ApiMeta(),
        Errors = new List<ApiError>()
    });
}
```

**MessageDto:**
```csharp
public record MessageDto
{
    public Guid Id { get; init; }
    public Guid ConversationId { get; init; }
    public string Role { get; init; }  // user, assistant, system
    public string Content { get; init; } = string.Empty;
    public string? ContentType { get; init; }
    public int? InputTokens { get; init; }
    public int? OutputTokens { get; init; }
    public int? TotalTokens { get; init; }
    public string? Model { get; init; }
    public string? Provider { get; init; }
    public string? FinishReason { get; init; }
    public DateTime CreatedAt { get; init; }
}
```

---

## 5. Race condition tạo conversation (Trung bình)

### FE Claim
Mở email → check localStorage → chưa có → tạo conversation. Nếu 2 tab cùng mở 1 email trong cùng 1ms, cả 2 đều tạo conversation trên BE.

### BE Implementation Check

**File:** `src/Modules/AIChat/Api/Controllers/ConversationsController.cs`
```csharp
[HttpPost]
public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequest request)
{
    var conversation = await _conversationService.CreateConversationAsync(
        request.Title,
        request.TenantId,
        request.CreatedBy);
    // Không có idempotency check
}
```

**File:** `src/Modules/AIChat/Application/Services/ConversationService.cs`
```csharp
public async Task<Conversation> CreateConversationAsync(string title, Guid tenantId, Guid createdBy)
{
    var conversation = Conversation.Create(title, tenantId, createdBy);
    await _conversationRepository.AddAsync(conversation);
    await _conversationRepository.SaveChangesAsync();
    return conversation;
}
```

### Kết luận
- **Lỗi BE:** Không có idempotency mechanism
- **Trạng thái hiện tại:** Mỗi POST tạo conversation mới
- **Độ nghiêm trọng:** Trung bình - Có thể tạo duplicate conversations
- **Impact:** Database bloat, nhưng không gây lỗi functional

### Giải pháp đề xuất
**Option 1 (Khuyên dùng):** Thêm idempotency key
```csharp
public record CreateConversationRequest
{
    public string Title { get; init; } = string.Empty;
    public Guid TenantId { get; init; }
    public Guid CreatedBy { get; init; }
    public string? IdempotencyKey { get; init; }  // Client-generated key
}
```

- BE lưu idempotency key trong DB với TTL
- Nếu key đã tồn tại, trả về conversation đã tạo thay vì tạo mới

**Option 2:** FE-side deduplication
- FE dùng `messageId` làm key trong localStorage
- Check localStorage trước khi gọi API
- Không hoàn toàn giải quyết race condition nhưng giảm tỷ lệ

**Option 3:** BE check existing conversation by entity
- Nếu link-entity sau khi tạo, BE có thể check xem conversation với entity đó đã tồn tại chưa
- Nhưng conversation có thể tạo trước khi link entity

---

## 6. LinkAttachment model khác docs (Nhẹ)

### FE Claim
Docs gợi ý sourceReference nhưng Swagger generate có messageId, attachmentId, fileHash, storageBucket, storagePath. Không rõ BE expect payload nào.

### BE Implementation Check

**Docs (ai-chat-api.md line 528-529):**
```csharp
public string? SourceReference { get; set; }  // Giả định
```

**BE actual (AttachmentsController.cs line 205-218):**
```csharp
public record LinkAttachmentRequest
{
    public string Source { get; init; } = string.Empty;  // 'mailconnector' or 'upload'
    public Guid? MessageId { get; init; }  // Required for mailconnector
    public Guid? AttachmentId { get; init; }  // Required for mailconnector
    public string FileName { get; init; } = string.Empty;
    public string? ContentType { get; init; }
    public long? FileSize { get; init; }
    public string? FileHash { get; init; }
    public string? StorageBucket { get; init; }
    public string? StoragePath { get; init; }
    public Guid TenantId { get; init; }
    public Guid CreatedBy { get; init; }
}
```

**BE actual (ConversationAttachment domain):**
```csharp
public class ConversationAttachment
{
    public string Source { get; private set; }  // upload, mailconnector
    public string? SourceReference { get; private set; }  // Vẫn có field này
    // ... other fields
}
```

### Kết luận
- **Lỗi Docs:** Docs không đầy đủ
- **Trạng thái hiện tại:** BE request model chi tiết hơn docs
- **Độ nghiêm trọng:** Nhẹ - Chỉ cần cập nhật docs
- **Mapping:** SourceReference trong domain được populate từ MessageId+AttachmentId

### Giải pháp đề xuất
**Cập nhật docs:**
- Thêm LinkAttachmentRequest đầy đủ vào docs
- Giải thích mapping: SourceReference = `${messageId}:${attachmentId}` cho mailconnector

---

## 7. Conversation orphaned (Nhẹ)

### FE Claim
Mỗi lần mở email tạo 1 conversation trên BE. Nếu user không dùng chat, conversation vẫn tồn tại trên BE không có cách cleanup.

### BE Implementation Check

**File:** `src/Modules/AIChat/Domain/Conversation.cs`
```csharp
public void Archive()
{
    Status = "archived";
    UpdateTimestamp();
}

public void Delete()
{
    Status = "deleted";
    UpdateTimestamp();
}
```

**Grep check:** Không tìm thấy scheduled job, TTL, hoặc auto-cleanup mechanism

### Kết luận
- **Lỗi BE:** Không có auto-cleanup mechanism
- **Trạng thái hiện tại:** Conversations tồn tại vĩnh viễn trừ khi manual delete
- **Độ nghiêm trọng:** Nhẹ - Database bloat về lâu dài
- **Impact:** Performance degradation sau thời gian dài

### Giải pháp đề xuất
**Option 1 (Khuyên dùng):** Scheduled cleanup job
- Tạo background service chạy hàng ngày
- Archive conversations:
  - Không có message trong 30 ngày
  - Status = active nhưng không có activity
- Delete conversations:
  - Status = archived trong 90 ngày

**Option 2:** Soft delete với TTL
- Thêm TTL field vào Conversation
- Set TTL khi tạo (ví dụ 7 ngày)
- Nếu có activity, extend TTL
- Background job delete expired conversations

**Option 3:** FE-side cleanup
- FE hiển thị danh sách conversations
- User manual delete/archived
- Không tự động

---

## Tóm tắt

| # | Vấn đề | Lỗi FE/BE | Độ nghiêm trọng | Trạng thái |
|---|--------|-----------|-----------------|------------|
| 1 | entityType "mail_message" không có trong docs | BE (chưa implement context) | Trung bình | Cần implement context |
| 2 | Template mode không trả về JSON | BE (không hỗ trợ) | Nghiêm trọng | Cần thêm responseFormat |
| 3 | selectedAttachmentIds mapping | FE (claim sai về void return) | Không nghiêm trọng | BE đã đúng |
| 4 | Không có GET messages | BE (thiếu endpoint) | Trung bình | Cần thêm GET endpoint |
| 5 | Race condition tạo conversation | BE (không idempotency) | Trung bình | Cần idempotency key |
| 6 | LinkAttachment model khác docs | Docs (outdated) | Nhẹ | Cần cập nhật docs |
| 7 | Conversation orphaned | BE (không cleanup) | Nhẹ | Cần scheduled job |

---

## Priority Actions

### High Priority (Fix ngay)
1. **Thêm GET messages endpoint** - FE cần để sync conversations
2. **Thêm responseFormat parameter** - Template mode cần JSON response

### Medium Priority (Fix trong sprint sau)
3. **Implement mail_message context** - Để link entity hoạt động đúng
4. **Thêm idempotency key** - Tránh duplicate conversations

### Low Priority (Fix khi có thời gian)
5. **Cập nhật docs LinkAttachment** - Đảm bảo docs đúng implementation
6. **Thêm scheduled cleanup job** - Database maintenance

---

## Mapping giữa FE và BE

### Luồng đúng hiện tại

```
1. FE mở email
   ↓
2. FE check localStorage cho conversationId
   ↓
3a. Nếu chưa có:
   POST /api/v1/ai-chat/conversations
   Response: { data: { id: "conv-guid" } }
   ↓
   POST /api/v1/ai-chat/conversations/{conv-guid}/link-entity
   Body: { entityType: "mail_message", entityId: "mail-msg-guid" }
   ↓
   Lưu conv-guid vào localStorage
   ↓
3b. Nếu đã có:
   Dùng conv-guid từ localStorage
   ↓
4. Link attachment (nếu cần)
   POST /api/v1/ai-chat/conversations/{conv-guid}/attachments
   Body: { 
     source: "mailconnector",
     messageId: "mail-msg-guid",
     attachmentId: "mail-att-guid",
     fileName: "invoice.pdf",
     tenantId: "...",
     createdBy: "..."
   }
   Response: { data: { id: "conv-att-guid" } }
   ↓
5. Gửi message
   POST /api/v1/ai-chat/conversations/{conv-guid}/messages
   Body: {
     message: "Hỏi về invoice...",
     selectedAttachmentIds: ["conv-att-guid"],  // Dùng conversation attachment ID
     provider: "openai",
     model: "gpt-4",
     tenantId: "...",
     createdBy: "..."
   }
   Response: { data: { message: "AI response...", ... } }
   ↓
6. (TODO) Lấy messages
   GET /api/v1/ai-chat/conversations/{conv-guid}/messages
   Response: { data: [ { role: "user", content: "..." }, { role: "assistant", content: "..." } ] }
```

### Vấn đề trong luồng

- **Bước 3a:** Race condition nếu 2 tab cùng mở
- **Bước 3a:** entityType "mail_message" không có context
- **Bước 5:** Template mode không thể request JSON response
- **Bước 6:** GET messages chưa có endpoint

---

## Contact

**Documentation:** 2026-05-28
**Version:** 1.0.0
**Reviewed by:** Backend Team

```

---

## File: `ai-chat-api.md`

```md
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

```

---

## File: `app\(app)\admin\ai-usage\page.tsx`

```tsx
"use client"
// ADMIN ROUTE: Theo dõi chi phí và token AI sử dụng — chỉ admin

import { useState } from "react"
import dayjs from "dayjs"
import {
  BarChart3,
  Cpu,
  Loader,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import {
  useAiOpenaiUsageQuery,
  useAiOpenaiUsageCurrentMonthQuery,
  useAiOpenaiUsageUsersCurrentMonthQuery,
} from "@/hooks/use-mail-queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type UsageRecord = Record<string, unknown>

function normalizeData(raw: unknown): UsageRecord[] {
  if (Array.isArray(raw)) return raw as UsageRecord[]
  if (raw && typeof raw === "object" && "data" in raw) {
    const d = raw as Record<string, unknown>
    if (Array.isArray(d.data)) return d.data as UsageRecord[]
  }
  return []
}

function getValue(record: UsageRecord, ...keys: string[]): number {
  for (const key of keys) {
    const val = record[key]
    if (typeof val === "number") return val
  }
  return 0
}

function getString(record: UsageRecord, key: string): string {
  const val = record[key]
  return val != null ? String(val) : "—"
}

export default function AiUsagePage() {
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  })

  const usageQuery = useAiOpenaiUsageQuery(dateRange)
  const currentMonthQuery = useAiOpenaiUsageCurrentMonthQuery()
  const usersCurrentMonthQuery = useAiOpenaiUsageUsersCurrentMonthQuery()

  const usageRecords = normalizeData(usageQuery.data)
  const currentMonthData = (() => {
    const raw = currentMonthQuery.data
    if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>
    if (raw && typeof raw === "object" && "data" in raw) {
      const d = raw as Record<string, unknown>
      return (d.data ?? {}) as Record<string, unknown>
    }
    return null
  })()

  const usersRecords = normalizeData(usersCurrentMonthQuery.data)

  const totalRequests = usageRecords.reduce((sum, r) => sum + getValue(r, "totalRequests", "requestCount", "requests"), 0)
  const totalTokens = usageRecords.reduce((sum, r) => sum + getValue(r, "totalTokens", "tokenCount", "tokens"), 0)
  const totalCost = usageRecords.reduce((sum, r) => sum + getValue(r, "totalCost", "cost", "estimatedCost"), 0)
  const activeUsers = usersRecords.length

  const isLoading = usageQuery.isPending || currentMonthQuery.isPending || usersCurrentMonthQuery.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">AI Usage Dashboard</h1>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-200" />
          <span className="text-sm text-neutral-200">
            {dayjs(dateRange.startDate).format("DD/MM/YYYY")} - {dayjs(dateRange.endDate).format("DD/MM/YYYY")}
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-neutral-200">
          <Loader className="h-4 w-4 animate-spin" />
          Đang tải...
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-200">Tổng Requests</CardTitle>
            <div className="rounded-lg bg-primary-50 p-2">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-300">{totalRequests.toLocaleString("vi-VN")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-200">Tổng Tokens</CardTitle>
            <div className="rounded-lg bg-blue-50 p-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-300">{totalTokens.toLocaleString("vi-VN")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-200">Chi phí ước tính</CardTitle>
            <div className="rounded-lg bg-green-50 p-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-300">${totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-200">User active (tháng)</CardTitle>
            <div className="rounded-lg bg-purple-50 p-2">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-300">{activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Month Summary */}
      {currentMonthData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tháng hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-xs text-neutral-200">Requests</p>
                <p className="text-xl font-bold text-neutral-300">
                  {Number(currentMonthData["totalRequests"] ?? currentMonthData["requestCount"] ?? 0).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-xs text-neutral-200">Tokens</p>
                <p className="text-xl font-bold text-neutral-300">
                  {Number(currentMonthData["totalTokens"] ?? currentMonthData["tokenCount"] ?? 0).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-xs text-neutral-200">Chi phí</p>
                <p className="text-xl font-bold text-neutral-300">
                  ${Number(currentMonthData["totalCost"] ?? currentMonthData["cost"] ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage by User */}
      {usersRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Usage theo user (tháng này)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-white/80">User</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Requests</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Tokens</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Chi phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/15">
                  {usersRecords.map((u, i) => (
                    <tr key={i} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-neutral-300 font-medium">
                        {getString(u, "userName") || getString(u, "userId") || getString(u, "email")}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-200">
                        {getValue(u, "totalRequests", "requestCount", "requests").toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-200">
                        {getValue(u, "totalTokens", "tokenCount", "tokens").toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-200">
                        ${getValue(u, "totalCost", "cost", "estimatedCost").toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Usage */}
      {usageRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Chi tiết theo ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Ngày</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Requests</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Tokens</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80">Chi phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/15">
                  {usageRecords.map((r, i) => {
                    const dateVal = getString(r, "date") || getString(r, "usageDate") || getString(r, "day")
                    return (
                      <tr key={i} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 text-neutral-300">
                          {dateVal !== "—" ? dayjs(dateVal).format("DD/MM/YYYY") : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-200">
                          {getValue(r, "totalRequests", "requestCount", "requests").toLocaleString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-200">
                          {getValue(r, "totalTokens", "tokenCount", "tokens").toLocaleString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-200">
                          ${getValue(r, "totalCost", "cost", "estimatedCost").toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

```

---

## File: `app\(app)\admin\assignments\page.tsx`

```tsx
"use client"
// ADMIN ROUTE: Quản lý phân công xử lý email (gán mail cho user) — chỉ admin

import { useState, useMemo } from "react"
import {
  Loader,
  Mail,
  UserCheck,
  CheckCircle,
  Clock,
  Send,
  Eye,
  X,
  Calendar,
  AlertTriangle,
  Paperclip,
} from "lucide-react"
import dayjs from "dayjs"
import { toast } from "sonner"
import { useMailMessagesQuery, useMailMessageQuery } from "@/hooks/use-mail-queries"
import {
  useMailAssignmentsByStatusQuery,
  useAssignMailMutation,
  useUnassignMailMutation,
} from "@/hooks/use-mail-assignments-queries"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import { useUsersQuery } from "@/hooks/use-user-queries"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const TABS = [
  { key: "unassigned", label: "Chưa xử lý", icon: Mail },
  { key: "assigned", label: "Đang xử lý", icon: Clock },
  { key: "completed", label: "Hoàn thành", icon: CheckCircle },
]

function normalizeArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[]
  if (raw && typeof raw === "object" && "data" in raw) {
    const d = raw as unknown as Record<string, unknown>
    if (Array.isArray(d.data)) return d.data as Record<string, unknown>[]
  }
  return []
}

function getPagination(raw: unknown) {
  if (raw && typeof raw === "object" && "meta" in raw) {
    const m = raw as unknown as Record<string, unknown>
    const meta = m.meta as Record<string, unknown> | undefined
    if (meta && "pagination" in meta) {
      return meta.pagination as Record<string, unknown>
    }
  }
  return null
}

export default function AdminAssignmentsPage() {
  const [activeTab, setActiveTab] = useState("unassigned")
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Queries
  const assignmentsQuery = useMailAssignmentsByStatusQuery(
    activeTab === "unassigned" ? "assigned" : activeTab
  )
  // Fetch all assignments with status=assigned for checking "already assigned" in unassigned tab
  const allAssignedQuery = useMailAssignmentsByStatusQuery("assigned")
  // Fetch all messages for unassigned tab + subject lookup in assignment rows
  const allMessagesQuery = useMailMessagesQuery({ page: 1, pageSize: 500 })
  const usersQuery = useUsersQuery({ page: 1, pageSize: 100 })
  const assignMutation = useAssignMailMutation()
  const unassignMutation = useUnassignMailMutation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mailApi: any = getLogisticsPlatformAPI()

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [currentAssignedUserId, setCurrentAssignedUserId] = useState<string | null>(null)

  const detailMessageQuery = useMailMessageQuery(detailModalOpen ? selectedMessageId : null)

  // Normalized data
  const assignments = normalizeArray(assignmentsQuery.data)
  const allAssigned = normalizeArray(allAssignedQuery.data)
  const allMessages = normalizeArray(allMessagesQuery.data)
  const users = normalizeArray(usersQuery.data)

  // Build lookup maps
  const messageMap = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>()
    for (const m of allMessages) {
      const id = String(m.id ?? "")
      if (id && !map.has(id)) map.set(id, m)
    }
    return map
  }, [allMessages])

  // Merge all assignment sources (tab-specific + all assigned) for lookup
  const allAssignments = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>()
    for (const a of [...allAssigned, ...assignments]) {
      const id = String(a.mailConnectorMessageId ?? "")
      if (id && !map.has(id)) map.set(id, a)
    }
    return map
  }, [allAssigned, assignments])

  const assignedMessageIds = useMemo(() => {
    const set = new Set<string>()
    for (const a of allAssignments.values()) {
      const id = String(a.mailConnectorMessageId ?? "")
      if (id) set.add(id)
    }
    return set
  }, [allAssignments])

  // Unassigned messages = all messages NOT in any assignment
  const unassignedMessages = useMemo(() => {
    return allMessages.filter((m) => {
      const id = String(m.id ?? "")
      return !assignedMessageIds.has(id)
    })
  }, [allMessages, assignedMessageIds])

  const getUserName = (userId: string) => {
    const u = users.find((item) => String(item.id) === userId)
    if (u) return String(u.fullName ?? u.email ?? "—")
    return userId.slice(0, 8)
  }

  const getMessageSubject = (messageId: string) => {
    const msg = messageMap.get(messageId)
    if (msg) return String(msg.subject ?? "(Không tiêu đề)")
    return null
  }

  const getMessageFromEmail = (messageId: string) => {
    const msg = messageMap.get(messageId)
    if (msg) return String(msg.fromEmail ?? "—")
    return "—"
  }

  const getMessageReceivedAt = (messageId: string) => {
    const msg = messageMap.get(messageId)
    const val = msg?.receivedAt ?? msg?.sentAt ?? msg?.createdAt
    if (val) return dayjs(String(val)).format("DD/MM/YYYY HH:mm")
    return null
  }

  const openAssignModal = (messageId: string) => {
    setSelectedMessageId(messageId)
    setSelectedUserId("")
    const existing = allAssignments.get(messageId)
    setCurrentAssignedUserId(existing ? String(existing.assignedToUserId ?? "") : null)
    setAssignModalOpen(true)
  }

  const openDetailModal = (messageId: string) => {
    setSelectedMessageId(messageId)
    setDetailModalOpen(true)
  }

  const handleAssign = async () => {
    if (!selectedMessageId || !selectedUserId) return

    try {
      // Nếu mail đã gán cho người khác → unassign trước rồi assign mới
      if (currentAssignedUserId) {
        await unassignMutation.mutateAsync({
          messageId: selectedMessageId,
          payload: { userId: currentAssignedUserId },
        })
      }

      assignMutation.mutate(
        {
          messageId: selectedMessageId,
          payload: { toUserId: selectedUserId },
        },
        {
          onSuccess: () => {
            toast.success(currentAssignedUserId ? "Đã chuyển giao mail." : "Đã gán mail cho người dùng.")
            setAssignModalOpen(false)
            setSelectedMessageId(null)
            setSelectedUserId("")
            setCurrentAssignedUserId(null)
          },
          onError: (err: unknown) => {
            toast.error((currentAssignedUserId ? "Chuyển giao" : "Gán mail") + " thất bại: " + String(err))
          },
        }
      )
    } catch (err) {
      toast.error("Hủy gán cũ thất bại: " + String(err))
    }
  }

  const tabData = activeTab === "unassigned" ? unassignedMessages : assignments
  const tabTotalPages = Math.max(1, Math.ceil(tabData.length / pageSize))
  const tabPaged = tabData.slice((page - 1) * pageSize, page * pageSize)
  const tabTotalItems = tabData.length

  const isLoading = activeTab === "unassigned"
    ? allMessagesQuery.isPending
    : assignmentsQuery.isPending

  const hasData = tabPaged.length > 0

  const currentData = tabPaged

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý Phân công</h1>
      </div>

      <div className="flex gap-1 rounded-lg border border-neutral-100 bg-white p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-primary text-white"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-primary">
              <tr>
                {activeTab === "unassigned" ? (
                  <>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Tiêu đề</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Người gửi</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Thời gian nhận</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái xử lý</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Đang giao</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80"></th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Tiêu đề</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Người gửi</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Người được giao</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-medium text-white/80">Thời gian</th>
                    <th className="px-4 py-3 text-right font-medium text-white/80"></th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải...</p>
                  </td>
                </tr>
              )}
              {!isLoading && !hasData && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    Không có bản ghi nào.
                  </td>
                </tr>
              )}
              {activeTab === "unassigned" && tabPaged.map((m) => {
                const messageId = String(m.id ?? "")
                return (
                  <tr key={messageId} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-neutral-300" />
                        <span className="max-w-[200px] truncate font-medium text-neutral-300">
                          {String(m.subject ?? "(Không tiêu đề)")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">{String(m.fromEmail ?? "—")}</td>
                    <td className="px-4 py-3 text-neutral-200 text-xs">
                      {m.receivedAt
                        ? dayjs(String(m.receivedAt)).format("DD/MM/YYYY HH:mm")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        m.processStatus === "completed"
                          ? "bg-green-50 text-green-700"
                          : m.processStatus === "processing"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {String(m.processStatus ?? "pending")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-200">—</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetailModal(messageId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          Xem
                        </button>
                        <button
                          onClick={() => openAssignModal(messageId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <Send className="h-3 w-3" />
                          Gán
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {activeTab !== "unassigned" && tabPaged.map((a) => {
                const messageId = String(a.mailConnectorMessageId ?? "")
                const userId = String(a.assignedToUserId ?? "")
                const status = String(a.status ?? "")
                const subject = getMessageSubject(messageId) ?? messageId.slice(0, 12) + "..."
                const fromEmail = getMessageFromEmail(messageId)
                const receivedAt = getMessageReceivedAt(messageId)
                const assignedUserName = String(a.assignedToUserName ?? a.assignedToUserEmail ?? userId.slice(0, 8))
                const assignedAt = a.assignedAt
                  ? dayjs(String(a.assignedAt)).format("DD/MM/YYYY HH:mm")
                  : "—"
                const completedAt = a.completedAt
                  ? dayjs(String(a.completedAt)).format("DD/MM/YYYY HH:mm")
                  : null

                return (
                  <tr key={messageId + userId} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-neutral-300" />
                        <span className="max-w-[200px] truncate font-medium text-neutral-300">
                          {subject}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">{fromEmail}</td>
                    <td className="px-4 py-3 text-neutral-300">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-neutral-300" />
                        {assignedUserName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        status === "completed"
                          ? "bg-green-50 text-green-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {status === "completed" ? "Hoàn thành" : "Đang xử lý"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-200 text-xs">
                      <div className="space-y-0.5">
                        {receivedAt && <div>Nhận: {receivedAt}</div>}
                        <div>Gán: {assignedAt}</div>
                        {completedAt && <div>Hoàn tất: {completedAt}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openAssignModal(messageId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 cursor-pointer"
                        >
                          <Send className="h-3 w-3" />
                          Chuyển
                        </button>
                        <button
                          onClick={() => openDetailModal(messageId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          Xem
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {tabTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
            <p className="text-xs text-neutral-200">
              Trang {page} / {tabTotalPages} ({tabTotalItems} bản ghi)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(tabTotalPages, p + 1))}
                disabled={page >= tabTotalPages}
                className="rounded-lg border border-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-black">
              {selectedMessageId && assignedMessageIds.has(selectedMessageId) ? "Chuyển giao mail" : "Gán mail cho người dùng"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-neutral-300">
              {selectedMessageId && assignedMessageIds.has(selectedMessageId)
                ? "Chọn người dùng khác để chuyển giao email này."
                : "Chọn người dùng để xử lý email này."}
            </p>
            {currentAssignedUserId && (
              <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <span className="font-medium">Đang gán cho:</span>{" "}
                {(() => {
                  const u = users.find((user) => String(user.id ?? "") === currentAssignedUserId)
                  return u ? String(u.fullName ?? u.email ?? currentAssignedUserId) : currentAssignedUserId
                })()}
              </div>
            )}
            <div className="max-h-[300px] space-y-1 overflow-y-auto rounded-lg border border-neutral-100 p-2">
              {usersQuery.isPending && (
                <p className="text-sm text-neutral-200">Đang tải danh sách...</p>
              )}
              {users.map((u) => {
                const uid = String(u.id ?? "")
                const isCurrentAssignee = uid === currentAssignedUserId
                return (
                  <button
                    key={uid}
                    onClick={() => !isCurrentAssignee && setSelectedUserId(uid)}
                    disabled={isCurrentAssignee}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      isCurrentAssignee
                        ? "cursor-not-allowed opacity-40"
                        : selectedUserId === uid
                        ? "bg-primary-50 text-primary cursor-pointer"
                        : "text-neutral-300 hover:bg-neutral-50 cursor-pointer"
                    }`}
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      selectedUserId === uid
                        ? "border-primary bg-primary"
                        : "border-neutral-300"
                    }`}>
                      {selectedUserId === uid && (
                        <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{String(u.fullName ?? u.email ?? "—")}</p>
                      <p className="text-xs text-neutral-200">{String(u.email ?? "")}</p>
                    </div>
                    {isCurrentAssignee && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        Đang gán
                      </span>
                    )}
                  </button>
                )
              })}
              {!usersQuery.isPending && users.length === 0 && (
                <p className="text-sm text-neutral-200">Không có người dùng nào.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!selectedUserId || assignMutation.isPending || unassignMutation.isPending}
              >
                {assignMutation.isPending || unassignMutation.isPending ? "..." : "Xác nhận gán"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Thông tin phân công
            </DialogTitle>
            <DialogDescription className="text-neutral-500">
              Chi tiết email, file đính kèm và trạng thái xử lý
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {detailMessageQuery.isPending && (
              <div className="flex items-center gap-2 py-4 text-sm text-neutral-400">
                <Loader className="h-4 w-4 animate-spin" /> Đang tải nội dung mail...
              </div>
            )}

            {(() => {
              const msgData = detailMessageQuery.data as Record<string, unknown> | undefined
              const a = [...assignments, ...allAssigned].find(
                (item) => String(item.mailConnectorMessageId ?? "") === selectedMessageId
              )
              const msgId = selectedMessageId ?? ""
              const subject = getMessageSubject(msgId) ?? msgId
              const fromName = msgData ? String(msgData.fromName ?? "—") : getMessageFromEmail(msgId)
              const fromEmail = msgData ? String(msgData.fromEmail ?? "—") : getMessageFromEmail(msgId)
              const receivedAt = msgData?.receivedAt
                ? dayjs(String(msgData.receivedAt)).format("DD/MM/YYYY HH:mm")
                : getMessageReceivedAt(msgId) ?? "—"
              const body = msgData?.bodyText ?? msgData?.body ?? msgData?.htmlBody ?? ""
              const attachments = msgData?.attachments as Array<Record<string, unknown>> | undefined

              const assignedUserName = a ? String(a.assignedToUserName ?? a.assignedToUserEmail ?? "—") : "—"
              const assignedAt = a?.assignedAt
                ? dayjs(String(a.assignedAt)).format("DD/MM/YYYY HH:mm")
                : null
              const completedAt = a?.completedAt
                ? dayjs(String(a.completedAt)).format("DD/MM/YYYY HH:mm")
                : null
              const confirmedAt = a?.confirmedAt
                ? dayjs(String(a.confirmedAt)).format("DD/MM/YYYY HH:mm")
                : null
              const status = a ? String(a.status ?? "Chưa gán") : "Chưa gán"
              const notes = a?.notes ? String(a.notes) : null

              const statusMap: Record<string, { label: string; className: string }> = {
                unassigned: { label: "Chưa gán", className: "bg-neutral-100 text-neutral-600" },
                assigned: { label: "Đã gán", className: "bg-blue-50 text-blue-700" },
                confirmed: { label: "Đã xác nhận", className: "bg-amber-50 text-amber-700" },
                needSupplement: { label: "Cần bổ sung", className: "bg-red-50 text-red-700" },
                extracted: { label: "Đã bóc tách", className: "bg-purple-50 text-purple-700" },
                completed: { label: "Hoàn thành", className: "bg-green-50 text-green-700" },
                exported: { label: "Đã xuất", className: "bg-neutral-100 text-neutral-600" },
              }
              const normalizedStatus = status.toLowerCase()
              const statusInfo = statusMap[normalizedStatus] ?? { label: status, className: "bg-neutral-100 text-neutral-600" }

              return (
                <div className="space-y-4">
                  {/* Mail Info */}
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3 space-y-2">
                    <div>
                      <span className="text-xs text-neutral-400">Tiêu đề</span>
                      <p className="text-sm font-medium text-neutral-800">{subject}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-neutral-400">Người gửi</span>
                        <p className="text-sm text-neutral-700">{fromName} &lt;{fromEmail}&gt;</p>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-400">Nhận lúc</span>
                        <p className="text-sm text-neutral-700">{receivedAt}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Status */}
                  <div className="rounded-lg border border-neutral-100 bg-white p-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Trạng thái phân công</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      {assignedAt && <span className="text-xs text-neutral-400">Gán: {assignedAt}</span>}
                      {confirmedAt && <span className="text-xs text-neutral-400">Xác nhận: {confirmedAt}</span>}
                      {completedAt && <span className="text-xs text-green-600">Hoàn tất: {completedAt}</span>}
                    </div>
                    {notes && (
                      <div>
                        <span className="text-xs text-neutral-400">Ghi chú</span>
                        <p className="text-sm text-neutral-700">{notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  {attachments && attachments.length > 0 && (
                    <div className="rounded-lg border border-neutral-100 bg-white p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        File đính kèm ({attachments.length})
                      </p>
                      <div className="space-y-1">
                        {attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center gap-2 rounded-md bg-neutral-50 px-2 py-1.5 text-xs">
                            <Paperclip className="h-3 w-3 text-neutral-400" />
                            <span className="flex-1 truncate text-neutral-700">
                              {String(att.fileName ?? att.name ?? `attachment-${idx + 1}`)}
                            </span>
                            <span className="text-neutral-400">
                              {att.fileSize ? `${Math.round(Number(att.fileSize) / 1024)} KB` : ""}
                            </span>
                            <span className="text-neutral-400">
                              {String(att.contentType ?? att.mimeType ?? "")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Body */}
                  {body && (
                    <div className="rounded-lg border border-neutral-100 bg-white p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Nội dung mail</p>
                      <div className="max-h-[300px] overflow-y-auto rounded-md bg-neutral-50 p-2 text-xs text-neutral-700 whitespace-pre-wrap">
                        {String(body)}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

```

---

## File: `app\(app)\admin\logs\page.tsx`

```tsx
"use client"
// ADMIN ROUTE: Xem logs và lỗi hệ thống — chỉ admin

import { useState } from "react"
import { AlertTriangle, Info, XCircle, Filter } from "lucide-react"
import dayjs from "dayjs"

const allLogs = [
  { id: "1", level: "error" as const, source: "sync", message: "Gmail sync failed: rate limit exceeded", details: "Account: logistics@company.com", createdAt: "2026-05-22T10:30:00Z" },
  { id: "2", level: "warning" as const, source: "ai", message: "AI extraction confidence low (45%)", details: "Email ID: 550e8400-e29b", createdAt: "2026-05-22T09:15:00Z" },
  { id: "3", level: "info" as const, source: "import", message: "Successfully imported 25 records", details: "File: report_may.xlsx", createdAt: "2026-05-21T16:00:00Z" },
  { id: "4", level: "error" as const, source: "import", message: "Import failed: invalid row 12", details: "Missing required field 'amount'", createdAt: "2026-05-21T15:45:00Z" },
]

export default function LogsPage() {
  const [filterLevel, setFilterLevel] = useState<string>("all")

  const filtered = filterLevel === "all" ? allLogs : allLogs.filter((l) => l.level === filterLevel)

  const levelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const levelBadge = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-700"
      case "warning":
        return "bg-amber-100 text-amber-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Logs & Lỗi</h1>
        <div id="tour-logs-filter" className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-500" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-blue-50/50 focus:bg-white transition-colors"
          >
            <option value="all">Tất cả</option>
            <option value="error">Lỗi</option>
            <option value="warning">Cảnh báo</option>
            <option value="info">Thông tin</option>
          </select>
        </div>
      </div>

      <div id="tour-logs-table" className="rounded-xl border border-blue-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Level</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Nguồn</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Thông báo</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Chi tiết</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {levelIcon(log.level)}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelBadge(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-blue-700 font-medium">{log.source}</td>
                <td className="px-4 py-3 text-blue-900">{log.message}</td>
                <td className="px-4 py-3 text-blue-600 text-xs">{log.details}</td>
                <td className="px-4 py-3 text-blue-600 whitespace-nowrap">
                  {dayjs(log.createdAt).format("DD/MM/YYYY HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\admin\page.tsx`

```tsx
"use client"
// ADMIN ROUTE: Admin dashboard tổng — chỉ admin

import Link from "next/link"
import {
  Users,
  Settings,
  FileText,
  Shield,
  TrendingUp,
  AlertTriangle,
  Activity,
  FileCode,
  ClipboardCheck,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const adminCards = [
  {
    href: "/admin/users",
    title: "Quản lý tài khoản",
    description: "Thêm, sửa, xóa tài khoản người dùng và phân quyền",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary-50",
    count: "3 tài khoản",
  },
  {
    href: "/admin/permissions",
    title: "Quyền hạn",
    description: "Quản lý danh sách quyền hạn (permissions) theo module",
    icon: Shield,
    color: "text-purple-600",
    bg: "bg-purple-50",
    count: "Permission CRUD",
  },
  {
    href: "/admin/roles",
    title: "Vai trò",
    description: "Quản lý vai trò (roles) và gán quyền",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    count: "Role CRUD",
  },
  {
    href: "/admin/assignments",
    title: "Phân công",
    description: "Quản lý phân công xử lý email cho nhân viên",
    icon: ClipboardCheck,
    color: "text-teal-600",
    bg: "bg-teal-50",
    count: "Assignments",
  },
  {
    href: "/admin/settings",
    title: "Cấu hình hệ thống",
    description: "Cài đặt đồng bộ email, AI extraction, thông báo",
    icon: Settings,
    color: "text-green-600",
    bg: "bg-green-50",
    count: "12 cấu hình",
  },
  {
    href: "/admin/logs",
    title: "Logs & lỗi",
    description: "Nhật ký hoạt động, lỗi và cảnh báo hệ thống",
    icon: FileText,
    color: "text-amber-600",
    bg: "bg-amber-50",
    count: "4 bản ghi",
  },
  {
    href: "/admin/ai-usage",
    title: "AI Usage",
    description: "Theo dõi chi phí và token sử dụng AI theo user và thời gian",
    icon: TrendingUp,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    count: "Analytics",
  },
  {
    href: "/admin/templates",
    title: "Template email",
    description: "Quản lý mẫu bóc tách email, expected fields và điều kiện nhận diện",
    icon: FileCode,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    count: "Template CRUD",
  },
]

const systemStats = [
  { label: "Tổng người dùng", value: "3", icon: Users, color: "text-primary", bg: "bg-primary-50" },
  { label: "Admin", value: "1", icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Nhân viên", value: "2", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
  { label: "Cảnh báo", value: "2", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-300">Admin tổng</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {systemStats.map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">{stat.label}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-300">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full cursor-pointer border-neutral-100 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    <CardDescription className="text-xs">{card.count}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-200">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Hoạt động gần đây
          </CardTitle>
          <CardDescription>Các thao tác quản trị mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Tạo tài khoản", target: "staff2@company.com", time: "20/04/2026", user: "Admin" },
              { action: "Cập nhật cấu hình", target: "Gmail sync", time: "19/04/2026", user: "Admin" },
              { action: "Đăng nhập hệ thống", target: "—", time: "22/05/2026 10:30", user: "Admin" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium text-neutral-300">{item.action}</p>
                    <p className="text-xs text-neutral-200">{item.target}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-200">{item.time}</p>
                  <p className="text-xs text-neutral-200">{item.user}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

```

---

## File: `app\(app)\admin\permissions\page.tsx`

```tsx
"use client"
// ADMIN ROUTE: Quản lý quyền hạn (permissions) — chỉ admin

import { useState } from "react"
import { Loader, Pencil, Plus, Shield, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  usePermissionsQuery,
  usePermissionModulesQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from "@/hooks/use-permissions-queries"

export default function AdminPermissionsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [formCode, setFormCode] = useState("")
  const [formName, setFormName] = useState("")
  const [formModule, setFormModule] = useState("")
  const [formDescription, setFormDescription] = useState("")

  const permissionsQuery = usePermissionsQuery()
  const modulesQuery = usePermissionModulesQuery()
  const createMutation = useCreatePermissionMutation()
  const updateMutation = useUpdatePermissionMutation()
  const deleteMutation = useDeletePermissionMutation()

  const permissions = Array.isArray(permissionsQuery.data)
    ? permissionsQuery.data
    : permissionsQuery.data?.data ?? []

  const modules = Array.isArray(modulesQuery.data)
    ? modulesQuery.data
    : modulesQuery.data?.data ?? []

  const openCreate = () => {
    setModalMode("create")
    setSelectedId(null)
    setFormCode("")
    setFormName("")
    setFormModule("")
    setFormDescription("")
    setModalOpen(true)
  }

  const openEdit = (item: unknown) => {
    const p = item as Record<string, unknown>
    setModalMode("edit")
    setSelectedId((p.id as string) ?? null)
    setFormCode((p.code as string) ?? "")
    setFormName((p.name as string) ?? "")
    setFormModule((p.module as string) ?? "")
    setFormDescription((p.description as string) ?? "")
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({ code: formCode, name: formName, module: formModule, description: formDescription })
        toast.success("Tạo quyền thành công.")
      } else if (selectedId) {
        await updateMutation.mutateAsync({ id: selectedId, payload: { name: formName, description: formDescription, module: formModule } })
        toast.success("Cập nhật quyền thành công.")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Thao tác thất bại."))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa quyền này?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Đã xóa quyền.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Xóa thất bại."))
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý Quyền hạn</h1>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" /> Tạo quyền
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Tìm theo tên hoặc code..." className="w-64" />
      </div>

      {modules.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {modules.map((m: unknown) => (
            <Badge key={String(m)} variant="outline" className="bg-white">
              {String(m)}
            </Badge>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Code</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Tên</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Module</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Mô tả</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {permissionsQuery.isPending && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải...</p>
                  </td>
                </tr>
              )}
              {!permissionsQuery.isPending && permissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    Không có quyền nào.
                  </td>
                </tr>
              )}
              {permissions.map((item: unknown) => {
                const p = item as Record<string, unknown>
                return (
                  <tr key={String(p.id ?? p.code)} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-300">{String(p.code ?? "—")}</td>
                    <td className="px-4 py-3 text-neutral-300">{String(p.name ?? "—")}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {String(p.module ?? "—")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">{String(p.description ?? "—")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(String(p.id))}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black">
              {modalMode === "create" ? "Tạo quyền mới" : "Cập nhật quyền"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-neutral-300">Code</Label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                disabled={modalMode === "edit"}
                placeholder="users:create"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300">Tên</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Tạo tài khoản"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300">Module</Label>
              <Input
                value={formModule}
                onChange={(e) => setFormModule(e.target.value)}
                placeholder="users"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300">Mô tả</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Cho phép tạo tài khoản mới"
                className="text-neutral-300"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isMutating}>
                {isMutating ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                {modalMode === "create" ? "Tạo" : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

```

---

## File: `app\(app)\admin\roles\page.tsx`

```tsx
"use client"
// ADMIN ROUTE: Quản lý vai trò (roles) và phân quyền — chỉ admin

import { useState, useEffect } from "react"
import { Loader, Pencil, Plus, Shield, Trash2, Check, X } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useRolesQuery,
  useRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from "@/hooks/use-roles-queries"
import {
  usePermissionsQuery,
} from "@/hooks/use-permissions-queries"

export default function AdminRolesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [formCode, setFormCode] = useState("")
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")

  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<string | null>(null)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])

  const rolesQuery = useRolesQuery()
  const createMutation = useCreateRoleMutation()
  const updateMutation = useUpdateRoleMutation()
  const deleteMutation = useDeleteRoleMutation()

  const permissionsQuery = usePermissionsQuery()
  const rolePermissionsQuery = useRolePermissionsQuery(selectedRoleForPermissions)
  const updateRolePermissionsMutation = useUpdateRolePermissionsMutation()

  const roles = Array.isArray(rolesQuery.data)
    ? rolesQuery.data
    : rolesQuery.data?.data ?? []

  const allPermissions = Array.isArray(permissionsQuery.data)
    ? permissionsQuery.data
    : permissionsQuery.data?.data ?? []

  const currentRolePermissions = Array.isArray(rolePermissionsQuery.data)
    ? rolePermissionsQuery.data
    : rolePermissionsQuery.data?.data ?? []

  const openCreate = () => {
    setModalMode("create")
    setSelectedId(null)
    setFormCode("")
    setFormName("")
    setFormDescription("")
    setModalOpen(true)
  }

  const openEdit = (item: unknown) => {
    const r = item as Record<string, unknown>
    setModalMode("edit")
    setSelectedId((r.id as string) ?? null)
    setFormCode((r.code as string) ?? "")
    setFormName((r.name as string) ?? "")
    setFormDescription((r.description as string) ?? "")
    setModalOpen(true)
  }

  const openPermissions = (roleId: string) => {
    setSelectedRoleForPermissions(roleId)
    setSelectedPermissionIds([])
    setPermissionsModalOpen(true)
  }

  useEffect(() => {
    if (rolePermissionsQuery.data && selectedRoleForPermissions) {
      const raw = rolePermissionsQuery.data
      let perms: unknown[] = []
      if (Array.isArray(raw)) {
        perms = raw
      } else if (raw && typeof raw === "object") {
        const d = raw as Record<string, unknown>
        if (Array.isArray(d.data)) perms = d.data
      }
      const currentIds = perms
        .map((p: unknown) => (p as Record<string, unknown>).id as string)
        .filter(Boolean)
      setSelectedPermissionIds(currentIds)
    }
  }, [rolePermissionsQuery.data, selectedRoleForPermissions])

  const handleSave = async () => {
    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({ code: formCode, name: formName, description: formDescription })
        toast.success("Tạo vai trò thành công.")
      } else if (selectedId) {
        await updateMutation.mutateAsync({ id: selectedId, payload: { name: formName, description: formDescription } })
        toast.success("Cập nhật vai trò thành công.")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Thao tác thất bại."))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa vai trò này?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Đã xóa vai trò.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Xóa thất bại."))
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedRoleForPermissions) return
    try {
      await updateRolePermissionsMutation.mutateAsync({
        id: selectedRoleForPermissions,
        payload: { permissionIds: selectedPermissionIds },
      })
      toast.success("Cập nhật quyền cho vai trò thành công.")
      setPermissionsModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật quyền thất bại."))
    }
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý Vai trò</h1>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" /> Tạo vai trò
        </button>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Code</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Tên</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Mô tả</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Quyền</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {rolesQuery.isPending && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải...</p>
                  </td>
                </tr>
              )}
              {!rolesQuery.isPending && roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    Không có vai trò nào.
                  </td>
                </tr>
              )}
              {roles.map((item: unknown) => {
                const r = item as Record<string, unknown>
                return (
                  <tr key={String(r.id ?? r.code)} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-300">{String(r.code ?? "—")}</td>
                    <td className="px-4 py-3 text-neutral-300">{String(r.name ?? "—")}</td>
                    <td className="px-4 py-3 text-neutral-200">{String(r.description ?? "—")}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[10px]">
                          Click icon Shield để gán quyền
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openPermissions(String(r.id))}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(String(r.id))}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Role Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black">
              {modalMode === "create" ? "Tạo vai trò mới" : "Cập nhật vai trò"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-neutral-300">Code</Label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                disabled={modalMode === "edit"}
                placeholder="admin"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300">Tên</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Quản trị viên"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300">Mô tả</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Toàn quyền quản trị hệ thống"
                className="text-neutral-300"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isMutating}>
                {isMutating ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                {modalMode === "create" ? "Tạo" : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Assignment Modal */}
      <Dialog open={permissionsModalOpen} onOpenChange={setPermissionsModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">Gán quyền cho vai trò</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {allPermissions.map((item: unknown) => {
              const p = item as Record<string, unknown>
              const pid = String(p.id)
              const checked = selectedPermissionIds.includes(pid)
              return (
                <div
                  key={pid}
                  onClick={() => togglePermission(pid)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    checked ? "border-primary bg-primary-50" : "border-neutral-100 hover:bg-neutral-50"
                  }`}
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                    checked ? "border-primary bg-primary text-white" : "border-neutral-300"
                  }`}>
                    {checked && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-300">{String(p.name)}</p>
                    <p className="text-xs text-neutral-200">{String(p.code)} · {String(p.module)}</p>
                  </div>
                </div>
              )
            })}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPermissionsModalOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleSavePermissions}
                disabled={updateRolePermissionsMutation.isPending}
              >
                {updateRolePermissionsMutation.isPending ? (
                  <Loader className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                Lưu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

```

---

## File: `app\(app)\admin\settings\page.tsx`

```tsx
"use client"
// ADMIN ROUTE: Cấu hình hệ thống (Gmail sync, AI prompt, thông báo) — chỉ admin

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Cpu,
  Mail,
  RefreshCw,
  Users,
} from "lucide-react"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAiOpenaiUsageUsersCurrentMonthQuery,
  useAiOpenaiUsageUsersQuery,
  useMailAccountsQuery,
  useOAuthUrlMutation,
  useSyncStatusQuery,
  useTriggerSyncDirectMutation,
  useTriggerSyncMutation,
} from "@/hooks/use-mail-queries"

type UsageRecord = Record<string, unknown>
type UsageSummary = {
  totalRequests: number
  totalTokens: number
  totalCost: number
  activeUsers: number
}

const numberOf = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const readNumber = (record: UsageRecord, keys: string[]) => {
  for (const key of keys) {
    if (key in record) return numberOf(record[key])
  }
  return 0
}

const getUsageItems = (value: unknown): UsageRecord[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === "object") as UsageRecord[]
  }
  if (!value || typeof value !== "object") return []

  const record = value as UsageRecord
  const nestedCandidates = [record.items, record.data, record.results, record.users]

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item) => item && typeof item === "object") as UsageRecord[]
    }
  }

  return [record]
}

const buildUsageSummary = (value: unknown): UsageSummary => {
  const items = getUsageItems(value)
  if (items.length === 0) {
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      activeUsers: 0,
    }
  }

  const first = items[0]
  const directTotalRequests = readNumber(first, [
    "totalRequests",
    "totalCalls",
    "requestCount",
    "totalRequestCount",
  ])
  const directTotalTokens = readNumber(first, [
    "totalTokens",
    "tokenCount",
    "totalTokenCount",
  ])
  const directTotalCost = readNumber(first, [
    "totalCost",
    "costEstimate",
    "cost",
    "amount",
  ])
  const directActiveUsers = readNumber(first, [
    "activeUsers",
    "userCount",
    "totalUsers",
  ])

  if (
    items.length === 1 &&
    (directTotalRequests > 0 ||
      directTotalTokens > 0 ||
      directTotalCost > 0 ||
      directActiveUsers > 0)
  ) {
    return {
      totalRequests: directTotalRequests,
      totalTokens: directTotalTokens,
      totalCost: directTotalCost,
      activeUsers: directActiveUsers,
    }
  }

  const userIds = new Set<string>()
  const summary = items.reduce<Pick<UsageSummary, "totalRequests" | "totalTokens" | "totalCost">>(
    (accumulator, item) => {
      const inputTokens = readNumber(item, ["inputTokenCount", "inputTokens"])
      const outputTokens = readNumber(item, ["outputTokenCount", "outputTokens"])
      const tokens =
        readNumber(item, ["totalTokens", "tokenCount", "totalTokenCount"]) ||
        inputTokens + outputTokens
      accumulator.totalRequests += readNumber(item, [
        "totalRequests",
        "requestCount",
        "calls",
        "totalCalls",
      ])
      accumulator.totalTokens += tokens
      accumulator.totalCost += readNumber(item, [
        "totalCost",
        "costEstimate",
        "cost",
        "amount",
      ])

      const userIdValue =
        item.userId ?? item.id ?? item.accountId ?? item.email ?? item.userEmail ?? item.username
      if (typeof userIdValue === "string" && userIdValue.trim()) {
        userIds.add(userIdValue)
      }

      return accumulator
    },
    { totalRequests: 0, totalTokens: 0, totalCost: 0 }
  )

  return {
    ...summary,
    activeUsers: userIds.size,
  }
}

function SettingsContent() {
  const [aiPrompt, setAiPrompt] = useState(
    "Extract invoice details: invoice number, amount, currency, due date, sender"
  )
  const [saved, setSaved] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const {
    data: accounts = [],
    isPending: loadingAccounts,
    error: accountsError,
  } = useMailAccountsQuery()
  const oauthMutation = useOAuthUrlMutation()
  const activeAccount = useMemo(() => accounts[0] ?? null, [accounts])
  const syncStatusQuery = useSyncStatusQuery(activeAccount?.id ?? null)
  const triggerSyncMutation = useTriggerSyncMutation(activeAccount?.id ?? null)
  const triggerSyncDirectMutation = useTriggerSyncDirectMutation(activeAccount?.id ?? null)
  const aiUsersCurrentMonthQuery = useAiOpenaiUsageUsersCurrentMonthQuery()
  const aiUsersQuery = useAiOpenaiUsageUsersQuery()

  const syncStatus = syncStatusQuery.data?.status
  const currentlySyncing =
    String(syncStatus || "").toLowerCase() === "syncing" ||
    triggerSyncMutation.isPending ||
    triggerSyncDirectMutation.isPending

  const monthUsageSummary = useMemo(
    () => buildUsageSummary(aiUsersCurrentMonthQuery.data),
    [aiUsersCurrentMonthQuery.data]
  )
  const totalUsageSummary = useMemo(
    () => buildUsageSummary(aiUsersQuery.data),
    [aiUsersQuery.data]
  )

  const handleConnectGmail = async () => {
    try {
      setActionError(null)
      setActionMessage(null)

      const redirectUri = `${window.location.origin}/mail-auth/callback`
      const state =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `mail-${Date.now()}`

      sessionStorage.setItem("mail_oauth_state", state)
      const response = await oauthMutation.mutateAsync({ redirectUri, state })

      if (!response?.authUrl) {
        throw new Error("Không lấy được đường dẫn OAuth.")
      }

      window.location.href = response.authUrl
    } catch (error) {
      setActionError(getErrorMessage(error, "Kết nối Gmail thất bại."))
    }
  }

  const handleSync = async () => {
    try {
      setActionError(null)
      setActionMessage(null)
      await triggerSyncMutation.mutateAsync()
      setActionMessage("Đã gửi yêu cầu đồng bộ. Hệ thống đang cập nhật trạng thái.")
    } catch (error) {
      setActionError(getErrorMessage(error, "Không thể bắt đầu đồng bộ email."))
    }
  }

  const handleSyncDirect = async () => {
    try {
      setActionError(null)
      setActionMessage(null)
      await triggerSyncDirectMutation.mutateAsync()
      setActionMessage("Đã chạy đồng bộ trực tiếp thành công.")
    } catch (error) {
      setActionError(getErrorMessage(error, "Không thể chạy đồng bộ trực tiếp."))
    }
  }

  const handleSavePrompt = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Cấu hình Hệ thống</h1>

      <div
        id="tour-settings-gmail"
        className="rounded-xl border border-blue-200 bg-white p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">Tài khoản Gmail</h2>
        </div>

        {searchParams.get("connected") === "1" && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" /> Kết nối Gmail thành công.
          </div>
        )}

        {accountsError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {getErrorMessage(accountsError, "Không tải được danh sách tài khoản.")}
          </div>
        )}

        {actionError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" /> {actionError}
          </div>
        )}

        {actionMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" /> {actionMessage}
          </div>
        )}

        {loadingAccounts ? (
          <p className="text-sm text-blue-700">Đang tải tài khoản...</p>
        ) : activeAccount ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" /> Đã kết nối: {activeAccount.emailAddress}
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 text-sm text-blue-700">
              <p className="font-medium">Trạng thái đồng bộ: {syncStatus || "idle"}</p>
              <p className="mt-1 text-xs text-blue-600">
                Đã đồng bộ: {syncStatusQuery.data?.syncedMessages ?? 0} /{" "}
                {syncStatusQuery.data?.totalMessages ?? 0}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSync}
                disabled={currentlySyncing}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", currentlySyncing && "animate-spin")} />
                {currentlySyncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
              </button>
              <button
                onClick={handleSyncDirect}
                disabled={currentlySyncing}
                className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={cn("h-4 w-4", triggerSyncDirectMutation.isPending && "animate-spin")}
                />
                {triggerSyncDirectMutation.isPending ? "Đang sync direct..." : "Sync direct"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnectGmail}
            disabled={oauthMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {oauthMutation.isPending ? "Đang tạo link OAuth..." : "Kết nối tài khoản Gmail"}
          </button>
        )}
      </div>

      <div
        id="tour-settings-ai"
        className="rounded-xl border border-blue-200 bg-white p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-blue-900">AI / Rule Engine</h2>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-blue-700">
            Prompt bóc tách mặc định
          </label>
          <textarea
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-blue-50/50 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-blue-700">
            Pattern lọc tiêu đề (Regex)
          </label>
          <input
            type="text"
            defaultValue="(invoice|shipping|logistics|freight|cargo)"
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-blue-50/50 focus:bg-white transition-colors"
          />
          <p className="mt-1 text-xs text-blue-500">
            Chỉ xử lý email có tiêu đề khớp với pattern này
          </p>
        </div>

        <button
          onClick={handleSavePrompt}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {saved ? <CheckCircle className="h-4 w-4" /> : "Lưu cấu hình"}
          {saved && " Đã lưu"}
        </button>

        <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-blue-900">OpenAI Usage</p>
          </div>

          {(aiUsersCurrentMonthQuery.isPending || aiUsersQuery.isPending) && (
            <p className="text-sm text-blue-700">Đang tải usage...</p>
          )}

          {(aiUsersCurrentMonthQuery.error || aiUsersQuery.error) && (
            <p className="text-sm text-red-700">
              {getErrorMessage(
                aiUsersCurrentMonthQuery.error || aiUsersQuery.error,
                "Không tải được OpenAI usage."
              )}
            </p>
          )}

          {!aiUsersCurrentMonthQuery.isPending &&
            !aiUsersQuery.isPending &&
            !aiUsersCurrentMonthQuery.error &&
            !aiUsersQuery.error && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-blue-100 bg-white p-3">
                  <p className="text-xs text-blue-600">Requests tháng này</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {monthUsageSummary.totalRequests.toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-white p-3">
                  <p className="text-xs text-blue-600">Tokens tháng này</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {monthUsageSummary.totalTokens.toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-white p-3">
                  <p className="text-xs text-blue-600">Cost tháng này (USD)</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {monthUsageSummary.totalCost.toLocaleString("en-US", {
                      maximumFractionDigits: 4,
                    })}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-white p-3">
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Users className="h-3 w-3" />
                    User có usage (all-time)
                  </div>
                  <p className="text-lg font-semibold text-blue-900">
                    {totalUsageSummary.activeUsers.toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-blue-700">Đang tải...</div>}>
      <SettingsContent />
    </Suspense>
  )
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

```

---

## File: `app\(app)\admin\templates\page.tsx`

```tsx
"use client"
// ADMIN ROUTE: Quản lý template nhận diện và bóc tách email — chỉ admin

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { toast } from "sonner"
import {
  useCreateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
  useEmailTemplatesQuery,
  useUpdateEmailTemplateMutation,
} from "@/hooks/use-mail-queries"

type TemplateFormState = {
  templateCode: string
  templateName: string
  description: string
  subjectPattern: string
  bodyPattern: string
  expectedFieldsJson: string
  documentTypesCsv: string
  isActive: boolean
}

type TemplateItem = {
  id?: string | null
  templateCode?: string | null
  templateName?: string | null
  description?: string | null
  subjectPattern?: string | null
  bodyPattern?: string | null
  expectedFields?: Record<string, string> | null
  documentTypes?: string[] | null
  isActive?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}

const emptyForm: TemplateFormState = {
  templateCode: "",
  templateName: "",
  description: "",
  subjectPattern: "",
  bodyPattern: "",
  expectedFieldsJson: "{}",
  documentTypesCsv: "",
  isActive: true,
}

export default function AdminTemplatesPage() {
  const templatesQuery = useEmailTemplatesQuery()
  const createTemplateMutation = useCreateEmailTemplateMutation()
  const deleteTemplateMutation = useDeleteEmailTemplateMutation()

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [formState, setFormState] = useState<TemplateFormState>(emptyForm)
  const [message, setMessage] = useState<string | null>(null)
  const updateTemplateMutation = useUpdateEmailTemplateMutation(editingTemplateId)

  const templates: TemplateItem[] = (templatesQuery.data ?? []) as TemplateItem[]
  const isSaving = createTemplateMutation.isPending || updateTemplateMutation.isPending

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort((first, second) => {
        const firstTime = new Date(first.updatedAt ?? first.createdAt ?? 0).getTime()
        const secondTime = new Date(second.updatedAt ?? second.createdAt ?? 0).getTime()
        return secondTime - firstTime
      }),
    [templates]
  )

  const parseExpectedFields = () => {
    try {
      const parsed = JSON.parse(formState.expectedFieldsJson || "{}")
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Expected fields phải là object JSON.")
      }
      return parsed as Record<string, string>
    } catch {
      throw new Error("Expected fields JSON không hợp lệ.")
    }
  }

  const resetForm = () => {
    setEditingTemplateId(null)
    setFormState(emptyForm)
  }

  const handleSubmit = async () => {
    try {
      const expectedFields = parseExpectedFields()
      const documentTypes = formState.documentTypesCsv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      if (editingTemplateId) {
        await updateTemplateMutation.mutateAsync({
          templateName: formState.templateName,
          description: formState.description,
          subjectPattern: formState.subjectPattern,
          bodyPattern: formState.bodyPattern,
          expectedFields,
          documentTypes,
          isActive: formState.isActive,
        })
        toast.success("Đã cập nhật template.")
      } else {
        await createTemplateMutation.mutateAsync({
          templateCode: formState.templateCode,
          templateName: formState.templateName,
          description: formState.description,
          subjectPattern: formState.subjectPattern,
          bodyPattern: formState.bodyPattern,
          expectedFields,
          documentTypes,
        })
        toast.success("Đã tạo template mới.")
      }
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không lưu được template."))
    }
  }

  const handleEdit = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId)
    if (!template) return
    setEditingTemplateId(template.id || null)
    setFormState({
      templateCode: template.templateCode || "",
      templateName: template.templateName || "",
      description: template.description || "",
      subjectPattern: template.subjectPattern || "",
      bodyPattern: template.bodyPattern || "",
      expectedFieldsJson: JSON.stringify(template.expectedFields ?? {}, null, 2),
      documentTypesCsv: (template.documentTypes ?? []).join(", "),
      isActive: Boolean(template.isActive),
    })
  }

  const handleDelete = async (templateId: string) => {
    const confirmed = window.confirm("Xóa template này?")
    if (!confirmed) return
    try {
      await deleteTemplateMutation.mutateAsync(templateId)
      if (editingTemplateId === templateId) {
        resetForm()
      }
      toast.success("Đã xóa template.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa template thất bại."))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại Admin
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-neutral-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-neutral-300">
              {editingTemplateId ? "Cập nhật template" : "Tạo template"}
            </h1>
            {editingTemplateId && (
              <button
                onClick={resetForm}
                className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Template code"
              value={formState.templateCode}
              onChange={(event) => setFormState((state) => ({ ...state, templateCode: event.target.value }))}
              disabled={Boolean(editingTemplateId)}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50"
            />
            <input
              type="text"
              placeholder="Template name"
              value={formState.templateName}
              onChange={(event) => setFormState((state) => ({ ...state, templateName: event.target.value }))}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Subject pattern"
              value={formState.subjectPattern}
              onChange={(event) => setFormState((state) => ({ ...state, subjectPattern: event.target.value }))}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Description"
              value={formState.description}
              onChange={(event) => setFormState((state) => ({ ...state, description: event.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Body pattern"
              value={formState.bodyPattern}
              onChange={(event) => setFormState((state) => ({ ...state, bodyPattern: event.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder='Expected fields JSON, ví dụ {"invoiceNumber":"Mã hóa đơn"}'
              value={formState.expectedFieldsJson}
              onChange={(event) => setFormState((state) => ({ ...state, expectedFieldsJson: event.target.value }))}
              rows={5}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 font-mono text-xs text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Document types (csv) ví dụ invoice,receipt"
              value={formState.documentTypesCsv}
              onChange={(event) => setFormState((state) => ({ ...state, documentTypesCsv: event.target.value }))}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <label className="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) => setFormState((state) => ({ ...state, isActive: event.target.checked }))}
                disabled={!editingTemplateId}
              />
              Kích hoạt template
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingTemplateId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSaving ? "Đang lưu..." : editingTemplateId ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-neutral-300">Danh sách template</h2>
          {templatesQuery.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {getErrorMessage(templatesQuery.error, "Không tải được template.")}
            </div>
          )}
          {templatesQuery.isPending && (
            <p className="text-sm text-neutral-200">Đang tải template...</p>
          )}
          {!templatesQuery.isPending && sortedTemplates.length === 0 && (
            <p className="text-sm text-neutral-200">Chưa có template nào.</p>
          )}

          <div className="space-y-2">
            {sortedTemplates.map((template) => (
              <div
                key={template.id}
                className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-300">
                    {template.templateCode} - {template.templateName}
                  </p>
                  <p className="text-xs text-neutral-200">
                    Cập nhật:{" "}
                    {template.updatedAt
                      ? dayjs(template.updatedAt).format("DD/MM/YYYY HH:mm")
                      : "N/A"}
                    {" · "}
                    {template.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(template.id || "")}
                    className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(template.id || "")}
                    disabled={deleteTemplateMutation.isPending}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3 w-3" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\admin\users\page.tsx`

```tsx
"use client"
// ADMIN ROUTE: Quản lý tài khoản người dùng — chỉ admin

import { useState } from "react"
import {
  BarChart3,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader,
  Pencil,
  Plus,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react"
import dayjs from "dayjs"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAiOpenaiUsageUserCurrentMonthQuery,
  useAiOpenaiUsageUserQuery,
} from "@/hooks/use-mail-queries"
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserRolesMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useResetUserPasswordMutation,
  useUserPermissionsQuery,
  type UserDto,
} from "@/hooks/use-user-queries"

const ALL_ROLES = ["admin", "user", "viewer", "editor"]
type UsageRecord = Record<string, unknown>
type UsageSummary = {
  totalRequests: number
  totalTokens: number
  totalCost: number
}

const numberOf = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const readNumber = (record: UsageRecord, keys: string[]) => {
  for (const key of keys) {
    if (key in record) return numberOf(record[key])
  }
  return 0
}

const getUsageItems = (value: unknown): UsageRecord[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === "object") as UsageRecord[]
  }
  if (!value || typeof value !== "object") return []

  const record = value as UsageRecord
  const nestedCandidates = [record.items, record.data, record.results, record.users]
  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item) => item && typeof item === "object") as UsageRecord[]
    }
  }
  return [record]
}

const buildUsageSummary = (value: unknown): UsageSummary => {
  const items = getUsageItems(value)
  if (items.length === 0) {
    return { totalRequests: 0, totalTokens: 0, totalCost: 0 }
  }

  const first = items[0]
  const directTotalRequests = readNumber(first, [
    "totalRequests",
    "totalCalls",
    "requestCount",
    "totalRequestCount",
  ])
  const directTotalTokens = readNumber(first, [
    "totalTokens",
    "tokenCount",
    "totalTokenCount",
  ])
  const directTotalCost = readNumber(first, ["totalCost", "costEstimate", "cost", "amount"])

  if (
    items.length === 1 &&
    (directTotalRequests > 0 || directTotalTokens > 0 || directTotalCost > 0)
  ) {
    return {
      totalRequests: directTotalRequests,
      totalTokens: directTotalTokens,
      totalCost: directTotalCost,
    }
  }

  return items.reduce<UsageSummary>(
    (accumulator, item) => {
      const inputTokens = readNumber(item, ["inputTokenCount", "inputTokens"])
      const outputTokens = readNumber(item, ["outputTokenCount", "outputTokens"])
      const tokens =
        readNumber(item, ["totalTokens", "tokenCount", "totalTokenCount"]) ||
        inputTokens + outputTokens

      accumulator.totalRequests += readNumber(item, [
        "totalRequests",
        "requestCount",
        "calls",
        "totalCalls",
      ])
      accumulator.totalTokens += tokens
      accumulator.totalCost += readNumber(item, [
        "totalCost",
        "costEstimate",
        "cost",
        "amount",
      ])
      return accumulator
    },
    { totalRequests: 0, totalTokens: 0, totalCost: 0 }
  )
}

type PermissionItem = {
  id?: string
  code?: string
  name?: string
  module?: string
}

function UserPermissionsSection({ userId }: { userId: string }) {
  const permissionsQuery = useUserPermissionsQuery(userId)

  const permissions: PermissionItem[] = (() => {
    const raw = permissionsQuery.data
    if (Array.isArray(raw)) return raw as PermissionItem[]
    if (raw && typeof raw === "object" && "data" in raw) {
      const d = raw as Record<string, unknown>
      if (Array.isArray(d.data)) return d.data as PermissionItem[]
    }
    return []
  })()

  const grouped = permissions.reduce<Record<string, PermissionItem[]>>((acc, item) => {
    const mod = item.module ?? "khác"
    if (!acc[mod]) acc[mod] = []
    acc[mod].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
      <Label className="text-neutral-300">Quyền hạn</Label>
      {permissionsQuery.isPending && (
        <p className="text-xs text-neutral-200">Đang tải...</p>
      )}
      {!permissionsQuery.isPending && permissions.length === 0 && (
        <p className="text-xs text-neutral-200">Không có quyền nào.</p>
      )}
      <div className="space-y-2">
        {Object.entries(grouped).map(([module, items]) => (
          <div key={module}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{module}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {items.map((item, i) => (
                <Badge key={i} variant="outline" className="bg-white text-[10px] text-neutral-600">
                  {item.code ?? "—"}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)
  const [usageModalOpen, setUsageModalOpen] = useState(false)
  const [selectedUsageUser, setSelectedUsageUser] = useState<UserDto | null>(null)

  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<UserDto | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formFullName, setFormFullName] = useState("")
  const [formRoles, setFormRoles] = useState<string[]>(["viewer"])
  const [formIsActive, setFormIsActive] = useState(true)
  const [showFormPassword, setShowFormPassword] = useState(false)

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserDto | null>(null)

  const filtersParts: string[] = []
  if (search.trim()) {
    filtersParts.push(`email@=${search.trim()},fullName@=${search.trim()}`)
  }
  if (statusFilter === "active") filtersParts.push("isActive==true")
  if (statusFilter === "inactive") filtersParts.push("isActive==false")
  if (roleFilter !== "all") filtersParts.push(`role==${roleFilter}`)

  const params = {
    filters: filtersParts.join(",") || undefined,
    page,
    pageSize,
    sortField: "CreatedAtUtc",
    sortOrder: "desc",
  }

  const usersQuery = useUsersQuery(params)
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()
  const updateRolesMutation = useUpdateUserRolesMutation()
  const updateStatusMutation = useUpdateUserStatusMutation()
  const deleteMutation = useDeleteUserMutation()
  const restoreMutation = useRestoreUserMutation()
  const resetPasswordMutation = useResetUserPasswordMutation()
  const userUsageCurrentMonthQuery = useAiOpenaiUsageUserCurrentMonthQuery(
    selectedUsageUser?.id ?? null
  )
  const userUsageAllTimeQuery = useAiOpenaiUsageUserQuery(selectedUsageUser?.id ?? null)

  const listData = usersQuery.data
  const users = listData?.data ?? []
  const pagination = listData?.meta?.pagination
  const monthUsageSummary = buildUsageSummary(userUsageCurrentMonthQuery.data)
  const allTimeUsageSummary = buildUsageSummary(userUsageAllTimeQuery.data)

  const openCreate = () => {
    setModalMode("create")
    setSelectedUser(null)
    setFormEmail("")
    setFormPassword("")
    setFormFullName("")
    setFormRoles(["viewer"])
    setFormIsActive(true)
    setModalOpen(true)
  }

  const openEdit = (user: UserDto) => {
    setModalMode("edit")
    setSelectedUser(user)
    setFormEmail(user.email)
    setFormPassword("")
    setFormFullName(user.fullName)
    setFormRoles(user.roles)
    setFormIsActive(user.isActive)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({
          email: formEmail,
          password: formPassword,
          fullName: formFullName,
          roles: formRoles,
        })
        toast.success("Tạo tài khoản thành công.")
      } else if (selectedUser) {
        await updateMutation.mutateAsync({
          id: selectedUser.id,
          payload: { fullName: formFullName },
        })
        await updateRolesMutation.mutateAsync({
          id: selectedUser.id,
          payload: { roles: formRoles },
        })
        toast.success("Cập nhật tài khoản thành công.")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Thao tác thất bại."))
    }
  }

  const handleToggleStatus = async (user: UserDto) => {
    try {
      await updateStatusMutation.mutateAsync({ id: user.id, isActive: !user.isActive })
      toast.success(`${!user.isActive ? "Kích hoạt" : "Vô hiệu hóa"} tài khoản thành công.`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật trạng thái thất bại."))
    }
  }

  const openDeleteConfirm = (user: UserDto) => {
    setConfirmDeleteUser(user)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!confirmDeleteUser) return
    try {
      await deleteMutation.mutateAsync(confirmDeleteUser.id)
      toast.success("Đã xóa tài khoản.")
      setConfirmDeleteOpen(false)
      setConfirmDeleteUser(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Xóa tài khoản thất bại."))
    }
  }

  const handleRestore = async (user: UserDto) => {
    try {
      await restoreMutation.mutateAsync(user.id)
      toast.success("Khôi phục tài khoản thành công.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Khôi phục thất bại."))
    }
  }

  const openResetPassword = (user: UserDto) => {
    setResetPasswordUser(user)
    setNewPassword("")
    setResetPasswordOpen(true)
  }

  const openUsageModal = (user: UserDto) => {
    setSelectedUsageUser(user)
    setUsageModalOpen(true)
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return
    try {
      await resetPasswordMutation.mutateAsync({
        id: resetPasswordUser.id,
        payload: { newPassword },
      })
      toast.success("Reset mật khẩu thành công.")
      setResetPasswordOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Reset mật khẩu thất bại."))
    }
  }

  const toggleRole = (role: string) => {
    setFormRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateRolesMutation.isPending ||
    updateStatusMutation.isPending ||
    deleteMutation.isPending ||
    restoreMutation.isPending ||
    resetPasswordMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý Tài khoản</h1>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" /> Tạo tài khoản
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm theo email hoặc tên..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            const nextValue = e.target.value as "all" | "active" | "inactive"
            setStatusFilter(nextValue)
            setPage(1)
          }}
          className="h-10 rounded-lg border border-neutral-100 bg-white px-3 text-sm text-neutral-300 focus:border-primary focus:outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(1)
          }}
          className="h-10 rounded-lg border border-neutral-100 bg-white px-3 text-sm text-neutral-300 focus:border-primary focus:outline-none"
        >
          <option value="all">Tất cả vai trò</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Email</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Họ tên</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Vai trò</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Ngày tạo</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {usersQuery.isPending && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải...</p>
                  </td>
                </tr>
              )}
              {!usersQuery.isPending && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    Không có tài khoản nào.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-neutral-300">{user.email}</td>
                  <td className="px-4 py-3 text-neutral-300">{user.fullName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className={
                            role === "admin"
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : role === "user"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                          }
                        >
                          {role === "admin" && <Shield className="mr-1 h-3 w-3" />}
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle className="h-3 w-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        <XCircle className="h-3 w-3" /> Không hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {user.createdAtUtc
                      ? dayjs(user.createdAtUtc).format("DD/MM/YYYY HH:mm")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        title="Sửa"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                      >
                        {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openUsageModal(user)}
                        title="AI usage"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openResetPassword(user)}
                        title="Reset mật khẩu"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-amber-600"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(user)}
                        title="Xóa"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-200">
            Trang {pagination.page} / {pagination.totalPages} · {pagination.totalItems} tài khoản
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPreviousPage}
              className="rounded-lg border border-neutral-100 bg-white px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNextPage}
              className="rounded-lg border border-neutral-100 bg-white px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black">
              {modalMode === "create" ? "Tạo tài khoản mới" : "Cập nhật tài khoản"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-neutral-300">Email</Label>
              <Input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                disabled={modalMode === "edit"}
                placeholder="user@example.com"
                className="text-neutral-300"
              />
            </div>
            {modalMode === "create" && (
              <div className="space-y-1">
                <Label className="text-neutral-300">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    type={showFormPassword ? "text" : "password"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự..."
                    className="pr-10 text-neutral-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300"
                  >
                    {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-neutral-300">Họ và tên</Label>
              <Input
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300">Vai trò</Label>
              <div className="flex flex-wrap gap-3">
                {ALL_ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm text-neutral-300">
                    <input
                      type="checkbox"
                      checked={formRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <Label className="mb-0 text-neutral-300">Kích hoạt tài khoản</Label>
            </div>
            {modalMode === "edit" && selectedUser && (
              <UserPermissionsSection userId={selectedUser.id} />
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isMutating}>
                {isMutating ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                {modalMode === "create" ? "Tạo" : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Usage Modal */}
      <Dialog open={usageModalOpen} onOpenChange={setUsageModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-black">AI usage theo user</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-neutral-200">
              Tai khoan: <strong className="text-neutral-300">{selectedUsageUser?.email}</strong>
            </p>

            {(userUsageCurrentMonthQuery.isPending || userUsageAllTimeQuery.isPending) && (
              <div className="rounded-lg border border-neutral-100 p-3 text-sm text-neutral-200">
                Dang tai usage...
              </div>
            )}

            {(userUsageCurrentMonthQuery.error || userUsageAllTimeQuery.error) && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                {getErrorMessage(
                  userUsageCurrentMonthQuery.error || userUsageAllTimeQuery.error,
                  "Khong tai duoc usage cua user."
                )}
              </div>
            )}

            {!userUsageCurrentMonthQuery.isPending &&
              !userUsageAllTimeQuery.isPending &&
              !userUsageCurrentMonthQuery.error &&
              !userUsageAllTimeQuery.error && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-lg border border-neutral-100 bg-white p-3">
                    <p className="text-xs text-neutral-200">Requests thang nay</p>
                    <p className="text-lg font-semibold text-neutral-300">
                      {monthUsageSummary.totalRequests.toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-100 bg-white p-3">
                    <p className="text-xs text-neutral-200">Tokens thang nay</p>
                    <p className="text-lg font-semibold text-neutral-300">
                      {monthUsageSummary.totalTokens.toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-100 bg-white p-3">
                    <p className="text-xs text-neutral-200">Cost thang nay (USD)</p>
                    <p className="text-lg font-semibold text-neutral-300">
                      {monthUsageSummary.totalCost.toLocaleString("en-US", {
                        maximumFractionDigits: 4,
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-100 bg-white p-3">
                    <p className="text-xs text-neutral-200">Tong requests (all-time)</p>
                    <p className="text-lg font-semibold text-neutral-300">
                      {allTimeUsageSummary.totalRequests.toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-black">Reset mật khẩu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-neutral-200">
              Tài khoản: <strong className="text-neutral-300">{resetPasswordUser?.email}</strong>
            </p>
            <div className="space-y-1">
              <Label className="text-neutral-300">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="pr-10 text-neutral-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleResetPassword} disabled={isMutating || !newPassword}>
                {isMutating ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                Xác nhận
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-black">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-neutral-200">
              Bạn có chắc muốn xóa tài khoản{" "}
              <strong className="text-neutral-300">{confirmDeleteUser?.email}</strong>?<br />
              Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                Xóa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

```

---

## File: `app\(app)\analysis-results\page.tsx`

```tsx
"use client"
// USER ROUTE: Xem kết quả AI xử lý email (phân loại, trích xuất) — user

import { useState } from "react"
import Link from "next/link"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { useAnalysisResultsQuery } from "@/hooks/use-mail-queries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search, ThumbsUp, ThumbsDown, Eye, ChevronLeft, ChevronRight } from "lucide-react"

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "notStarted", label: "Chưa bắt đầu" },
  { value: "processing", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn thành" },
  { value: "pendingReview", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "failed", label: "Thất bại" },
]

const categoryOptions = [
  { value: "all", label: "Tất cả category" },
  { value: "businessDocument", label: "Business Document" },
  { value: "orderRequest", label: "Order Request" },
  { value: "supportRequest", label: "Support Request" },
  { value: "notification", label: "Notification" },
  { value: "systemMail", label: "System Mail" },
  { value: "spam", label: "Spam" },
  { value: "unknown", label: "Unknown" },
]

const statusLabelMap: Record<string, string> = {
  notStarted: "Chưa bắt đầu",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  pendingReview: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  failed: "Thất bại",
}

const statusColorMap: Record<string, string> = {
  notStarted: "bg-gray-50 text-gray-700",
  processing: "bg-blue-50 text-blue-700",
  completed: "bg-blue-50 text-blue-700",
  pendingReview: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  failed: "bg-red-50 text-red-700",
}

export default function AnalysisResultsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const analysisQuery = useAnalysisResultsQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    page,
    pageSize,
  })

  const results = analysisQuery.data ?? []

  const visibleResults = search.trim()
    ? results.filter((item) =>
        item.mailMessageId?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase())
      )
    : results

  const totalItems = visibleResults.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const visiblePageNumbers = pageNumbers.filter((pageNumber) => {
    if (totalPages <= 7) return true
    if (pageNumber <= 2 || pageNumber > totalPages - 2) return true
    if (Math.abs(pageNumber - page) <= 1) return true
    return false
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Kết quả phân tích AI</h1>
      </div>

      {analysisQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(analysisQuery.error, "Không tải được kết quả phân tích.")}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-100" />
          <input
            type="text"
            placeholder="Tìm kiếm theo message ID, category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-neutral-100 bg-white py-2 pl-9 pr-4 text-sm text-neutral-800 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
          <Filter className="h-4 w-4 text-neutral-200" />
          <Select
            value={statusFilter}
            onValueChange={(value: string) => {
              setStatusFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[170px] text-neutral-800">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(value: string) => {
              setCategoryFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[190px] text-neutral-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Email ID</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Category</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Intent</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Độ tin cậy</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Thời gian</th>
                <th className="px-4 py-3 text-right font-medium text-white/80">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {analysisQuery.isPending && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-200">
                    Đang tải...
                  </td>
                </tr>
              )}

              {!analysisQuery.isPending && visibleResults.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-200">
                    Không tìm thấy kết quả nào
                  </td>
                </tr>
              )}

              {visibleResults.map((result) => {
                const status = result.status ?? "notStarted"
                const statusClass = statusColorMap[status] ?? "bg-gray-50 text-gray-700"
                const confidence = result.confidenceScore ?? 0
                return (
                  <tr key={result.id} className="cursor-pointer transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-neutral-300">{result.mailMessageId || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-200 capitalize">{result.category || "—"}</td>
                    <td className="px-4 py-3 text-neutral-200 capitalize">{result.detectedIntent || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.round(confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-200">{Math.round(confidence * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                        {statusLabelMap[status] || status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">
                      {result.createdAt ? dayjs(result.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {result.mailMessageId && (
                          <Link
                            href={`/emails/${result.mailMessageId}/extract`}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                          >
                            <Eye className="h-3 w-3" /> Xem
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {analysisQuery.isPending && (
            <div className="px-4 py-8 text-center text-sm text-neutral-200">Đang tải...</div>
          )}

          {!analysisQuery.isPending && visibleResults.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-neutral-200">Không tìm thấy kết quả nào</div>
          )}

          {visibleResults.map((result) => {
            const status = result.status ?? "notStarted"
            const statusClass = statusColorMap[status] ?? "bg-gray-50 text-gray-700"
            const confidence = result.confidenceScore ?? 0
            return (
              <div key={result.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="wrap-break-word text-sm font-medium text-neutral-300">
                    {result.mailMessageId || "—"}
                  </p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                    {statusLabelMap[status] || status}
                  </span>
                </div>
                <p className="text-xs text-neutral-200 capitalize">
                  {result.category || "—"} · {result.detectedIntent || "—"}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(confidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-200">{Math.round(confidence * 100)}%</span>
                </div>
                <p className="text-xs text-neutral-200">
                  {result.createdAt ? dayjs(result.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                </p>
                {result.mailMessageId && (
                  <Link
                    href={`/emails/${result.mailMessageId}/extract`}
                    className="inline-flex cursor-pointer items-center rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    <Eye className="h-3 w-3" /> Xem
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-200 sm:text-sm">
            Trang <span className="font-medium text-neutral-300">{page}</span> /{" "}
            <span className="font-medium text-neutral-300">{totalPages}</span> · Tổng{" "}
            <span className="font-medium text-neutral-300">{totalItems}</span> kết quả
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setPage((previousPage) => Math.max(1, previousPage - 1))}
              disabled={page === 1}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {visiblePageNumbers.map((pageNumber, index) => {
              const previousPageNumber = visiblePageNumbers[index - 1]
              const shouldShowGap = previousPageNumber && pageNumber - previousPageNumber > 1
              return (
                <div key={pageNumber} className="flex items-center gap-1">
                  {shouldShowGap ? <span className="px-1 text-neutral-200">…</span> : null}
                  <button
                    onClick={() => setPage(pageNumber)}
                    className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                      pageNumber === page
                        ? "bg-primary text-white"
                        : "border border-neutral-100 bg-white text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                </div>
              )
            })}
            <button
              onClick={() => setPage((previousPage) => Math.min(totalPages, previousPage + 1))}
              disabled={page === totalPages}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\emails\page.tsx`

```tsx
"use client"
// ROUTE: Danh sách email — dùng chung cho mọi user (gán theo /my API)

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Loader,
  Mail,
  Paperclip,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { useMailAssignmentsMyQuery, useConfirmMailAssignmentMutation } from "@/hooks/use-mail-assignments-queries"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 10

type MailAttachment = {
  id?: string | null
  fileName?: string | null
  contentType?: string | null
  fileSize?: number | null
}

type MailItem = {
  id?: string | null
  subject?: string | null
  fromEmail?: string | null
  fromName?: string | null
  receivedAt?: string | null
  attachments?: MailAttachment[] | null
}

type AssignmentItem = {
  id?: string | null
  mailConnectorMessageId?: string | null
  assignedAt?: string | null
  status?: string | null
  confirmedAt?: string | null
  completedAt?: string | null
  notes?: string | null
  mail?: MailItem | null
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    assigned: {
      label: "Đã giao",
      className: "bg-blue-50 text-blue-700",
      icon: <Mail className="h-3 w-3" />,
    },
    confirmed: {
      label: "Đã xác nhận",
      className: "bg-amber-50 text-amber-700",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    completed: {
      label: "Hoàn thành",
      className: "bg-green-50 text-green-700",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    needSupplement: {
      label: "Cần bổ sung",
      className: "bg-red-50 text-red-700",
      icon: <AlertCircle className="h-3 w-3" />,
    },
    extracted: {
      label: "Đã bóc tách",
      className: "bg-purple-50 text-purple-700",
      icon: <Paperclip className="h-3 w-3" />,
    },
    exported: {
      label: "Đã xuất",
      className: "bg-neutral-100 text-neutral-600",
      icon: <Clock className="h-3 w-3" />,
    },
  }
  const normalized = status?.toLowerCase() ?? ""
  const match = Object.entries(map).find(([key]) => normalized.includes(key))
  return match?.[1] ?? { label: status || "—", className: "bg-neutral-100 text-neutral-600", icon: null }
}

export default function EmailsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const assignmentsQuery = useMailAssignmentsMyQuery()
  const confirmMutation = useConfirmMailAssignmentMutation()

  const assignmentsRaw = assignmentsQuery.data
  const assignments: AssignmentItem[] = useMemo(() => {
    if (Array.isArray(assignmentsRaw)) return assignmentsRaw as AssignmentItem[]
    if (assignmentsRaw && typeof assignmentsRaw === "object" && "data" in (assignmentsRaw as Record<string, unknown>)) {
      const d = assignmentsRaw as unknown as Record<string, unknown>
      if (Array.isArray(d.data)) return d.data as AssignmentItem[]
    }
    return []
  }, [assignmentsRaw])

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim()
    if (!keyword) return assignments
    return assignments.filter((a) => {
      const subject = String(a.mail?.subject ?? "").toLowerCase()
      const fromEmail = String(a.mail?.fromEmail ?? "").toLowerCase()
      const fromName = String(a.mail?.fromName ?? "").toLowerCase()
      const status = String(a.status ?? "").toLowerCase()
      return (
        subject.includes(keyword) ||
        fromEmail.includes(keyword) ||
        fromName.includes(keyword) ||
        status.includes(keyword)
      )
    })
  }, [assignments, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const isLoading = assignmentsQuery.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Danh sách Email</h1>
      </div>

      {assignmentsQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(assignmentsQuery.error, "Không tải được danh sách.")}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-100" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề, người gửi, trạng thái..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-neutral-100 bg-white py-2 pl-9 pr-4 text-sm text-neutral-800 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-neutral-400">
          <Loader className="h-4 w-4 animate-spin" /> Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-neutral-100 bg-white p-6 text-center text-sm text-neutral-400">
          <Mail className="mx-auto mb-2 h-8 w-8 text-neutral-200" />
          <p>Chưa có email nào được giao cho bạn.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Tiêu đề</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Người gửi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Nhận lúc</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Ngày giao</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Xác nhận lúc</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Hoàn thành lúc</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paged.map((item) => {
                    const messageId = String(item.mailConnectorMessageId ?? "")
                    const badge = statusBadge(item.status ?? "")
                    const hasAttachments = (item.mail?.attachments?.length ?? 0) > 0
                    return (
                      <tr key={item.id || messageId} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0 text-neutral-300" />
                            <span className="max-w-[200px] truncate font-medium text-neutral-700">
                              {item.mail?.subject ?? "(Không tiêu đề)"}
                            </span>
                            {hasAttachments && (
                              <Paperclip className="h-3 w-3 text-neutral-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-500">
                          {item.mail?.fromName || item.mail?.fromEmail || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">
                          {item.mail?.receivedAt
                            ? dayjs(String(item.mail.receivedAt)).format("DD/MM/YYYY HH:mm")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">
                          {item.assignedAt
                            ? dayjs(String(item.assignedAt)).format("DD/MM/YYYY HH:mm")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">
                          {item.confirmedAt
                            ? dayjs(String(item.confirmedAt)).format("DD/MM/YYYY HH:mm")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">
                          {item.completedAt
                            ? dayjs(String(item.completedAt)).format("DD/MM/YYYY HH:mm")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {(() => {
                            const statusLower = item.status?.toLowerCase() ?? ""
                            const canConfirm = statusLower === "assigned"
                            const canProcess = ["confirmed", "needSupplement", "extracted", "exported"].includes(statusLower)
                            const isCompleted = statusLower === "completed"
                            return (
                              <div className="flex items-center justify-end gap-1">
                                {canConfirm && messageId && (
                                  <button
                                    onClick={() => {
                                      confirmMutation.mutate(
                                        { messageId, payload: {} },
                                        {
                                          onSuccess: () => toast.success("Đã xác nhận nhận mail."),
                                          onError: (err) => toast.error("Xác nhận thất bại: " + String(err)),
                                        }
                                      )
                                    }}
                                    disabled={confirmMutation.isPending}
                                    className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                                  >
                                    Xác nhận
                                  </button>
                                )}
                                {canProcess && messageId && (
                                  <Link
                                    href={`/emails/${messageId}`}
                                    className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-500"
                                  >
                                    Xử lý
                                  </Link>
                                )}
                                {isCompleted && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Hoàn thành
                                  </span>
                                )}
                                {!messageId && <span className="text-neutral-400">—</span>}
                              </div>
                            )
                          })()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
              <p className="text-xs text-neutral-200">
                Trang {page} / {totalPages} ({filtered.length} bản ghi)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

```

---

## File: `app\(app)\emails\[id]\extract\page.tsx`

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { AlertTriangle, ArrowLeft, CheckCircle, FileSpreadsheet, Save, ThumbsDown, ThumbsUp } from "lucide-react"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAnalysisResultQuery,
  useApproveAnalysisMutation,
  useLatestAnalysisByMessageIdQuery,
  useRejectAnalysisMutation,
  useUpdateAnalysisFieldsMutation,
} from "@/hooks/use-mail-queries"

export default function ExtractPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const messageId = params.id
  const analysisIdFromQuery = searchParams.get("analysisId")
  const latestAnalysisQuery = useLatestAnalysisByMessageIdQuery(analysisIdFromQuery ? null : messageId)
  const analysisId = analysisIdFromQuery ?? latestAnalysisQuery.data?.id ?? null

  const analysisQuery = useAnalysisResultQuery(analysisId)
  const updateFieldsMutation = useUpdateAnalysisFieldsMutation(analysisId)
  const approveMutation = useApproveAnalysisMutation(analysisId)
  const rejectMutation = useRejectAnalysisMutation(analysisId)

  const [fields, setFields] = useState<Record<string, string>>({})
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    const extractedFields = analysisQuery.data?.extractedFields ?? {}
    setFields(extractedFields)
  }, [analysisQuery.data?.extractedFields])

  const missingFields = useMemo<string[]>(
    () => (analysisQuery.data?.missingFields ?? []) as string[],
    [analysisQuery.data?.missingFields]
  )
  const warnings = useMemo<string[]>(
    () => (analysisQuery.data?.warnings ?? []) as string[],
    [analysisQuery.data?.warnings]
  )

  const handleFieldChange = (key: string, value: string) => {
    setFields((previousState) => ({ ...previousState, [key]: value }))
  }

  const handleSave = async () => {
    try {
      if (!analysisId) return
      setSaveMessage(null)
      await updateFieldsMutation.mutateAsync(fields)
      setSaveMessage("Đã lưu chỉnh sửa.")
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Lưu chỉnh sửa thất bại."))
    }
  }

  const handleApprove = async () => {
    try {
      if (!analysisId) return
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "admin-ui" : "admin-ui"
      await approveMutation.mutateAsync(userId)
      setSaveMessage("Đã duyệt kết quả bóc tách.")
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Duyệt kết quả thất bại."))
    }
  }

  const handleReject = async () => {
    try {
      if (!analysisId) return
      const reason = window.prompt("Lý do từ chối (có thể bỏ trống):") ?? ""
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "admin-ui" : "admin-ui"
      await rejectMutation.mutateAsync({ userId, reason: reason || undefined })
      setSaveMessage("Đã từ chối kết quả bóc tách.")
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Từ chối kết quả thất bại."))
    }
  }

  const handleExport = () => {
    const csv = Object.entries(fields)
      .map(([key, value]) => `${key},${value}`)
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `extract-${messageId}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (latestAnalysisQuery.isPending && !analysisIdFromQuery) {
    return <div className="text-sm text-neutral-200">Đang tìm kết quả phân tích gần nhất...</div>
  }

  if (!analysisId) {
    return (
      <div className="space-y-3">
        <Link href={`/emails/${messageId}`} className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại email
        </Link>
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Chưa có kết quả phân tích. Vui lòng bấm <strong>Gửi AI bóc tách</strong> từ màn chi tiết email.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/emails/${messageId}`} className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại email
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            disabled={updateFieldsMutation.isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {updateFieldsMutation.isPending ? "Đang lưu..." : "Lưu chỉnh sửa"}
          </button>
          <button
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsUp className="h-4 w-4" />
            {approveMutation.isPending ? "Đang duyệt..." : "Duyệt"}
          </button>
          <button
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsDown className="h-4 w-4" />
            {rejectMutation.isPending ? "Đang từ chối..." : "Từ chối"}
          </button>
          <button
            id="tour-extract-export"
            onClick={handleExport}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{saveMessage}</div>
      )}

      {analysisQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(analysisQuery.error, "Không tải được kết quả bóc tách.")}
        </div>
      )}

      <div id="tour-extract-result" className="space-y-4 rounded-xl border border-neutral-100 bg-white p-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-neutral-300">Kết quả bóc tách</h1>
          <span className="rounded-full bg-[#EDF3EC] px-2.5 py-0.5 text-xs font-medium text-[#346538]">
            {analysisQuery.data?.status || "pending"}
          </span>
        </div>

        {analysisQuery.isPending && <p className="text-sm text-neutral-200">Đang tải dữ liệu phân tích...</p>}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-200">Độ tin cậy AI:</span>
          <div className="h-2 w-32 rounded-full bg-neutral-50">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${Math.round((analysisQuery.data?.confidenceScore ?? 0) * 100)}%` }}
            />
          </div>
          <span className="font-medium">
            {Math.round((analysisQuery.data?.confidenceScore ?? 0) * 100)}%
          </span>
        </div>

        {missingFields.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Thiếu thông tin:</p>
              <p>{missingFields.join(", ")}</p>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Cảnh báo:</p>
              <ul className="list-inside list-disc">
                {warnings.map((warningText, index) => (
                  <li key={index}>{warningText}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div id="tour-extract-fields" className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-200">Dữ liệu trích xuất</h3>
          <div className="grid gap-3">
            {Object.keys(fields).length === 0 && (
              <p className="text-sm text-neutral-200">Chưa có trường dữ liệu để hiển thị.</p>
            )}
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} className="grid grid-cols-1 gap-2 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
                <label className="text-sm font-medium text-neutral-200">{key}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(event) => handleFieldChange(key, event.target.value)}
                  className="rounded-lg border border-neutral-100 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1 rounded-lg bg-neutral-50 p-4 text-xs text-neutral-200">
          <p>Model: {analysisQuery.data?.modelName || "N/A"}</p>
          <p>Input tokens: {analysisQuery.data?.inputTokenCount ?? 0}</p>
          <p>Output tokens: {analysisQuery.data?.outputTokenCount ?? 0}</p>
          <p>Chi phí ước tính: ${analysisQuery.data?.costEstimate ?? 0}</p>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\emails\[id]\page.tsx`

```tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Bot, Paperclip, Send, User, X, Play, Sparkles, Tag, FileSearch } from "lucide-react"
import dayjs from "dayjs"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/get-error-message"
import { usePermission } from "@/hooks/use-permission"
import { useAuthStore, getTenantIdFromToken } from "@/lib/stores/auth-store"
import {
  useMailAssignmentStatusQuery,
  useAssignMailMutation,
  useReassignMailMutation,
  useConfirmMailAssignmentMutation,
  useCompleteMailAssignmentMutation,
} from "@/hooks/use-mail-assignments-queries"
import { useUsersQuery } from "@/hooks/use-user-queries"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"
import { FileAttachmentItem } from "@/components/file-attachment-item"
import { AttachmentViewerModal } from "@/components/attachment-viewer-modal"
import { FileViewerModal } from "@/components/ui/file-viewer-modal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  ExtractionResultModal,
  type ExtractionPreviewSources,
} from "@/components/extraction-result-modal"
import {
  TemplateResultModal,
  type ExtractionPreviewSources as TemplatePreviewSources,
} from "@/components/template-result-modal"
import {
  useAttachmentContentQuery,
  useAttachmentExtractTextQuery,
  useDownloadAttachmentMutation,
  useEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useMailMessageQuery,
  useTriggerPipelineMutation,
  useNormalizeMailMutation,
  useClassifyMailMutation,
  useExtractMailMutation,
} from "@/hooks/use-mail-queries"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import {
  useGetAiChatConversationByEntityQuery,
  useCreateAiChatConversationMutation,
  useLinkAiChatEntityMutation,
  useGetAiChatMessagesQuery,
  useLinkAiChatAttachmentMutation,
  useSendAiChatMessageMutation,
  type AiChatMessage,
} from "@/hooks/use-ai-chat-queries"

const mailApi = getLogisticsPlatformAPI()
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://vietprodev.duckdns.org/gateway/logistics/api/v1"

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function resolvePresignedPreview(response: unknown): ExtractionPreviewSources | null {
  const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" ? (value as Record<string, unknown>) : null

  const root = asRecord(response)
  const level1 = asRecord(root?.data)
  const level2 = asRecord(level1?.data)
  const candidates = [root, level1, level2].filter(Boolean) as Record<string, unknown>[]

  for (const candidate of candidates) {
    const url = readString(candidate.url)
    const googleViewerUrl = readString(candidate.googleViewerUrl)
    const officeViewerUrl = readString(candidate.officeViewerUrl)
    const proxyUrl = readString(candidate.proxyUrl)
    const expiresAt = readString(candidate.expiresAt)

    if (url || googleViewerUrl || officeViewerUrl || proxyUrl) {
      return { url, googleViewerUrl, officeViewerUrl, proxyUrl, expiresAt }
    }
  }

  return null
}

type TemplateItem = {
  id?: string | null
  templateCode?: string | null
  templateName?: string | null
  description?: string | null
  expectedFields?: Record<string, string> | null
  isActive?: boolean | null
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  displayContent?: string
  result?: string | null
  isLoading?: boolean
  inputTokens?: number | null
  outputTokens?: number | null
  totalTokens?: number | null
  finishReason?: string | null
}

export default function EmailDetailPage() {
  const params = useParams<{ id: string }>()
  const messageId = params.id

  const messageQuery = useMailMessageQuery(messageId)
  const templatesQuery = useEmailTemplatesQuery()
  const downloadAttachmentMutation = useDownloadAttachmentMutation(messageId)
  const triggerPipelineMutation = useTriggerPipelineMutation()
  const normalizeMailMutation = useNormalizeMailMutation()
  const classifyMailMutation = useClassifyMailMutation()
  const extractMailMutation = useExtractMailMutation()

  // AI Chat hooks
  const conversationByEntityQuery = useGetAiChatConversationByEntityQuery(
    messageId ? { entityType: "mail_message", entityId: messageId } : null
  )
  const createConversationMutation = useCreateAiChatConversationMutation()
  const linkEntityMutation = useLinkAiChatEntityMutation()
  const linkAttachmentMutation = useLinkAiChatAttachmentMutation()
  const sendMessageMutation = useSendAiChatMessageMutation()
  const messagesQuery = useGetAiChatMessagesQuery(
    conversationByEntityQuery.data?.id ?? null
  )

  const { has: canProcessMailPermission } = usePermission("mail.process")
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = useAuthStore((s) => s.isAdmin)()

  const assignmentStatusQuery = useMailAssignmentStatusQuery(messageId)
  const assignMutation = useAssignMailMutation()
  const reassignMutation = useReassignMailMutation()
  const confirmMutation = useConfirmMailAssignmentMutation()
  const completeMutation = useCompleteMailAssignmentMutation()

  const assignmentData = assignmentStatusQuery.data as Record<string, unknown> | undefined
  const assignedToUserId = assignmentData?.assignedToUserId as string | undefined
  const assignmentStatus = assignmentData?.status as string | undefined
  const isAssignedToMe = assignedToUserId === currentUser?.userId
  const canProcessMail = canProcessMailPermission && (isAdmin || isAssignedToMe)

  const [reassignModalOpen, setReassignModalOpen] = useState(false)
  const [selectedReassignUserId, setSelectedReassignUserId] = useState("")

  const usersQuery = useUsersQuery({ page: 1, pageSize: 100 })
  const userList = (() => {
    const raw = usersQuery.data
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === "object" && "data" in raw) {
      const d = raw as unknown as Record<string, unknown>
      if (Array.isArray(d.data)) return d.data
    }
    return []
  })()

  const [contentMode, setContentMode] = useState<"auto" | "text" | "html">("auto")
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null)
  const [attachmentViewMode, setAttachmentViewMode] = useState<"extract" | "content">("extract")
  const [selectedForAI, setSelectedForAI] = useState<Set<string>>(new Set())

  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [fileViewerUrl, setFileViewerUrl] = useState("")
  const [fileViewerName, setFileViewerName] = useState("")
  const [fileViewerType, setFileViewerType] = useState("")
  const [fileViewerAttachmentId, setFileViewerAttachmentId] = useState<string | undefined>(undefined)

  const [extractionResultOpen, setExtractionResultOpen] = useState(false)
  const [extractionResult, setExtractionResult] = useState<string | null>(null)
  const [extractionPreview, setExtractionPreview] = useState<ExtractionPreviewSources | null>(null)
  const [extractionFileName, setExtractionFileName] = useState<string | null>(null)
  const [templateResultOpen, setTemplateResultOpen] = useState(false)
  const [templateExtractedData, setTemplateExtractedData] = useState<Record<string, string>>({})

  const [aiMode, setAiMode] = useState<"chat" | "template">("chat")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [promptError, setPromptError] = useState<string | null>(null)
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [newTemplateCode, setNewTemplateCode] = useState("")
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateFields, setNewTemplateFields] = useState("{}")
  const createTemplateMutation = useCreateEmailTemplateMutation()

  const [processedHtml, setProcessedHtml] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatLoading = sendMessageMutation.isPending || linkAttachmentMutation.isPending

  const tenantId = useMemo(() => getTenantIdFromToken(), [])

  const templates = useMemo(
    () =>
      ((templatesQuery.data ?? []) as TemplateItem[]).filter((template) =>
        template.isActive === undefined || template.isActive === null
          ? true
          : Boolean(template.isActive)
      ),
    [templatesQuery.data]
  )

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
  )

  const emailData = messageQuery.data
  const attachments = useMemo(
    () =>
      (emailData?.attachments ?? []) as Array<{
        id: string
        fileName: string
        contentType?: string
        fileSize?: number
        previewUrl?: string
        contentId?: string
      }>,
    [emailData?.attachments]
  )

  const bodyText = emailData?.bodyText || ""
  const bodyHtml = emailData?.bodyHtml || ""

  const htmlContent = useMemo(() => {
    if (bodyHtml.trim()) return bodyHtml
    const trimmed = bodyText.trim()
    const looksLikeHtml =
      /^<!doctype html/i.test(trimmed) ||
      /^<html/i.test(trimmed) ||
      /<body[\s>]/i.test(trimmed) ||
      /<table[\s>]/i.test(trimmed) ||
      /<head[\s>]/i.test(trimmed)
    return looksLikeHtml ? trimmed : ""
  }, [bodyHtml, bodyText])

  useEffect(() => {
    const processInlineImages = async () => {
      if (!htmlContent || !/cid:/i.test(htmlContent)) {
        setProcessedHtml(htmlContent)
        return
      }

      let processed = htmlContent
      const cidRegex = /cid:([a-zA-Z0-9_-]+)/gi
      const cids = new Set<string>()
      let match: RegExpExecArray | null

      while ((match = cidRegex.exec(htmlContent)) !== null) {
        cids.add(match[1])
      }

      for (const cid of cids) {
        const attachment = attachments.find(
          (a) =>
            a.contentId === cid ||
            a.contentId === `<${cid}>` ||
            a.fileName.includes(cid) ||
            (a.fileName.startsWith("image") && cid.includes("ii_"))
        )

        if (!attachment) continue

        try {
          const response = await MAIL_CONNECTOR_AXIOS.get(
            `/api/v1/mail-messages/${messageId}/attachments/${attachment.id}/content`
          )

          const responseData = response.data
          let content = ""
          if (typeof responseData === "string") {
            content = responseData
          } else if (responseData?.data?.content) {
            content = responseData.data.content
          } else if (responseData?.content) {
            content = responseData.content
          }

          if (content && attachment.contentType?.startsWith("image/")) {
            const dataUrl = `data:${attachment.contentType};base64,${content}`
            processed = processed.replace(new RegExp(`cid:${cid}`, "gi"), dataUrl)
          }
        } catch (error) {
          console.error(`Failed to fetch content for CID ${cid}:`, error)
        }
      }

      setProcessedHtml(processed)
    }

    void processInlineImages()
  }, [htmlContent, attachments, messageId])

  // Conversation initialization: find existing or create new
  const [conversationId, setConversationId] = useState<string | null>(null)
  const hasAttemptedCreate = useRef(false)

  useEffect(() => {
    if (conversationByEntityQuery.data?.id) {
      setConversationId(conversationByEntityQuery.data.id)
      return
    }
    if (conversationByEntityQuery.isLoading) return

    if (!hasAttemptedCreate.current && messageId && currentUser?.userId) {
      hasAttemptedCreate.current = true
      createConversationMutation.mutate(
        {
          title: emailData?.subject || `Email ${messageId}`,
          createdBy: currentUser.userId,
          idempotencyKey: `email:${messageId}`,
          ...(tenantId ? { tenantId } : {}),
        },
        {
          onSuccess: (newConv) => {
            const newId = newConv.id
            setConversationId(newId)
            linkEntityMutation.mutate({
              conversationId: newId,
              payload: { entityType: "mail_message", entityId: messageId },
            })
          },
        }
      )
    }
  }, [
    conversationByEntityQuery.data,
    conversationByEntityQuery.isLoading,
    messageId,
    currentUser?.userId,
    emailData?.subject,
    createConversationMutation,
    linkEntityMutation,
  ])

  function parseAiDisplayContent(raw: string): { display: string; result: string | null } {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      if (parsed.fields && Array.isArray(parsed.fields)) {
        const lines = (parsed.fields as Array<{ name?: string; value?: string }>)
          .map((f) => `${f.name ?? ""}: ${f.value ?? ""}`)
        const summary = typeof parsed.summary === "string" ? parsed.summary : ""
        return {
          display: [...lines, summary].filter(Boolean).join("\n"),
          result: JSON.stringify(parsed),
        }
      }
      if (typeof parsed.summary === "string") {
        return { display: parsed.summary, result: JSON.stringify(parsed) }
      }
      return { display: JSON.stringify(parsed, null, 2), result: JSON.stringify(parsed) }
    } catch {
      return { display: raw, result: null }
    }
  }

  // Sync BE messages to local chat state
  useEffect(() => {
    if (!messagesQuery.data) return
    const mapped: ChatMessage[] = messagesQuery.data.map((msg: AiChatMessage) => {
      let displayContent = msg.content
      let result: string | null = null
      if (msg.role === "assistant") {
        const parsed = parseAiDisplayContent(msg.content)
        displayContent = parsed.display
        if (aiMode === "template") {
          result = parsed.result
        }
      }
      return {
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        displayContent,
        result,
        isLoading: false,
        inputTokens: msg.inputTokens,
        outputTokens: msg.outputTokens,
        totalTokens: msg.totalTokens,
        finishReason: msg.finishReason,
      }
    })
    setChatMessages(mapped)
  }, [messagesQuery.data, aiMode])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const attachmentExtractTextQuery = useAttachmentExtractTextQuery(
    messageId,
    attachmentViewMode === "extract" ? selectedAttachmentId : null
  )

  const attachmentContentQuery = useAttachmentContentQuery(
    messageId,
    attachmentViewMode === "content" ? selectedAttachmentId : null
  )

  const sendChatMessage = async (messageText?: string) => {
    const text = (messageText ?? chatInput).trim()
    if (!text) return

    if (selectedForAI.size === 0) {
      setPromptError("Vui lòng chọn ít nhất một file đính kèm trước khi chat.")
      return
    }

    if (aiMode === "template" && !selectedTemplate) {
      setPromptError("Vui lòng chọn template để bóc tách.")
      return
    }

    if (!conversationId) {
      setPromptError("Chưa có conversation. Vui lòng thử lại.")
      return
    }

    setPromptError(null)
    setChatInput("")

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    }
    setChatMessages((prev) => [...prev, userMsg])

    try {
      setExtractionPreview(null)

      // Link attachments to conversation
      const linkedAttachments = await Promise.all(
        Array.from(selectedForAI).map(async (attachmentId) => {
          const attachment = attachments.find((a) => a.id === attachmentId)
          if (!attachment) throw new Error(`Attachment ${attachmentId} not found`)

          const linked = await linkAttachmentMutation.mutateAsync({
            conversationId,
            payload: {
              source: "mailconnector",
              messageId,
              attachmentId,
              fileName: attachment.fileName,
              contentType: attachment.contentType,
              fileSize: attachment.fileSize,
              ...(tenantId ? { tenantId } : {}),
              createdBy: currentUser?.userId || "",
            },
          })
          return linked.id
        })
      )

      // Send message — assistant response will sync via messagesQuery refetch
      await sendMessageMutation.mutateAsync({
        conversationId,
        payload: {
          message: text,
          selectedAttachmentIds: linkedAttachments.filter(Boolean),
          provider: "openai",
          model: "deepseek/deepseek-v4-flash-20260423",
          responseFormat: aiMode === "template" ? "json" : "text",
          templateType: aiMode === "template" ? (selectedTemplate?.templateCode ?? null) : null,
          ...(tenantId ? { tenantId } : {}),
          createdBy: currentUser?.userId || "",
        },
      })

      // For template mode, set preview from first selected attachment
      if (aiMode === "template") {
        const firstAttachmentId = Array.from(selectedForAI)[0]
        const firstAttachment = attachments.find((a) => a.id === firstAttachmentId)

        if (firstAttachment) {
          const presignedResponse =
            await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl(
              messageId,
              firstAttachmentId,
              { expiryMinutes: 30 }
            )
          setExtractionPreview(resolvePresignedPreview(presignedResponse))
          setExtractionFileName(firstAttachment.fileName)
        }
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: getErrorMessage(error, "Gửi AI thất bại."),
        },
      ])
    }
  }

  const openExtractionDetail = (result: string) => {
    if (aiMode === "template") {
      try {
        const parsed = JSON.parse(result) as Record<string, unknown>
        const flat: Record<string, string> = {}
        for (const [key, value] of Object.entries(parsed)) {
          flat[key] = value === null || value === undefined ? "" : String(value)
        }
        setTemplateExtractedData(flat)
        setTemplateResultOpen(true)
      } catch {
        setExtractionResult(result)
        setExtractionResultOpen(true)
      }
    } else {
      setExtractionResult(result)
      setExtractionResultOpen(true)
    }
  }

  const handleTemplateDataChange = (data: Record<string, string>) => {
    setTemplateExtractedData(data)
  }

  const handleShowAttachmentExtractText = (attachmentId: string | undefined) => {
    if (!attachmentId) return
    setAttachmentViewMode("extract")
    setSelectedAttachmentId(attachmentId)
  }

  const handleShowAttachmentContent = async (
    attachmentId: string | undefined,
    fileName?: string,
    contentType?: string
  ) => {
    if (!attachmentId) return

    const isOfficeFile =
      contentType?.toLowerCase().includes("word") ||
      contentType?.toLowerCase().includes("excel") ||
      contentType?.toLowerCase().includes("powerpoint") ||
      contentType?.toLowerCase().includes("document") ||
      contentType?.toLowerCase().includes("sheet") ||
      contentType?.toLowerCase().includes("presentation")

    if (isOfficeFile) {
      try {
        const response = await MAIL_CONNECTOR_AXIOS.get(
          `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/presigned-url`
        )
        const data =
          response.data && typeof response.data === "object"
            ? (response.data as Record<string, unknown>)
            : null
        const nestedData =
          data?.data && typeof data.data === "object"
            ? (data.data as Record<string, unknown>)
            : null
        const nestedUrl = nestedData?.url
        const rootUrl = data?.url
        const presignedUrl =
          typeof nestedUrl === "string"
            ? nestedUrl
            : typeof rootUrl === "string"
              ? rootUrl
              : null
        if (presignedUrl) {
          const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(presignedUrl)}&embedded=true`
          setFileViewerUrl(googleDocsUrl)
          setFileViewerName(fileName || "")
          setFileViewerType(contentType || "")
          setFileViewerAttachmentId(attachmentId)
          setFileViewerOpen(true)
          return
        }
      } catch {
        console.log("Presigned URL failed for Office file, showing download message")
      }

      setFileViewerUrl("")
      setFileViewerName(fileName || "")
      setFileViewerType(contentType || "")
      setFileViewerAttachmentId(attachmentId)
      setFileViewerOpen(true)
      return
    }

    try {
      const downloadResponse = await MAIL_CONNECTOR_AXIOS.get(
        `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/download`,
        { responseType: "blob" }
      )
      const blob = new Blob([downloadResponse.data], {
        type: contentType || "application/octet-stream",
      })
      const objectUrl = URL.createObjectURL(blob)
      setFileViewerUrl(objectUrl)
      setFileViewerName(fileName || "")
      setFileViewerType(contentType || "")
      setFileViewerAttachmentId(attachmentId)
      setFileViewerOpen(true)
    } catch (error) {
      alert(getErrorMessage(error, "Không thể xem trước tệp."))
    }
  }

  const handleDownloadAttachment = async (
    attachmentId: string | undefined,
    fileName?: string | null
  ) => {
    if (!attachmentId) return
    try {
      await downloadAttachmentMutation.mutateAsync({ attachmentId, fileName })
    } catch (error) {
      alert(getErrorMessage(error, "Tải tệp thất bại."))
    }
  }

  if (messageQuery.isPending) {
    return (
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 text-sm text-neutral-400">
        Đang tải chi tiết email...
      </div>
    )
  }

  if (messageQuery.error || !messageQuery.data) {
    return (
      <div className="space-y-4">
        <Link
          href="/emails"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {getErrorMessage(messageQuery.error, "Không tải được chi tiết email.")}
        </div>
      </div>
    )
  }

  const shouldShowHtml = contentMode === "html" || (contentMode === "auto" && Boolean(htmlContent))

  return (
    <div className="flex h-[calc(100dvh-120px)] min-h-0 flex-col gap-4 overflow-hidden">
      <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start gap-3">
          <div className="space-y-1.5">
            <Link
              href="/emails"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500 hover:text-neutral-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại danh sách
            </Link>
            <h1 className="max-w-4xl text-lg font-semibold text-neutral-900 md:text-xl">
              {emailData?.subject || "(Không tiêu đề)"}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
              <span>{emailData?.fromName || emailData?.fromEmail || "N/A"}</span>
              <span className="hidden sm:inline">|</span>
              <span>
                {emailData?.receivedAt
                  ? dayjs(emailData.receivedAt).format("DD/MM/YYYY HH:mm")
                  : "--"}
              </span>
              {assignmentStatusQuery.isPending && (
                <span className="text-neutral-300">...</span>
              )}
              {assignedToUserId && !assignmentStatusQuery.isPending && (
                <>
                  <span className="hidden sm:inline">|</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                    Đang xử lý
                  </span>
                </>
              )}
              {!assignedToUserId && !assignmentStatusQuery.isPending && (
                <>
                  <span className="hidden sm:inline">|</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                    Chưa phân công
                  </span>
                </>
              )}
              {isAssignedToMe && assignmentStatus === "assigned" && (
                <button
                  onClick={() => confirmMutation.mutate({ messageId, payload: {} })}
                  disabled={confirmMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                >
                  {confirmMutation.isPending ? "..." : "Xác nhận"}
                </button>
              )}
              {isAssignedToMe && assignmentStatus === "confirmed" && (
                <button
                  onClick={() => completeMutation.mutate({ messageId, payload: {} })}
                  disabled={completeMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                >
                  {completeMutation.isPending ? "..." : "Hoàn thành"}
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => {
                    setSelectedReassignUserId(assignedToUserId ?? "")
                    setReassignModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 hover:bg-amber-100"
                >
                  Giao việc
                </button>
              )}
              {!isAssignedToMe && !assignedToUserId && !isAdmin && (
                <button
                  onClick={() => assignMutation.mutate({ messageId })}
                  disabled={assignMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary-100 disabled:opacity-50"
                >
                  {assignMutation.isPending ? "..." : "Nhận xử lý"}
                </button>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {canProcessMail && (
              <>
                <button
                  onClick={() => triggerPipelineMutation.mutate(messageId)}
                  disabled={triggerPipelineMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <Play className="h-3 w-3" />
                  {triggerPipelineMutation.isPending ? "..." : "Pipeline"}
                </button>
                <button
                  onClick={() => normalizeMailMutation.mutate(messageId)}
                  disabled={normalizeMailMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  {normalizeMailMutation.isPending ? "..." : "Normalize"}
                </button>
                <button
                  onClick={() => classifyMailMutation.mutate(messageId)}
                  disabled={classifyMailMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-50"
                >
                  <Tag className="h-3 w-3" />
                  {classifyMailMutation.isPending ? "..." : "Classify"}
                </button>
                <button
                  onClick={() => extractMailMutation.mutate(messageId)}
                  disabled={extractMailMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                >
                  <FileSearch className="h-3 w-3" />
                  {extractMailMutation.isPending ? "..." : "Extract"}
                </button>
              </>
            )}
            <Link
              href={`/emails/${messageId}/extract`}
              className="inline-flex items-center rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Trích xuất
            </Link>
          </div>
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-3 gap-4 overflow-hidden xl:grid-cols-[260px_minmax(0,1fr)_360px] xl:grid-rows-1">
        <aside className="flex min-h-0 flex-col rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <Paperclip className="h-3.5 w-3.5" />
              Tệp đính kèm
            </h2>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
              {attachments.length}
            </span>
          </div>

          {attachments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500">
              Không có tệp đính kèm.
            </p>
          ) : (
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {attachments.map((attachment) => (
                <FileAttachmentItem
                  key={attachment.id}
                  id={attachment.id}
                  fileName={attachment.fileName}
                  fileType={attachment.contentType?.split("/").pop() || "unknown"}
                  fileSize={attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : "N/A"}
                  isChecked={selectedForAI.has(attachment.id)}
                  onCheckChange={(checked) => {
                    const next = new Set(selectedForAI)
                    if (checked) next.add(attachment.id)
                    else next.delete(attachment.id)
                    setSelectedForAI(next)
                  }}
                  onViewExtract={() => handleShowAttachmentExtractText(attachment.id)}
                  onViewContent={() =>
                    handleShowAttachmentContent(
                      attachment.id,
                      attachment.fileName,
                      attachment.contentType
                    )
                  }
                  onDownload={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                  status="completed"
                />
              ))}
            </div>
          )}
        </aside>

        <section className="flex min-h-0 flex-col rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <div id="tour-email-body" className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-neutral-800">Nội dung email</h2>
              {htmlContent && (
                <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-1 text-[11px]">
                  <button
                    onClick={() => setContentMode("auto")}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      contentMode === "auto" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setContentMode("text")}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      contentMode === "text" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setContentMode("html")}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      contentMode === "html" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    HTML
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1">
              {shouldShowHtml ? (
                <iframe
                  title="email-html-content"
                  srcDoc={processedHtml || htmlContent}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                  className="h-full w-full rounded-xl border border-neutral-200 bg-white"
                />
              ) : (
                <div className="h-full overflow-y-auto whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  {bodyText || "Không có nội dung text."}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="bg-primary px-3 py-2.5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-white/15 p-1">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide">Trợ lý AI</p>
                  <p className="text-[11px] text-white/80">
                    {selectedForAI.size > 0
                      ? `${selectedForAI.size} file được chọn`
                      : "Chưa chọn file"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatMessages([])}
                className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
                title="Xóa hội thoại"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="border-b border-neutral-100 px-3 py-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAiMode("chat")
                  setPromptError(null)
                }}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                  aiMode === "chat" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiMode("template")
                  setPromptError(null)
                }}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                  aiMode === "template" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                }`}
                >
                  Template
                </button>

              {aiMode === "template" && (
                <div className="ml-auto flex min-w-0 items-center gap-2">
                  <select
                    value={selectedTemplateId}
                    onChange={(event) => {
                      setSelectedTemplateId(event.target.value)
                      setPromptError(null)
                    }}
                    disabled={templatesQuery.isPending}
                    className="max-w-[180px] rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-700 outline-none focus:border-primary"
                    title={templates.find((t) => t.id === selectedTemplateId)?.templateName ?? ""}
                  >
                    <option value="">-- Chọn template --</option>
                    {templates.map((template) => (
                      <option key={template.id || template.templateCode || "unknown"} value={template.id || ""}>
                        {[template.templateCode, template.templateName].filter(Boolean).join(" - ") || "Template"}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCreateTemplate((s) => !s)}
                    className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100"
                    title="Tạo template mới"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {aiMode === "template" && showCreateTemplate && (
              <div className="border-t border-neutral-100 bg-neutral-50/50 px-3 py-2 space-y-1.5">
                <p className="text-[11px] font-medium text-neutral-500">Tạo template mới</p>
                <input
                  type="text"
                  placeholder="Mã template"
                  value={newTemplateCode}
                  onChange={(e) => setNewTemplateCode(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-800 outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Tên template"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-800 outline-none focus:border-primary"
                />
                <textarea
                  placeholder='Expected fields JSON, ví dụ {"invoiceNumber":"Mã hóa đơn"}'
                  value={newTemplateFields}
                  onChange={(e) => setNewTemplateFields(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-neutral-200 px-2 py-1 font-mono text-[10px] text-neutral-800 outline-none focus:border-primary"
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTemplate(false)
                      setNewTemplateCode("")
                      setNewTemplateName("")
                      setNewTemplateFields("{}")
                    }}
                    className="rounded-md px-2 py-1 text-[11px] text-neutral-500 hover:bg-neutral-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={createTemplateMutation.isPending || !newTemplateCode.trim() || !newTemplateName.trim()}
                    onClick={async () => {
                      try {
                        let expectedFields: Record<string, string> = {}
                        try {
                          expectedFields = JSON.parse(newTemplateFields || "{}")
                          if (typeof expectedFields !== "object" || Array.isArray(expectedFields)) {
                            throw new Error("Expected fields phải là object JSON.")
                          }
                        } catch {
                          setPromptError("Expected fields JSON không hợp lệ.")
                          return
                        }
                        const result = await createTemplateMutation.mutateAsync({
                          templateCode: newTemplateCode.trim(),
                          templateName: newTemplateName.trim(),
                          expectedFields,
                        })
                        const createdId = (result as { id?: string | null })?.id || null
                        if (createdId) {
                          setSelectedTemplateId(createdId)
                        }
                        setShowCreateTemplate(false)
                        setNewTemplateCode("")
                        setNewTemplateName("")
                        setNewTemplateFields("{}")
                        setPromptError(null)
                        toast.success("Đã tạo template mới.")
                      } catch (err) {
                        setPromptError(getErrorMessage(err, "Tạo template thất bại."))
                      }
                    }}
                    className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-white hover:bg-primary-500 disabled:opacity-40"
                  >
                    {createTemplateMutation.isPending ? "Đang tạo..." : "Tạo"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-50/70 px-3 py-3 space-y-2">
            {chatMessages.length === 0 && (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 text-center">
                <Bot className="h-8 w-8 text-primary/40" />
                <p className="text-xs font-medium text-neutral-500">Chưa có hội thoại</p>
                <p className="max-w-[230px] text-[11px] text-neutral-400">
                  {selectedForAI.size === 0
                    ? "Hãy chọn ít nhất một file ở cột bên trái trước khi chat."
                    : `Đã chọn ${selectedForAI.size} file. Bạn có thể bắt đầu.`}
                </p>
              </div>
            )}

            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-1.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-xl px-2.5 py-1.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md border border-neutral-100 bg-white text-neutral-700"
                    }`}
                  >
                    {msg.isLoading ? (
                      <div className="flex items-center gap-1 py-0.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "300ms" }} />
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans">{msg.displayContent ?? msg.content}</pre>
                    )}
                  </div>

                  {msg.role === "assistant" && (msg.totalTokens || msg.inputTokens || msg.outputTokens) && (
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span>🪙 {msg.totalTokens ?? 0} tokens</span>
                      {msg.inputTokens !== null && msg.inputTokens !== undefined && (
                        <span>in: {msg.inputTokens}</span>
                      )}
                      {msg.outputTokens !== null && msg.outputTokens !== undefined && (
                        <span>out: {msg.outputTokens}</span>
                      )}
                      {msg.finishReason && (
                        <span>· {msg.finishReason}</span>
                      )}
                    </div>
                  )}

                  {msg.result && aiMode === "template" && (
                    <button
                      onClick={() => openExtractionDetail(String(msg.result))}
                      className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start gap-1.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="max-w-[82%]">
                  <div className="rounded-xl rounded-bl-md border border-neutral-100 bg-white px-2.5 py-1.5 text-xs leading-relaxed text-neutral-700">
                    <div className="flex items-center gap-1 py-0.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {promptError && (
            <p className="border-t border-red-100 bg-red-50 px-3 py-1 text-[11px] text-red-600">{promptError}</p>
          )}

          <div className="border-t border-neutral-100 bg-white px-3 py-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => {
                  setChatInput(event.target.value)
                  setPromptError(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void sendChatMessage()
                  }
                }}
                disabled={chatLoading}
                placeholder={aiMode === "chat" ? "Nhập yêu cầu..." : "Enter để bóc template"}
                className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 outline-none focus:border-primary focus:bg-white disabled:opacity-50"
              />
              <button
                onClick={() => {
                  void sendChatMessage()
                }}
                disabled={chatLoading || !chatInput.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      <AttachmentViewerModal
        open={!!selectedAttachmentId}
        onOpenChange={(open) => {
          if (!open) setSelectedAttachmentId(null)
        }}
        title={attachmentViewMode === "extract" ? "Text trích xuất từ tệp" : "Nội dung tệp"}
        isLoading={attachmentExtractTextQuery.isPending || attachmentContentQuery.isPending}
        error={(attachmentExtractTextQuery.error || attachmentContentQuery.error) as Error | null}
        content={
          attachmentViewMode === "extract"
            ? (attachmentExtractTextQuery.data ?? null)
            : (attachmentContentQuery.data ?? null)
        }
      />

      <FileViewerModal
        open={fileViewerOpen}
        onOpenChange={setFileViewerOpen}
        fileUrl={fileViewerUrl}
        fileName={fileViewerName}
        fileType={fileViewerType}
        downloadUrl={
          fileViewerAttachmentId
            ? `${API_BASE}/mail-messages/${messageId}/attachments/${fileViewerAttachmentId}/download`
            : undefined
        }
      />

      <ExtractionResultModal
        open={extractionResultOpen}
        onOpenChange={setExtractionResultOpen}
        result={extractionResult}
        preview={extractionPreview}
        fileName={extractionFileName}
      />

      <TemplateResultModal
        open={templateResultOpen}
        onOpenChange={setTemplateResultOpen}
        fields={selectedTemplate?.expectedFields ?? {}}
        data={templateExtractedData}
        onDataChange={handleTemplateDataChange}
        preview={extractionPreview as TemplatePreviewSources | null}
        fileName={extractionFileName}
      />

      {/* Admin Reassign Dialog */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-black">Giao việc xử lý mail</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-neutral-300">
              Chọn người dùng để giao việc xử lý email này.
            </p>
            <div className="max-h-[300px] space-y-1 overflow-y-auto">
              {usersQuery.isPending && (
                <p className="text-sm text-neutral-200">Đang tải danh sách...</p>
              )}
              {userList.map((item: unknown) => {
                const u = item as Record<string, unknown>
                const uid = String(u.id ?? "")
                return (
                  <button
                    key={uid}
                    onClick={() => setSelectedReassignUserId(uid)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      selectedReassignUserId === uid
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-neutral-100 text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      selectedReassignUserId === uid
                        ? "border-primary bg-primary"
                        : "border-neutral-300"
                    }`}>
                      {selectedReassignUserId === uid && (
                        <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{String(u.fullName ?? u.email ?? "—")}</p>
                      <p className="text-xs text-neutral-200">{String(u.email ?? "")}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setReassignModalOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={() => {
                  if (!selectedReassignUserId) return
                  reassignMutation.mutate(
                    {
                      messageId,
                      payload: { toUserId: selectedReassignUserId },
                    },
                    {
                      onSuccess: () => {
                        toast.success("Đã giao việc thành công.")
                        setReassignModalOpen(false)
                      },
                    }
                  )
                }}
                disabled={!selectedReassignUserId || reassignMutation.isPending}
              >
                {reassignMutation.isPending ? "..." : "Xác nhận giao"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

```

---

## File: `app\(app)\employees\page.tsx`

```tsx
import { redirect } from "next/navigation"

export default function EmployeesPage() {
  redirect("/employees/me")
}

```

---

## File: `app\(app)\employees\[employeeId]\page.tsx`

```tsx
"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Mail, Clock, CheckCircle, AlertTriangle, ArrowRight, TrendingUp, Package, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import dayjs from "dayjs"

const myStats = [
  { label: "Email được giao", value: 12, icon: Mail, color: "text-primary", bg: "bg-primary-50" },
  { label: "Đang xử lý", value: 3, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Đã hoàn tất", value: 8, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  { label: "Cần chú ý", value: 1, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
]

const myTasks = [
  { id: "1", subject: "Invoice #INV-001 - ABC Logistics", fromName: "ABC Logistics", deadline: "2026-05-23T17:00:00Z", priority: "high", status: "unprocessed" },
  { id: "3", subject: "Freight quote request", fromName: "Global Freight", deadline: "2026-05-23T12:00:00Z", priority: "medium", status: "processing" },
  { id: "6", subject: "Customs declaration #CD-1122", fromName: "Customs Dept", deadline: "2026-05-24T09:00:00Z", priority: "high", status: "unprocessed" },
  { id: "8", subject: "Warehouse inbound notice", fromName: "Saigon Depot", deadline: "2026-05-24T15:00:00Z", priority: "low", status: "processing" },
  { id: "10", subject: "Container release order", fromName: "Hapag-Lloyd", deadline: "2026-05-25T10:00:00Z", priority: "medium", status: "unprocessed" },
  { id: "14", subject: "Delivery delay notice", fromName: "FedEx Logistics", deadline: "2026-05-25T08:00:00Z", priority: "high", status: "unprocessed" },
]

const weeklyProgress = [
  { day: "T2", completed: 3, assigned: 4 },
  { day: "T3", completed: 5, assigned: 5 },
  { day: "T4", completed: 2, assigned: 3 },
  { day: "T5", completed: 4, assigned: 6 },
  { day: "T6", completed: 6, assigned: 6 },
  { day: "T7", completed: 1, assigned: 2 },
  { day: "CN", completed: 0, assigned: 1 },
]

export default function NhanVienPage() {
  const params = useParams<{ employeeId: string }>()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-300 tracking-tight">Khu vực Nhân viên</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            ID: {params.employeeId}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {dayjs().format("DD/MM/YYYY")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {myStats.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">{card.label}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-300">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card id="tour-staff-tasks">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Công việc của tôi
                </CardTitle>
                <CardDescription>Danh sách email được giao xử lý</CardDescription>
              </div>
              <Link href="/emails">
                <Badge variant="outline" className="hover:bg-neutral-50 cursor-pointer">
                  Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-neutral-300 text-sm">{task.subject}</p>
                      {task.priority === "high" && (
                        <Badge variant="destructive" className="text-[10px] h-5">Cao</Badge>
                      )}
                      {task.priority === "medium" && (
                        <Badge variant="outline" className="text-[10px] h-5 text-amber-600 border-amber-200 bg-amber-50">TB</Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-200 mt-1">{task.fromName} · Hạn: {dayjs(task.deadline).format("DD/MM HH:mm")}</p>
                  </div>
                  <div className="ml-3 shrink-0">
                    {task.status === "unprocessed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <Clock className="h-3 w-3" /> Chờ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                        <TrendingUp className="h-3 w-3" /> Đang xử lý
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tiến độ tuần này
            </CardTitle>
            <CardDescription>Số công việc hoàn thành / được giao</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyProgress.map((w) => {
                const pct = w.assigned > 0 ? (w.completed / w.assigned) * 100 : 0
                return (
                  <div key={w.day} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-medium text-neutral-300">{w.day}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-neutral-200">{w.completed}/{w.assigned}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-primary-50 p-3">
              <span className="text-sm font-medium text-primary">Tỷ lệ hoàn thành</span>
              <span className="text-lg font-bold text-primary">
                {Math.round((weeklyProgress.reduce((a, b) => a + b.completed, 0) / weeklyProgress.reduce((a, b) => a + b.assigned, 0)) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\layout.tsx`

```tsx
"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  type LucideIcon,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileCode,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Settings as SettingsIcon,
  Shield,
  User,
  Users,
  ClipboardList,
  Inbox,
  Webhook,
  ClipboardCheck,
  Monitor,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/stores/auth-store"
import { usePermissions } from "@/hooks/use-permission"
import TourButton from "@/components/tour-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster } from "sonner"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  permission?: string
}

const getBreadcrumbItems = (pathname: string) => {
  if (pathname === "/") return [{ label: "Dashboard", href: "/" }]

  if (pathname.startsWith("/analysis-results")) {
    return [{ label: "Kết quả AI", href: "/analysis-results" }]
  }

  // if (pathname.startsWith("/webhooks")) {
  //   return [{ label: "Webhooks", href: "/webhooks" }]
  // }

  if (pathname.startsWith("/mail-accounts")) {
    return [{ label: "Tài khoản Email", href: "/mail-accounts" }]
  }

  if (pathname.startsWith("/emails")) {
    if (pathname === "/emails") return [{ label: "Email", href: "/emails" }]
    if (pathname.includes("/extract")) {
      return [
        { label: "Email", href: "/emails" },
        { label: "Chi tiết", href: "#" },
        { label: "Trích xuất", href: "#" },
      ]
    }

    return [
      { label: "Email", href: "/emails" },
      { label: "Chi tiết", href: "#" },
    ]
  }

  if (pathname.startsWith("/reports")) {
    if (pathname === "/reports") return [{ label: "Báo cáo", href: "/reports" }]
    if (pathname.includes("/import")) {
      return [
        { label: "Báo cáo", href: "/reports" },
        { label: "Import", href: "#" },
      ]
    }

    return [{ label: "Báo cáo", href: "/reports" }]
  }

  if (pathname.startsWith("/user")) {
    return [{ label: "Tài khoản", href: "/user" }]
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin") {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Admin Tổng", href: "#" },
      ]
    }
    if (pathname.includes("/users")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Tài khoản", href: "#" },
      ]
    }
    if (pathname.includes("/settings")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Cấu hình", href: "#" },
      ]
    }
    if (pathname.includes("/logs")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Logs", href: "#" },
      ]
    }
    if (pathname.includes("/templates")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Templates", href: "#" },
      ]
    }
    if (pathname.includes("/permissions")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Quyền hạn", href: "#" },
      ]
    }
    if (pathname.includes("/roles")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Vai trò", href: "#" },
      ]
    }
    if (pathname.includes("/assignments")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Phân công", href: "#" },
      ]
    }
    if (pathname.includes("/ai-usage")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "AI Usage", href: "#" },
      ]
    }
    return [{ label: "Quản trị", href: "#" }]
  }

  if (pathname.startsWith("/employees")) {
    const employeeId = pathname.split("/")[2]
    if (employeeId) {
      return [
        { label: "Nhân viên", href: "/employees" },
        { label: employeeId, href: "#" },
      ]
    }

    return [{ label: "Nhân viên", href: "/employees" }]
  }

  return [{ label: "Trang chủ", href: "/" }]
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [mounted, setMounted] = useState(false)
  const breadcrumbItems = getBreadcrumbItems(pathname)
  const { logout } = useAuth()
  const authUser = useAuthStore((s) => s.user)
  const isAdmin = useAuthStore((s) => s.isAdmin)()
  const { codes: apiPermissionCodes } = usePermissions([])

  const userPermissions = apiPermissionCodes.length > 0
    ? apiPermissionCodes
    : (authUser?.permissions ?? [])

  const baseNavItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/mail-accounts", label: "Tài khoản Email", icon: Inbox, permission: "mail.read" },
    { href: "/analysis-results", label: "Kết quả AI", icon: ClipboardList, permission: "mail.read" },
    { href: "/templates", label: "Templates", icon: FileCode },
    { href: "/reports", label: "Báo cáo", icon: BarChart3, permission: "report.view" },
    { href: "/sessions", label: "Quản lý phiên", icon: Monitor },
  ]

  const navItems: NavItem[] = [
    ...baseNavItems.slice(0, 2),
    { href: "/emails", label: "Email", icon: Mail, permission: "mail.read" },
    ...baseNavItems.slice(2),
  ]

  const adminItems: NavItem[] = [
    { href: "/admin", label: "Admin Tổng", icon: Shield },
    { href: "/admin/users", label: "Tài khoản", icon: Users },
    { href: "/admin/permissions", label: "Quyền hạn", icon: Shield },
    { href: "/admin/roles", label: "Vai trò", icon: User },
    { href: "/admin/assignments", label: "Phân công", icon: ClipboardCheck },
    { href: "/admin/ai-usage", label: "AI Usage", icon: BarChart3 },
    { href: "/admin/settings", label: "Cấu hình", icon: Settings },
    { href: "/admin/logs", label: "Logs", icon: FileText },
    { href: "/admin/templates", label: "Templates", icon: FileCode },
  ]

  useEffect(() => {
    setMounted(true)
    setHasHydrated(useAuthStore.persist.hasHydrated())
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    return unsubscribe
  }, [])

  // Redirect non-admin users away from admin routes
  useEffect(() => {
    if (!hasHydrated) return
    if (!isAdmin && pathname.startsWith("/admin")) {
      router.replace("/login")
    }
  }, [hasHydrated, isAdmin, pathname, router])

  const handleLogout = () => {
    logout()
  }

  const [navMounted, setNavMounted] = useState(false)
  useEffect(() => {
    setNavMounted(true)
  }, [])

  const renderNavItem = (item: NavItem) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/")
    const linkContent = (
      <>
        {active && (
          <span
            aria-hidden
            className={cn(
              "absolute left-0 top-2 bottom-2 w-px bg-white",
              collapsed && "left-1/2 top-auto bottom-1 h-px w-6 -translate-x-1/2"
            )}
          />
        )}
        <item.icon
          className={cn(
            "h-5 w-5 shrink-0",
            active ? "text-white" : "text-neutral-100 group-hover:text-white"
          )}
        />
        {!collapsed && <span>{item.label}</span>}
      </>
    )

    const linkClass = cn(
      "group relative flex min-h-11 items-center gap-3 rounded-[10px] border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
      collapsed && "justify-center px-0",
      active
        ? "z-30 border-white/10 bg-white/10 text-white"
        : "text-neutral-100 hover:bg-white/10 hover:text-white"
    )

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      router.push(item.href)
    }

    const navItem = (
      <a
        key={item.href}
        href={item.href}
        {...(navMounted ? { onClick: handleNavClick } : {})}
        className={linkClass}
      >
        {linkContent}
      </a>
    )

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{navItem}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return navItem
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-neutral-50 p-4">
        <div className="flex h-[calc(100vh-2rem)] overflow-hidden">
          <aside
            id="tour-sidebar"
            className={cn(
              "relative z-20 flex h-full max-h-[920px] flex-col rounded-[12px] border border-neutral-200/10 bg-primary transition-all duration-300",
              collapsed ? "w-16" : "w-64"
            )}
          >
            <div className="relative flex h-16 items-center gap-3 border-b border-neutral-200/10 px-4 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-neutral-200/10 bg-white/10">
                <Mail className="h-5 w-5 shrink-0 text-white" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="block truncate text-lg font-semibold tracking-tight text-white">Logistics</span>
                  <span className="block text-xs uppercase tracking-[0.18em] text-neutral-100">Operations Desk</span>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              <nav className="space-y-1.5 p-3">
                {navItems.map((item) => {
                  if (!navMounted) {
                    return <a key={item.href} href={item.href} className="hidden" />
                  }
                  const hidden = isAdmin && item.label === "Email"
                  const noPermission = item.permission && !userPermissions.includes(item.permission) && !isAdmin
                  if (hidden || noPermission) {
                    return <a key={item.href} href={item.href} className="hidden" />
                  }
                  return renderNavItem(item)
                })}

                {mounted && hasHydrated && isAdmin && (
                  <>
                    {!collapsed && (
                      <div className="px-3 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-100">
                        Quản trị
                      </div>
                    )}
                    {collapsed && <Separator className="my-3 bg-neutral-200/20" />}
                    {adminItems.map(renderNavItem)}
                  </>
                )}
              </nav>
            </ScrollArea>

            <div className="space-y-1 border-t border-neutral-200/10 p-3 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-neutral-100 transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    {!collapsed && "Thu gọn"}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{collapsed ? "Mở rộng" : "Thu gọn"}</p>
                </TooltipContent>
              </Tooltip>

            </div>
          </aside>

          <div className="relative z-10 ml-4 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-neutral-100 bg-white">
            <header className="relative flex h-16 shrink-0 items-center justify-between bg-white border-b border-neutral-100 px-6">
              <Breadcrumb>
                <BreadcrumbList className="text-neutral-200">
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={`${item.href}-${item.label}`}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {index === breadcrumbItems.length - 1 ? (
                          <BreadcrumbPage className="text-neutral-300 font-medium">{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.href} className="hover:text-neutral-300 transition-colors cursor-pointer">{item.label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative rounded-full bg-neutral-50 p-2.5 transition-colors hover:bg-neutral-100 cursor-pointer">
                      <Bell className="h-5 w-5 text-neutral-300" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-white">
                        3
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md focus:bg-neutral-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-300">Email mới từ ABC Logistics</p>
                        <p className="text-[11px] text-neutral-200 truncate">Invoice #INV-001 đã được nhận</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-neutral-200">2p</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md focus:bg-neutral-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-300">Import thành công</p>
                        <p className="text-[11px] text-neutral-200 truncate">25 bản ghi đã được import</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-neutral-200">1h</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md focus:bg-neutral-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-300">Cảnh báo hệ thống</p>
                        <p className="text-[11px] text-neutral-200 truncate">Tỷ lệ xử lý giảm dưới 90%</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-neutral-200">3h</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                      Xem tất cả thông báo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 rounded-full border border-neutral-100 bg-white px-2 py-1.5 transition-colors hover:bg-neutral-50 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-50 text-primary text-xs font-semibold">
                          {authUser?.fullName
                            ? authUser.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden text-left sm:block pr-1">
                        <p className="text-sm font-medium text-neutral-300">{authUser?.fullName || "User"}</p>
                        <p className="text-[11px] text-neutral-200">{authUser?.email || ""}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/user" className="flex cursor-pointer items-center">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <span>Hồ sơ</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/sessions" className="flex cursor-pointer items-center">
                        <Monitor className="mr-2 h-4 w-4 text-primary" />
                        <span>Quản lý phiên</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings" className="flex cursor-pointer items-center">
                          <SettingsIcon className="mr-2 h-4 w-4 text-primary" />
                          <span>Cài đặt hệ thống</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-accent cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="relative flex-1 overflow-auto px-8 py-7">
              <div key={pathname} className="route-shell-reveal relative">
                {children}
              </div>
            </main>
          </div>

          <TourButton />
          <Toaster
            position="top-right"
            toastOptions={{
              className: "text-sm",
            }}
            richColors
          />
        </div>
      </div>
    </TooltipProvider>
  )
}



```

---

## File: `app\(app)\mail-accounts\page.tsx`

```tsx
"use client"
// USER ROUTE: Quản lý tài khoản email — user quản lý kết nối tài khoản mail

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Inbox,
  Link2,
  Loader,
  PauseCircle,
  Play,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react"
import dayjs from "dayjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getErrorMessage } from "@/lib/get-error-message"
import { toast } from "sonner"
import {
  useMailAccountsQuery,
  useDeleteMailAccountMutation,
  useOAuthUrlMutation,
  useSyncStatusQuery,
  useTriggerSyncMutation,
  useTriggerSyncDirectMutation,
} from "@/hooks/use-mail-queries"

type MailAccountItem = {
  id?: string | null
  provider?: string | null
  emailAddress?: string | null
  displayName?: string | null
  status?: string | null
  lastSyncedAt?: string | null
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = (status || "").toLowerCase()
  switch (normalized) {
    case "connected":
    case "active":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
          <CheckCircle className="mr-1 h-3 w-3" /> Đã kết nối
        </Badge>
      )
    case "authrequired":
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
          <AlertCircle className="mr-1 h-3 w-3" /> Cần xác thực
        </Badge>
      )
    case "syncing":
      return (
        <Badge className="bg-primary-50 text-primary hover:bg-primary-50">
          <Loader className="mr-1 h-3 w-3 animate-spin" /> Đang đồng bộ
        </Badge>
      )
    case "paused":
      return (
        <Badge className="bg-neutral-100 text-neutral-400 hover:bg-neutral-100">
          <PauseCircle className="mr-1 h-3 w-3" /> Tạm dừng
        </Badge>
      )
    case "disconnected":
      return (
        <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-50">
          <XCircle className="mr-1 h-3 w-3" /> Ngắt kết nối
        </Badge>
      )
    case "error":
      return (
        <Badge className="bg-red-50 text-red-700 hover:bg-red-50">
          <XCircle className="mr-1 h-3 w-3" /> Lỗi
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-neutral-400">
          {status || "Không rõ"}
        </Badge>
      )
  }
}

function MailAccountsContent() {
  const router = useRouter()

  const { data: accountsData = [], isPending: accountsPending } = useMailAccountsQuery()
  const accounts: MailAccountItem[] = accountsData as MailAccountItem[]
  const oauthMutation = useOAuthUrlMutation()
  const deleteMutation = useDeleteMailAccountMutation()

  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null)
  const triggerSync = useTriggerSyncMutation(syncingAccountId)
  const triggerSyncDirect = useTriggerSyncDirectMutation(syncingAccountId)
  const syncStatus = useSyncStatusQuery(syncingAccountId)

  const handleConnect = async () => {
    try {
      // BE callback - BE sẽ xử lý toàn bộ OAuth
      const redirectUri = "https://vietprodev.duckdns.org/gateway/mail-connector/oauth/callback"
      const randomState = Math.random().toString(36).substring(2)
      const response = await oauthMutation.mutateAsync({ redirectUri, state: randomState })
      const authUrl = (response as { authUrl?: string })?.authUrl
      if (authUrl) {
        window.location.href = authUrl
      } else {
        toast.error("Không nhận được URL xác thực từ server.")
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể bắt đầu xác thực OAuth."))
    }
  }

  const handleSync = (accountId: string) => {
    setSyncingAccountId(accountId)
    triggerSync.mutate(undefined, {
      onError: (err) => toast.error(getErrorMessage(err, "Kích hoạt đồng bộ thất bại.")),
    })
  }

  const handleDirectSync = (accountId: string) => {
    setSyncingAccountId(accountId)
    triggerSyncDirect.mutate(undefined, {
      onSuccess: () => toast.success("Đồng bộ trực tiếp thành công."),
      onError: (err) => toast.error(getErrorMessage(err, "Đồng bộ trực tiếp thất bại.")),
    })
  }

  const handleDelete = (accountId: string) => {
    if (!window.confirm("Xóa tài khoản email này? Hành động không thể hoàn tác.")) return
    deleteMutation.mutate(accountId, {
      onError: (err) => toast.error(getErrorMessage(err, "Xóa tài khoản thất bại.")),
    })
  }

  const isSyncing =
    syncingAccountId &&
    (syncStatus.data?.status || "").toLowerCase() === "syncing"

  const progress = syncStatus.data
    ? Math.round(
        ((syncStatus.data.syncedMessages || 0) / (syncStatus.data.totalMessages || 1)) * 100
      )
    : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Tài khoản Email</h1>
        <button
          onClick={handleConnect}
          disabled={oauthMutation.isPending}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Link2 className="h-4 w-4" />
          {oauthMutation.isPending ? "Đang xử lý..." : "Kết nối Gmail"}
        </button>
      </div>

      {isSyncing && syncStatus.data && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary animate-spin" />
              Đang đồng bộ: {syncStatus.data.currentFolder || "INBOX"}
            </CardTitle>
            <CardDescription>
              {syncStatus.data.syncedMessages} / {syncStatus.data.totalMessages} tin nhắn
              {syncStatus.data.failedMessages ? ` · Lỗi: ${syncStatus.data.failedMessages}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded-full bg-neutral-100">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-neutral-200">{progress}%</p>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Email</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Nhà cung cấp</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Đồng bộ lần cuối</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {accountsPending && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải tài khoản...</p>
                  </td>
                </tr>
              )}

              {!accountsPending && accounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    <Inbox className="mx-auto h-8 w-8 text-neutral-100" />
                    <p className="mt-2 text-sm">Chưa có tài khoản email nào.</p>
                    <button
                      onClick={handleConnect}
                      className="mt-2 cursor-pointer text-sm text-primary hover:underline"
                    >
                      Kết nối tài khoản mới
                    </button>
                  </td>
                </tr>
              )}

              {accounts.map((account) => (
                <tr key={account.id} className="cursor-pointer hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-neutral-300">{account.emailAddress || "N/A"}</p>
                      {account.displayName && (
                        <p className="text-xs text-neutral-200">{account.displayName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-200 capitalize">
                    {account.provider || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={account.status ?? undefined} />
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {account.lastSyncedAt ? (
                      dayjs(account.lastSyncedAt).format("DD/MM/YYYY HH:mm")
                    ) : (
                      <span className="text-neutral-100">Chưa đồng bộ</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => account.id && handleSync(account.id)}
                        disabled={triggerSync.isPending || triggerSyncDirect.isPending || deleteMutation.isPending}
                        title="Đồng bộ"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => account.id && handleDirectSync(account.id)}
                        disabled={triggerSync.isPending || triggerSyncDirect.isPending || deleteMutation.isPending}
                        title="Đồng bộ trực tiếp"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={triggerSyncDirect.isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                      </button>
                      <button
                        onClick={() => account.id && handleDelete(account.id)}
                        disabled={deleteMutation.isPending}
                        title="Xóa"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function MailAccountsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-neutral-200">Đang tải...</div>}>
      <MailAccountsContent />
    </Suspense>
  )
}

```

---

## File: `app\(app)\mail-templates\page.tsx`

```tsx
"use client"

import { useState } from "react"
import { getErrorMessage } from "@/lib/get-error-message"
import { toast } from "sonner"
import {
  useEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
} from "@/hooks/use-mail-queries"
import {
  Plus,
  Save,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  LayoutTemplate,
} from "lucide-react"

type TemplateFormState = {
  templateCode: string
  templateName: string
  description: string
  subjectPattern: string
  bodyPattern: string
  expectedFields: string
  documentTypes: string
  isActive: boolean
}

const emptyForm: TemplateFormState = {
  templateCode: "",
  templateName: "",
  description: "",
  subjectPattern: "",
  bodyPattern: "",
  expectedFields: "",
  documentTypes: "",
  isActive: true,
}

export default function MailTemplatesPage() {
  const templatesQuery = useEmailTemplatesQuery()
  const createMutation = useCreateEmailTemplateMutation()
  const deleteMutation = useDeleteEmailTemplateMutation()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<TemplateFormState>(emptyForm)

  const updateMutation = useUpdateEmailTemplateMutation(editingId)

  const templates = templatesQuery.data ?? []
  const isSaving = createMutation.isPending || updateMutation.isPending

  const resetForm = () => {
    setEditingId(null)
    setFormState(emptyForm)
  }

  const handleSubmit = async () => {
    try {
      const documentTypes = formState.documentTypes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      let expectedFields: Record<string, string> | undefined
      if (formState.expectedFields.trim()) {
        try {
          expectedFields = JSON.parse(formState.expectedFields)
        } catch {
          toast.error("Expected fields phải là JSON hợp lệ.")
          return
        }
      }

      if (editingId) {
        await updateMutation.mutateAsync({
          templateName: formState.templateName || null,
          description: formState.description || null,
          subjectPattern: formState.subjectPattern || null,
          bodyPattern: formState.bodyPattern || null,
          expectedFields: expectedFields || null,
          documentTypes: documentTypes.length ? documentTypes : null,
          isActive: formState.isActive,
        })
        toast.success("Đã cập nhật template.")
      } else {
        await createMutation.mutateAsync({
          templateCode: formState.templateCode || null,
          templateName: formState.templateName || null,
          description: formState.description || null,
          subjectPattern: formState.subjectPattern || null,
          bodyPattern: formState.bodyPattern || null,
          expectedFields: expectedFields || null,
          documentTypes: documentTypes.length ? documentTypes : null,
        })
        toast.success("Đã tạo template mới.")
      }
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không lưu được template."))
    }
  }

  const handleEdit = (template: Record<string, unknown>) => {
    setEditingId(String(template.id ?? ""))
    setFormState({
      templateCode: String(template.templateCode ?? ""),
      templateName: String(template.templateName ?? ""),
      description: String(template.description ?? ""),
      subjectPattern: String(template.subjectPattern ?? ""),
      bodyPattern: String(template.bodyPattern ?? ""),
      expectedFields:
        template.expectedFields && typeof template.expectedFields === "object"
          ? JSON.stringify(template.expectedFields, null, 2)
          : "",
      documentTypes: Array.isArray(template.documentTypes)
        ? template.documentTypes.join(", ")
        : "",
      isActive: Boolean(template.isActive ?? true),
    })
  }

  const handleDelete = async (templateId: string) => {
    const confirmed = window.confirm("Xóa template này?")
    if (!confirmed) return
    try {
      await deleteMutation.mutateAsync(templateId)
      if (editingId === templateId) {
        resetForm()
      }
      toast.success("Đã xóa template.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa template thất bại."))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Email Templates</h1>
      </div>

      {templatesQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(templatesQuery.error, "Không tải được templates.")}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4 rounded-xl border border-neutral-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-300">
              {editingId ? "Cập nhật template" : "Tạo template"}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Template code (VD: invoice_template)"
              value={formState.templateCode}
              onChange={(event) =>
                setFormState((state) => ({ ...state, templateCode: event.target.value }))
              }
              disabled={Boolean(editingId)}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50"
            />
            <input
              type="text"
              placeholder="Template name"
              value={formState.templateName}
              onChange={(event) =>
                setFormState((state) => ({ ...state, templateName: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Mô tả"
              value={formState.description}
              onChange={(event) =>
                setFormState((state) => ({ ...state, description: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Subject pattern (regex)"
              value={formState.subjectPattern}
              onChange={(event) =>
                setFormState((state) => ({ ...state, subjectPattern: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Body pattern (regex)"
              value={formState.bodyPattern}
              onChange={(event) =>
                setFormState((state) => ({ ...state, bodyPattern: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Expected fields (JSON) VD: {&quot;invoiceNumber&quot;: &quot;Số hóa đơn&quot;}"
              value={formState.expectedFields}
              onChange={(event) =>
                setFormState((state) => ({ ...state, expectedFields: event.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Document types (csv) VD: pdf,docx"
              value={formState.documentTypes}
              onChange={(event) =>
                setFormState((state) => ({ ...state, documentTypes: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <label className="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, isActive: event.target.checked }))
                }
                disabled={!editingId}
              />
              Kích hoạt
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSaving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-neutral-300">Danh sách template</h2>
          {templatesQuery.isPending && (
            <p className="text-sm text-neutral-200">Đang tải...</p>
          )}
          {!templatesQuery.isPending && templates.length === 0 && (
            <p className="text-sm text-neutral-200">Chưa có template nào.</p>
          )}

          <div className="space-y-2">
            {templates.map((template: Record<string, unknown>) => {
              const id = String(template.id ?? "")
              const isActive = Boolean(template.isActive ?? false)
              return (
                <div
                  key={id}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-neutral-300">
                        {String(template.templateName || "—")}
                      </p>
                      <span className="text-xs text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {String(template.templateCode || "—")}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-200 mt-1">
                      {String(template.description || "—")}
                    </p>
                    <p className="text-xs text-neutral-200 mt-1">
                      Subject: {String(template.subjectPattern || "—")} · Body:{" "}
                      {String(template.bodyPattern || "—")}
                    </p>
                    <p className="text-xs text-neutral-200 mt-1">
                      Document types:{" "}
                      {Array.isArray(template.documentTypes)
                        ? template.documentTypes.join(", ")
                        : "—"}
                      {" · "}
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-neutral-300">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-3 w-3" /> Xóa
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\page.tsx`

```tsx
"use client"
// USER ROUTE: Dashboard chính — user/admin đều xem

import { useState } from "react"
import Link from "next/link"
import { Mail, CheckCircle, AlertTriangle, Clock, ArrowRight, TrendingUp, Package, DollarSign, BarChart3 } from "lucide-react"
import dayjs from "dayjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const stats = [
  { label: "Tổng email", value: 124, icon: Mail, color: "text-primary", bg: "bg-primary-50", change: "+12%" },
  { label: "Chờ xử lý", value: 18, icon: Clock, color: "text-amber-600", bg: "bg-[#FBF3DB]", change: "-5%" },
  { label: "Đã hoàn tất", value: 98, icon: CheckCircle, color: "text-green-600", bg: "bg-[#EDF3EC]", change: "+18%" },
  { label: "Lỗi / Từ chối", value: 8, icon: AlertTriangle, color: "text-red-600", bg: "bg-[#FDEBEC]", change: "-2%" },
]

const recentEmails = [
  { id: "1", subject: "Invoice #INV-001 - ABC Logistics", fromEmail: "billing@abclogistics.com", receivedAt: "2026-05-22T09:30:00Z", processStatus: "unprocessed" },
  { id: "2", subject: "Shipping confirmation XYZ-2026", fromEmail: "ops@xyzshipping.com", receivedAt: "2026-05-22T08:15:00Z", processStatus: "processed" },
  { id: "3", subject: "Freight quote request", fromEmail: "sales@globalfreight.com", receivedAt: "2026-05-21T16:45:00Z", processStatus: "unprocessed" },
  { id: "4", subject: "Cargo manifest - Voyage 4521", fromEmail: "manifest@ocean cargo.com", receivedAt: "2026-05-21T14:20:00Z", processStatus: "processed" },
  { id: "5", subject: "Delivery receipt #DR-8821", fromEmail: "receipts@fast delivery.com", receivedAt: "2026-05-21T11:00:00Z", processStatus: "processed" },
]

const emailTrendData = [
  { name: "T2", processed: 12, pending: 5, error: 1 },
  { name: "T3", processed: 18, pending: 8, error: 2 },
  { name: "T4", processed: 15, pending: 6, error: 0 },
  { name: "T5", processed: 22, pending: 4, error: 1 },
  { name: "T6", processed: 25, pending: 7, error: 3 },
  { name: "T7", processed: 20, pending: 5, error: 1 },
  { name: "CN", processed: 8, pending: 2, error: 0 },
]

const statusDistribution = [
  { name: "Đã xử lý", value: 98, color: "#22c55e" },
  { name: "Chờ xử lý", value: 18, color: "#3b82f6" },
  { name: "Lỗi", value: 8, color: "#ef4444" },
]

const topSenders = [
  { name: "ABC Logistics", count: 24, amount: "125M" },
  { name: "XYZ Shipping", count: 18, amount: "87M" },
  { name: "Global Freight", count: 15, amount: "152M" },
  { name: "Ocean Cargo", count: 12, amount: "45M" },
  { name: "Fast Delivery", count: 10, amount: "32M" },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-300 tracking-tight">Dashboard</h1>
        <Badge variant="secondary" className="text-sm">
          Cập nhật: {dayjs().format("DD/MM/YYYY HH:mm")}
        </Badge>
      </div>

      <div id="tour-dashboard-stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">{card.label}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-neutral-300">{card.value}</div>
                <Badge variant={card.change.startsWith("+") ? "success" : "warning"} className="text-xs">
                  {card.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Xu hướng xử lý email
            </CardTitle>
            <CardDescription>Số lượng email theo trạng thái trong 7 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emailTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="processed" stroke="#22c55e" strokeWidth={2} name="Đã xử lý" />
                <Line type="monotone" dataKey="pending" stroke="#3b82f6" strokeWidth={2} name="Chờ xử lý" />
                <Line type="monotone" dataKey="error" stroke="#ef4444" strokeWidth={2} name="Lỗi" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Phân bố trạng thái
            </CardTitle>
            <CardDescription>Tỷ lệ email theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-200">{item.name}</span>
                  </div>
                  <span className="font-medium text-neutral-300">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top người gửi
            </CardTitle>
            <CardDescription>5 người gửi email nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topSenders} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card id="tour-dashboard-recent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email gần đây
                </CardTitle>
                <CardDescription>5 email mới nhất</CardDescription>
              </div>
              <Link href="/emails">
                <Badge variant="outline" className="hover:bg-neutral-50 cursor-pointer">
                  Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-300 text-sm">{email.subject}</p>
                    <p className="text-xs text-neutral-200 mt-1">{email.fromEmail}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs text-neutral-200">{dayjs(email.receivedAt).format("HH:mm")}</span>
                    <Badge variant={email.processStatus === "processed" ? "success" : "warning"} className="text-xs">
                      {email.processStatus === "processed" ? "Đã xử lý" : "Chờ xử lý"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan hệ thống</CardTitle>
              <CardDescription>Thống kê chi tiết về hoạt động hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary-50 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Tổng giá trị</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-300">364.5M VND</p>
                  <p className="text-xs text-neutral-200 mt-1">+15% so với tháng trước</p>
                </div>
                <div className="p-4 rounded-lg bg-[#EDF3EC] border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-[#346538]" />
                    <span className="text-sm font-medium text-[#346538]">Tỷ lệ thành công</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-300">94.2%</p>
                  <p className="text-xs text-neutral-200 mt-1">+2.3% so với tháng trước</p>
                </div>
                <div className="p-4 rounded-lg bg-[#FBF3DB] border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[#956400]" />
                    <span className="text-sm font-medium text-[#956400]">Thời gian xử lý TB</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-300">2.4h</p>
                  <p className="text-xs text-neutral-200 mt-1">-0.5h so với tháng trước</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất xử lý</CardTitle>
              <CardDescription>Biểu đồ hiệu suất theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-primary-100">
                <p className="text-sm">Dữ liệu hiệu suất sẽ được hiển thị tại đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nhật ký hoạt động</CardTitle>
              <CardDescription>Lịch sử các hoạt động gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-primary-100">
                <p className="text-sm">Nhật ký hoạt động sẽ được hiển thị tại đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

```

---

## File: `app\(app)\reports\import\page.tsx`

```tsx
"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, FileSpreadsheet, AlertTriangle, CheckCircle, RotateCcw } from "lucide-react"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError("")
    setImported(false)

    // Simple preview reading first 10 lines as text
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split("\n").slice(0, 10)
      setPreview(lines.map((l) => l.split(",")))
    }
    reader.readAsText(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setError("")
    try {
      // Mock import - replace with real API when BE supports it
      await new Promise((r) => setTimeout(r, 1500))
      setImported(true)
    } catch {
      setError("Import thất bại. File có thể sai định dạng.")
    } finally {
      setImporting(false)
    }
  }

  const handleRollback = () => {
    setFile(null)
    setPreview([])
    setImported(false)
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-4">
      <Link href="/reports" className="flex items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
        <ArrowLeft className="h-4 w-4" /> Quay lại Báo cáo
      </Link>

      <h1 className="text-2xl font-bold text-neutral-300">Import Dữ liệu</h1>

      <div className="rounded-xl border border-neutral-100 bg-white p-6 space-y-4">
        {/* Upload */}
        <div
          id="tour-import-upload"
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-neutral-100 p-8 text-center hover:border-primary hover:bg-neutral-50"
        >
          <Upload className="mx-auto h-8 w-8 text-neutral-200" />
          <p className="mt-2 text-sm font-medium text-neutral-200">Click để chọn file Excel/CSV</p>
          <p className="text-xs text-neutral-200">Hỗ trợ .xlsx, .csv</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {file && (
          <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3">
            <FileSpreadsheet className="h-5 w-5 text-[#346538]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-300">{file.name}</p>
              <p className="text-xs text-neutral-200">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={handleRollback} className="text-sm text-accent-200 hover:text-accent-200/80">
              Xóa
            </button>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div id="tour-import-preview">
            <h3 className="mb-2 text-sm font-medium text-neutral-200">Preview (10 dòng đầu)</h3>
            <div className="overflow-auto rounded-lg border border-neutral-100">
              <table className="w-full text-xs">
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className={i === 0 ? "bg-neutral-50 font-medium" : "border-t border-neutral-100"}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-accent-50 p-3 text-sm text-accent-200">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        {imported && (
          <div className="flex items-center gap-2 rounded-lg bg-[#EDF3EC] p-3 text-sm text-[#346538]">
            <CheckCircle className="h-4 w-4" /> Import thành công! Dữ liệu đã được thêm vào Báo cáo Tổng.
          </div>
        )}

        <div className="flex gap-2">
          <button
            id="tour-import-btn"
            onClick={handleImport}
            disabled={!file || importing || imported}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
          >
            {importing ? "Đang import..." : "Thực hiện Import"}
          </button>
          {(imported || error) && (
            <button
              onClick={handleRollback}
              className="flex items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50"
            >
              <RotateCcw className="h-4 w-4" /> Rollback / Import lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\reports\page.tsx`

```tsx
"use client"
// USER ROUTE: Xem báo cáo và import dữ liệu — user

import Link from "next/link"
import { FileSpreadsheet, TrendingUp, Package, DollarSign } from "lucide-react"
import dayjs from "dayjs"
import { PermissionGuard } from "@/components/permission-guard"

const reports = [
  { id: "1", invoiceNumber: "INV-001", sender: "ABC Logistics", amount: 12500000, currency: "VND", date: "2026-05-20", status: "completed", importedAt: "2026-05-21T10:00:00Z" },
  { id: "2", invoiceNumber: "INV-002", sender: "XYZ Shipping", amount: 8750000, currency: "VND", date: "2026-05-19", status: "completed", importedAt: "2026-05-20T09:30:00Z" },
  { id: "3", invoiceNumber: "INV-003", sender: "Global Freight", amount: 15200000, currency: "VND", date: "2026-05-18", status: "completed", importedAt: "2026-05-19T14:00:00Z" },
]

const totalAmount = reports.reduce((sum, r) => sum + (r.amount || 0), 0)

export default function ReportsPage() {
  return (
    <PermissionGuard permission="report.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-300">Báo cáo Tổng</h1>
          <PermissionGuard permission="report.export">
            <Link
              id="tour-reports-import-btn"
              href="/reports/import"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Import dữ liệu mới
            </Link>
          </PermissionGuard>
        </div>

      <div id="tour-reports-stats" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2.5">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-200">Tổng bản ghi</p>
              <p className="text-2xl font-bold text-neutral-300">{reports.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#EDF3EC] p-2.5">
              <DollarSign className="h-5 w-5 text-[#346538]" />
            </div>
            <div>
              <p className="text-sm text-neutral-200">Tổng giá trị</p>
              <p className="text-2xl font-bold text-neutral-300">{totalAmount.toLocaleString("vi-VN")} VND</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FBF3DB] p-2.5">
              <TrendingUp className="h-5 w-5 text-[#956400]" />
            </div>
            <div>
              <p className="text-sm text-neutral-200">Bản ghi tháng này</p>
              <p className="text-2xl font-bold text-neutral-300">{reports.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div id="tour-reports-table" className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="font-semibold text-neutral-300">Dữ liệu đã import</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Invoice #</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Người gửi</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Ngày</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-200">Số tiền</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Import lúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-300">{r.invoiceNumber}</td>
                <td className="px-4 py-3 text-neutral-200">{r.sender}</td>
                <td className="px-4 py-3 text-neutral-200">{dayjs(r.date).format("DD/MM/YYYY")}</td>
                <td className="px-4 py-3 text-right font-medium text-neutral-300">
                  {r.amount.toLocaleString("vi-VN")} {r.currency}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#EDF3EC] px-2 py-0.5 text-xs font-medium text-[#346538]">
                    Hoàn thành
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-200">{dayjs(r.importedAt).format("DD/MM/YYYY HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </PermissionGuard>
  )
}

```

---

## File: `app\(app)\sessions\page.tsx`

```tsx
"use client"
// ROUTE: Quản lý phiên đăng nhập — xem và hủy phiên của chính mình

import { useState } from "react"
import {
  Loader,
  LogOut,
  Monitor,
  Smartphone,
  Globe,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAuthSessionsQuery,
  useAuthRevokeSessionMutation,
  useAuthLogoutAllMutation,
} from "@/hooks/use-auth-queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SessionRecord = Record<string, unknown>

function normalizeSessions(raw: unknown): SessionRecord[] {
  if (raw && typeof raw === "object") {
    const d = raw as Record<string, unknown>
    if (Array.isArray(d.sessions)) return d.sessions as SessionRecord[]
  }
  return []
}

function getDeviceIcon(platform?: string | null) {
  const p = (platform ?? "").toLowerCase()
  if (p.includes("mobile") || p.includes("android") || p.includes("ios")) {
    return <Smartphone className="h-5 w-5 text-neutral-200" />
  }
  return <Monitor className="h-5 w-5 text-neutral-200" />
}

export default function SessionsPage() {
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const sessionsQuery = useAuthSessionsQuery()
  const revokeMutation = useAuthRevokeSessionMutation()
  const logoutAllMutation = useAuthLogoutAllMutation()

  const sessions = normalizeSessions(sessionsQuery.data)

  const handleRevoke = async (id: string) => {
    setRevokingId(id)
    try {
      await revokeMutation.mutateAsync({
        id,
        payload: { reason: "User revoked from web UI" },
      })
      toast.success("Đã hủy phiên đăng nhập.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Hủy phiên thất bại."))
    } finally {
      setRevokingId(null)
    }
  }

  const handleLogoutAll = async () => {
    const confirmed = window.confirm("Đăng xuất khỏi tất cả thiết bị?")
    if (!confirmed) return
    try {
      await logoutAllMutation.mutateAsync({ reason: "User logout all from web UI" })
      toast.success("Đã đăng xuất khỏi tất cả thiết bị.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Thao tác thất bại."))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý phiên đăng nhập</h1>
        <Button
          variant="outline"
          onClick={handleLogoutAll}
          disabled={logoutAllMutation.isPending}
          className="text-accent border-accent/20 hover:bg-accent/5 cursor-pointer"
        >
          {logoutAllMutation.isPending ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Đăng xuất tất cả
        </Button>
      </div>

      {sessionsQuery.isPending && (
        <div className="flex items-center gap-2 text-sm text-neutral-200">
          <Loader className="h-4 w-4 animate-spin" />
          Đang tải...
        </div>
      )}

      {!sessionsQuery.isPending && sessions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-neutral-200" />
            <p className="mt-3 text-sm text-neutral-200">Không có phiên đăng nhập nào.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sessions.map((s) => {
          const id = String(s.id ?? "")
          const platform = s.platform as string | null
          const deviceName = (s.deviceName as string | null) ?? null
          const ip = (s.ipAddress as string | null) ?? "—"
          const createdAt = s.createdAtUtc as string | undefined
          const lastActive = s.lastActivityAtUtc as string | undefined
          const expiresAt = s.expiresAtUtc as string | undefined
          const isCurrent = Boolean(s.isCurrent)

          return (
            <Card
              key={id}
              className={`transition-colors ${isCurrent ? "border-primary/30 bg-primary/5" : ""}`}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-50">
                  {getDeviceIcon(platform)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-300">
                      {deviceName ?? (platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : "Thiết bị")}
                    </p>
                    {isCurrent && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Hiện tại
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-200">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {ip}
                    </span>
                    {typeof createdAt === "string" && (
                      <span>Đăng nhập: {dayjs(createdAt).format("DD/MM/YYYY HH:mm")}</span>
                    )}
                    {typeof lastActive === "string" && (
                      <span>Hoạt động: {dayjs(lastActive).format("DD/MM/YYYY HH:mm")}</span>
                    )}
                    {typeof expiresAt === "string" && (
                      <span>Hết hạn: {dayjs(expiresAt).format("DD/MM/YYYY HH:mm")}</span>
                    )}
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleRevoke(id)}
                    disabled={revokingId === id || revokeMutation.isPending}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {revokingId === id ? (
                      <Loader className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Hủy
                  </button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


```

---

## File: `app\(app)\template.tsx`

```tsx
export default function AppTemplate({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}

```

---

## File: `app\(app)\templates\page.tsx`

```tsx
"use client"
// User route: Quản lý template nhận diện và bóc tách email

import { useMemo, useState } from "react"
import { Plus, Save, Trash2 } from "lucide-react"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { toast } from "sonner"
import {
  useCreateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
  useEmailTemplatesQuery,
  useUpdateEmailTemplateMutation,
} from "@/hooks/use-mail-queries"

type TemplateFormState = {
  templateCode: string
  templateName: string
  description: string
  subjectPattern: string
  bodyPattern: string
  expectedFieldsJson: string
  documentTypesCsv: string
  isActive: boolean
}

type TemplateItem = {
  id?: string | null
  templateCode?: string | null
  templateName?: string | null
  description?: string | null
  subjectPattern?: string | null
  bodyPattern?: string | null
  expectedFields?: Record<string, string> | null
  documentTypes?: string[] | null
  isActive?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}

const emptyForm: TemplateFormState = {
  templateCode: "",
  templateName: "",
  description: "",
  subjectPattern: "",
  bodyPattern: "",
  expectedFieldsJson: "{}",
  documentTypesCsv: "",
  isActive: true,
}

export default function TemplatesPage() {
  const templatesQuery = useEmailTemplatesQuery()
  const createTemplateMutation = useCreateEmailTemplateMutation()
  const deleteTemplateMutation = useDeleteEmailTemplateMutation()

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [formState, setFormState] = useState<TemplateFormState>(emptyForm)
  const updateTemplateMutation = useUpdateEmailTemplateMutation(editingTemplateId)

  const templates: TemplateItem[] = (templatesQuery.data ?? []) as TemplateItem[]
  const isSaving = createTemplateMutation.isPending || updateTemplateMutation.isPending

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort((first, second) => {
        const firstTime = new Date(first.updatedAt ?? first.createdAt ?? 0).getTime()
        const secondTime = new Date(second.updatedAt ?? second.createdAt ?? 0).getTime()
        return secondTime - firstTime
      }),
    [templates]
  )

  const parseExpectedFields = () => {
    try {
      const parsed = JSON.parse(formState.expectedFieldsJson || "{}")
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Expected fields phải là object JSON.")
      }
      return parsed as Record<string, string>
    } catch {
      throw new Error("Expected fields JSON không hợp lệ.")
    }
  }

  const resetForm = () => {
    setEditingTemplateId(null)
    setFormState(emptyForm)
  }

  const handleSubmit = async () => {
    try {
      const expectedFields = parseExpectedFields()
      const documentTypes = formState.documentTypesCsv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      if (editingTemplateId) {
        await updateTemplateMutation.mutateAsync({
          templateName: formState.templateName,
          description: formState.description,
          subjectPattern: formState.subjectPattern,
          bodyPattern: formState.bodyPattern,
          expectedFields,
          documentTypes,
          isActive: formState.isActive,
        })
        toast.success("Đã cập nhật template.")
      } else {
        await createTemplateMutation.mutateAsync({
          templateCode: formState.templateCode,
          templateName: formState.templateName,
          description: formState.description,
          subjectPattern: formState.subjectPattern,
          bodyPattern: formState.bodyPattern,
          expectedFields,
          documentTypes,
        })
        toast.success("Đã tạo template mới.")
      }
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không lưu được template."))
    }
  }

  const handleEdit = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId)
    if (!template) return
    setEditingTemplateId(template.id || null)
    setFormState({
      templateCode: template.templateCode || "",
      templateName: template.templateName || "",
      description: template.description || "",
      subjectPattern: template.subjectPattern || "",
      bodyPattern: template.bodyPattern || "",
      expectedFieldsJson: JSON.stringify(template.expectedFields ?? {}, null, 2),
      documentTypesCsv: (template.documentTypes ?? []).join(", "),
      isActive: Boolean(template.isActive),
    })
  }

  const handleDelete = async (templateId: string) => {
    const confirmed = window.confirm("Xóa template này?")
    if (!confirmed) return
    try {
      await deleteTemplateMutation.mutateAsync(templateId)
      if (editingTemplateId === templateId) {
        resetForm()
      }
      toast.success("Đã xóa template.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa template thất bại."))
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-neutral-300">Quản lý Templates</h1>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-neutral-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-300">
              {editingTemplateId ? "Cập nhật template" : "Tạo template"}
            </h2>
            {editingTemplateId && (
              <button
                onClick={resetForm}
                className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Template code"
              value={formState.templateCode}
              onChange={(event) => setFormState((state) => ({ ...state, templateCode: event.target.value }))}
              disabled={Boolean(editingTemplateId)}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50"
            />
            <input
              type="text"
              placeholder="Template name"
              value={formState.templateName}
              onChange={(event) => setFormState((state) => ({ ...state, templateName: event.target.value }))}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Subject pattern"
              value={formState.subjectPattern}
              onChange={(event) => setFormState((state) => ({ ...state, subjectPattern: event.target.value }))}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Description"
              value={formState.description}
              onChange={(event) => setFormState((state) => ({ ...state, description: event.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Body pattern"
              value={formState.bodyPattern}
              onChange={(event) => setFormState((state) => ({ ...state, bodyPattern: event.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder='Expected fields JSON, ví dụ {"invoiceNumber":"Mã hóa đơn"}'
              value={formState.expectedFieldsJson}
              onChange={(event) => setFormState((state) => ({ ...state, expectedFieldsJson: event.target.value }))}
              rows={5}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 font-mono text-xs text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Document types (csv) ví dụ invoice,receipt"
              value={formState.documentTypesCsv}
              onChange={(event) => setFormState((state) => ({ ...state, documentTypesCsv: event.target.value }))}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <label className="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) => setFormState((state) => ({ ...state, isActive: event.target.checked }))}
                disabled={!editingTemplateId}
              />
              Kích hoạt template
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingTemplateId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSaving ? "Đang lưu..." : editingTemplateId ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-neutral-300">Danh sách template</h2>
          {templatesQuery.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {getErrorMessage(templatesQuery.error, "Không tải được template.")}
            </div>
          )}
          {templatesQuery.isPending && (
            <p className="text-sm text-neutral-200">Đang tải template...</p>
          )}
          {!templatesQuery.isPending && sortedTemplates.length === 0 && (
            <p className="text-sm text-neutral-200">Chưa có template nào.</p>
          )}

          <div className="space-y-2">
            {sortedTemplates.map((template) => (
              <div
                key={template.id}
                className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-300">
                    {template.templateCode} - {template.templateName}
                  </p>
                  <p className="text-xs text-neutral-200">
                    Cập nhật:{" "}
                    {template.updatedAt
                      ? dayjs(template.updatedAt).format("DD/MM/YYYY HH:mm")
                      : "N/A"}
                    {" · "}
                    {template.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(template.id || "")}
                    className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(template.id || "")}
                    disabled={deleteTemplateMutation.isPending}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3 w-3" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\user\page.tsx`

```tsx
"use client"
// USER ROUTE: Hồ sơ cá nhân — user quản lý thông tin và đổi mật khẩu

import { useState } from "react"
import {
  Loader2,
  Pencil,
  Save,
  KeyRound,
  Mail,
  User,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  AlertCircle,
  ChevronRight,
  Lock,
  UserCircle,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useCurrentUserQuery,
  useUpdateMyProfileMutation,
  useChangeMyPasswordMutation,
} from "@/hooks/use-user-queries"

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 animate-pulse rounded-full bg-neutral-100" />
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function UserDashboardPage() {
  const currentUserQuery = useCurrentUserQuery()
  const updateProfileMutation = useUpdateMyProfileMutation()
  const changePasswordMutation = useChangeMyPasswordMutation()

  const user = currentUserQuery.data

  const [editingProfile, setEditingProfile] = useState(false)
  const [editFullName, setEditFullName] = useState("")

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)

  const startEditProfile = () => {
    setEditFullName(user?.fullName ?? "")
    setEditingProfile(true)
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({ fullName: editFullName })
      toast.success("Cập nhật hồ sơ thành công.")
      setEditingProfile(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật hồ sơ thất bại."))
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword })
      toast.success("Đổi mật khẩu thành công.")
      setShowChangePassword(false)
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      toast.error(getErrorMessage(err, "Đổi mật khẩu thất bại."))
    }
  }

  const isMutating = updateProfileMutation.isPending || changePasswordMutation.isPending

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Tài khoản của tôi</h1>
        <p className="mt-1 text-sm text-neutral-500">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      {currentUserQuery.isPending && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <ProfileSkeleton />
        </div>
      )}

      {!currentUserQuery.isPending && !user && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <p className="mt-4 text-base font-medium text-neutral-900">Không tải được thông tin</p>
          <p className="mt-1 text-sm text-neutral-500">Vui lòng thử tải lại trang</p>
        </div>
      )}

      {user && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {/* Card Header with Avatar */}
            <div className="bg-linear-to-r from-neutral-50 to-white px-8 py-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-primary text-2xl font-bold text-white">
                      {getInitials(user.fullName || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">{user.fullName || "Chưa cập nhật"}</h2>
                    <p className="mt-0.5 text-sm text-neutral-500">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        >
                          {role}
                        </Badge>
                      ))}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                        Hoạt động
                      </span>
                    </div>
                  </div>
                </div>
                {!editingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startEditProfile}
                    className="gap-2"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Card Content */}
            <div className="px-8 py-6">
              <AnimatePresence mode="wait">
                {editingProfile ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-neutral-50 text-neutral-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-neutral-700">
                        Họ và tên
                      </Label>
                      <Input
                        id="fullName"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        autoFocus
                        className="text-neutral-900"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProfile(false)}
                      >
                        <X className="mr-1.5 h-4 w-4" /> Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isMutating}
                      >
                        {isMutating ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-1.5 h-4 w-4" />
                        )}
                        Lưu thay đổi
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0"
                  >
                    {[
                      {
                        icon: <Mail className="h-5 w-5 text-neutral-400" />,
                        label: "Email",
                        value: user.email,
                      },
                      {
                        icon: <UserCircle className="h-5 w-5 text-neutral-400" />,
                        label: "Họ và tên",
                        value: user.fullName || <span className="italic text-neutral-400">Chưa cập nhật</span>,
                      },
                      {
                        icon: <ShieldCheck className="h-5 w-5 text-neutral-400" />,
                        label: "Vai trò",
                        value: (
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="outline"
                                className="border-neutral-200 bg-neutral-50 text-neutral-700"
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        ),
                      },
                      {
                        icon: <Activity className="h-5 w-5 text-neutral-400" />,
                        label: "Trạng thái",
                        value: (
                          <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            Đang hoạt động
                          </span>
                        ),
                      },
                    ].map((item, index, arr) => (
                      <div key={item.label}>
                        <div className="flex items-start gap-4 py-4">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50">
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                              {item.label}
                            </p>
                            <div className="mt-1 text-sm text-neutral-900">{item.value}</div>
                          </div>
                        </div>
                        {index < arr.length - 1 && <Separator />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Security Card */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="px-8 py-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                    <Lock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Bảo mật</h2>
                    <p className="text-sm text-neutral-500">Quản lý mật khẩu và bảo mật tài khoản</p>
                  </div>
                </div>
                {!showChangePassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChangePassword(true)}
                    className="gap-2"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Đổi mật khẩu
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {showChangePassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <Separator className="mb-6" />
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-medium text-neutral-700">
                          Mật khẩu hiện tại
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPwd ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Nhập mật khẩu hiện tại"
                            className="pr-11 text-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                          >
                            {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium text-neutral-700">
                          Mật khẩu mới
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPwd ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Tối thiểu 8 ký tự"
                            className="pr-11 text-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPwd(!showNewPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                          >
                            {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowChangePassword(false)}
                        >
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleChangePassword}
                          disabled={isMutating || !currentPassword || !newPassword}
                        >
                          {isMutating ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          ) : (
                            <KeyRound className="mr-1.5 h-4 w-4" />
                          )}
                          Xác nhận
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

```

---

## File: `app\(app)\webhooks\page.tsx`

```tsx
"use client"

import { useState } from "react"
import { getErrorMessage } from "@/lib/get-error-message"
import { toast } from "sonner"
import {
  useWebhookSubscriptionsQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
} from "@/hooks/use-mail-queries"
import { Plus, Save, Trash2, Play, Webhook, CheckCircle2, XCircle } from "lucide-react"

type WebhookFormState = {
  subscriberCode: string
  callbackUrl: string
  eventTypes: string
  secretKey: string
  isActive: boolean
}

const emptyForm: WebhookFormState = {
  subscriberCode: "",
  callbackUrl: "",
  eventTypes: "",
  secretKey: "",
  isActive: true,
}

/*
export default function WebhooksPage() {
  const webhooksQuery = useWebhookSubscriptionsQuery()
  const createMutation = useCreateWebhookMutation()
  const deleteMutation = useDeleteWebhookMutation()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<WebhookFormState>(emptyForm)

  const updateMutation = useUpdateWebhookMutation(editingId)
  const testMutation = useTestWebhookMutation(editingId)

  const webhooks = webhooksQuery.data ?? []
  const isSaving = createMutation.isPending || updateMutation.isPending

  const resetForm = () => {
    setEditingId(null)
    setFormState(emptyForm)
  }

  const handleSubmit = async () => {
    try {
      const eventTypes = formState.eventTypes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      if (editingId) {
        await updateMutation.mutateAsync({
          callbackUrl: formState.callbackUrl || null,
          eventTypes: eventTypes.length ? eventTypes : null,
          isActive: formState.isActive,
        })
        toast.success("Đã cập nhật webhook.")
      } else {
        await createMutation.mutateAsync({
          subscriberCode: formState.subscriberCode || null,
          callbackUrl: formState.callbackUrl || null,
          eventTypes: eventTypes.length ? eventTypes : null,
          secretKey: formState.secretKey || null,
        })
        toast.success("Đã tạo webhook mới.")
      }
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không lưu được webhook."))
    }
  }

  const handleEdit = (webhook: Record<string, unknown>) => {
    setEditingId(String(webhook.id ?? ""))
    setFormState({
      subscriberCode: String(webhook.subscriberCode ?? ""),
      callbackUrl: String(webhook.callbackUrl ?? ""),
      eventTypes: Array.isArray(webhook.eventTypes) ? webhook.eventTypes.join(", ") : "",
      secretKey: String(webhook.secretKey ?? ""),
      isActive: Boolean(webhook.isActive ?? true),
    })
  }

  const handleDelete = async (webhookId: string) => {
    const confirmed = window.confirm("Xóa webhook này?")
    if (!confirmed) return
    try {
      await deleteMutation.mutateAsync(webhookId)
      if (editingId === webhookId) {
        resetForm()
      }
      toast.success("Đã xóa webhook.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa webhook thất bại."))
    }
  }

  const handleTest = async (webhookId: string) => {
    try {
      await testMutation.mutateAsync({
        eventType: "mail.received",
        payload: { test: true, message: "Hello from test" },
      })
      toast.success("Đã gửi test webhook.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Test webhook thất bại."))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Webhook Subscriptions</h1>
      </div>

      {webhooksQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(webhooksQuery.error, "Không tải được webhooks.")}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-neutral-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-300">
              {editingId ? "Cập nhật webhook" : "Tạo webhook"}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Subscriber code"
              value={formState.subscriberCode}
              onChange={(event) =>
                setFormState((state) => ({ ...state, subscriberCode: event.target.value }))
              }
              disabled={Boolean(editingId)}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50"
            />
            <input
              type="text"
              placeholder="Callback URL"
              value={formState.callbackUrl}
              onChange={(event) =>
                setFormState((state) => ({ ...state, callbackUrl: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Event types (csv) ví dụ mail.received,mail.processed"
              value={formState.eventTypes}
              onChange={(event) =>
                setFormState((state) => ({ ...state, eventTypes: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Secret key (optional)"
              value={formState.secretKey}
              onChange={(event) =>
                setFormState((state) => ({ ...state, secretKey: event.target.value }))
              }
              disabled={Boolean(editingId)}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50"
            />
            <label className="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, isActive: event.target.checked }))
                }
                disabled={!editingId}
              />
              Kích hoạt
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSaving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-neutral-300">Danh sách webhook</h2>
          {webhooksQuery.isPending && (
            <p className="text-sm text-neutral-200">Đang tải...</p>
          )}
          {!webhooksQuery.isPending && webhooks.length === 0 && (
            <p className="text-sm text-neutral-200">Chưa có webhook nào.</p>
          )}

          <div className="space-y-2">
            {webhooks.map((webhook) => {
              const id = String(webhook.id ?? "")
              const isActive = Boolean(webhook.isActive ?? false)
              return (
                <div
                  key={id}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-300">
                      {String(webhook.subscriberCode || "—")}
                    </p>
                    <p className="text-xs text-neutral-200 wrap-break-word">
                      {String(webhook.callbackUrl || "—")}
                    </p>
                    <p className="text-xs text-neutral-200">
                      Events: {Array.isArray(webhook.eventTypes) ? webhook.eventTypes.join(", ") : "—"}
                      {" · "}
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-neutral-300">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTest(id)}
                      disabled={testMutation.isPending}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="h-3 w-3" /> Test
                    </button>
                    <button
                      onClick={() => handleEdit(webhook)}
                      className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-3 w-3" /> Xóa
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
*/

export default function WebhooksPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-neutral-300">Webhook Subscriptions</h1>
      <p className="text-sm text-neutral-200">Trang này đang được tạm ẩn.</p>
    </div>
  )
}

```

---

## File: `app\forgot-password\page.tsx`

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowLeft, Loader } from "lucide-react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAuthForgotPasswordSendOtpMutation,
  useAuthForgotPasswordConfirmResetMutation,
} from "@/hooks/use-auth-queries"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"send" | "confirm">("send")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const sendOtpMutation = useAuthForgotPasswordSendOtpMutation()
  const confirmResetMutation = useAuthForgotPasswordConfirmResetMutation()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await sendOtpMutation.mutateAsync({
        email,
        ipAddress: null,
        userAgent: null,
      })
      toast.success("Đã gửi OTP đến email của bạn.")
      setStep("confirm")
    } catch (err) {
      toast.error(getErrorMessage(err, "Gửi OTP thất bại."))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || !newPassword) return
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.")
      return
    }
    setLoading(true)
    try {
      await confirmResetMutation.mutateAsync({
        email,
        token: otp,
        newPassword,
      })
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.")
      router.push("/login")
    } catch (err) {
      toast.error(getErrorMessage(err, "Đặt lại mật khẩu thất bại."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-neutral-300">
            {step === "send" ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
          </h1>
          <p className="mt-1 text-sm text-neutral-200">
            {step === "send"
              ? "Nhập email để nhận mã OTP"
              : "Nhập mã OTP và mật khẩu mới"}
          </p>
        </div>

        {step === "send" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-200" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Gửi OTP"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex w-full items-center justify-center gap-1 text-sm text-neutral-200 hover:text-neutral-300 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại đăng nhập
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Mã OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full rounded-lg border border-neutral-100 px-4 py-2.5 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200 text-center tracking-[0.5em] font-mono"
                placeholder="123456"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-neutral-100 px-4 py-2.5 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-neutral-100 px-4 py-2.5 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Xác nhận"}
            </button>

            <button
              type="button"
              onClick={() => setStep("send")}
              className="flex w-full items-center justify-center gap-1 text-sm text-neutral-200 hover:text-neutral-300 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

```

---

## File: `app\globals.css`

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Brand palette extracted from logo */
  --color-primary: #0c549c;
  --color-primary-50: #E1F3FE;
  --color-primary-100: #6c9ccc;
  --color-primary-200: #0c6cb4;
  --color-primary-300: #0c6c9c;
  --color-primary-400: #0c549c;
  --color-primary-500: #0a3f75;
  --color-primary-600: #08305c;

  --color-accent: #e42424;
  --color-accent-50: #FDEBEC;
  --color-accent-100: #f25c4d;
  --color-accent-200: #cc240c;
  --color-accent-300: #a81e0a;

  --color-neutral-50: #F7F6F3;
  --color-neutral-100: #EAEAEA;
  --color-neutral-200: #787774;
  --color-neutral-300: #111111;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
}

@keyframes route-content-enter {
  from {
    opacity: 0;
    transform: translateX(-36px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
}

.route-content-enter {
  animation: route-content-enter 440ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity, filter;
}

@keyframes route-shell-reveal {
  from {
    opacity: 0.6;
    transform: translateX(-44px);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
}

.route-shell-reveal {
  animation: route-shell-reveal 700ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform, filter;
}

@media (prefers-reduced-motion: reduce) {
  .route-content-enter {
    animation: none;
  }
}

```

---

## File: `app\layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Logistics Mail - Bóc tách dữ liệu",
  description: "Hệ thống xử lý email logistics tự động",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

```

---

## File: `app\login\page.tsx`

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Shield, Clock, BarChart3, User, Lock } from "lucide-react"
import Image from "next/image"
import { getErrorMessage } from "@/lib/get-error-message"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useAuthLoginMutation } from "@/hooks/use-auth-queries"

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useAuthLoginMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await loginMutation.mutateAsync({ email, password })
      // API response wrapper: { data: { accessToken, user }, meta, errors }
      const apiData = res?.data ?? res
      const accessToken = apiData?.accessToken
      const refreshToken = apiData?.refreshToken
      const user = apiData?.user
      if (accessToken && user && typeof window !== "undefined") {
        localStorage.setItem("token", accessToken)
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken)
        if (user?.userId) localStorage.setItem("userId", user.userId)

        setAuth({
          user,
          accessToken,
          refreshToken: refreshToken ?? "",
        })

        // Redirect based on role
        if (user.roles?.includes("admin")) {
          router.push("/")
        } else {
          router.push("/user")
        }
      } else {
        throw new Error("Đăng nhập thất bại, thiếu thông tin.")
      }
    } catch (err) {
      setError(getErrorMessage(err, "Đăng nhập thất bại."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-end">
      {/* Full screen background image */}
      <Image
        src="/loginthongquan.png"
        alt="Logistics background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-r from-[#1e3a5f]/70 via-[#1e3a5f]/40 to-transparent" />

      {/* Left content overlay */}
      <div className="absolute left-0 top-0 hidden h-full w-1/2 flex-col justify-between p-12 text-white lg:flex">
        {/* <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight">LOGISTICS</span>
              <span className="block text-xs font-medium tracking-widest text-primary-50">MAIL</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Kết nối vận chuyển<br />– Giao nhận toàn cầu
          </h2>
          <p className="mt-4 max-w-md text-base text-primary-50">
            Giải pháp quản lý logistics hiệu quả, an toàn và nhanh chóng.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary-100" />
            <div>
              <p className="text-sm font-semibold">Bảo mật tuyệt đối</p>
              <p className="text-xs text-primary-50">Thông tin được mã hóa và bảo vệ an toàn</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary-100" />
            <div>
              <p className="text-sm font-semibold">Hiệu quả vượt trội</p>
              <p className="text-xs text-primary-50">Quy trình tối ưu, tiết kiệm thời gian</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary-100" />
            <div>
              <p className="text-sm font-semibold">Quản lý toàn diện</p>
              <p className="text-xs text-primary-50">Kiểm soát mọi đơn hàng mọi lúc, mọi nơi</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Right side - Login form */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div id="tour-login-form" className="w-full max-w-[420px] rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-300">Logistics Mail</h1>
            <p className="mt-1 text-sm text-neutral-200">Đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-200" />
                <input
                  id="tour-login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                  placeholder="admin@company.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-200" />
                <input
                  id="tour-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-100 text-primary focus:ring-primary"
                />
                Ghi nhớ đăng nhập
              </label>
              <a href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-500 cursor-pointer">
                Quên mật khẩu?
              </a>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              id="tour-login-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-neutral-200">hoặc</span>
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-100 bg-white px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Đăng nhập với Google
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-neutral-200">
            © 2026 THONG QUAN JOINT STOCK COMPANY.
          </p>
          <p className="text-center text-xs text-neutral-200">
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\mail-auth\callback\page.tsx`

```tsx
"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Mail, XCircle } from "lucide-react"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import { getErrorMessage } from "@/lib/get-error-message"

const mailApi = getLogisticsPlatformAPI()

function MailAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const authorizationCode = useMemo(
    () => searchParams.get("code") ?? searchParams.get("authorizationCode"),
    [searchParams]
  )
  const state = useMemo(() => searchParams.get("state"), [searchParams])

  useEffect(() => {
    const run = async () => {
      try {
        if (!authorizationCode) {
          throw new Error("Thiếu authorization code từ Gmail.")
        }

        const storedState = sessionStorage.getItem("mail_oauth_state")
        if (storedState && state && storedState !== state) {
          throw new Error("OAuth state không hợp lệ. Vui lòng thử lại.")
        }

        const redirectUri = `${window.location.origin}/mail-auth/callback`
        await mailApi.postApiV1MailAccountsConnect({
          authorizationCode,
          redirectUri,
        })
        sessionStorage.removeItem("mail_oauth_state")
        router.replace("/admin/settings?connected=1")
      } catch (callbackError) {
        setError(getErrorMessage(callbackError, "Xử lý callback Gmail thất bại."))
      }
    }

    void run()
  }, [authorizationCode, router, state])

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-neutral-300">Xác thực Gmail</h1>
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => router.replace("/admin/settings")}
              className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Quay về cấu hình
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang hoàn tất kết nối tài khoản...
          </div>
        )}
      </div>
    </div>
  )
}

export default function MailAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}>
      <MailAuthCallbackContent />
    </Suspense>
  )
}

```

---

## File: `CHANGELOG-27-05-2026.md`

```md
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

```

---

## File: `CLAUDE.md`

```md
@AGENTS.md

```

---

## File: `components\attachment-viewer-modal.tsx`

```tsx
"use client"

import * as React from "react"
import { X, Loader } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getErrorMessage } from "@/lib/get-error-message"

interface AttachmentViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  isLoading: boolean
  error: Error | null
  content: string | null
}

export function AttachmentViewerModal({
  open,
  onOpenChange,
  title,
  isLoading,
  error,
  content,
}: AttachmentViewerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-neutral-300 truncate pr-4">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-neutral-50 p-4 min-h-0">
          {isLoading && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="flex items-center gap-2 text-sm text-neutral-200">
                <Loader className="h-4 w-4 animate-spin" />
                Đang tải nội dung...
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-sm text-red-600">
                {String(getErrorMessage(error, "Không tải được nội dung tệp."))}
              </p>
            </div>
          )}

          {!isLoading && !error && content && (
            <pre className="h-full overflow-auto whitespace-pre-wrap rounded-lg bg-white border border-neutral-100 p-4 text-xs text-neutral-300 leading-relaxed">
              {content}
            </pre>
          )}

          {!isLoading && !error && !content && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-sm text-neutral-200">Không có nội dung.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

```

---

## File: `components\extraction-result-modal.tsx`

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ViewerMode = "auto" | "google" | "office" | "proxy" | "direct"

export type ExtractionPreviewSources = {
  url?: string | null
  expiresAt?: string | null
  googleViewerUrl?: string | null
  officeViewerUrl?: string | null
  proxyUrl?: string | null
}

interface ExtractionResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: string | null
  preview?: ExtractionPreviewSources | null
  fileName?: string | null
}

type LogisticsData = {
  stt: number
  maKhachHang: string
  nhanVien: string
  khachHang: string
  congViec: string
  soToKhai: string
  loaiHinh: string
  ngayToKhai: string
  loaiHang: string
  luongTk: string
  haiQuan: string
  co: string
  soInvVat: string
  soBill: string
  soBooking: string
  soLuongKien: string
  soLuongKg: string
  soContainer20: string
  soContainer40: string
  soContainerLcl: string
  soContainerTc: string
  thongBaoPhiCsht: string
  soTienCsht: string
  cangXuatNhap: string
  ghiChu: string
  trangThaiLoHang: string
}

type LogisticsStringKey = Exclude<keyof LogisticsData, "stt">

type FieldConfig = {
  key: LogisticsStringKey
  label: string
  aliases: string[]
}

const FIELD_CONFIGS: FieldConfig[] = [
  { key: "maKhachHang", label: "MÃ KHÁCH HÀNG", aliases: ["maKhachHang", "customerCode"] },
  { key: "nhanVien", label: "NHÂN VIÊN", aliases: ["nhanVien", "staff"] },
  { key: "khachHang", label: "KHÁCH HÀNG", aliases: ["khachHang", "customer"] },
  { key: "congViec", label: "CÔNG VIỆC", aliases: ["congViec", "job"] },
  { key: "soToKhai", label: "SỐ TỜ KHAI", aliases: ["soToKhai", "declarationNo"] },
  { key: "loaiHinh", label: "LOẠI HÌNH", aliases: ["loaiHinh", "type"] },
  { key: "ngayToKhai", label: "NGÀY TỜ KHAI", aliases: ["ngayToKhai", "declarationDate"] },
  { key: "loaiHang", label: "LOẠI HÀNG", aliases: ["loaiHang", "goodsType"] },
  { key: "luongTk", label: "LUỒNG TK", aliases: ["luongTk", "customsStream"] },
  { key: "haiQuan", label: "HẢI QUAN", aliases: ["haiQuan", "customs"] },
  { key: "co", label: "C/O", aliases: ["co", "certificate"] },
  { key: "soInvVat", label: "SỐ INV/VAT", aliases: ["soInvVat", "invoiceNo"] },
  { key: "soBill", label: "SỐ BILL", aliases: ["soBill", "billNo"] },
  { key: "soBooking", label: "SỐ BOOKING", aliases: ["soBooking", "bookingNo"] },
  { key: "soLuongKien", label: "SỐ LƯỢNG (KIỆN)", aliases: ["soLuongKien", "quantityPackages"] },
  { key: "soLuongKg", label: "SỐ LƯỢNG (KG)", aliases: ["soLuongKg", "quantityKg"] },
  { key: "soContainer20", label: "CONT 20'", aliases: ["soContainer20", "container20"] },
  { key: "soContainer40", label: "CONT 40'", aliases: ["soContainer40", "container40"] },
  { key: "soContainerLcl", label: "CONT LCL", aliases: ["soContainerLcl", "containerLcl"] },
  { key: "soContainerTc", label: "CONT TC", aliases: ["soContainerTc", "containerTc"] },
  { key: "thongBaoPhiCsht", label: "THÔNG BÁO PHÍ CSHT", aliases: ["thongBaoPhiCsht", "cshtNotice"] },
  { key: "soTienCsht", label: "SỐ TIỀN CSHT", aliases: ["soTienCsht", "cshtAmount"] },
  { key: "cangXuatNhap", label: "CẢNG XUẤT - CẢNG NHẬP", aliases: ["cangXuatNhap", "port"] },
  { key: "ghiChu", label: "GHI CHÚ", aliases: ["ghiChu", "note"] },
  { key: "trangThaiLoHang", label: "TRẠNG THÁI LÔ HÀNG", aliases: ["trangThaiLoHang", "shipmentStatus"] },
]

const EMPTY_ROW: LogisticsData = {
  stt: 1,
  maKhachHang: "",
  nhanVien: "",
  khachHang: "",
  congViec: "",
  soToKhai: "",
  loaiHinh: "",
  ngayToKhai: "",
  loaiHang: "",
  luongTk: "",
  haiQuan: "",
  co: "",
  soInvVat: "",
  soBill: "",
  soBooking: "",
  soLuongKien: "",
  soLuongKg: "",
  soContainer20: "",
  soContainer40: "",
  soContainerLcl: "",
  soContainerTc: "",
  thongBaoPhiCsht: "",
  soTienCsht: "",
  cangXuatNhap: "",
  ghiChu: "",
  trangThaiLoHang: "",
}

function pickFirstString(item: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    const value = item[alias]
    if (value === null || value === undefined) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ""
}

function normalizeLogisticsRow(item: Record<string, unknown>, index: number): LogisticsData {
  const normalized: LogisticsData = { ...EMPTY_ROW, stt: index + 1 }
  for (const field of FIELD_CONFIGS) {
    normalized[field.key] = pickFirstString(item, field.aliases)
  }
  const explicitIndex = item.stt ?? item.index ?? item.no
  if (explicitIndex !== undefined && explicitIndex !== null && String(explicitIndex).trim()) {
    const parsedIndex = Number(explicitIndex)
    normalized.stt = Number.isFinite(parsedIndex) ? parsedIndex : index + 1
  }
  return normalized
}

function extractRecords(parsed: unknown): Record<string, unknown>[] {
  if (Array.isArray(parsed)) {
    return parsed.filter((entry) => entry && typeof entry === "object") as Record<string, unknown>[]
  }
  if (!parsed || typeof parsed !== "object") return []

  const asRecord = parsed as Record<string, unknown>
  const collectionCandidates = ["data", "items", "records", "results", "rows", "shipments"]
  for (const key of collectionCandidates) {
    const value = asRecord[key]
    if (Array.isArray(value)) {
      return value.filter((entry) => entry && typeof entry === "object") as Record<string, unknown>[]
    }
  }
  return [asRecord]
}

function parseResult(resultStr: string): { rows: LogisticsData[]; rawMessage: string | null } {
  try {
    const parsed = JSON.parse(resultStr) as unknown
    const records = extractRecords(parsed)
    if (records.length === 0) {
      return { rows: [], rawMessage: resultStr }
    }
    return {
      rows: records.map((record, index) => normalizeLogisticsRow(record, index)),
      rawMessage: null,
    }
  } catch {
    return { rows: [], rawMessage: resultStr }
  }
}

export function ExtractionResultModal({
  open,
  onOpenChange,
  result,
  preview,
  fileName,
}: ExtractionResultModalProps) {
  const [rows, setRows] = useState<LogisticsData[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [viewerMode, setViewerMode] = useState<ViewerMode>("auto")

  useEffect(() => {
    if (!result) {
      setRows([])
      setMessage(null)
      return
    }
    const parsed = parseResult(result)
    setRows(parsed.rows)
    setMessage(parsed.rawMessage)
  }, [result])

  const sources = useMemo(
    () => ({
      google: preview?.googleViewerUrl?.trim() || "",
      office: preview?.officeViewerUrl?.trim() || "",
      proxy: preview?.proxyUrl?.trim() || "",
      direct: preview?.url?.trim() || "",
    }),
    [preview]
  )

  const viewerSrc = useMemo(() => {
    if (viewerMode === "google" && sources.google) return sources.google
    if (viewerMode === "office" && sources.office) return sources.office
    if (viewerMode === "proxy" && sources.proxy) return sources.proxy
    if (viewerMode === "direct" && sources.direct) return sources.direct
    return sources.google || sources.office || sources.proxy || sources.direct || ""
  }, [sources, viewerMode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[94vh] max-w-[96vw] p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-black">Kết quả bóc tách thông tin logistics</DialogTitle>
          {fileName ? (
            <p className="text-sm text-neutral-600">
              Tệp: <span className="font-medium">{fileName}</span>
            </p>
          ) : null}
        </DialogHeader>

        <div className="grid h-[calc(94vh-88px)] grid-cols-1 md:grid-cols-[minmax(460px,45%)_1fr]">
          <div className="overflow-y-auto border-r p-4">
            {rows.length > 0 ? (
              <div className="space-y-4">
                {rows.map((row) => (
                  <section key={`${row.stt}-${row.soToKhai}-${row.soBill}`} className="rounded-lg border bg-white">
                    <div className="border-b bg-neutral-50 px-4 py-2">
                      <p className="text-sm font-semibold text-primary">Lô hàng #{row.stt}</p>
                    </div>
                    <div className="overflow-hidden">
                      <table className="w-full table-fixed text-sm">
                        <tbody>
                          {FIELD_CONFIGS.map((field) => (
                            <tr key={field.key} className="border-b last:border-b-0">
                              <th className="w-[46%] bg-neutral-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                {field.label}
                              </th>
                              <td className="px-3 py-2 text-neutral-800">
                                {row[field.key] ? row[field.key] : <span className="text-neutral-400">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))}
              </div>
            ) : message ? (
              <div className="rounded-lg border bg-white p-4">
                <p className="mb-2 text-sm font-medium text-neutral-700">Kết quả thô từ AI</p>
                <pre className="max-h-[68vh] overflow-auto whitespace-pre-wrap text-sm text-neutral-800">{message}</pre>
              </div>
            ) : (
              <section className="rounded-lg border bg-white">
                <div className="border-b bg-neutral-50 px-4 py-2">
                  <p className="text-sm font-semibold text-primary">Lô hàng #1</p>
                </div>
                <div className="overflow-hidden">
                  <table className="w-full table-fixed text-sm">
                    <tbody>
                      {FIELD_CONFIGS.map((field) => (
                        <tr key={field.key} className="border-b last:border-b-0">
                          <th className="w-[46%] bg-neutral-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            {field.label}
                          </th>
                          <td className="px-3 py-2 text-neutral-400">Chưa có dữ liệu</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          <div className="flex min-h-0 flex-col p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewerMode("auto")}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "auto" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
              >
                Auto
              </button>
              {sources.google ? (
                <button
                  onClick={() => setViewerMode("google")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "google" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  Google Viewer
                </button>
              ) : null}
              {sources.office ? (
                <button
                  onClick={() => setViewerMode("office")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "office" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  Office Viewer
                </button>
              ) : null}
              {sources.proxy ? (
                <button
                  onClick={() => setViewerMode("proxy")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "proxy" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  Proxy
                </button>
              ) : null}
              {sources.direct ? (
                <button
                  onClick={() => setViewerMode("direct")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "direct" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  URL gốc
                </button>
              ) : null}
            </div>

            {viewerSrc ? (
              <>
                <iframe
                  src={viewerSrc}
                  className="min-h-0 w-full flex-1 rounded-lg border"
                  title={fileName || "File preview"}
                />
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <a
                    href={viewerSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-neutral-200 px-2 py-1 text-neutral-700 hover:bg-neutral-50"
                  >
                    Mở tab mới
                  </a>
                  {preview?.expiresAt ? (
                    <span className="self-center text-neutral-500">Hết hạn: {preview.expiresAt}</span>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border bg-neutral-50 text-sm text-neutral-500">
                Chưa có URL preview từ presign.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

```

---

## File: `components\file-attachment-item.tsx`

```tsx
"use client"

import * as React from "react"
import { FileText, FileImage, FileSpreadsheet, FileCode, Download, Eye, Square, CheckSquare } from "lucide-react"

interface FileAttachmentItemProps {
  id: string
  fileName: string
  fileType: string
  fileSize: string
  isChecked?: boolean
  onCheckChange?: (checked: boolean) => void
  onViewExtract?: () => void
  onViewContent?: () => void
  onDownload?: () => void
  status?: "pending" | "completed" | "error"
}

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase()
  if (type.includes("image") || ["png", "jpg", "jpeg", "gif", "webp"].some((ext) => type.includes(ext)))
    return <FileImage className="h-3.5 w-3.5 text-primary" />
  if (type.includes("excel") || type.includes("csv") || type.includes("sheet"))
    return <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
  if (type.includes("json") || type.includes("xml") || type.includes("html"))
    return <FileCode className="h-3.5 w-3.5 text-primary" />
  return <FileText className="h-3.5 w-3.5 text-primary" />
}

export function FileAttachmentItem({
  fileName,
  fileType,
  fileSize,
  isChecked = false,
  onCheckChange,
  onViewExtract,
  onViewContent,
  onDownload,
}: FileAttachmentItemProps) {
  return (
    <div className="group relative flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-3 transition-colors hover:border-neutral-200">
      {/* Top: checkbox + icon + type */}
      <div className="flex items-start gap-2.5">
        {onCheckChange && (
          <button
            onClick={() => onCheckChange(!isChecked)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
              isChecked
                ? "border-primary bg-primary text-white"
                : "border-neutral-200 bg-white text-neutral-300 hover:border-primary/50"
            }`}
          >
            {isChecked ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
          </button>
        )}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
          {getFileIcon(fileType)}
        </div>
        <span className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
          {fileType}
        </span>
      </div>

      {/* Name */}
      <p className="line-clamp-2 text-xs font-medium leading-snug text-neutral-700" title={fileName}>
        {fileName}
      </p>

      {/* Bottom: size + actions */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-neutral-300">{fileSize}</span>
        <div className="flex items-center gap-1">
          {onViewExtract && (
            <button
              onClick={onViewExtract}
              className="flex items-center gap-1 rounded-md border border-neutral-100 bg-white px-2 py-1 text-[10px] font-medium text-neutral-400 hover:text-primary hover:border-primary/30 transition-colors"
            >
              <FileText className="h-3 w-3" /> Trích
            </button>
          )}
          {onViewContent && (
            <button
              onClick={onViewContent}
              className="flex items-center gap-1 rounded-md border border-neutral-100 bg-white px-2 py-1 text-[10px] font-medium text-neutral-400 hover:text-primary hover:border-primary/30 transition-colors"
            >
              <Eye className="h-3 w-3" /> Xem
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex h-6 w-6 items-center justify-center rounded text-neutral-300 hover:text-primary transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

```

---

## File: `components\permission-guard.tsx`

```tsx
"use client"

import { Shield } from "lucide-react"
import { usePermission, usePermissions } from "@/hooks/use-permission"

interface PermissionGuardProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({
  permission,
  permissions,
  requireAll = true,
  children,
  fallback,
}: PermissionGuardProps) {
  if (permission) {
    return (
      <SinglePermissionGuard
        permission={permission}
        children={children}
        fallback={fallback}
      />
    )
  }

  if (permissions && permissions.length > 0) {
    return (
      <MultiPermissionGuard
        permissions={permissions}
        requireAll={requireAll}
        children={children}
        fallback={fallback}
      />
    )
  }

  return <>{children}</>
}

function SinglePermissionGuard({
  permission,
  children,
  fallback,
}: {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { has, isLoading } = usePermission(permission)

  if (isLoading) return null

  if (!has) {
    return (
      <>
        {fallback ?? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Shield className="h-6 w-6 text-neutral-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300">Không có quyền truy cập</p>
              <p className="text-xs text-neutral-200">
                Bạn cần quyền <code className="rounded bg-neutral-100 px-1 py-0.5 text-[10px]">{permission}</code> để sử dụng tính năng này.
              </p>
            </div>
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}

function MultiPermissionGuard({
  permissions,
  requireAll,
  children,
  fallback,
}: {
  permissions: string[]
  requireAll: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasAll, hasAny, isLoading } = usePermissions(permissions)

  const has = requireAll ? hasAll : hasAny

  if (isLoading) return null

  if (!has) {
    return (
      <>
        {fallback ?? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Shield className="h-6 w-6 text-neutral-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300">Không có quyền truy cập</p>
              <p className="text-xs text-neutral-200">
                Bạn cần quyền phù hợp để sử dụng tính năng này.
              </p>
            </div>
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}

```

---

## File: `components\providers\query-provider.tsx`

```tsx
"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

type QueryProviderProps = {
  children: React.ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  )
}

```

---

## File: `components\template-result-modal.tsx`

```tsx
"use client"

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type ExtractionPreviewSources = {
  url?: string | null
  expiresAt?: string | null
  googleViewerUrl?: string | null
  officeViewerUrl?: string | null
  proxyUrl?: string | null
}

interface TemplateResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fields: Record<string, string>
  data: Record<string, string>
  onDataChange: (data: Record<string, string>) => void
  preview?: ExtractionPreviewSources | null
  fileName?: string | null
}

type ViewerMode = "auto" | "google" | "office" | "proxy" | "direct"

export function TemplateResultModal({
  open,
  onOpenChange,
  fields,
  data,
  onDataChange,
  preview,
  fileName,
}: TemplateResultModalProps) {
  const [viewerMode, setViewerMode] = useState<ViewerMode>("auto")
  const [localData, setLocalData] = useState<Record<string, string>>({})

  // Sync localData when data changes
  const displayData = { ...data, ...localData }

  const handleChange = (key: string, value: string) => {
    const next = { ...localData, [key]: value }
    setLocalData(next)
    onDataChange({ ...data, ...next })
  }

  const sources = useMemo(
    () => ({
      google: preview?.googleViewerUrl?.trim() || "",
      office: preview?.officeViewerUrl?.trim() || "",
      proxy: preview?.proxyUrl?.trim() || "",
      direct: preview?.url?.trim() || "",
    }),
    [preview]
  )

  const viewerSrc = useMemo(() => {
    if (viewerMode === "google" && sources.google) return sources.google
    if (viewerMode === "office" && sources.office) return sources.office
    if (viewerMode === "proxy" && sources.proxy) return sources.proxy
    if (viewerMode === "direct" && sources.direct) return sources.direct
    return sources.google || sources.office || sources.proxy || sources.direct || ""
  }, [sources, viewerMode])

  const fieldEntries = Object.entries(fields)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[94vh] max-w-[96vw] p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-black">Kết quả bóc tách</DialogTitle>
          {fileName ? (
            <p className="text-sm text-neutral-600">
              Tệp: <span className="font-medium">{fileName}</span>
            </p>
          ) : null}
        </DialogHeader>

        <div className="grid h-[calc(94vh-88px)] grid-cols-1 md:grid-cols-[minmax(420px,40%)_1fr]">
          {/* Left: editable table */}
          <div className="overflow-y-auto border-r p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700">Thông tin đã bóc tách</p>
              <p className="text-[11px] text-neutral-400">Click để sửa</p>
            </div>
            {fieldEntries.length === 0 ? (
              <p className="text-sm text-neutral-400">Không có trường nào được định nghĩa trong template.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                  <tbody>
                    {fieldEntries.map(([key, label]) => (
                      <tr key={key} className="border-b last:border-b-0">
                        <th className="w-[40%] min-w-[120px] bg-neutral-50 px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500 wrap-break-word whitespace-normal align-top">
                          {label || key}
                        </th>
                        <td className="w-[60%] px-2 py-1 align-top">
                          <input
                            type="text"
                            value={displayData[key] || ""}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-xs text-neutral-800 outline-none hover:border-neutral-200 focus:border-primary focus:bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: file preview */}
          <div className="flex min-h-0 flex-col p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewerMode("auto")}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "auto" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
              >
                Auto
              </button>
              {sources.google ? (
                <button
                  onClick={() => setViewerMode("google")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "google" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  Google Viewer
                </button>
              ) : null}
              {sources.office ? (
                <button
                  onClick={() => setViewerMode("office")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "office" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  Office Viewer
                </button>
              ) : null}
              {sources.proxy ? (
                <button
                  onClick={() => setViewerMode("proxy")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "proxy" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  Proxy
                </button>
              ) : null}
              {sources.direct ? (
                <button
                  onClick={() => setViewerMode("direct")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${viewerMode === "direct" ? "border-primary bg-primary text-white" : "border-neutral-200 text-neutral-700"}`}
                >
                  URL gốc
                </button>
              ) : null}
            </div>

            {viewerSrc ? (
              <>
                <iframe
                  src={viewerSrc}
                  className="min-h-0 w-full flex-1 rounded-lg border"
                  title={fileName || "File preview"}
                />
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <a
                    href={viewerSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-neutral-200 px-2 py-1 text-neutral-700 hover:bg-neutral-50"
                  >
                    Mở tab mới
                  </a>
                  {preview?.expiresAt ? (
                    <span className="self-center text-neutral-500">Hết hạn: {preview.expiresAt}</span>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border bg-neutral-50 text-sm text-neutral-500">
                Chưa có URL preview từ presign.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

```

---

## File: `components\tour-button.tsx`

```tsx
"use client"

import { HelpCircle } from "lucide-react"
import { useTour } from "@/hooks/useTour"

export default function TourButton() {
  const { startTour } = useTour()

  return (
    <button
      onClick={startTour}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      title="Hướng dẫn sử dụng"
    >
      <HelpCircle className="h-6 w-6" />
    </button>
  )
}

```

---

## File: `components\ui\avatar.tsx`

```tsx
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-blue-100 text-blue-700",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }

```

---

## File: `components\ui\badge.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        {
          "border-transparent bg-blue-600 text-white shadow-sm": variant === "default",
          "border-transparent bg-blue-100 text-blue-900": variant === "secondary",
          "border-transparent bg-red-600 text-white shadow-sm": variant === "destructive",
          "text-blue-950 border-blue-200": variant === "outline",
          "border-transparent bg-green-100 text-green-700": variant === "success",
          "border-transparent bg-amber-100 text-amber-700": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }

```

---

## File: `components\ui\breadcrumb.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-blue-600 sm:gap-2.5",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a">
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "transition-colors hover:text-blue-900",
      className
    )}
    {...props}
  />
))
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("font-medium text-blue-900", className)}
    aria-current="page"
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipsis"

function ChevronRight({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function MoreHorizontal({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

```

---

## File: `components\ui\button.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-600 text-white hover:bg-blue-700 shadow-sm": variant === "default",
            "bg-red-600 text-white hover:bg-red-700 shadow-sm": variant === "destructive",
            "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50": variant === "outline",
            "bg-blue-100 text-blue-900 hover:bg-blue-200": variant === "secondary",
            "text-blue-700 hover:bg-blue-50": variant === "ghost",
            "text-blue-600 underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3 text-xs": size === "sm",
            "h-11 rounded-lg px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

```

---

## File: `components\ui\card.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-blue-200 bg-white text-blue-950 shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-blue-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

---

## File: `components\ui\checkbox.tsx`

```tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-blue-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

```

---

## File: `components\ui\dialog.tsx`

```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

```

---

## File: `components\ui\dropdown-menu.tsx`

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-blue-50 data-[state=open]:bg-blue-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-blue-200 bg-white p-1 text-blue-950 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-blue-200 bg-white p-1 text-blue-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-blue-50 focus:text-blue-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-blue-50 focus:text-blue-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-blue-50 focus:text-blue-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-blue-200", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

function Check({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function Circle({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-2 w-2", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

```

---

## File: `components\ui\file-viewer-modal.tsx`

```tsx
"use client"

import * as React from "react"
import { X, Download, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"

interface FileViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileUrl: string
  fileName?: string
  fileType?: string
  downloadUrl?: string
}

export function FileViewerModal({ open, onOpenChange, fileUrl, fileName, fileType, downloadUrl }: FileViewerModalProps) {
  const getFileType = (url: string, type?: string) => {
    // Prioritize explicit type parameter (for blob URLs)
    if (type) {
      const normalizedType = type.toLowerCase()
      if (normalizedType.includes('pdf')) return 'pdf'
      if (normalizedType.includes('image')) return 'image'
      if (normalizedType.includes('word') || normalizedType.includes('document')) return 'word'
      if (normalizedType.includes('excel') || normalizedType.includes('sheet')) return 'excel'
      if (normalizedType.includes('powerpoint') || normalizedType.includes('presentation')) return 'powerpoint'
    }
    
    // Fallback to URL-based detection
    const ext = url.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) return 'image'
    if (['doc', 'docx'].includes(ext || '')) return 'word'
    if (['xls', 'xlsx'].includes(ext || '')) return 'excel'
    if (['ppt', 'pptx'].includes(ext || '')) return 'powerpoint'
    return 'unknown'
  }

  const type = getFileType(fileUrl, fileType)

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <div className="flex items-center justify-center bg-black/5 rounded-lg p-4">
            <img 
              src={fileUrl} 
              alt={fileName || "Preview"} 
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        )

      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-[calc(90vh-120px)] rounded-lg border"
            title={fileName || "PDF Preview"}
          />
        )

      case 'word':
      case 'excel':
      case 'powerpoint':
        // Check if URL is Google Docs Viewer URL
        if (fileUrl.includes('docs.google.com/viewer')) {
          return (
            <iframe
              src={fileUrl}
              className="w-full h-[calc(90vh-120px)] rounded-lg border"
              title={fileName || "Office Document Preview"}
            />
          )
        }
        // Office files require public URLs for external viewers - show download message
        return (
          <div className="flex flex-col items-center justify-center h-[calc(90vh-120px)] bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Download className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể xem trước file này</h3>
            <p className="text-gray-600 mb-6 max-w-md">File Office cần URL công khai để xem trước. Vui lòng tải xuống để xem nội dung.</p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="h-4 w-4" />
              Tải xuống file
            </button>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[85vh] bg-muted rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-muted-foreground mb-4">Không thể xem trước file này</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              Mở file trong tab mới
            </a>
          </div>
        )
    }
  }

  const handleDownload = async () => {
    if (!downloadUrl) {
      console.error("No download URL available")
      return
    }
    try {
      const response = await MAIL_CONNECTOR_AXIOS.get(downloadUrl, { responseType: 'blob' })
      const blob = response.data as Blob
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Tải xuống thất bại. Vui lòng thử lại.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4 text-gray-900">{fileName || "Xem file"}</DialogTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Download className="h-4 w-4" />
                Tải xuống
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
                Đóng
              </button>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-2">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

```

---

## File: `components\ui\input.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm text-black shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

---

## File: `components\ui\label.tsx`

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), "text-black", className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```

---

## File: `components\ui\scroll-area.tsx`

```tsx
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-blue-200/50 hover:bg-blue-300/50 transition-colors" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }

```

---

## File: `components\ui\select.tsx`

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-lg border border-neutral-100 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white transition-colors focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-neutral-100 bg-white text-neutral-300 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-neutral-50 focus:text-neutral-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
}

```

---

## File: `components\ui\separator.tsx`

```tsx
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-blue-200",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

```

---

## File: `components\ui\table.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-neutral-50/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-neutral-50/50 data-[state=selected]:bg-neutral-100",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-4 text-left align-middle font-medium text-primary [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-neutral-500", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

```

---

## File: `components\ui\tabs.tsx`

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: "",
  onValueChange: () => {},
})

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    onValueChange: (value: string) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div ref={ref} className={cn("", className)} {...props} />
  </TabsContext.Provider>
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-blue-50 p-1 text-blue-600",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context.value === value

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-blue-900 shadow-sm"
          : "text-blue-600 hover:bg-blue-100",
        className
      )}
      onClick={() => context.onValueChange(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context.value === value

  if (!isActive) return null

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }

```

---

## File: `components\ui\tooltip.tsx`

```tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-blue-200 bg-white px-3 py-1.5 text-sm text-blue-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

```

---

## File: `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}

```

---

## File: `eslint.config.mjs`

```mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

```

---

## File: `frontend-guide.md`

```md
# MailConnector - Frontend Integration Guide

**Version:** 1.1  
**Last Updated:** 2026-05-24  
**Target Audience:** Frontend Developers, UI/UX Designers

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [UI Components Guidelines](#ui-components-guidelines)
6. [Error Handling](#error-handling)
7. [TypeScript Interfaces](#typescript-interfaces)
8. [Example Implementation](#example-implementation)
9. [Advanced Features](#advanced-features)

---

## Overview

MailConnector là hệ thống tích hợp email hỗ trợ kết nối tài khoản Gmail qua OAuth2, đồng bộ email, và quản lý tin nhắn.

### Base URL

```
https://{domain}/api/v1
```

### Supported Providers

- **Gmail** (hiện tại)
- Outlook/Exchange (dự kiến)

---

## Authentication Flow

### 1. OAuth2 Flow cho Gmail

#### Bước 1: Lấy Authorization URL

```http
POST /api/v1/mail-auth/oauth-url
Content-Type: application/json

{
  "redirectUri": "https://your-app.com/callback",
  "state": "random-state-string"
}
```

**Query Parameters:**
- `redirectUri` (required) - URL callback sau khi authorize
- `state` (required) - Chuỗi ngẫu nhiên để prevent CSRF

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "provider": "gmail"
  },
  "meta": {},
  "errors": []
}
```

**UI Action:** Redirect user đến `authUrl`

#### Bước 2: Xử lý Callback

Sau khi user authorize, Google redirect về `redirectUri` với `authorizationCode`.

#### Bước 3: Kết nối tài khoản

```http
POST /api/v1/mail-accounts/connect
Content-Type: application/json

{
  "authorizationCode": "4/0AX4XfWh...",
  "redirectUri": "https://your-app.com/callback"
}
```

**Response (201 Created):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "provider": "gmail",
    "emailAddress": "user@gmail.com",
    "displayName": "John Doe",
    "status": "active",
    "lastSyncedAt": null,
    "createdAt": "2026-05-22T10:30:00.000Z",
    "updatedAt": "2026-05-22T10:30:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

**UI Action:** Hiển thị thông báo thành công, chuyển đến danh sách tài khoản

---

## API Endpoints

### Mail Accounts

#### Lấy danh sách tài khoản email

```http
GET /api/v1/mail-accounts
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "provider": "gmail",
      "emailAddress": "user@gmail.com",
      "displayName": "John Doe",
      "status": "active",
      "lastSyncedAt": "2026-05-22T09:00:00.000Z",
      "createdAt": "2026-05-20T10:30:00.000Z",
      "updatedAt": "2026-05-22T09:00:00.000Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

#### Lấy chi tiết tài khoản

```http
GET /api/v1/mail-accounts/{id}
```

**Response (200 OK):** Tương tự như item trong danh sách

#### Cập nhật tài khoản

```http
PUT /api/v1/mail-accounts/{id}
Content-Type: application/json

{
  "displayName": "New Display Name"
}
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "uuid",
    "provider": "gmail",
    "emailAddress": "user@gmail.com",
    "displayName": "New Display Name",
    "status": "active",
    "lastSyncedAt": "2026-05-22T09:00:00.000Z",
    "createdAt": "2026-05-20T10:30:00.000Z",
    "updatedAt": "2026-05-22T10:30:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

#### Xóa tài khoản

```http
DELETE /api/v1/mail-accounts/{id}
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "uuid",
    "deleted": true
  },
  "meta": {},
  "errors": []
}
```

#### Lấy trạng thái đồng bộ

```http
GET /api/v1/mail-accounts/{id}/sync-status
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "accountId": "uuid",
    "status": "syncing",
    "totalMessages": 1500,
    "syncedMessages": 750,
    "failedMessages": 2,
    "currentFolder": "INBOX",
    "lastSyncedAt": "2026-05-22T09:00:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

**Status values:**
- `Pending` - Chờ đồng bộ
- `Syncing` - Đang đồng bộ
- `Success` - Hoàn thành thành công
- `PartialSuccess` - Hoàn thành một phần
- `Failed` - Thất bại

#### Kích hoạt đồng bộ

```http
POST /api/v1/mail-accounts/{id}/sync
Content-Type: application/json

{
  "syncType": "full",
  "folderIds": ["INBOX", "SENT"],
  "fromDate": "2026-01-01T00:00:00.000Z",
  "toDate": "2026-05-22T00:00:00.000Z"
}
```

**Response (202 Accepted):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "jobId": "uuid",
    "status": "queued"
  },
  "meta": {
    "job": {
      "jobId": "uuid",
      "status": "queued",
      "pollUrl": "/api/v1/mail-accounts/{id}/sync-status"
    }
  },
  "errors": []
}
```

**UI Action:** Hiển thị progress bar, poll `/sync-status` để cập nhật

#### Tạo tài khoản trực tiếp

```http
POST /api/v1/mail-accounts
Content-Type: application/json

{
  "provider": "gmail",
  "authorizationCode": "4/0AX4XfWh...",
  "redirectUri": "https://your-app.com/callback"
}
```

**Response (201 Created):** Tương tự như endpoint `/connect`

**UI Action:** Alternative endpoint để tạo tài khoản, trả về kết quả tương tự

#### Ping tài khoản

```http
GET /api/v1/mail-accounts/{id}/ping
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "status": "ok"
}
```

**UI Action:** Health check cho tài khoản, dùng để kiểm tra kết nối

#### Đồng bộ trực tiếp (không qua queue)

```http
POST /api/v1/mail-accounts/{id}/sync-direct
Content-Type: application/json

{
  "syncType": "full",
  "folderIds": ["INBOX", "SENT"],
  "fromDate": "2026-01-01T00:00:00.000Z",
  "toDate": "2026-05-22T00:00:00.000Z"
}
```

**Response (200 OK):**

```json
{
  "synced": true
}
```

**UI Action:** Đồng bộ trực tiếp mà không qua job queue - chủ yếu dùng cho testing

### Mail Messages

#### Lấy danh sách tin nhắn

```http
GET /api/v1/mail-messages?page=1&pageSize=20&filters=mailAccountId==<guid>&sortField=receivedAt&sortOrder=desc
```

**Query Parameters:**
- `page` (default: 1) - Số trang
- `pageSize` (default: 20) - Số item/trang
- `filters` (optional) - Bộ lọc theo DSL (xem ví dụ dưới)
- `sortField` (optional) - Trường để sort (default: receivedAt)
- `sortOrder` (optional) - Thứ tự sort (asc/desc, default: desc)

**Filter DSL Examples:**
- `mailAccountId==<guid>` - Lọc theo tài khoản
- `fromEmail@=gmail` - Lọc theo người gửi (contains)
- `hasAttachments==true` - Lọc có đính kèm
- `syncStatus==Synced|syncStatus==Failed` - Lọc theo trạng thái đồng bộ (OR)
- `receivedAt>=2025-01-01` - Lọc theo ngày nhận
- `receivedAt>=2025-01-01&receivedAt<=2025-12-31` - Lọc theo khoảng ngày

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "provider": "gmail",
      "subject": "Project Update",
      "fromEmail": "sender@example.com",
      "fromName": "Jane Smith",
      "receivedAt": "2026-05-22T09:00:00.000Z",
      "sentAt": "2026-05-22T08:55:00.000Z",
      "createdAt": "2026-05-22T09:00:00.000Z",
      "updatedAt": "2026-05-22T09:00:00.000Z",
      "hasAttachments": true,
      "syncStatus": "synced",
      "processStatus": "processed"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "errors": []
}
```

#### Lấy chi tiết tin nhắn

```http
GET /api/v1/mail-messages/{id}
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "uuid",
    "subject": "Project Update",
    "fromEmail": "sender@example.com",
    "fromName": "Jane Smith",
    "toEmails": ["recipient@example.com"],
    "ccEmails": ["cc@example.com"],
    "receivedAt": "2026-05-22T09:00:00.000Z",
    "sentAt": "2026-05-22T08:55:00.000Z",
    "createdAt": "2026-05-22T09:00:00.000Z",
    "updatedAt": "2026-05-22T09:00:00.000Z",
    "bodyText": "Plain text content...",
    "bodyHtml": "<p>HTML content...</p>",
    "attachments": [
      {
        "id": "uuid",
        "fileName": "document.pdf",
        "contentType": "application/pdf",
        "fileSize": 1024000,
        "downloadStatus": "available",
        "downloadUrl": null,
        "createdAt": "2026-05-22T09:00:00.000Z",
        "updatedAt": "2026-05-22T09:00:00.000Z"
      }
    ]
  },
  "meta": {},
  "errors": []
}
```

#### Lấy danh sách đính kèm

```http
GET /api/v1/mail-messages/{id}/attachments
```

**Response (200 OK):** Tương tự như `attachments` trong chi tiết tin nhắn

#### Tải xuống đính kèm

```http
GET /api/v1/mail-messages/{messageId}/attachments/{attachmentId}/download
```

**Response:** Binary file stream

**UI Action:** Tạo download link hoặc trigger browser download

#### Lấy nội dung đính kèm (base64)

```http
GET /api/v1/mail-messages/{messageId}/attachments/{attachmentId}/content
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "content": "base64_encoded_content",
    "fileName": "document.pdf",
    "contentType": "application/pdf"
  },
  "meta": {},
  "errors": []
}
```

#### Trích xuất văn bản từ đính kèm PDF

```http
GET /api/v1/mail-messages/{messageId}/attachments/{attachmentId}/extract-text
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "text": "Extracted text content from PDF...",
    "fileName": "document.pdf"
  },
  "meta": {},
  "errors": []
}
```

**Note:** Chỉ hỗ trợ file PDF

### Document Processing

#### Xử lý tài liệu đơn với AI

```http
POST /api/v1/document-processor/process
Content-Type: application/json

{
  "content": "Document content here...",
  "prompt": "Extract key information",
  "model": "gpt-4",
  "isImage": false,
  "mimeType": "text/plain"
}
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "result": "Extracted information...",
    "model": "gpt-4",
    "tokensUsed": 150
  },
  "meta": {},
  "errors": []
}
```

#### Xử lý nhiều tài liệu

```http
POST /api/v1/document-processor/process-multiple
Content-Type: application/json

{
  "files": [
    {
      "fileName": "document1.pdf",
      "content": "base64 or text content",
      "type": "text",
      "mimeType": "application/pdf"
    }
  ],
  "prompt": "Compare these documents",
  "model": "gpt-4"
}
```

**Response (200 OK):** Tương tự như xử lý đơn

### Email Analysis Results

#### Lấy danh sách kết quả phân tích

```http
GET /api/v1/mail-analysis-results?status=pending
```

**Query Parameters:**
- `status` (optional) - Lọc theo trạng thái (NotStarted, Processing, Completed, PendingReview, Approved, Rejected, Failed)

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "mailMessageId": "uuid",
      "category": "BusinessDocument",
      "detectedIntent": "CreateOrderRequest",
      "status": "PendingReview",
      "confidenceScore": 0.95,
      "extractedFields": {
        "invoiceNumber": "INV-001",
        "amount": "1000",
        "dueDate": "2026-06-01"
      },
      "missingFields": [],
      "warnings": [],
      "modelName": "gpt-4",
      "inputTokenCount": 500,
      "outputTokenCount": 200,
      "costEstimate": 0.01,
      "reviewedByUserId": null,
      "reviewedAt": null,
      "createdAt": "2026-05-22T10:00:00.000Z",
      "updatedAt": "2026-05-22T10:00:00.000Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

#### Tạo kết quả phân tích mới

```http
POST /api/v1/mail-analysis-results
Content-Type: application/json

{
  "mailMessageId": "uuid"
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto

#### Phê duyệt kết quả

```http
POST /api/v1/mail-analysis-results/{id}/approve
Content-Type: application/json

{
  "userId": "uuid"
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto với status = approved

#### Từ chối kết quả

```http
POST /api/v1/mail-analysis-results/{id}/reject
Content-Type: application/json

{
  "userId": "uuid",
  "reason": "Incorrect extraction"
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto với status = rejected

#### Cập nhật fields

```http
PUT /api/v1/mail-analysis-results/{id}/fields
Content-Type: application/json

{
  "extractedFields": {
    "invoiceNumber": "INV-001",
    "amount": "1000"
  },
  "missingFields": ["dueDate"],
  "warnings": ["Amount seems low"]
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto đã cập nhật

#### Lấy delivery logs

```http
GET /api/v1/mail-analysis-results/{id}/delivery-logs
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "subscriberCode": "sub_001",
      "eventType": "analysis.completed",
      "callbackUrl": "https://your-app.com/webhook",
      "responseStatus": 200,
      "responseBody": "{\"status\": \"success\"}",
      "status": "delivered",
      "retryCount": 0,
      "errorMessage": null,
      "deliveredAt": "2026-05-22T10:05:00.000Z",
      "createdAt": "2026-05-22T10:00:00.000Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

### Email Processing

#### Xử lý email

```http
POST /api/v1/mail-messages/{id}/process
```

**Response (200 OK):** Tạo analysis result mới

#### Chuẩn hóa email

```http
POST /api/v1/mail-messages/{id}/normalize
```

**Response (200 OK):** Email được chuẩn hóa

#### Phân loại email

```http
POST /api/v1/mail-messages/{id}/classify
```

**Response (200 OK):** Email được phân loại

#### Kích hoạt pipeline xử lý

```http
POST /api/v1/mail-messages/{id}/trigger-pipeline
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "message": "Processing pipeline triggered successfully"
  },
  "meta": {},
  "errors": []
}
```

**UI Action:** Hiển thị thông báo pipeline đã được kích hoạt

#### Lấy danh sách processing jobs

```http
GET /api/v1/mail-messages/{id}/processing-jobs
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "jobType": "normalize",
      "status": "completed",
      "createdAt": "2026-05-22T10:00:00.000Z",
      "startedAt": "2026-05-22T10:00:01.000Z",
      "completedAt": "2026-05-22T10:00:05.000Z",
      "errorMessage": null,
      "retryCount": 0
    }
  ],
  "meta": {},
  "errors": []
}
```

#### Trích xuất trường từ email

```http
POST /api/v1/mail-messages/{id}/extract
Content-Type: application/json

{
  "templateCode": "invoice_template",
  "expectedFields": {
    "invoiceNumber": "string",
    "amount": "number"
  }
}
```

**Response (200 OK):** Trích xuất fields theo template

### Email Templates

#### Lấy danh sách templates

```http
GET /api/v1/mail-templates
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "templateCode": "invoice_template",
      "templateName": "Invoice Template",
      "description": "Template for processing invoices",
      "subjectPattern": "Invoice.*",
      "bodyPattern": "Total:.*",
      "expectedFields": {
        "invoiceNumber": "Invoice #",
        "amount": "Total amount"
      },
      "documentTypes": ["pdf", "docx"],
      "isActive": true,
      "createdAt": "2026-05-20T10:00:00.000Z",
      "updatedAt": "2026-05-20T10:00:00.000Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

#### Tạo template mới

```http
POST /api/v1/mail-templates
Content-Type: application/json

{
  "templateCode": "new_template",
  "templateName": "New Template",
  "description": "Template description",
  "subjectPattern": "Pattern.*",
  "bodyPattern": "Body pattern",
  "expectedFields": {
    "field1": "description"
  },
  "documentTypes": ["pdf"]
}
```

**Response (201 Created):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "uuid",
    "templateCode": "new_template",
    "templateName": "New Template",
    "description": "Template description",
    "subjectPattern": "Pattern.*",
    "bodyPattern": "Body pattern",
    "expectedFields": {
      "field1": "description"
    },
    "documentTypes": ["pdf"],
    "isActive": true,
    "createdAt": "2026-05-22T10:30:00.000Z",
    "updatedAt": "2026-05-22T10:30:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

**Location Header:** `/api/v1/mail-templates/{id}`

#### Cập nhật template

```http
PUT /api/v1/mail-templates/{id}
Content-Type: application/json

{
  "templateName": "Updated Name",
  "isActive": false
}
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "uuid",
    "templateCode": "invoice_template",
    "templateName": "Updated Name",
    "description": "Template description",
    "subjectPattern": "Pattern.*",
    "bodyPattern": "Body pattern",
    "expectedFields": {
      "field1": "description"
    },
    "documentTypes": ["pdf"],
    "isActive": false,
    "createdAt": "2026-05-20T10:00:00.000Z",
    "updatedAt": "2026-05-22T10:30:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

#### Xóa template

```http
DELETE /api/v1/mail-templates/{id}
```

**Response (204 No Content)**

### Webhook Subscriptions

#### Lấy danh sách subscriptions

```http
GET /api/v1/webhook-subscriptions
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "subscriberCode": "sub_001",
      "callbackUrl": "https://your-app.com/webhook",
      "eventTypes": ["email.received", "analysis.completed"],
      "isActive": true,
      "createdAt": "2026-05-20T10:00:00.000Z",
      "updatedAt": "2026-05-20T10:00:00.000Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

#### Tạo subscription mới

```http
POST /api/v1/webhook-subscriptions
Content-Type: application/json

{
  "subscriberCode": "sub_001",
  "callbackUrl": "https://your-app.com/webhook",
  "eventTypes": ["email.received", "analysis.completed"],
  "secretKey": "optional-secret"
}
```

**Response (201 Created):** Trả về WebhookSubscriptionDto

#### Cập nhật subscription

```http
PUT /api/v1/webhook-subscriptions/{id}
Content-Type: application/json

{
  "callbackUrl": "https://new-url.com/webhook",
  "eventTypes": ["email.received"],
  "isActive": false
}
```

**Response (200 OK):** Trả về WebhookSubscriptionDto đã cập nhật

#### Xóa subscription

```http
DELETE /api/v1/webhook-subscriptions/{id}
```

**Response (204 No Content)**

#### Test webhook

```http
POST /api/v1/webhook-subscriptions/{id}/test
Content-Type: application/json

{
  "eventType": "email.received",
  "payload": {
    "test": true
  }
}
```

**Response (200 OK):**

```json
{
  "message": "Test webhook dispatched successfully"
}
```

---

## Data Models

### MailAccount

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID tài khoản |
| `provider` | string | Nhà cung cấp (gmail, outlook) |
| `emailAddress` | string | Địa chỉ email |
| `displayName` | string? | Tên hiển thị |
| `status` | string | Trạng thái (Connected, AuthRequired, Syncing, Paused, Disconnected, Error) |
| `lastSyncedAt` | DateTime? | Thời gian đồng bộ cuối |
| `createdAt` | DateTime | Thời gian tạo |
| `updatedAt` | DateTime | Thời gian cập nhật |

### MailMessage

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID tin nhắn |
| `provider` | string | Nhà cung cấp |
| `subject` | string? | Tiêu đề |
| `fromEmail` | string? | Email người gửi |
| `fromName` | string? | Tên người gửi |
| `receivedAt` | DateTime? | Thời gian nhận |
| `sentAt` | DateTime? | Thời gian gửi |
| `createdAt` | DateTime | Thời gian tạo bản ghi |
| `updatedAt` | DateTime | Thời gian cập nhật bản ghi |
| `hasAttachments` | boolean | Có đính kèm không |
| `syncStatus` | string | Trạng thái đồng bộ |
| `processStatus` | string | Trạng thái xử lý |

### Attachment

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID đính kèm |
| `fileName` | string | Tên file |
| `contentType` | string? | MIME type |
| `fileSize` | long? | Kích thước (bytes) |
| `downloadStatus` | string | Trạng thái tải xuống |
| `downloadUrl` | string? | URL tải xuống |
| `createdAt` | DateTime | Thời gian tạo bản ghi |
| `updatedAt` | DateTime | Thời gian cập nhật bản ghi |

### SyncStatus

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | GUID | ID tài khoản |
| `status` | string | Trạng thái (Pending, Syncing, Success, PartialSuccess, Failed) |
| `totalMessages` | number | Tổng số tin nhắn |
| `syncedMessages` | number | Số đã đồng bộ |
| `failedMessages` | number | Số thất bại |
| `currentFolder` | string? | Folder hiện tại |
| `lastSyncedAt` | DateTime? | Thời gian đồng bộ cuối |

### EmailAnalysisResult

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID kết quả phân tích |
| `mailMessageId` | GUID | ID email message |
| `category` | string? | Category (BusinessDocument, OrderRequest, SupportRequest, Notification, SystemEmail, Spam, Unknown) |
| `detectedIntent` | string? | Intent detected (CreateOrderRequest, UpdateOrderRequest, CancelOrderRequest, SupportInquiry, InformationRequest, Unknown) |
| `status` | string | Trạng thái (NotStarted, Processing, Completed, PendingReview, Approved, Rejected, Failed) |
| `confidenceScore` | decimal? | Độ tin cậy (0-1) |
| `extractedFields` | object? | Fields đã trích xuất |
| `missingFields` | string[]? | Fields còn thiếu |
| `warnings` | string[]? | Cảnh báo |
| `modelName` | string? | Model AI sử dụng |
| `inputTokenCount` | int? | Số token input |
| `outputTokenCount` | int? | Số token output |
| `costEstimate` | decimal? | Chi phí ước tính |
| `reviewedByUserId` | GUID? | ID user review |
| `reviewedAt` | DateTime? | Thời gian review |
| `createdAt` | DateTime | Thời gian tạo |
| `updatedAt` | DateTime | Thời gian cập nhật |

### EmailTemplate

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID template |
| `templateCode` | string | Mã template (unique) |
| `templateName` | string | Tên template |
| `description` | string? | Mô tả |
| `subjectPattern` | string? | Pattern subject (regex) |
| `bodyPattern` | string? | Pattern body (regex) |
| `expectedFields` | object? | Fields mong đợi |
| `documentTypes` | string[]? | Loại document hỗ trợ |
| `isActive` | boolean | Có active không |
| `createdAt` | DateTime | Thời gian tạo |
| `updatedAt` | DateTime | Thời gian cập nhật |

### WebhookSubscription

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID subscription |
| `subscriberCode` | string | Mã subscriber (unique) |
| `callbackUrl` | string | URL callback |
| `eventTypes` | string[] | Event types subscribed |
| `isActive` | boolean | Có active không |
| `createdAt` | DateTime | Thời gian tạo |
| `updatedAt` | DateTime | Thời gian cập nhật |

### DocumentProcessingResponse

| Field | Type | Description |
|-------|------|-------------|
| `result` | string | Kết quả xử lý |
| `model` | string | Model AI sử dụng |
| `tokensUsed` | int | Số token đã dùng |

---

## UI Components Guidelines

### 1. Mail Accounts List Page

**Layout:**
- Header: "Email Accounts" + "Add Account" button
- Table/Grid hiển thị danh sách tài khoản
- Columns: Email, Provider, Status, Last Synced, Actions

**Actions:**
- Add Account → Mở modal OAuth flow
- Sync → Kích hoạt đồng bộ
- Delete → Xác nhận xóa
- View Details → Chuyển đến trang chi tiết

**Status Indicators:**
- Connected: Green badge
- AuthRequired: Yellow badge
- Syncing: Blue badge + spinner
- Paused: Gray badge
- Disconnected: Orange badge
- Error: Red badge

### 2. OAuth Connect Modal

**Flow:**
1. User click "Add Account"
2. Hiển thị modal với provider selection (Gmail hiện tại)
3. User chọn provider → gọi `/oauth-url`
4. Redirect đến Google OAuth page
5. Callback → gọi `/connect` với authorization code
6. Success → Đóng modal, refresh danh sách
7. Error → Hiển thị error message

**UI Elements:**
- Provider cards (Gmail icon + label)
- Loading state trong khi redirect
- Error message nếu failed

### 3. Sync Progress

**Display:**
- Progress bar: `(syncedMessages / totalMessages) * 100`
- Status text: "Syncing... 750/1500 messages"
- Current folder: "Current: INBOX"
- Failed count: "Failed: 2" (nếu > 0)

**Behavior:**
- Poll `/sync-status` mỗi 2-3 giây
- Auto-stop khi status = `completed` hoặc `failed`
- Show retry button nếu failed

### 4. Mail Messages List

**Layout:**
- Header: "Messages" + Filters
- Filters: Account dropdown, Search by sender, Has attachment toggle
- Table/List view với pagination

**Columns:**
- Subject (clickable → detail)
- From
- Received At
- Attachment icon (nếu có)
- Status badges

**Pagination:**
- Page size selector (10, 20, 50, 100)
- Page navigation (Previous, Next, Page numbers)
- Total count display

### 5. Message Detail

**Layout:**
- Header: Subject + Back button
- Info section: From, To, CC, Date
- Body: HTML content (sanitized)
- Attachments section (nếu có)

**Attachments:**
- List view với icon, filename, size
- Download button → gọi `/download` endpoint
- Preview cho images (nếu hỗ trợ)

### 6. Analysis Results List

**Layout:**
- Header: "Analysis Results" + Filters
- Filters: Status dropdown, Category dropdown, Date range
- Table/List view với pagination

**Columns:**
- Email Subject (clickable → email detail)
- Category badge
- Intent badge
- Confidence score (progress bar)
- Status badge
- Actions (Approve, Reject, View)

**Status Indicators:**
- NotStarted: Gray badge
- Processing: Blue badge + spinner
- Completed: Blue badge
- PendingReview: Yellow badge
- Approved: Green badge
- Rejected: Red badge
- Failed: Red badge

**Actions:**
- Approve → Phê duyệt kết quả
- Reject → Mở modal nhập lý do
- View → Xem chi tiết extracted fields

### 7. Analysis Result Detail

**Layout:**
- Header: "Analysis Result" + Back button
- Info section: Email info, Category, Intent, Confidence
- Extracted Fields section (key-value pairs)
- Missing Fields section (nếu có)
- Warnings section (nếu có)
- AI Info section: Model, Tokens, Cost
- Actions: Approve/Reject buttons

**Extracted Fields:**
- Display as key-value table
- Editable fields (nếu cần chỉnh sửa)
- Copy button cho từng field

### 8. Templates Management

**Layout:**
- Header: "Email Templates" + "Create Template" button
- Table/Grid hiển thị danh sách templates
- Columns: Template Code, Name, Description, Document Types, Active, Actions

**Actions:**
- Create → Mở form tạo template
- Edit → Mở form chỉnh sửa
- Delete → Xác nhận xóa
- Toggle Active → Bật/tắt template

**Template Form:**
- Template Code (required, unique)
- Template Name (required)
- Description (optional)
- Subject Pattern (regex, optional)
- Body Pattern (regex, optional)
- Expected Fields (key-value pairs)
- Document Types (multi-select)
- Active toggle

### 9. Webhook Subscriptions

**Layout:**
- Header: "Webhook Subscriptions" + "Add Subscription" button
- Table hiển thị danh sách subscriptions
- Columns: Subscriber Code, Callback URL, Event Types, Active, Actions

**Actions:**
- Add → Mở form tạo subscription
- Edit → Mở form chỉnh sửa
- Delete → Xác nhận xóa
- Test → Test webhook với payload tùy chỉnh
- Toggle Active → Bật/tắt subscription

**Subscription Form:**
- Subscriber Code (required, unique)
- Callback URL (required, must be valid URL)
- Event Types (multi-select from available events)
- Secret Key (optional, for signature verification)
- Active toggle

**Available Event Types:**
- `email.received` - Email mới được đồng bộ
- `email.synced` - Email đồng bộ hoàn tất
- `analysis.completed` - Phân tích email hoàn tất
- `analysis.approved` - Kết quả được phê duyệt
- `analysis.rejected` - Kết quả bị từ chối

### AI Usage

#### Lấy thống kê sử dụng OpenAI

```http
GET /api/v1/ai/openai-usage?startDate=2026-05-01&endDate=2026-05-31
```

**Query Parameters:**
- `startDate` (optional, date) - Ngày bắt đầu (default: 30 ngày trước)
- `endDate` (optional, date) - Ngày kết thúc (default: hiện tại)

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "startDate": "2026-05-01",
    "endDate": "2026-05-31",
    "summary": {
      "totalRequests": 1500,
      "totalContextTokens": 500000,
      "totalGeneratedTokens": 300000,
      "totalTokens": 800000,
      "totalCost": 12.50
    },
    "dailyUsage": [
      {
        "date": "2026-05-22T00:00:00.000Z",
        "requests": 50,
        "contextTokens": 15000,
        "generatedTokens": 10000,
        "totalTokens": 25000,
        "cost": 0.40
      }
    ]
  },
  "meta": {},
  "errors": []
}
```

**UI Action:** Hiển thị dashboard thống kê chi phí AI

#### Lấy thống kê sử dụng OpenAI tháng hiện tại

```http
GET /api/v1/ai/openai-usage/current-month
```

**Response (200 OK):** Tương tự như trên nhưng chỉ cho tháng hiện tại

**UI Action:** Hiển thị tổng quan chi phí tháng hiện tại

### OAuth Callback

#### Xử lý OAuth callback từ Google

```http
GET /oauth/callback?code=4/0AX4XfWh...&state=random-state-string
```

**Query Parameters:**
- `code` (required) - Authorization code từ Google
- `state` (required) - State string để prevent CSRF

**Response:** HTML page hiển thị kết quả (thành công hoặc thất bại)

**UI Action:**
- Endpoint này được Google redirect về sau khi user authorize
- Frontend không cần gọi trực tiếp, chỉ cần cấu hình redirect URI trong Google OAuth console
- Sau khi callback thành công, user có thể được redirect về frontend app

---

## Error Handling

### Standard Error Response

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": "email",
      "code": "VALIDATION_INVALID_EMAIL",
      "message": "Email không hợp lệ",
      "messageKey": "validation.email.invalid",
      "severity": "low"
    }
  ]
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Tài nguyên không tồn tại |
| `VALIDATION_ERROR` | 422 | Lỗi validation |
| `UNAUTHORIZED` | 401 | Chưa xác thực |
| `FORBIDDEN` | 403 | Không có quyền |
| `EXTERNAL_SERVICE_ERROR` | 502 | Lỗi service bên ngoài (Google API) |
| `RATE_LIMIT_EXCEEDED` | 429 | Vượt quá giới hạn |

### UI Error Handling

**Validation Errors:**
- Hiển thị error message dưới field tương ứng
- Use `messageKey` cho i18n nếu cần

**Not Found:**
- Hiển thị 404 page hoặc empty state
- Message: "Resource not found"

**External Service Errors:**
- Hiển thị friendly message: "Cannot connect to email provider"
- Suggest user thử lại sau

**Rate Limit:**
- Hiển thị message với retry time
- Disable action temporarily

---

## TypeScript Interfaces

```typescript
// API Response Envelope
interface ApiResponse<T> {
  correlationId: string;
  traceId: string;
  timestamp: string;
  data: T | null;
  meta: ApiMeta;
  errors: ApiError[];
}

interface ApiMeta {
  pagination?: PaginationMeta;
  cursor?: CursorPaginationMeta;
  sort?: SortMeta;
  job?: JobMeta;
  extra?: Record<string, unknown>;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface JobMeta {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  pollUrl?: string;
}

interface ApiError {
  field?: string;
  code: string;
  message: string;
  messageKey?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Mail Account
interface MailAccount {
  id: string;
  provider: string;
  emailAddress: string;
  displayName?: string;
  status: AccountStatus;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateMailAccountRequest {
  provider: string;
  authorizationCode: string;
  redirectUri: string;
}

interface UpdateMailAccountRequest {
  displayName?: string;
}

interface ConnectAccountRequest {
  authorizationCode: string;
  redirectUri: string;
}

// Sync
interface SyncStatus {
  accountId: string;
  status: SyncStatusEnum;
  totalMessages: number;
  syncedMessages: number;
  failedMessages: number;
  currentFolder?: string;
  lastSyncedAt?: string;
}

interface TriggerSyncRequest {
  syncType: string;
  folderIds: string[];
  fromDate?: string;
  toDate?: string;
}

// Mail Message
interface MailMessage {
  id: string;
  provider: string;
  subject?: string;
  fromEmail?: string;
  fromName?: string;
  receivedAt?: string;
  hasAttachments: boolean;
  syncStatus: string;
  processStatus: string;
}

interface MailMessageDetail {
  id: string;
  subject?: string;
  fromEmail?: string;
  fromName?: string;
  toEmails: string[];
  ccEmails: string[];
  receivedAt?: string;
  bodyText?: string;
  bodyHtml?: string;
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  fileName: string;
  contentType?: string;
  fileSize?: number;
  downloadStatus: string;
  downloadUrl?: string;
}

// OAuth
interface OAuthUrlRequest {
  redirectUri: string;
  state: string;
}

interface OAuthUrlResponse {
  authUrl: string;
  provider: string;
}

interface TokenExchangeRequest {
  authorizationCode: string;
  redirectUri: string;
}

interface TokenExchangeResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  userProfile: UserProfile;
}

interface UserProfile {
  id: string;
  emailAddress: string;
  displayName?: string;
  photoUrl?: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
}

// Enums
type EmailCategory = 'BusinessDocument' | 'OrderRequest' | 'SupportRequest' | 'Notification' | 'SystemEmail' | 'Spam' | 'Unknown';
type EmailIntent = 'CreateOrderRequest' | 'UpdateOrderRequest' | 'CancelOrderRequest' | 'SupportInquiry' | 'InformationRequest' | 'Unknown';
type AnalysisStatus = 'NotStarted' | 'Processing' | 'Completed' | 'PendingReview' | 'Approved' | 'Rejected' | 'Failed';
type AccountStatus = 'Connected' | 'AuthRequired' | 'Syncing' | 'Paused' | 'Disconnected' | 'Error';
type SyncStatusEnum = 'Pending' | 'Syncing' | 'Success' | 'PartialSuccess' | 'Failed';

// Email Analysis Result
interface EmailAnalysisResult {
  id: string;
  mailMessageId: string;
  category?: EmailCategory;
  detectedIntent?: EmailIntent;
  status: AnalysisStatus;
  confidenceScore?: number;
  extractedFields?: Record<string, string>;
  missingFields?: string[];
  warnings?: string[];
  modelName?: string;
  inputTokenCount?: number;
  outputTokenCount?: number;
  costEstimate?: number;
  reviewedByUserId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateAnalysisResultRequest {
  mailMessageId: string;
}

interface UpdateAnalysisResultRequest {
  extractedFields?: Record<string, string>;
  missingFields?: string[];
  warnings?: string[];
}

interface ApproveAnalysisResultRequest {
  userId: string;
}

interface RejectAnalysisResultRequest {
  userId: string;
  reason?: string;
}

// Email Template
interface EmailTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  description?: string;
  subjectPattern?: string;
  bodyPattern?: string;
  expectedFields?: Record<string, string>;
  documentTypes?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateTemplateRequest {
  templateCode: string;
  templateName: string;
  description?: string;
  subjectPattern?: string;
  bodyPattern?: string;
  expectedFields?: Record<string, string>;
  documentTypes?: string[];
}

interface UpdateTemplateRequest {
  templateName?: string;
  description?: string;
  subjectPattern?: string;
  bodyPattern?: string;
  expectedFields?: Record<string, string>;
  documentTypes?: string[];
  isActive?: boolean;
}

// Webhook Subscription
interface WebhookSubscription {
  id: string;
  subscriberCode: string;
  callbackUrl: string;
  eventTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateWebhookSubscriptionRequest {
  subscriberCode: string;
  callbackUrl: string;
  eventTypes: string[];
  secretKey?: string;
}

interface UpdateWebhookSubscriptionRequest {
  callbackUrl?: string;
  eventTypes?: string[];
  isActive?: boolean;
}

interface TestWebhookRequest {
  eventType: string;
  payload?: object;
}

// Document Processing
interface DocumentProcessingRequest {
  content: string;
  prompt?: string;
  model?: string;
  isImage: boolean;
  mimeType?: string;
}

interface DocumentProcessingResponse {
  result: string;
  model: string;
  tokensUsed: number;
}

interface FileContentDto {
  fileName: string;
  content: string;
  type: 'text' | 'image';
  mimeType?: string;
}

interface ProcessMultipleDocumentsRequest {
  files: FileContentDto[];
  prompt?: string;
  model?: string;
}

// AI Usage
interface OpenAiUsageSummary {
  totalRequests: number;
  totalContextTokens: number;
  totalGeneratedTokens: number;
  totalTokens: number;
  totalCost: number;
}

interface DailyUsage {
  date: string;
  requests: number;
  contextTokens: number;
  generatedTokens: number;
  totalTokens: number;
  cost: number;
}

interface OpenAiUsageResponse {
  startDate: string;
  endDate: string;
  summary: OpenAiUsageSummary;
  dailyUsage: DailyUsage[];
}

// Email Processing
interface ExtractEmailRequest {
  mailMessageId: string;
  templateCode?: string;
  expectedFields?: Record<string, string>;
}
```

---

## Example Implementation

### React Hook cho Mail Accounts

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = '/api/v1';

interface UseMailAccountsResult {
  accounts: MailAccount[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  connectAccount: (code: string, redirectUri: string) => Promise<void>;
  updateAccount: (id: string, displayName: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  triggerSync: (id: string, options?: TriggerSyncRequest) => Promise<string>;
}

export function useMailAccounts(): UseMailAccountsResult {
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<MailAccount[]>>(
        `${API_BASE}/mail-accounts`
      );
      setAccounts(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (code: string, redirectUri: string) => {
    await axios.post(`${API_BASE}/mail-accounts/connect`, {
      authorizationCode: code,
      redirectUri
    });
    await fetchAccounts();
  };

  const deleteAccount = async (id: string) => {
    await axios.delete(`${API_BASE}/mail-accounts/${id}`);
    await fetchAccounts();
  };

  const updateAccount = async (id: string, displayName: string) => {
    await axios.put(`${API_BASE}/mail-accounts/${id}`, { displayName });
    await fetchAccounts();
  };

  const triggerSync = async (id: string, options?: TriggerSyncRequest) => {
    const response = await axios.post<ApiResponse<{ jobId: string; status: string }>>(
      `${API_BASE}/mail-accounts/${id}/sync`,
      options || { syncType: 'full', folderIds: [] }
    );
    return response.data.data?.jobId || '';
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    refresh: fetchAccounts,
    connectAccount,
    deleteAccount,
    triggerSync
  };
}
```

### React Hook cho Sync Progress

```typescript
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface UseSyncProgressResult {
  status: SyncStatus | null;
  progress: number;
  isSyncing: boolean;
  startPolling: (accountId: string) => void;
  stopPolling: () => void;
}

export function useSyncProgress(): UseSyncProgressResult {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!accountId) return;
    
    const response = await axios.get<ApiResponse<SyncStatus>>(
      `${API_BASE}/mail-accounts/${accountId}/sync-status`
    );
    setStatus(response.data.data);
    
    // Stop polling if completed or failed
    if (response.data.data?.status === 'completed' || 
        response.data.data?.status === 'failed') {
      setPolling(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (!polling || !accountId) return;

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [polling, accountId, fetchStatus]);

  const progress = status 
    ? (status.syncedMessages / status.totalMessages) * 100 
    : 0;

  const isSyncing = status?.status === 'syncing';

  return {
    status,
    progress,
    isSyncing,
    startPolling: (id: string) => {
      setAccountId(id);
      setPolling(true);
    },
    stopPolling: () => setPolling(false)
  };
}
```

### OAuth Flow Component

```typescript
import { useState } from 'react';
import { useMailAccounts } from './hooks/useMailAccounts';

export function OAuthConnectButton() {
  const { connectAccount } = useMailAccounts();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      
      // Step 1: Get OAuth URL
      const redirectUri = `${window.location.origin}/callback`;
      const state = Math.random().toString(36).substring(7);
      
      const response = await axios.post<ApiResponse<OAuthUrlResponse>>(
        `${API_BASE}/mail-auth/oauth-url`,
        { redirectUri, state }
      );
      
      // Step 2: Redirect to Google
      window.location.href = response.data.data.authUrl;
      
    } catch (error) {
      console.error('OAuth failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle callback (in callback page component)
  const handleCallback = async (authorizationCode: string) => {
    const redirectUri = `${window.location.origin}/callback`;
    await connectAccount(authorizationCode, redirectUri);
    // Redirect back to accounts list
  };

  return (
    <button onClick={handleConnect} disabled={loading}>
      {loading ? 'Connecting...' : 'Add Gmail Account'}
    </button>
  );
}
```

### React Hook cho Analysis Results

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseAnalysisResultsResult {
  results: EmailAnalysisResult[];
  loading: boolean;
  error: string | null;
  createResult: (mailMessageId: string) => Promise<void>;
  approveResult: (id: string, userId: string) => Promise<void>;
  rejectResult: (id: string, userId: string, reason?: string) => Promise<void>;
  updateFields: (id: string, fields: Record<string, string>) => Promise<void>;
}

export function useAnalysisResults(status?: string): UseAnalysisResultsResult {
  const [results, setResults] = useState<EmailAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = status ? { status } : {};
      const response = await axios.get<ApiResponse<EmailAnalysisResult[]>>(
        `${API_BASE}/mail-analysis-results`,
        { params }
      );
      setResults(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analysis results');
    } finally {
      setLoading(false);
    }
  };

  const createResult = async (mailMessageId: string) => {
    await axios.post(`${API_BASE}/mail-analysis-results`, { mailMessageId });
    await fetchResults();
  };

  const approveResult = async (id: string, userId: string) => {
    await axios.post(`${API_BASE}/mail-analysis-results/${id}/approve`, { userId });
    await fetchResults();
  };

  const rejectResult = async (id: string, userId: string, reason?: string) => {
    await axios.post(`${API_BASE}/mail-analysis-results/${id}/reject`, { userId, reason });
    await fetchResults();
  };

  const updateFields = async (id: string, fields: Record<string, string>) => {
    await axios.put(`${API_BASE}/mail-analysis-results/${id}/fields`, { extractedFields: fields });
    await fetchResults();
  };

  useEffect(() => {
    fetchResults();
  }, [status]);

  return {
    results,
    loading,
    error,
    createResult,
    approveResult,
    rejectResult,
    updateFields
  };
}
```

### React Hook cho Templates

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseTemplatesResult {
  templates: EmailTemplate[];
  loading: boolean;
  error: string | null;
  createTemplate: (template: CreateTemplateRequest) => Promise<void>;
  updateTemplate: (id: string, template: UpdateTemplateRequest) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export function useTemplates(): UseTemplatesResult {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<EmailTemplate[]>>(
        `${API_BASE}/mail-templates`
      );
      setTemplates(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: CreateTemplateRequest) => {
    await axios.post(`${API_BASE}/mail-templates`, template);
    await fetchTemplates();
  };

  const updateTemplate = async (id: string, template: UpdateTemplateRequest) => {
    await axios.put(`${API_BASE}/mail-templates/${id}`, template);
    await fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    await axios.delete(`${API_BASE}/mail-templates/${id}`);
    await fetchTemplates();
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
}
```

### React Hook cho Webhook Subscriptions

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseWebhooksResult {
  subscriptions: WebhookSubscription[];
  loading: boolean;
  error: string | null;
  createSubscription: (sub: CreateWebhookSubscriptionRequest) => Promise<void>;
  updateSubscription: (id: string, sub: UpdateWebhookSubscriptionRequest) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  testWebhook: (id: string, eventType: string, payload?: object) => Promise<void>;
}

export function useWebhooks(): UseWebhooksResult {
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<WebhookSubscription[]>>(
        `${API_BASE}/webhook-subscriptions`
      );
      setSubscriptions(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch webhook subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (sub: CreateWebhookSubscriptionRequest) => {
    await axios.post(`${API_BASE}/webhook-subscriptions`, sub);
    await fetchSubscriptions();
  };

  const updateSubscription = async (id: string, sub: UpdateWebhookSubscriptionRequest) => {
    await axios.put(`${API_BASE}/webhook-subscriptions/${id}`, sub);
    await fetchSubscriptions();
  };

  const deleteSubscription = async (id: string) => {
    await axios.delete(`${API_BASE}/webhook-subscriptions/${id}`);
    await fetchSubscriptions();
  };

  const testWebhook = async (id: string, eventType: string, payload?: object) => {
    await axios.post(`${API_BASE}/webhook-subscriptions/${id}/test`, { eventType, payload });
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    testWebhook
  };
}
```

---

## Best Practices

### 1. Error Boundaries

Wrap components với Error Boundary để handle unexpected errors:

```typescript
class APIErrorBoundary extends React.Component {
  // Handle API errors gracefully
}
```

### 2. Loading States

Luôn hiển thị loading state khi gọi API:
- Skeleton loaders cho lists
- Spinners cho actions
- Disable buttons trong khi loading

### 3. Optimistic Updates

Cho các actions không critical (ví dụ: delete), có thể optimistic update:

```typescript
const deleteAccount = async (id: string) => {
  // Optimistic update
  setAccounts(prev => prev.filter(a => a.id !== id));
  
  try {
    await axios.delete(`${API_BASE}/mail-accounts/${id}`);
  } catch {
    // Rollback on error
    await fetchAccounts();
  }
};
```

### 4. Retry Logic

Implement retry cho transient errors (502, 503):

```typescript
const fetchWithRetry = async (url: string, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await axios.get(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
```

### 5. Caching

Sử dụng React Query hoặc SWR cho caching và auto-refetch:

```typescript
import { useQuery } from '@tanstack/react-query';

function useMailAccounts() {
  return useQuery({
    queryKey: ['mail-accounts'],
    queryFn: () => axios.get(`${API_BASE}/mail-accounts`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## Advanced Features

### Real-time Notifications with Webhooks

MailConnector hỗ trợ webhook subscriptions để nhận real-time notifications về các sự kiện quan trọng.

**Event Types Available:**
- `email.received` - Email mới được đồng bộ
- `email.synced` - Email đồng bộ hoàn tất
- `analysis.completed` - Phân tích email hoàn tất
- `analysis.approved` - Kết quả được phê duyệt
- `analysis.rejected` - Kết quả bị từ chối

**Webhook Payload Structure:**

```typescript
interface WebhookPayload {
  eventType: string;
  timestamp: string;
  data: {
    id: string;
    // Event-specific data
  };
  signature?: string; // HMAC signature if secret key provided
}
```

**Implementing Webhook Handler:**

```typescript
// On your backend server
app.post('/webhook', async (req, res) => {
  const { eventType, data, signature } = req.body;
  
  // Verify signature if secret key is configured
  if (signature) {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).send('Invalid signature');
    }
  }
  
  // Handle different event types
  switch (eventType) {
    case 'email.received':
      // Handle new email
      break;
    case 'analysis.completed':
      // Update UI with analysis result
      break;
    // ... other events
  }
  
  res.status(200).send('OK');
});
```

**Frontend Real-time Updates:**

```typescript
// Using WebSocket or polling
import { useEffect, useState } from 'react';

export function useRealtimeUpdates() {
  const [updates, setUpdates] = useState([]);
  
  useEffect(() => {
    // Option 1: WebSocket connection
    const ws = new WebSocket('wss://your-backend.com/ws');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setUpdates(prev => [...prev, update]);
    };
    
    // Option 2: Polling (fallback)
    const interval = setInterval(async () => {
      const response = await fetch('/api/v1/updates');
      const data = await response.json();
      setUpdates(data);
    }, 5000);
    
    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);
  
  return updates;
}
```

### AI Analysis Workflow

Quy trình phân tích email với AI:

```
1. Email được đồng bộ → status: synced
2. User kích hoạt phân tích → POST /mail-messages/{id}/process
3. AI phân tích email → status: pending
4. Kết quả trả về → status: completed
5. User review kết quả
   - Approve → status: approved
   - Reject → status: rejected
```

**Implementing Analysis Workflow:**

```typescript
export function EmailAnalysisWorkflow({ messageId }: { messageId: string }) {
  const { createResult, approveResult, rejectResult, results } = useAnalysisResults();
  const [currentResult, setCurrentResult] = useState<EmailAnalysisResult | null>(null);
  
  const handleAnalyze = async () => {
    await createResult(messageId);
    // Poll for result or wait for webhook
  };
  
  const handleApprove = async () => {
    if (currentResult) {
      await approveResult(currentResult.id, currentUserId);
    }
  };
  
  const handleReject = async (reason: string) => {
    if (currentResult) {
      await rejectResult(currentResult.id, currentUserId, reason);
    }
  };
  
  return (
    <div>
      <button onClick={handleAnalyze}>Analyze with AI</button>
      {currentResult && (
        <AnalysisResultCard 
          result={currentResult}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
```

### Template Matching

Email templates được sử dụng để tự động trích xuất thông tin từ email có cấu trúc lặp lại.

**How Template Matching Works:**

1. Email đến → Check subject pattern
2. Nếu match → Check body pattern
3. Nếu match → Extract expected fields
4. Return extracted data

**Creating Custom Templates:**

```typescript
export function TemplateCreator() {
  const { createTemplate } = useTemplates();
  const [template, setTemplate] = useState<CreateTemplateRequest>({
    templateCode: '',
    templateName: '',
    subjectPattern: '',
    bodyPattern: '',
    expectedFields: {},
    documentTypes: []
  });
  
  const handleSave = async () => {
    await createTemplate(template);
  };
  
  return (
    <form onSubmit={handleSave}>
      <input
        value={template.templateCode}
        onChange={(e) => setTemplate({...template, templateCode: e.target.value})}
        placeholder="Template Code (unique)"
      />
      <input
        value={template.subjectPattern}
        onChange={(e) => setTemplate({...template, subjectPattern: e.target.value})}
        placeholder="Subject Pattern (regex)"
      />
      {/* More fields */}
      <button type="submit">Save Template</button>
    </form>
  );
}
```

**Testing Template Patterns:**

```typescript
export function TemplateTester() {
  const [subject, setSubject] = useState('');
  const [pattern, setPattern] = useState('');
  
  const testPattern = () => {
    const regex = new RegExp(pattern, 'i');
    const matches = regex.test(subject);
    console.log('Pattern matches:', matches);
  };
  
  return (
    <div>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} />
      <input value={pattern} onChange={(e) => setPattern(e.target.value)} />
      <button onClick={testPattern}>Test Pattern</button>
    </div>
  );
}
```

### Approval Workflow

Quy trình phê duyệt kết quả phân tích:

**States:**
- `pending` - Chờ xử lý
- `completed` - AI đã phân tích xong
- `approved` - Đã phê duyệt
- `rejected` - Đã từ chối

**Implementing Approval UI:**

```typescript
export function ApprovalQueue() {
  const { results, approveResult, rejectResult } = useAnalysisResults('completed');
  
  const pendingResults = results.filter(r => r.status === 'completed');
  
  return (
    <div>
      <h2>Pending Approvals ({pendingResults.length})</h2>
      {pendingResults.map(result => (
        <ApprovalCard
          key={result.id}
          result={result}
          onApprove={() => approveResult(result.id, currentUserId)}
          onReject={(reason) => rejectResult(result.id, currentUserId, reason)}
        />
      ))}
    </div>
  );
}

function ApprovalCard({ result, onApprove, onReject }: any) {
  const [rejectReason, setRejectReason] = useState('');
  
  return (
    <div className="approval-card">
      <h3>{result.category}</h3>
      <div>Confidence: {(result.confidenceScore! * 100).toFixed(1)}%</div>
      
      <div className="extracted-fields">
        {Object.entries(result.extractedFields || {}).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {value}
          </div>
        ))}
      </div>
      
      <div className="actions">
        <button onClick={onApprove}>Approve</button>
        <button onClick={() => onReject(rejectReason)}>Reject</button>
        <input
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection"
        />
      </div>
    </div>
  );
}
```

### Document Processing with AI

Xử lý tài liệu đính kèm với AI để trích xuất thông tin.

**Processing Attachments:**

```typescript
export function AttachmentProcessor({ attachmentId }: { attachmentId: string }) {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<DocumentProcessingResponse | null>(null);
  
  const handleProcess = async () => {
    setProcessing(true);
    try {
      // Download attachment
      const attachment = await fetch(`/api/v1/mail-messages/attachments/${attachmentId}`);
      const content = await attachment.text();
      
      // Process with AI
      const response = await axios.post<ApiResponse<DocumentProcessingResponse>>(
        '/api/v1/document-processor/process',
        {
          content,
          prompt: 'Extract all invoice details',
          model: 'gpt-4',
          isImage: false
        }
      );
      
      setResult(response.data.data);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleProcess} disabled={processing}>
        {processing ? 'Processing...' : 'Process with AI'}
      </button>
      {result && (
        <div>
          <h3>Processing Result</h3>
          <pre>{result.result}</pre>
          <div>Tokens used: {result.tokensUsed}</div>
        </div>
      )}
    </div>
  );
}
```

**Batch Processing:**

```typescript
export function BatchAttachmentProcessor({ attachmentIds }: { attachmentIds: string[] }) {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<DocumentProcessingResponse[]>([]);
  
  const handleBatchProcess = async () => {
    setProcessing(true);
    try {
      // Fetch all attachments
      const files = await Promise.all(
        attachmentIds.map(async (id) => {
          const response = await fetch(`/api/v1/mail-messages/attachments/${id}`);
          const blob = await response.blob();
          return {
            fileName: `attachment_${id}`,
            content: await blob.text(),
            type: 'text' as const,
            mimeType: blob.type
          };
        })
      );
      
      // Process all at once
      const response = await axios.post<ApiResponse<DocumentProcessingResponse>>(
        '/api/v1/document-processor/process-multiple',
        {
          files,
          prompt: 'Compare these documents and extract common fields',
          model: 'gpt-4'
        }
      );
      
      setResults([response.data.data]);
    } catch (error) {
      console.error('Batch processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleBatchProcess} disabled={processing}>
        {processing ? 'Processing...' : `Process ${attachmentIds.length} Files`}
      </button>
      {results.map((result, index) => (
        <div key={index}>
          <pre>{result.result}</pre>
        </div>
      ))}
    </div>
  );
}
```

---

## Testing Checklist

### Core Features
- [ ] OAuth flow hoàn chỉnh (redirect → callback → connect)
- [ ] List accounts hiển thị đúng
- [ ] Sync progress cập nhật real-time
- [ ] Pagination hoạt động đúng
- [ ] Error handling cho tất cả scenarios
- [ ] Attachment download hoạt động
- [ ] Responsive design trên mobile
- [ ] Loading states cho tất cả actions
- [ ] Form validation
- [ ] Accessibility (ARIA labels, keyboard navigation)

### Advanced Features
- [ ] Email analysis workflow (process → approve/reject)
- [ ] Analysis results list với filters
- [ ] Approval/reject actions với reason input
- [ ] Template creation và editing
- [ ] Template pattern testing
- [ ] Webhook subscription creation
- [ ] Webhook testing functionality
- [ ] Document processing với AI
- [ ] Batch document processing
- [ ] Real-time updates (webhook hoặc polling)
- [ ] Extracted fields editing
- [ ] Confidence score display
- [ ] Token usage tracking
- [ ] Cost estimation display

---

## Support

For questions or issues, contact:
- Backend Team: backend@company.com
- API Documentation: [API_CONTRACT.md](./API_CONTRACT.md)
- OpenAPI Spec: Available at `/swagger` (when deployed)

```

---

## File: `hooks\use-ai-chat-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { CreateConversationRequest } from "@/lib/generated/mail-connector/model/createConversationRequest"
import type { SendMessageRequest } from "@/lib/generated/mail-connector/model/sendMessageRequest"
import type { LinkAttachmentRequest } from "@/lib/generated/mail-connector/model/linkAttachmentRequest"
import type { LinkEntityRequest } from "@/lib/generated/mail-connector/model/linkEntityRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export type AiChatMessage = {
  id: string
  conversationId?: string
  role: "user" | "assistant" | "system"
  content: string
  contentType?: string | null
  inputTokens?: number | null
  outputTokens?: number | null
  totalTokens?: number | null
  model?: string | null
  provider?: string | null
  finishReason?: string | null
  createdAt?: string
}

export type AiChatConversation = {
  id: string
  title?: string | null
  description?: string | null
  status?: string
  tenantId?: string
  organizationId?: string | null
  createdBy?: string
  entityType?: string | null
  entityId?: string | null
  createdAt?: string
  updatedAt?: string | null
}

export type AiChatAttachment = {
  id: string
  conversationId: string
  source: string
  sourceReference?: string | null
  fileName: string
  contentType?: string | null
  fileSize?: number | null
  fileHash?: string | null
  storageBucket?: string | null
  storagePath?: string | null
  extractedText?: string | null
  extractedTextVersion?: number
  tenantId: string
  createdBy: string
  createdAt: string
  updatedAt?: string | null
}

export const aiChatQueryKeys = {
  conversations: ["ai-chat-conversations"] as const,
  conversationByEntity: (entityType: string, entityId: string) =>
    ["ai-chat-conversation-by-entity", entityType, entityId] as const,
  conversation: (id: string) => ["ai-chat-conversation", id] as const,
  messages: (conversationId: string) => ["ai-chat-messages", conversationId] as const,
  attachments: (conversationId: string) => ["ai-chat-attachments", conversationId] as const,
}

// GET /api/v1/ai-chat/conversations/by-entity?entityType=&entityId=
export function useGetAiChatConversationByEntityQuery(
  params: { entityType: string; entityId: string } | null
) {
  const enabled = Boolean(params)
  return useQuery<AiChatConversation | null>({
    queryKey: params
      ? aiChatQueryKeys.conversationByEntity(params.entityType, params.entityId)
      : aiChatQueryKeys.conversationByEntity("", ""),
    enabled,
    retry: false,
    queryFn: async () => {
      if (!params) return null
      try {
        const response = await mailApi.getApiV1AiChatConversationsByEntity({
          entityType: params.entityType,
          entityId: params.entityId,
        })
        const data = response?.data
        if (data && typeof data === "object") return data as AiChatConversation
        return null
      } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 404) return null
        throw error
      }
    },
  })
}

// GET /api/v1/ai-chat/conversations/{id}/messages
export function useGetAiChatMessagesQuery(conversationId: string | null) {
  const enabled = Boolean(conversationId)
  return useQuery<AiChatMessage[]>({
    queryKey: conversationId
      ? aiChatQueryKeys.messages(conversationId)
      : aiChatQueryKeys.messages(""),
    enabled,
    queryFn: async () => {
      if (!conversationId) return []
      const response = await mailApi.getApiV1AiChatConversationsConversationIdMessages(
        conversationId
      )
      const data = response?.data
      if (Array.isArray(data)) return data as AiChatMessage[]
      return []
    },
  })
}

// POST /api/v1/ai-chat/conversations
export function useCreateAiChatConversationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateConversationRequest) => {
      const response = await mailApi.postApiV1AiChatConversations(payload)
      return (response?.data ?? response) as AiChatConversation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiChatQueryKeys.conversations })
    },
  })
}

// POST /api/v1/ai-chat/conversations/{id}/link-entity
export function useLinkAiChatEntityMutation() {
  return useMutation({
    mutationFn: async ({
      conversationId,
      payload,
    }: {
      conversationId: string
      payload: LinkEntityRequest
    }) => {
      const response = await mailApi.postApiV1AiChatConversationsIdLinkEntity(
        conversationId,
        payload
      )
      return (response?.data ?? response) as AiChatConversation
    },
  })
}

// POST /api/v1/ai-chat/conversations/{id}/attachments
export function useLinkAiChatAttachmentMutation() {
  return useMutation({
    mutationFn: async ({
      conversationId,
      payload,
    }: {
      conversationId: string
      payload: LinkAttachmentRequest
    }) => {
      const response = await mailApi.postApiV1AiChatConversationsConversationIdAttachments(
        conversationId,
        payload
      )
      return (response?.data ?? response) as AiChatAttachment
    },
  })
}

// POST /api/v1/ai-chat/conversations/{id}/messages
export function useSendAiChatMessageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      conversationId,
      payload,
    }: {
      conversationId: string
      payload: SendMessageRequest
    }) => {
      const response = await mailApi.postApiV1AiChatConversationsConversationIdMessages(
        conversationId,
        payload
      )
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: aiChatQueryKeys.messages(variables.conversationId),
      })
    },
  })
}

```

---

## File: `hooks\use-attachment-reviews-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { ApproveRequest } from "@/lib/generated/mail-connector/model/approveRequest"
import type { RejectRequest } from "@/lib/generated/mail-connector/model/rejectRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const attachmentReviewQueryKeys = {
  my: ["attachment-reviews-my"] as const,
  byStatus: (status: string) => ["attachment-reviews-by-status", status] as const,
  byMessage: (messageId: string) => ["attachment-reviews-by-message", messageId] as const,
  review: (id: string) => ["attachment-review", id] as const,
}

export function useAttachmentReviewsMyQuery() {
  return useQuery({
    queryKey: attachmentReviewQueryKeys.my,
    queryFn: async () => {
      const response = await mailApi.getApiAttachmentReviewsMy()
      return response?.data ?? response
    },
  })
}

export function useAttachmentReviewsByStatusQuery(status: string) {
  return useQuery({
    queryKey: attachmentReviewQueryKeys.byStatus(status),
    queryFn: async () => {
      const response = await mailApi.getApiAttachmentReviewsByStatusStatus(status)
      return response?.data ?? response
    },
  })
}

export function useAttachmentReviewsByMessageQuery(messageId: string | null) {
  return useQuery({
    queryKey: messageId ? attachmentReviewQueryKeys.byMessage(messageId) : ["attachment-reviews-by-message", "none"],
    enabled: Boolean(messageId),
    queryFn: async () => {
      const response = await mailApi.getApiAttachmentReviewsByMessageMailConnectorMessageId(messageId)
      return response?.data ?? response
    },
  })
}

export function useAttachmentReviewQuery(id: string | null) {
  return useQuery({
    queryKey: id ? attachmentReviewQueryKeys.review(id) : ["attachment-review", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiAttachmentReviewsMailConnectorAttachmentId(id)
      return response?.data ?? response
    },
  })
}

export function useApproveAttachmentReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ApproveRequest }) => {
      const response = await mailApi.putApiAttachmentReviewsMailConnectorAttachmentIdApprove(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: attachmentReviewQueryKeys.review(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["attachment-reviews-my"] })
    },
  })
}

export function useRejectAttachmentReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RejectRequest }) => {
      const response = await mailApi.putApiAttachmentReviewsMailConnectorAttachmentIdReject(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: attachmentReviewQueryKeys.review(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["attachment-reviews-my"] })
    },
  })
}

export function useResetAttachmentReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.postApiAttachmentReviewsMailConnectorAttachmentIdReset(id)
      return response?.data ?? response
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: attachmentReviewQueryKeys.review(id) })
      void queryClient.invalidateQueries({ queryKey: ["attachment-reviews-my"] })
    },
  })
}

```

---

## File: `hooks\use-auth-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { LoginCommand } from "@/lib/generated/mail-connector/model/loginCommand"
import type { RefreshTokenCommand } from "@/lib/generated/mail-connector/model/refreshTokenCommand"
import type { LogoutCommand } from "@/lib/generated/mail-connector/model/logoutCommand"
import type { LogoutAllRequest } from "@/lib/generated/mail-connector/model/logoutAllRequest"
import type { RevokeSessionRequest } from "@/lib/generated/mail-connector/model/revokeSessionRequest"
import type { SendPasswordResetOtpCommand } from "@/lib/generated/mail-connector/model/sendPasswordResetOtpCommand"
import type { ConfirmPasswordResetCommand } from "@/lib/generated/mail-connector/model/confirmPasswordResetCommand"
import type { ExchangeTokenRequest } from "@/lib/generated/mail-connector/model/exchangeTokenRequest"
import type { RefreshMailTokenRequest } from "@/lib/generated/mail-connector/model/refreshMailTokenRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const authQueryKeys = {
  sessions: ["auth-sessions"] as const,
}

export function useAuthLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginCommand) => {
      const response = await mailApi.postApiV1AuthLogin(payload)
      return response
    },
  })
}

export function useAuthRefreshMutation() {
  return useMutation({
    mutationFn: async (payload: RefreshTokenCommand) => {
      const response = await mailApi.postApiV1AuthRefresh(payload)
      return response.data
    },
  })
}

export function useAuthLogoutMutation() {
  return useMutation({
    mutationFn: async (payload: LogoutCommand) => {
      const response = await mailApi.postApiV1AuthLogout(payload)
      return response.data
    },
  })
}

export function useAuthSessionsQuery() {
  return useQuery({
    queryKey: authQueryKeys.sessions,
    queryFn: async () => {
      const response = await mailApi.getApiV1AuthSessions()
      return response.data
    },
  })
}

export function useAuthRevokeSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RevokeSessionRequest }) => {
      const response = await mailApi.postApiV1AuthSessionsIdRevoke(id, payload)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions })
    },
  })
}

export function useAuthLogoutAllMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: LogoutAllRequest) => {
      const response = await mailApi.postApiV1AuthLogoutAll(payload)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions })
    },
  })
}

export function useAuthForgotPasswordSendOtpMutation() {
  return useMutation({
    mutationFn: async (payload: SendPasswordResetOtpCommand) => {
      const response = await mailApi.postApiV1AuthForgotPasswordSendOtp(payload)
      return response.data
    },
  })
}

export function useAuthForgotPasswordConfirmResetMutation() {
  return useMutation({
    mutationFn: async (payload: ConfirmPasswordResetCommand) => {
      const response = await mailApi.postApiV1AuthForgotPasswordConfirmReset(payload)
      return response.data
    },
  })
}

export function useMailAuthExchangeTokenMutation() {
  return useMutation({
    mutationFn: async (payload: ExchangeTokenRequest) => {
      const response = await mailApi.postApiV1MailAuthExchangeToken(payload)
      return response.data
    },
  })
}

export function useMailAuthRefreshTokenMutation() {
  return useMutation({
    mutationFn: async (payload: RefreshMailTokenRequest) => {
      const response = await mailApi.postApiV1MailAuthRefreshToken(payload)
      return response.data
    },
  })
}

```

---

## File: `hooks\use-auth.ts`

```ts
"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import { useAuthStore } from "@/lib/stores/auth-store"

export function useAuth() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const logout = useCallback(async () => {
    const api = getLogisticsPlatformAPI()
    const refreshToken = localStorage.getItem("refreshToken") || ""
    try {
      await api.postApiV1AuthLogout({ refreshToken })
    } catch {
      // Ignore logout API errors
    }
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userId")
    localStorage.removeItem("email")
    localStorage.removeItem("name")
    clearAuth()
    router.push("/login")
  }, [router, clearAuth])

  return { user, isLoading: false, logout }
}

```

---

## File: `hooks\use-mail-assignments-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { UnassignRequest } from "@/lib/generated/mail-connector/model/unassignRequest"
import type { UpdateStatusRequest } from "@/lib/generated/mail-connector/model/updateStatusRequest"
import type { ReassignRequest } from "@/lib/generated/mail-connector/model/reassignRequest"
import type { CompleteRequest } from "@/lib/generated/mail-connector/model/completeRequest"
import type { ConfirmRequest } from "@/lib/generated/mail-connector/model/confirmRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const mailAssignmentQueryKeys = {
  my: ["mail-assignments-my"] as const,
  byStatus: (status: string) => ["mail-assignments-by-status", status] as const,
  status: (messageId: string) => ["mail-assignment-status", messageId] as const,
}

export function useMailAssignmentsMyQuery() {
  return useQuery({
    queryKey: mailAssignmentQueryKeys.my,
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAssignmentsMy()
      return response?.data ?? response
    },
  })
}

export function useMailAssignmentsByStatusQuery(status: string) {
  return useQuery({
    queryKey: mailAssignmentQueryKeys.byStatus(status),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAssignmentsByStatusStatus(status)
      return response?.data ?? response
    },
  })
}

export function useMailAssignmentStatusQuery(messageId: string | null) {
  return useQuery({
    queryKey: messageId ? mailAssignmentQueryKeys.status(messageId) : ["mail-assignment-status", "none"],
    enabled: Boolean(messageId),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAssignmentsMailConnectorMessageIdStatus(messageId)
      return response?.data ?? response
    },
  })
}

function invalidateAssignments(queryClient: ReturnType<typeof useQueryClient>, messageId?: string) {
  void queryClient.invalidateQueries({ queryKey: mailAssignmentQueryKeys.my })
  void queryClient.invalidateQueries({ queryKey: ["mail-assignments-by-status"] })
  void queryClient.invalidateQueries({ queryKey: ["mail-messages"] })
  if (messageId) {
    void queryClient.invalidateQueries({ queryKey: mailAssignmentQueryKeys.status(messageId) })
  }
}

export function useAssignMailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      messageId,
      payload,
    }: {
      messageId: string
      payload?: { toUserId?: string | null }
    }) => {
      const response = await mailApi.postApiV1MailAssignmentsMailConnectorMessageIdAssign(messageId, payload ?? {})
      return response?.data ?? response
    },
    onSuccess: () => {
      invalidateAssignments(queryClient)
    },
  })
}

export function useUnassignMailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, payload }: { messageId: string; payload: UnassignRequest }) => {
      const response = await mailApi.deleteApiV1MailAssignmentsMailConnectorMessageIdUnassign(messageId, payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      invalidateAssignments(queryClient)
    },
  })
}

export function useUpdateMailAssignmentStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, payload }: { messageId: string; payload: UpdateStatusRequest }) => {
      const response = await mailApi.putApiV1MailAssignmentsMailConnectorMessageIdStatus(messageId, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      invalidateAssignments(queryClient, variables.messageId)
    },
  })
}

export function useReassignMailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, payload }: { messageId: string; payload: ReassignRequest }) => {
      const response = await mailApi.postApiV1MailAssignmentsMailConnectorMessageIdReassign(messageId, payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      invalidateAssignments(queryClient)
    },
  })
}

export function useConfirmMailAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, payload }: { messageId: string; payload?: ConfirmRequest }) => {
      const response = await mailApi.postApiV1MailAssignmentsMailConnectorMessageIdConfirm(messageId, payload ?? {})
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      invalidateAssignments(queryClient, variables.messageId)
    },
  })
}

export function useCompleteMailAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, payload }: { messageId: string; payload: CompleteRequest }) => {
      const response = await mailApi.postApiV1MailAssignmentsMailConnectorMessageIdComplete(messageId, payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      invalidateAssignments(queryClient)
    },
  })
}


```

---

## File: `hooks\use-mail-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { CreateTemplateRequest } from "@/lib/generated/mail-connector/model/createTemplateRequest"
import type { CreateWebhookSubscriptionRequest } from "@/lib/generated/mail-connector/model/createWebhookSubscriptionRequest"
import type { GetApiV1AiOpenaiUsageUserUserIdParams } from "@/lib/generated/mail-connector/model/getApiV1AiOpenaiUsageUserUserIdParams"
import type { GetApiV1AiOpenaiUsageParams } from "@/lib/generated/mail-connector/model/getApiV1AiOpenaiUsageParams"
import type { GetApiV1AiOpenaiUsageUsersParams } from "@/lib/generated/mail-connector/model/getApiV1AiOpenaiUsageUsersParams"
import type { GetApiV1MailAnalysisResultsParams } from "@/lib/generated/mail-connector/model/getApiV1MailAnalysisResultsParams"
import type { GetApiV1MailMessagesParams } from "@/lib/generated/mail-connector/model/getApiV1MailMessagesParams"
import type { GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams } from "@/lib/generated/mail-connector/model/getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams"
import type { UpdateTemplateRequest } from "@/lib/generated/mail-connector/model/updateTemplateRequest"
import type { UpdateWebhookSubscriptionRequest } from "@/lib/generated/mail-connector/model/updateWebhookSubscriptionRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

type MailAnalysisResultDto = {
  id?: string | null
  mailMessageId?: string | null
  category?: string | null
  detectedIntent?: string | null
  status?: string | null
  confidenceScore?: number | null
  extractedFields?: Record<string, string> | null
  missingFields?: string[] | null
  warnings?: string[] | null
  modelName?: string | null
  inputTokenCount?: number | null
  outputTokenCount?: number | null
  costEstimate?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

const getAnalysisItems = (data: unknown): MailAnalysisResultDto[] => {
  if (!Array.isArray(data)) return []
  return data as MailAnalysisResultDto[]
}

const getAttachmentTextContent = (data: unknown): string => {
  if (!data) return ""
  if (typeof data === "string") return data
  if (typeof data !== "object") return ""
  const value = data as Record<string, unknown>
  const textCandidate =
    value.text ??
    value.content ??
    value.body ??
    value.extractedText ??
    value.result ??
    value.value
  if (typeof textCandidate === "string") return textCandidate
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return ""
  }
}

export const mailQueryKeys = {
  accounts: ["mail-accounts"] as const,
  syncStatus: (accountId: string) => ["mail-sync-status", accountId] as const,
  messages: (params: object) => ["mail-messages", params] as const,
  message: (id: string) => ["mail-message", id] as const,
  attachments: (id: string) => ["mail-message-attachments", id] as const,
  attachmentContent: (messageId: string, attachmentId: string) =>
    ["mail-message-attachment-content", messageId, attachmentId] as const,
  attachmentExtractText: (messageId: string, attachmentId: string) =>
    ["mail-message-attachment-extract-text", messageId, attachmentId] as const,
  analysis: (id: string) => ["mail-analysis", id] as const,
  latestAnalysisByMessage: (messageId: string) => ["mail-analysis-latest", messageId] as const,
  templates: ["mail-templates"] as const,
  analysisResults: (params: GetApiV1MailAnalysisResultsParams) =>
    ["mail-analysis-results", params] as const,
  webhooks: ["webhook-subscriptions"] as const,
  aiUsageUser: (userId: string, params?: GetApiV1AiOpenaiUsageUserUserIdParams) =>
    ["ai-openai-usage-user", userId, params] as const,
  aiUsageUserCurrentMonth: (userId: string) => ["ai-openai-usage-user-current-month", userId] as const,
  aiUsageUsers: (params?: GetApiV1AiOpenaiUsageUsersParams) =>
    ["ai-openai-usage-users", params] as const,
  aiUsageUsersCurrentMonth: ["ai-openai-usage-users-current-month"] as const,
  aiUsage: (params?: GetApiV1AiOpenaiUsageParams) => ["ai-openai-usage", params] as const,
  aiUsageCurrentMonth: ["ai-openai-usage-current-month"] as const,
  processingJobs: (messageId: string) => ["mail-processing-jobs", messageId] as const,
}

export function useMailAccountsQuery() {
  return useQuery({
    queryKey: mailQueryKeys.accounts,
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAccounts()
      return response.data ?? []
    },
  })
}

export function useConnectAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ authorizationCode, redirectUri }: { authorizationCode: string; redirectUri: string }) =>
      mailApi.postApiV1MailAccountsConnect({ authorizationCode, redirectUri }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.accounts })
    },
  })
}

export function useDeleteMailAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: string) => mailApi.deleteApiV1MailAccountsId(accountId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.accounts })
    },
  })
}

export function useOAuthUrlMutation() {
  return useMutation({
    mutationFn: async ({ redirectUri, state }: { redirectUri: string; state: string }) => {
      const response = await mailApi.postApiV1MailAuthOauthUrl({ redirectUri, state })
      return response.data
    },
  })
}

export function useSyncStatusQuery(accountId: string | null) {
  return useQuery({
    queryKey: accountId ? mailQueryKeys.syncStatus(accountId) : ["mail-sync-status", "none"],
    enabled: Boolean(accountId),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAccountsIdSyncStatus(accountId as string)
      return response.data
    },
    refetchInterval: (query) => {
      const status = String(query.state.data?.status || "").toLowerCase()
      const shouldPoll =
        status === "syncing" ||
        status === "pending" ||
        status === "queued" ||
        status === "running"
      return shouldPoll ? 2000 : false
    },
  })
}

export function useTriggerSyncMutation(accountId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      mailApi.postApiV1MailAccountsIdSync(accountId as string, {
        syncType: "MANUAL_RESYNC",
        folderIds: ["INBOX"],
      }),
    onSuccess: () => {
      if (accountId) {
        void queryClient.invalidateQueries({ queryKey: mailQueryKeys.syncStatus(accountId) })
      }
    },
  })
}

export function useTriggerSyncDirectMutation(accountId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      mailApi.postApiV1MailAccountsIdSyncDirect(
        accountId as string,
        {
          syncType: "MANUAL_RESYNC",
          folderIds: ["INBOX"],
        },
        { params: { downloadAttachments: true } }
      ),
    onSuccess: () => {
      if (accountId) {
        void queryClient.invalidateQueries({ queryKey: mailQueryKeys.syncStatus(accountId) })
      }
    },
  })
}

export function useMailMessagesQuery(params: {
  accountId?: string
  page: number
  pageSize: number
  fromEmail?: string
  hasAttachment?: boolean
  processStatus?: string
  sortField?: string
  sortOrder?: "asc" | "desc"
}) {
  const filters: string[] = []
  if (params.accountId) filters.push(`mailAccountId==${params.accountId}`)
  if (params.fromEmail) filters.push(`fromEmail@=${params.fromEmail}`)
  if (params.hasAttachment) filters.push(`hasAttachments==true`)
  if (params.processStatus) filters.push(`processStatus==${params.processStatus}`)

  const queryParams: GetApiV1MailMessagesParams = {
    page: params.page,
    pageSize: params.pageSize,
    filters: filters.join("&") || undefined,
    sortField: params.sortField ?? "sentAt",
    sortOrder: params.sortOrder ?? "desc",
  }

  return useQuery({
    queryKey: mailQueryKeys.messages(queryParams),
    queryFn: () => mailApi.getApiV1MailMessages(queryParams),
  })
}

export function useMailMessageQuery(id: string | null) {
  return useQuery({
    queryKey: id ? mailQueryKeys.message(id) : ["mail-message", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailMessagesId(id as string)
      return response.data
    },
  })
}

export function useMailMessageAttachmentsQuery(id: string | null) {
  return useQuery({
    queryKey: id ? mailQueryKeys.attachments(id) : ["mail-message-attachments", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailMessagesIdAttachments(id as string)
      return response.data ?? []
    },
  })
}

export function useProcessMailMutation() {
  return useMutation({
    mutationFn: async (id: string) => {
      await mailApi.postApiV1MailMessagesIdProcess(id)
      await mailApi.postApiV1MailAnalysisResults({ mailMessageId: id })
      const resultResponse = await mailApi.getApiV1MailAnalysisResults()
      const matched = getAnalysisItems(resultResponse.data)
        .filter((item) => item.mailMessageId === id)
        .sort((first, second) => {
          const firstTime = new Date(first.updatedAt ?? first.createdAt ?? 0).getTime()
          const secondTime = new Date(second.updatedAt ?? second.createdAt ?? 0).getTime()
          return secondTime - firstTime
        })
      return matched[0] ?? null
    },
  })
}

export function useProcessDocumentsMutation() {
  return useMutation({
    mutationFn: async (payload: { files: Array<{ fileName: string; content: string; type: string; mimeType: string }>; prompt: string; model: string }) => {
      const response = await mailApi.postApiV1DocumentProcessorProcessMultiple(payload)
      return response.data
    },
  })
}

export function useDownloadAttachmentMutation(messageId: string | null) {
  return useMutation({
    mutationFn: async ({ attachmentId, fileName }: { attachmentId: string; fileName?: string | null }) => {
      if (!messageId) throw new Error("Thiếu messageId để tải tệp.")
      const response = await MAIL_CONNECTOR_AXIOS.get(
        `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/download`,
        { responseType: "blob" }
      )
      const blob = response.data as Blob
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = fileName || `attachment-${attachmentId}`
      anchor.click()
      URL.revokeObjectURL(url)
    },
  })
}

export function useAttachmentContentQuery(messageId: string | null, attachmentId: string | null) {
  const enabled = Boolean(messageId && attachmentId)
  return useQuery({
    queryKey:
      enabled
        ? mailQueryKeys.attachmentContent(messageId as string, attachmentId as string)
        : ["mail-message-attachment-content", "none"],
    enabled,
    queryFn: async () => {
      const response = await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdContent(
        messageId as string,
        attachmentId as string
      )
      return getAttachmentTextContent(response.data)
    },
  })
}

export function useAttachmentExtractTextQuery(messageId: string | null, attachmentId: string | null) {
  const enabled = Boolean(messageId && attachmentId)
  return useQuery({
    queryKey:
      enabled
        ? mailQueryKeys.attachmentExtractText(messageId as string, attachmentId as string)
        : ["mail-message-attachment-extract-text", "none"],
    enabled,
    queryFn: async () => {
      const response = await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdExtractText(
        messageId as string,
        attachmentId as string
      )
      return getAttachmentTextContent(response.data)
    },
  })
}

export function useAnalysisResultQuery(id: string | null) {
  return useQuery({
    queryKey: id ? mailQueryKeys.analysis(id) : ["mail-analysis", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAnalysisResultsId(id as string)
      return response.data
    },
    refetchInterval: (query) => {
      const status = String(query.state.data?.status || "").toLowerCase()
      const shouldPoll =
        status === "pending" || status === "processing" || status === "notstarted"
      return shouldPoll ? 2000 : false
    },
  })
}

export function useLatestAnalysisByMessageIdQuery(messageId: string | null) {
  return useQuery({
    queryKey: messageId ? mailQueryKeys.latestAnalysisByMessage(messageId) : ["mail-analysis-latest", "none"],
    enabled: Boolean(messageId),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAnalysisResults()
      const matched = getAnalysisItems(response.data)
        .filter((item) => item.mailMessageId === messageId)
        .sort((first, second) => {
          const firstTime = new Date(first.updatedAt ?? first.createdAt ?? 0).getTime()
          const secondTime = new Date(second.updatedAt ?? second.createdAt ?? 0).getTime()
          return secondTime - firstTime
        })
      return matched[0] ?? null
    },
  })
}

export function useUpdateAnalysisFieldsMutation(analysisId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fields: Record<string, string>) =>
      mailApi.putApiV1MailAnalysisResultsIdFields(analysisId as string, {
        extractedFields: fields,
      }),
    onSuccess: () => {
      if (analysisId) {
        void queryClient.invalidateQueries({ queryKey: mailQueryKeys.analysis(analysisId) })
      }
    },
  })
}

export function useApproveAnalysisMutation(analysisId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      mailApi.postApiV1MailAnalysisResultsIdApprove(analysisId as string, { userId }),
    onSuccess: () => {
      if (analysisId) {
        void queryClient.invalidateQueries({ queryKey: mailQueryKeys.analysis(analysisId) })
      }
    },
  })
}

export function useRejectAnalysisMutation(analysisId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      mailApi.postApiV1MailAnalysisResultsIdReject(analysisId as string, { userId, reason }),
    onSuccess: () => {
      if (analysisId) {
        void queryClient.invalidateQueries({ queryKey: mailQueryKeys.analysis(analysisId) })
      }
    },
  })
}

export function useAnalysisResultsQuery(params: {
  status?: string
  category?: string
  sortField?: string
  sortOrder?: "asc" | "desc"
  page: number
  pageSize: number
}) {
  const filters: string[] = []
  if (params.status) filters.push(`status==${params.status}`)
  if (params.category) filters.push(`category==${params.category}`)

  const queryParams: GetApiV1MailAnalysisResultsParams = {
    filters: filters.join("&") || undefined,
    sortField: params.sortField ?? "createdAt",
    sortOrder: params.sortOrder ?? "desc",
    page: params.page,
    pageSize: params.pageSize,
  }

  return useQuery({
    queryKey: mailQueryKeys.analysisResults(queryParams),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAnalysisResults(queryParams)
      return getAnalysisItems(response.data)
    },
  })
}

export function useEmailTemplatesQuery() {
  return useQuery({
    queryKey: mailQueryKeys.templates,
    queryFn: async () => {
      const response = await mailApi.getApiV1MailTemplates()
      return response.data ?? []
    },
  })
}

export function useCreateEmailTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTemplateRequest) => mailApi.postApiV1MailTemplates(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.templates })
    },
  })
}

export function useUpdateEmailTemplateMutation(templateId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTemplateRequest) =>
      mailApi.putApiV1MailTemplatesId(templateId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.templates })
    },
  })
}

export function useDeleteEmailTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => mailApi.deleteApiV1MailTemplatesId(templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.templates })
    },
  })
}

export function useAttachmentPresignedUrlQuery(
  messageId: string | null,
  attachmentId: string | null,
  params?: GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams
) {
  return useQuery({
    queryKey: ["attachment-presigned-url", messageId, attachmentId, params],
    queryFn: async () => {
      if (!messageId || !attachmentId) return null
      const response = await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl(
        messageId,
        attachmentId,
        params
      )
      return response.data?.data as { url: string; expiresAt: string } | null
    },
    enabled: Boolean(messageId && attachmentId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

const getWebhookItems = (data: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(data)) return []
  return data as Record<string, unknown>[]
}

export function useWebhookSubscriptionsQuery() {
  return useQuery({
    queryKey: mailQueryKeys.webhooks,
    queryFn: async () => {
      const response = await mailApi.getApiV1WebhookSubscriptions()
      return getWebhookItems(response.data)
    },
  })
}

export function useCreateWebhookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateWebhookSubscriptionRequest) =>
      mailApi.postApiV1WebhookSubscriptions(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.webhooks })
    },
  })
}

export function useUpdateWebhookMutation(webhookId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateWebhookSubscriptionRequest) =>
      mailApi.putApiV1WebhookSubscriptionsId(webhookId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.webhooks })
    },
  })
}

export function useDeleteWebhookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (webhookId: string) => mailApi.deleteApiV1WebhookSubscriptionsId(webhookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.webhooks })
    },
  })
}

export function useTestWebhookMutation(webhookId: string | null) {
  return useMutation({
    mutationFn: (payload: { eventType?: string; payload?: unknown }) =>
      mailApi.postApiV1WebhookSubscriptionsIdTest(webhookId as string, {
        eventType: payload.eventType,
        payload: payload.payload,
      }),
  })
}

export function useAiOpenaiUsageUserQuery(
  userId: string | null,
  params?: GetApiV1AiOpenaiUsageUserUserIdParams
) {
  return useQuery({
    queryKey: userId ? mailQueryKeys.aiUsageUser(userId, params) : ["ai-openai-usage-user", "none"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await mailApi.getApiV1AiOpenaiUsageUserUserId(userId as string, params)
      return response.data as unknown
    },
  })
}

export function useAiOpenaiUsageUserCurrentMonthQuery(userId: string | null) {
  return useQuery({
    queryKey: userId
      ? mailQueryKeys.aiUsageUserCurrentMonth(userId)
      : ["ai-openai-usage-user-current-month", "none"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await mailApi.getApiV1AiOpenaiUsageUserUserIdCurrentMonth(userId as string)
      return response.data as unknown
    },
  })
}

export function useAiOpenaiUsageUsersQuery(params?: GetApiV1AiOpenaiUsageUsersParams) {
  return useQuery({
    queryKey: mailQueryKeys.aiUsageUsers(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1AiOpenaiUsageUsers(params)
      return response.data as unknown
    },
  })
}

export function useAiOpenaiUsageUsersCurrentMonthQuery() {
  return useQuery({
    queryKey: mailQueryKeys.aiUsageUsersCurrentMonth,
    queryFn: async () => {
      const response = await mailApi.getApiV1AiOpenaiUsageUsersCurrentMonth()
      return response.data as unknown
    },
  })
}

export function useAiOpenaiUsageQuery(params?: GetApiV1AiOpenaiUsageParams) {
  return useQuery({
    queryKey: mailQueryKeys.aiUsage(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1AiOpenaiUsage(params)
      return response.data as unknown
    },
  })
}

export function useAiOpenaiUsageCurrentMonthQuery() {
  return useQuery({
    queryKey: mailQueryKeys.aiUsageCurrentMonth,
    queryFn: async () => {
      const response = await mailApi.getApiV1AiOpenaiUsageCurrentMonth()
      return response.data as unknown
    },
  })
}

export function useTriggerPipelineMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await mailApi.postApiV1MailMessagesIdTriggerPipeline(messageId)
      return response.data
    },
    onSuccess: (_, messageId) => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.message(messageId) })
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.processingJobs(messageId) })
    },
  })
}

export function useNormalizeMailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await mailApi.postApiV1MailMessagesIdNormalize(messageId)
      return response.data
    },
    onSuccess: (_, messageId) => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.message(messageId) })
    },
  })
}

export function useClassifyMailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await mailApi.postApiV1MailMessagesIdClassify(messageId)
      return response.data
    },
    onSuccess: (_, messageId) => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.message(messageId) })
    },
  })
}

export function useExtractMailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await mailApi.postApiV1MailMessagesIdExtract(messageId)
      return response.data
    },
    onSuccess: (_, messageId) => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.message(messageId) })
    },
  })
}

export function useMailMessageProcessingJobsQuery(messageId: string | null) {
  return useQuery({
    queryKey: messageId ? mailQueryKeys.processingJobs(messageId) : ["mail-processing-jobs", "none"],
    enabled: Boolean(messageId),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailMessagesIdProcessingJobs(messageId)
      return response.data
    },
  })
}

```

---

## File: `hooks\use-order-drafts-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { GetApiV1OrderDraftsParams } from "@/lib/generated/mail-connector/model/getApiV1OrderDraftsParams"
import type { GetApiV1OrderDraftsExportParams } from "@/lib/generated/mail-connector/model/getApiV1OrderDraftsExportParams"
import type { ReviewRequest } from "@/lib/generated/mail-connector/model/reviewRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const orderDraftQueryKeys = {
  orderDrafts: (params?: GetApiV1OrderDraftsParams) => ["order-drafts", params] as const,
  orderDraft: (id: string) => ["order-draft", id] as const,
  export: (params?: GetApiV1OrderDraftsExportParams) => ["order-drafts-export", params] as const,
}

export function useOrderDraftsQuery(params?: GetApiV1OrderDraftsParams) {
  return useQuery({
    queryKey: orderDraftQueryKeys.orderDrafts(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1OrderDrafts(params)
      return response?.data ?? response
    },
  })
}

export function useOrderDraftQuery(id: string | null) {
  return useQuery({
    queryKey: id ? orderDraftQueryKeys.orderDraft(id) : ["order-draft", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1OrderDraftsId(id)
      return response?.data ?? response
    },
  })
}

export function useApproveOrderDraftL1Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewRequest }) => {
      const response = await mailApi.postApiV1OrderDraftsIdApproveL1(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: orderDraftQueryKeys.orderDraft(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["order-drafts"] })
    },
  })
}

export function useRejectOrderDraftL1Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewRequest }) => {
      const response = await mailApi.postApiV1OrderDraftsIdRejectL1(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: orderDraftQueryKeys.orderDraft(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["order-drafts"] })
    },
  })
}

export function useConfirmOrderDraftMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewRequest }) => {
      const response = await mailApi.postApiV1OrderDraftsIdConfirm(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: orderDraftQueryKeys.orderDraft(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["order-drafts"] })
    },
  })
}

export function useRejectOrderDraftMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewRequest }) => {
      const response = await mailApi.postApiV1OrderDraftsIdReject(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: orderDraftQueryKeys.orderDraft(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["order-drafts"] })
    },
  })
}

export function useExportOrderDraftsQuery(params?: GetApiV1OrderDraftsExportParams) {
  return useQuery({
    queryKey: orderDraftQueryKeys.export(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1OrderDraftsExport(params)
      return response?.data ?? response
    },
  })
}

```

---

## File: `hooks\use-permission.ts`

```ts
"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { useCurrentUserPermissionsQuery } from "@/hooks/use-user-queries"

type PermissionItem = {
  id?: string
  code?: string
  name?: string
  module?: string
}

function extractCodes(data: unknown): string[] {
  if (!data) return []
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        const p = item as PermissionItem
        return p.code ?? ""
      })
      .filter(Boolean)
  }
  if (typeof data === "object" && data !== null) {
    const d = data as Record<string, unknown>
    if (Array.isArray(d.data)) {
      return extractCodes(d.data)
    }
  }
  return []
}

export function usePermission(permissionCode: string) {
  const authUser = useAuthStore((s) => s.user)
  const permissionsQuery = useCurrentUserPermissionsQuery()

  // Use auth store as primary source, API as fallback
  const storeCodes = authUser?.permissions ?? []
  const apiCodes = extractCodes(permissionsQuery.data)
  const allCodes = apiCodes.length > 0 ? apiCodes : storeCodes

  const has = allCodes.includes(permissionCode)

  return {
    has,
    isLoading: permissionsQuery.isPending,
    codes: allCodes,
  }
}

export function usePermissions(permissionCodes: string[]) {
  const authUser = useAuthStore((s) => s.user)
  const permissionsQuery = useCurrentUserPermissionsQuery()

  const storeCodes = authUser?.permissions ?? []
  const apiCodes = extractCodes(permissionsQuery.data)
  const allCodes = apiCodes.length > 0 ? apiCodes : storeCodes

  const hasAll = permissionCodes.every((code) => allCodes.includes(code))
  const hasAny = permissionCodes.some((code) => allCodes.includes(code))
  const check = (code: string) => allCodes.includes(code)

  return {
    hasAll,
    hasAny,
    check,
    isLoading: permissionsQuery.isPending,
    codes: allCodes,
  }
}

```

---

## File: `hooks\use-permissions-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { GetApiV1PermissionsParams } from "@/lib/generated/mail-connector/model/getApiV1PermissionsParams"
import type { CreatePermissionRequest } from "@/lib/generated/mail-connector/model/createPermissionRequest"
import type { UpdatePermissionRequest } from "@/lib/generated/mail-connector/model/updatePermissionRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const permissionQueryKeys = {
  permissions: (params?: GetApiV1PermissionsParams) => ["permissions", params] as const,
  permission: (id: string) => ["permission", id] as const,
  modules: ["permission-modules"] as const,
}

export function usePermissionsQuery(params?: GetApiV1PermissionsParams) {
  return useQuery({
    queryKey: permissionQueryKeys.permissions(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1Permissions(params)
      return response?.data ?? response
    },
  })
}

export function usePermissionModulesQuery() {
  return useQuery({
    queryKey: permissionQueryKeys.modules,
    queryFn: async () => {
      const response = await mailApi.getApiV1PermissionsModules()
      return response?.data ?? response
    },
  })
}

export function usePermissionQuery(id: string | null) {
  return useQuery({
    queryKey: id ? permissionQueryKeys.permission(id) : ["permission", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1PermissionsId(id)
      return response?.data ?? response
    },
  })
}

export function useCreatePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreatePermissionRequest) => {
      const response = await mailApi.postApiV1Permissions(payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdatePermissionRequest }) => {
      const response = await mailApi.putApiV1PermissionsId(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: permissionQueryKeys.permission(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.deleteApiV1PermissionsId(id)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useRestorePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.postApiV1PermissionsIdRestore(id)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

```

---

## File: `hooks\use-roles-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { GetApiV1RolesParams } from "@/lib/generated/mail-connector/model/getApiV1RolesParams"
import type { CreateRoleRequest } from "@/lib/generated/mail-connector/model/createRoleRequest"
import type { UpdateRoleRequest } from "@/lib/generated/mail-connector/model/updateRoleRequest"
import type { AssignPermissionsRequest } from "@/lib/generated/mail-connector/model/assignPermissionsRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const roleQueryKeys = {
  roles: (params?: GetApiV1RolesParams) => ["roles", params] as const,
  role: (id: string) => ["role", id] as const,
  rolePermissions: (id: string) => ["role-permissions", id] as const,
}

export function useRolesQuery(params?: GetApiV1RolesParams) {
  return useQuery({
    queryKey: roleQueryKeys.roles(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1Roles(params)
      return response?.data ?? response
    },
  })
}

export function useRoleQuery(id: string | null) {
  return useQuery({
    queryKey: id ? roleQueryKeys.role(id) : ["role", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1RolesId(id)
      return response?.data ?? response
    },
  })
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateRoleRequest) => {
      const response = await mailApi.postApiV1Roles(payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateRoleRequest }) => {
      const response = await mailApi.putApiV1RolesId(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: roleQueryKeys.role(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.deleteApiV1RolesId(id)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useRestoreRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.postApiV1RolesIdRestore(id)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useRolePermissionsQuery(id: string | null) {
  return useQuery({
    queryKey: id ? roleQueryKeys.rolePermissions(id) : ["role-permissions", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1RolesIdPermissions(id)
      return response?.data ?? response
    },
  })
}

export function useAssignRolePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AssignPermissionsRequest }) => {
      const response = await mailApi.postApiV1RolesIdPermissions(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: roleQueryKeys.rolePermissions(variables.id) })
    },
  })
}

export function useUpdateRolePermissionsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AssignPermissionsRequest }) => {
      const response = await mailApi.putApiV1RolesIdPermissions(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: roleQueryKeys.rolePermissions(variables.id) })
    },
  })
}

export function useRemoveRolePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, permissionId }: { id: string; permissionId: string }) => {
      const response = await mailApi.deleteApiV1RolesIdPermissionsPermissionId(id, permissionId)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: roleQueryKeys.rolePermissions(variables.id) })
    },
  })
}

```

---

## File: `hooks\use-user-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { GetApiV1UsersParams } from "@/lib/generated/mail-connector/model/getApiV1UsersParams"
import type { CreateUserRequest } from "@/lib/generated/mail-connector/model/createUserRequest"
import type { UpdateUserRequest } from "@/lib/generated/mail-connector/model/updateUserRequest"
import type { UpdateUserRolesRequest } from "@/lib/generated/mail-connector/model/updateUserRolesRequest"
import type { UpdateUserStatusRequest } from "@/lib/generated/mail-connector/model/updateUserStatusRequest"
import type { ChangePasswordRequest } from "@/lib/generated/mail-connector/model/changePasswordRequest"
import type { ResetPasswordRequest } from "@/lib/generated/mail-connector/model/resetPasswordRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export interface UserDto {
  id: string
  email: string
  fullName: string
  roles: string[]
  isActive: boolean
  isLocked: boolean
  createdAtUtc: string
  updatedAtUtc: string | null
}

export interface CurrentUserResponse {
  userId: string
  email: string
  fullName: string
  roles: string[]
  isActive: boolean
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface UserListResponse {
  data: UserDto[]
  meta: {
    pagination: PaginationMeta
    job: null
    extra: Record<string, unknown>
  }
}

const getUserList = (data: unknown): UserListResponse => {
  if (typeof data !== "object" || data === null) {
    return { data: [], meta: { pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }, job: null, extra: {} } }
  }
  return data as UserListResponse
}

const getUserDto = (data: unknown): UserDto | null => {
  if (typeof data !== "object" || data === null) return null
  const d = data as Record<string, unknown>
  if (d.data && typeof d.data === "object") return d.data as UserDto
  return data as UserDto
}

export const userQueryKeys = {
  users: (params: GetApiV1UsersParams) => ["users", params] as const,
  user: (id: string) => ["user", id] as const,
  me: ["users-me"] as const,
  userPermissions: (id: string) => ["user-permissions", id] as const,
}

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: userQueryKeys.me,
    queryFn: async () => {
      const response = await mailApi.getApiV1UsersMe()
      const data = response?.data ?? response ?? null
      return data as CurrentUserResponse | null
    },
  })
}

export function useUsersQuery(params: GetApiV1UsersParams) {
  return useQuery({
    queryKey: userQueryKeys.users(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1Users(params)
      return getUserList(response)
    },
  })
}

export function useUserQuery(id: string | null) {
  return useQuery({
    queryKey: id ? userQueryKeys.user(id) : ["user", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1UsersId(id)
      return getUserDto(response?.data ?? response)
    },
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateUserRequest) => {
      const response = await mailApi.postApiV1Users(payload)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateUserRequest }) => {
      const response = await mailApi.putApiV1UsersId(id, payload)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserRolesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateUserRolesRequest }) => {
      const response = await mailApi.putApiV1UsersIdRoles(id, payload)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await mailApi.patchApiV1UsersIdStatus(id, { isActive } as UpdateUserStatusRequest)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.deleteApiV1UsersId(id)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useRestoreUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.postApiV1UsersIdRestore(id)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateUserRequest) => {
      const response = await mailApi.putApiV1UsersMe(payload)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.me })
    },
  })
}

export function useChangeMyPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordRequest) => {
      const response = await mailApi.postApiV1UsersMeChangePassword(payload)
      return response?.data ?? response
    },
  })
}

export function useResetUserPasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ResetPasswordRequest }) => {
      const response = await mailApi.postApiV1UsersIdResetPassword(id, payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUserPermissionsQuery(id: string | null) {
  return useQuery({
    queryKey: id ? userQueryKeys.userPermissions(id) : ["user-permissions", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1UsersIdPermissions(id)
      return response?.data ?? response
    },
  })
}

export function useCurrentUserPermissionsQuery() {
  return useQuery({
    queryKey: ["users-me-permissions"],
    queryFn: async () => {
      const response = await mailApi.getApiV1UsersMePermissions()
      return response?.data ?? response
    },
  })
}

export function useUsersWithPermissionQuery(permissionCode: string) {
  return useQuery({
    queryKey: ["users-with-permission", permissionCode],
    queryFn: async () => {
      // 1. Get all users
      const usersRes = await mailApi.getApiV1Users({ page: 1, pageSize: 100 })
      const usersRaw = usersRes?.data ?? usersRes
      const users = (() => {
        if (Array.isArray(usersRaw)) return usersRaw
        if (usersRaw && typeof usersRaw === "object" && "data" in usersRaw) {
          const d = usersRaw as unknown as Record<string, unknown>
          if (Array.isArray(d.data)) return d.data
        }
        return []
      })() as Record<string, unknown>[]

      // 2. For each user, fetch permissions in parallel
      const usersWithPerms = await Promise.all(
        users.map(async (user) => {
          const userId = String(user.id ?? "")
          if (!userId) return { user, hasPermission: false }
          try {
            const permRes = await mailApi.getApiV1UsersIdPermissions(userId)
            const permRaw = permRes?.data ?? permRes
            const perms = (() => {
              if (Array.isArray(permRaw)) return permRaw
              if (permRaw && typeof permRaw === "object" && "data" in permRaw) {
                const d = permRaw as unknown as Record<string, unknown>
                if (Array.isArray(d.data)) return d.data
              }
              return []
            })() as { code?: string }[]
            const hasPermission = perms.some((p) => p.code === permissionCode)
            return { user, hasPermission }
          } catch {
            return { user, hasPermission: false }
          }
        })
      )

      return usersWithPerms.filter((u) => u.hasPermission).map((u) => u.user)
    },
  })
}

```

---

## File: `hooks\useTour.ts`

```ts
"use client"

import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

const tourSteps: Record<string, Array<{ element: string; popover: { title: string; description: string; side?: "top" | "bottom" | "left" | "right" } }>> = {
  "/login": [
    {
      element: "#tour-login-form",
      popover: { title: "Đăng nhập", description: "Nhập thông tin tài khoản để truy cập hệ thống Logistics Mail.", side: "bottom" },
    },
    {
      element: "#tour-login-email",
      popover: { title: "Email", description: "Nhập địa chỉ email của bạn tại đây.", side: "right" },
    },
    {
      element: "#tour-login-password",
      popover: { title: "Mật khẩu", description: "Nhập mật khẩu để đăng nhập.", side: "right" },
    },
    {
      element: "#tour-login-btn",
      popover: { title: "Đăng nhập", description: "Click để vào hệ thống.", side: "top" },
    },
  ],
  "/": [
    {
      element: "#tour-sidebar",
      popover: { title: "Thanh điều hướng", description: "Truy cập nhanh các trang chính: Dashboard, Email, Báo cáo và Quản trị.", side: "right" },
    },
    {
      element: "#tour-dashboard-stats",
      popover: { title: "Thống kê", description: "Xem tổng quan số lượng email, chờ xử lý, đã hoàn tất và lỗi.", side: "bottom" },
    },
    {
      element: "#tour-dashboard-recent",
      popover: { title: "Email gần đây", description: "Danh sách email vừa được đồng bộ. Click để xem chi tiết.", side: "top" },
    },
  ],
  "/emails": [
    {
      element: "#tour-emails-search",
      popover: { title: "Tìm kiếm", description: "Tìm email theo tiêu đề hoặc người gửi.", side: "bottom" },
    },
    {
      element: "#tour-emails-filter",
      popover: { title: "Bộ lọc", description: "Lọc email theo trạng thái: tất cả, chưa xử lý, đã xử lý, có đính kèm.", side: "bottom" },
    },
    {
      element: "#tour-emails-table",
      popover: { title: "Danh sách Email", description: "Danh sách email đã đồng bộ. Click 'Xử lý' để mở chi tiết.", side: "top" },
    },
  ],
  "/emails/1": [
    {
      element: "#tour-email-header",
      popover: { title: "Thông tin email", description: "Xem người gửi, tiêu đề và thời gian nhận email.", side: "bottom" },
    },
    {
      element: "#tour-email-body",
      popover: { title: "Nội dung", description: "Đọc nội dung chính của email tại đây.", side: "top" },
    },
    {
      element: "#tour-email-attachments",
      popover: { title: "Tệp đính kèm", description: "Kiểm tra tệp đính kèm hợp lệ trước khi gửi AI.", side: "top" },
    },
    {
      element: "#tour-email-ai-btn",
      popover: { title: "Gửi AI bóc tách", description: "Click để AI phân tích và trích xuất dữ liệu từ email.", side: "left" },
    },
  ],
  "/emails/1/extract": [
    {
      element: "#tour-extract-result",
      popover: { title: "Kết quả bóc tách", description: "Dữ liệu AI đã trích xuất. Kiểm tra độ tin cậy và thông tin còn thiếu.", side: "bottom" },
    },
    {
      element: "#tour-extract-fields",
      popover: { title: "Chỉnh sửa dữ liệu", description: "Bạn có thể chỉnh sửa trực tiếp các trường dữ liệu trước khi export.", side: "top" },
    },
    {
      element: "#tour-extract-export",
      popover: { title: "Export Excel", description: "Xuất dữ liệu đã bóc tách ra file Excel.", side: "left" },
    },
  ],
  "/reports": [
    {
      element: "#tour-reports-stats",
      popover: { title: "Thống kê báo cáo", description: "Tổng quan số bản ghi, giá trị và bản ghi tháng này.", side: "bottom" },
    },
    {
      element: "#tour-reports-table",
      popover: { title: "Dữ liệu đã import", description: "Xem toàn bộ dữ liệu logistics đã import vào hệ thống.", side: "top" },
    },
    {
      element: "#tour-reports-import-btn",
      popover: { title: "Import mới", description: "Upload file Excel để thêm dữ liệu mới vào báo cáo.", side: "bottom" },
    },
  ],
  "/reports/import": [
    {
      element: "#tour-import-upload",
      popover: { title: "Upload file", description: "Chọn file Excel hoặc CSV để import.", side: "bottom" },
    },
    {
      element: "#tour-import-preview",
      popover: { title: "Preview", description: "Xem trước dữ liệu (10 dòng đầu) trước khi import.", side: "top" },
    },
    {
      element: "#tour-import-btn",
      popover: { title: "Thực hiện Import", description: "Click để import dữ liệu vào báo cáo tổng.", side: "top" },
    },
  ],
  "/admin/users": [
    {
      element: "#tour-users-table",
      popover: { title: "Danh sách tài khoản", description: "Quản lý nhân viên và admin. Xem vai trò và ngày tạo.", side: "top" },
    },
    {
      element: "#tour-users-add",
      popover: { title: "Thêm tài khoản", description: "Tạo tài khoản mới cho nhân viên.", side: "left" },
    },
  ],
  "/admin/settings": [
    {
      element: "#tour-settings-gmail",
      popover: { title: "Gmail", description: "Kết nối và cấu hình tài khoản Gmail đồng bộ email.", side: "bottom" },
    },
    {
      element: "#tour-settings-ai",
      popover: { title: "AI / Rule Engine", description: "Tùy chỉnh prompt và pattern lọc tiêu đề email.", side: "top" },
    },
  ],
  "/admin/logs": [
    {
      element: "#tour-logs-filter",
      popover: { title: "Lọc logs", description: "Lọc theo mức độ: lỗi, cảnh báo, thông tin.", side: "bottom" },
    },
    {
      element: "#tour-logs-table",
      popover: { title: "Danh sách Logs", description: "Xem lịch sử lỗi đồng bộ, AI và import để debug.", side: "top" },
    },
  ],
}

export function useTour() {
  const pathname = usePathname()

  const startTour = useCallback(() => {
    const steps = tourSteps[pathname]
    if (!steps || steps.length === 0) return

    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps,
      nextBtnText: "Tiếp",
      prevBtnText: "Trước",
      doneBtnText: "Xong",
      progressText: "{{current}} / {{total}}",
      overlayColor: "rgba(0,0,0,0.6)",
    })

    driverObj.drive()
  }, [pathname])

  useEffect(() => {
    // Auto-start tour on first visit per session (optional, using sessionStorage)
    const visited = sessionStorage.getItem(`tour-${pathname}`)
    if (!visited) {
      // Delay slightly to ensure DOM is ready
      const timer = setTimeout(() => {
        startTour()
        sessionStorage.setItem(`tour-${pathname}`, "true")
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [pathname, startTour])

  return { startTour }
}

```

---

## File: `lib\api.ts`

```ts
import axios, { AxiosRequestConfig } from "axios"
import type { ApiResponse, MailAccount, MailMessage, MailMessageDetail, EmailAnalysisResult, EmailTemplate, SyncStatus, User, LogEntry, ReportData } from "@/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://vietprodev.duckdns.org/gateway/logistics/api/v1"

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

async function doRefreshToken() {
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) throw new Error("No refresh token")

  const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
  const data = res.data as { accessToken?: string; refreshToken?: string } | undefined
  if (!data?.accessToken) throw new Error("Refresh failed")

  localStorage.setItem("token", data.accessToken)
  if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
  return data.accessToken
}

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (typeof window === "undefined") {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          resolve(api(originalRequest))
        })
      })
    }

    isRefreshing = true

    try {
      const newToken = await doRefreshToken()
      onTokenRefreshed(newToken)
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
      }
      return api(originalRequest)
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userId")
      window.location.href = "/login"
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default api

// Auth
export async function login(email: string, password: string) {
  const res = await api.post<ApiResponse<{
    accessToken: string
    refreshToken: string
    expiresIn: number
    tokenType: string
    user: {
      userId: string
      email: string
      fullName: string
      roles: string[]
      permissions: string[]
    }
  }>>("/auth/login", { email, password })
  return res.data
}

// Mail Accounts
export async function getMailAccounts() {
  const res = await api.get<ApiResponse<MailAccount[]>>("/mail-accounts")
  return res.data.data || []
}

export async function connectAccount(code: string, redirectUri: string) {
  const res = await api.post<ApiResponse<MailAccount>>("/mail-accounts/connect", {
    authorizationCode: code,
    redirectUri,
  })
  return res.data.data
}

export async function getOAuthUrl(redirectUri: string, state: string) {
  const res = await api.post<ApiResponse<{ authUrl: string; provider: string }>>("/mail-auth/oauth-url", {
    redirectUri,
    state,
  })
  return res.data.data
}

export async function deleteAccount(id: string) {
  await api.delete(`/mail-accounts/${id}`)
}

export async function triggerSync(id: string) {
  const res = await api.post<ApiResponse<{ jobId: string; status: string }>>(`/mail-accounts/${id}/sync`, {
    syncType: "MANUAL_RESYNC",
    folderIds: ["INBOX"],
  })
  return res.data.data
}

export async function getSyncStatus(id: string) {
  const res = await api.get<ApiResponse<SyncStatus>>(`/mail-accounts/${id}/sync-status`)
  return res.data.data
}

// Mail Messages
export async function getMailMessages(params?: { accountId?: string; page?: number; pageSize?: number; fromEmail?: string; hasAttachment?: boolean }) {
  const res = await api.get<ApiResponse<MailMessage[]>>("/mail-messages", { params })
  return res.data.data || []
}

export async function getMailMessagesEnvelope(params?: { accountId?: string; page?: number; pageSize?: number; fromEmail?: string; hasAttachment?: boolean }) {
  const res = await api.get<ApiResponse<MailMessage[]>>("/mail-messages", { params })
  return res.data
}

export async function getMailMessage(id: string) {
  const res = await api.get<ApiResponse<MailMessageDetail>>(`/mail-messages/${id}`)
  return res.data.data
}

export async function getMailMessageAttachments(id: string) {
  const res = await api.get<ApiResponse<MailMessageDetail["attachments"]>>(`/mail-messages/${id}/attachments`)
  return res.data.data || []
}

export async function processEmail(id: string) {
  const res = await api.post<ApiResponse<EmailAnalysisResult>>(`/email-messages/${id}/process`)
  return res.data.data
}

export async function classifyEmail(id: string) {
  const res = await api.post<ApiResponse<unknown>>(`/email-messages/${id}/classify`)
  return res.data.data
}

export async function extractEmailFields(id: string, templateCode?: string) {
  const res = await api.post<ApiResponse<unknown>>(`/email-messages/${id}/extract`, { templateCode })
  return res.data.data
}

// Attachments
export async function getAttachmentDownloadUrl(messageId: string, attachmentId: string) {
  return `${API_BASE}/mail-messages/${messageId}/attachments/${attachmentId}/download`
}

// Analysis Results
export async function getAnalysisResults(status?: string) {
  const res = await api.get<ApiResponse<EmailAnalysisResult[]>>("/email-analysis-results", { params: status ? { status } : undefined })
  return res.data.data || []
}

export async function createAnalysisResult(emailMessageId: string) {
  const res = await api.post<ApiResponse<EmailAnalysisResult>>("/email-analysis-results", { emailMessageId })
  return res.data.data
}

export async function getAnalysisResult(id: string) {
  const res = await api.get<ApiResponse<EmailAnalysisResult>>(`/email-analysis-results/${id}`)
  return res.data.data
}

export async function approveAnalysisResult(id: string, userId: string) {
  const res = await api.post<ApiResponse<EmailAnalysisResult>>(`/email-analysis-results/${id}/approve`, { userId })
  return res.data.data
}

export async function rejectAnalysisResult(id: string, userId: string, reason?: string) {
  const res = await api.post<ApiResponse<EmailAnalysisResult>>(`/email-analysis-results/${id}/reject`, { userId, reason })
  return res.data.data
}

export async function updateAnalysisFields(id: string, fields: Record<string, string>) {
  const res = await api.put<ApiResponse<EmailAnalysisResult>>(`/email-analysis-results/${id}/fields`, { extractedFields: fields })
  return res.data.data
}

// Document Processing
export async function processDocument(content: string, prompt?: string) {
  const res = await api.post<ApiResponse<{ result: string; model: string; tokensUsed: number }>>("/document-processor/process", {
    content,
    prompt,
    model: "gpt-4",
    isImage: false,
  })
  return res.data.data
}

// Templates
export async function getTemplates() {
  const res = await api.get<ApiResponse<EmailTemplate[]>>("/email-templates")
  return res.data.data || []
}

// Webhooks
export async function getWebhookSubscriptions() {
  const res = await api.get<ApiResponse<unknown[]>>("/webhook-subscriptions")
  return res.data.data || []
}

// Users
export async function getUsers() {
  const res = await api.get<ApiResponse<User[]>>("/users")
  return res.data.data || []
}

// Logs
export async function getLogs() {
  const res = await api.get<ApiResponse<LogEntry[]>>("/logs")
  return res.data.data || []
}

// Reports
export async function getReports() {
  const res = await api.get<ApiResponse<ReportData[]>>("/reports")
  return res.data.data || []
}

export async function exportReport() {
  const res = await api.get("/reports/export", { responseType: "blob" })
  return res.data
}

export async function importReport(formData: FormData) {
  const res = await api.post<ApiResponse<unknown>>("/reports/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data.data
}

```

---

## File: `lib\generated\mail-connector\endpoints.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type {
  ApproveRequest,
  AssignPermissionsRequest,
  AssignRequest,
  BatchCompleteUploadRequest,
  BatchDownloadUrlRequest,
  BatchInitiateUploadRequest,
  ChangePasswordRequest,
  CompleteRequest,
  ConfirmPasswordResetCommand,
  ConfirmRequest,
  ConnectAccountRequest,
  CreateAnalysisResultRequest,
  CreateConversationRequest,
  CreateMailAccountRequest,
  CreatePermissionRequest,
  CreateRoleRequest,
  CreateTemplateRequest,
  CreateUserRequest,
  CreateWebhookSubscriptionRequest,
  DocumentProcessingRequest,
  ExchangeTokenRequest,
  ExecuteImportRequest,
  GetApiV1AiChatConversationsByEntityParams,
  GetApiV1AiChatConversationsParams,
  GetApiV1AiOpenaiUsageParams,
  GetApiV1AiOpenaiUsageUserUserIdParams,
  GetApiV1AiOpenaiUsageUsersParams,
  GetApiV1FilesIdDownloadUrlParams,
  GetApiV1FilesParams,
  GetApiV1FilesQuotaParams,
  GetApiV1MailAnalysisResultsParams,
  GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams,
  GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewParams,
  GetApiV1MailMessagesParams,
  GetApiV1OrderDraftsExportParams,
  GetApiV1OrderDraftsParams,
  GetApiV1PermissionsParams,
  GetApiV1RolesParams,
  GetApiV1UsersParams,
  GetApiV1WebhookSubscriptionsParams,
  GetOauthCallbackParams,
  InitiateUploadRequest,
  LinkAttachmentRequest,
  LinkEntityRequest,
  LoginCommand,
  LogoutAllRequest,
  LogoutCommand,
  OAuthUrlRequest,
  PostApiImportUploadBody,
  PreviewImportRequest,
  ProcessMultipleDocumentsRequest,
  ReassignRequest,
  RefreshMailTokenRequest,
  RefreshTokenCommand,
  RejectRequest,
  ResetPasswordRequest,
  ReviewRequest,
  RevokeSessionRequest,
  SendMessageRequest,
  SendPasswordResetOtpCommand,
  TestWebhookRequest,
  TriggerSyncDto,
  UnassignRequest,
  UpdateAnalysisResultFieldsRequest,
  UpdateConversationRequest,
  UpdateFileMetadataRequest,
  UpdateMailAccountDto,
  UpdatePermissionRequest,
  UpdateRoleRequest,
  UpdateStatusRequest,
  UpdateTemplateRequest,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UpdateUserStatusRequest,
  UpdateWebhookSubscriptionRequest,
  ValidateMappingRequest,
  WebhookPayload
} from './model';

import { mailConnectorInstance } from '../../orval/mail-connector-mutator';
import type { BodyType } from '../../orval/mail-connector-mutator';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];


  export const getLogisticsPlatformAPI = () => {
const getApiV1AiOpenaiUsage = (
    params?: GetApiV1AiOpenaiUsageParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai/openai-usage`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1AiOpenaiUsageCurrentMonth = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai/openai-usage/current-month`, method: 'GET'
    },
      options);
    }
  
const getApiV1AiOpenaiUsageUserUserId = (
    userId: string,
    params?: GetApiV1AiOpenaiUsageUserUserIdParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai/openai-usage/user/${userId}`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1AiOpenaiUsageUserUserIdCurrentMonth = (
    userId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai/openai-usage/user/${userId}/current-month`, method: 'GET'
    },
      options);
    }
  
const getApiV1AiOpenaiUsageUsers = (
    params?: GetApiV1AiOpenaiUsageUsersParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai/openai-usage/users`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1AiOpenaiUsageUsersCurrentMonth = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai/openai-usage/users/current-month`, method: 'GET'
    },
      options);
    }
  
const putApiAttachmentReviewsMailConnectorAttachmentIdApprove = (
    mailConnectorAttachmentId: string,
    approveRequest: BodyType<ApproveRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/${mailConnectorAttachmentId}/approve`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: approveRequest
    },
      options);
    }
  
const putApiAttachmentReviewsMailConnectorAttachmentIdReject = (
    mailConnectorAttachmentId: string,
    rejectRequest: BodyType<RejectRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/${mailConnectorAttachmentId}/reject`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: rejectRequest
    },
      options);
    }
  
const getApiAttachmentReviewsByMessageMailConnectorMessageId = (
    mailConnectorMessageId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/by-message/${mailConnectorMessageId}`, method: 'GET'
    },
      options);
    }
  
const getApiAttachmentReviewsByStatusStatus = (
    status: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/by-status/${status}`, method: 'GET'
    },
      options);
    }
  
const getApiAttachmentReviewsMy = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/my`, method: 'GET'
    },
      options);
    }
  
const postApiAttachmentReviewsMailConnectorAttachmentIdReset = (
    mailConnectorAttachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/${mailConnectorAttachmentId}/reset`, method: 'POST'
    },
      options);
    }
  
const getApiAttachmentReviewsMailConnectorAttachmentId = (
    mailConnectorAttachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/${mailConnectorAttachmentId}`, method: 'GET'
    },
      options);
    }
  
const postApiV1AiChatConversationsConversationIdAttachments = (
    conversationId: string,
    linkAttachmentRequest: BodyType<LinkAttachmentRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/${conversationId}/attachments`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: linkAttachmentRequest
    },
      options);
    }
  
const getApiV1AiChatConversationsConversationIdAttachments = (
    conversationId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/${conversationId}/attachments`, method: 'GET'
    },
      options);
    }
  
const deleteApiV1AiChatConversationsConversationIdAttachmentsId = (
    conversationId: string,
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/${conversationId}/attachments/${id}`, method: 'DELETE'
    },
      options);
    }
  
const postApiV1AuthLogin = (
    loginCommand: BodyType<LoginCommand>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/login`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: loginCommand
    },
      options);
    }
  
const postApiV1AuthRefresh = (
    refreshTokenCommand: BodyType<RefreshTokenCommand>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/refresh`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: refreshTokenCommand
    },
      options);
    }
  
const postApiV1AuthLogout = (
    logoutCommand: BodyType<LogoutCommand>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/logout`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: logoutCommand
    },
      options);
    }
  
const getApiV1AuthSessions = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/sessions`, method: 'GET'
    },
      options);
    }
  
const postApiV1AuthSessionsIdRevoke = (
    id: string,
    revokeSessionRequest: BodyType<RevokeSessionRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/sessions/${id}/revoke`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: revokeSessionRequest
    },
      options);
    }
  
const postApiV1AuthLogoutAll = (
    logoutAllRequest: BodyType<LogoutAllRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/logout-all`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: logoutAllRequest
    },
      options);
    }
  
const postApiV1AuthForgotPasswordSendOtp = (
    sendPasswordResetOtpCommand: BodyType<SendPasswordResetOtpCommand>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/forgot-password/send-otp`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: sendPasswordResetOtpCommand
    },
      options);
    }
  
const postApiV1AuthForgotPasswordConfirmReset = (
    confirmPasswordResetCommand: BodyType<ConfirmPasswordResetCommand>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/forgot-password/confirm-reset`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: confirmPasswordResetCommand
    },
      options);
    }
  
const getApiV1AiChatConversationsConversationIdMessages = (
    conversationId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/${conversationId}/messages`, method: 'GET'
    },
      options);
    }
  
const postApiV1AiChatConversationsConversationIdMessages = (
    conversationId: string,
    sendMessageRequest: BodyType<SendMessageRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/${conversationId}/messages`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: sendMessageRequest
    },
      options);
    }
  
const postApiV1AiChatConversations = (
    createConversationRequest: BodyType<CreateConversationRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createConversationRequest
    },
      options);
    }
  
const getApiV1AiChatConversations = (
    params?: GetApiV1AiChatConversationsParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1AiChatConversationsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1AiChatConversationsId = (
    id: string,
    updateConversationRequest: BodyType<UpdateConversationRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateConversationRequest
    },
      options);
    }
  
const deleteApiV1AiChatConversationsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/${id}`, method: 'DELETE'
    },
      options);
    }
  
const getApiV1AiChatConversationsByEntity = (
    params?: GetApiV1AiChatConversationsByEntityParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/by-entity`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1AiChatConversationsIdArchive = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/${id}/archive`, method: 'POST'
    },
      options);
    }
  
const postApiV1AiChatConversationsIdLinkEntity = (
    id: string,
    linkEntityRequest: BodyType<LinkEntityRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai-chat/conversations/${id}/link-entity`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: linkEntityRequest
    },
      options);
    }
  
const postApiV1DocumentProcessorProcess = (
    documentProcessingRequest: BodyType<DocumentProcessingRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/document-processor/process`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: documentProcessingRequest
    },
      options);
    }
  
const postApiV1DocumentProcessorProcessMultiple = (
    processMultipleDocumentsRequest: BodyType<ProcessMultipleDocumentsRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/document-processor/process-multiple`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: processMultipleDocumentsRequest
    },
      options);
    }
  
const getApiV1MailAnalysisResults = (
    params?: GetApiV1MailAnalysisResultsParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-analysis-results`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1MailAnalysisResults = (
    createAnalysisResultRequest: BodyType<CreateAnalysisResultRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-analysis-results`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createAnalysisResultRequest
    },
      options);
    }
  
const getApiV1MailAnalysisResultsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-analysis-results/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1MailAnalysisResultsIdFields = (
    id: string,
    updateAnalysisResultFieldsRequest: BodyType<UpdateAnalysisResultFieldsRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-analysis-results/${id}/fields`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateAnalysisResultFieldsRequest
    },
      options);
    }
  
const postApiImportUpload = (
    postApiImportUploadBody: BodyType<PostApiImportUploadBody>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {const formData = new FormData();
if(postApiImportUploadBody.file !== undefined) {
 formData.append(`file`, postApiImportUploadBody.file)
 }

      return mailConnectorInstance<void>(
      {url: `/api/import/upload`, method: 'POST',
      headers: {'Content-Type': 'multipart/form-data', },
       data: formData
    },
      options);
    }
  
const postApiImportValidateMapping = (
    validateMappingRequest: BodyType<ValidateMappingRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/import/validate-mapping`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: validateMappingRequest
    },
      options);
    }
  
const postApiImportPreview = (
    previewImportRequest: BodyType<PreviewImportRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {const formData = new FormData();
if(previewImportRequest.mappings !== undefined && previewImportRequest.mappings !== null) {
 previewImportRequest.mappings.forEach(value => formData.append(`mappings`, JSON.stringify(value)));
 }
if(previewImportRequest.previewRows !== undefined) {
 formData.append(`previewRows`, previewImportRequest.previewRows.toString())
 }

      return mailConnectorInstance<void>(
      {url: `/api/import/preview`, method: 'POST',
      headers: {'Content-Type': 'multipart/form-data', },
       data: formData
    },
      options);
    }
  
const postApiImportExecute = (
    executeImportRequest: BodyType<ExecuteImportRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {const formData = new FormData();
if(executeImportRequest.mappings !== undefined && executeImportRequest.mappings !== null) {
 executeImportRequest.mappings.forEach(value => formData.append(`mappings`, JSON.stringify(value)));
 }
if(executeImportRequest.fileName !== undefined && executeImportRequest.fileName !== null) {
 formData.append(`fileName`, executeImportRequest.fileName)
 }

      return mailConnectorInstance<void>(
      {url: `/api/import/execute`, method: 'POST',
      headers: {'Content-Type': 'multipart/form-data', },
       data: formData
    },
      options);
    }
  
const getApiImportHistory = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/import/history`, method: 'GET'
    },
      options);
    }
  
const getApiImportSchema = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/import/schema`, method: 'GET'
    },
      options);
    }
  
const postApiV1FilesInitiateUpload = (
    initiateUploadRequest: BodyType<InitiateUploadRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/initiate-upload`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: initiateUploadRequest
    },
      options);
    }
  
const postApiV1FilesIdCompleteUpload = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}/complete-upload`, method: 'POST'
    },
      options);
    }
  
const postApiV1FilesIdAbortUpload = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}/abort-upload`, method: 'POST'
    },
      options);
    }
  
const getApiV1Files = (
    params?: GetApiV1FilesParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1FilesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}`, method: 'GET'
    },
      options);
    }
  
const deleteApiV1FilesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}`, method: 'DELETE'
    },
      options);
    }
  
const getApiV1FilesIdDownloadUrl = (
    id: string,
    params?: GetApiV1FilesIdDownloadUrlParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}/download-url`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1FilesQuota = (
    params?: GetApiV1FilesQuotaParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/quota`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1FilesBatchInitiateUpload = (
    batchInitiateUploadRequest: BodyType<BatchInitiateUploadRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/batch-initiate-upload`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: batchInitiateUploadRequest
    },
      options);
    }
  
const postApiV1FilesBatchCompleteUpload = (
    batchCompleteUploadRequest: BodyType<BatchCompleteUploadRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/batch-complete-upload`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: batchCompleteUploadRequest
    },
      options);
    }
  
const patchApiV1FilesIdMetadata = (
    id: string,
    updateFileMetadataRequest: BodyType<UpdateFileMetadataRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}/metadata`, method: 'PATCH',
      headers: {'Content-Type': 'application/json', },
      data: updateFileMetadataRequest
    },
      options);
    }
  
const postApiV1FilesIdRestore = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}/restore`, method: 'POST'
    },
      options);
    }
  
const postApiV1FilesBatchDownloadUrl = (
    batchDownloadUrlRequest: BodyType<BatchDownloadUrlRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/batch-download-url`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: batchDownloadUrlRequest
    },
      options);
    }
  
const getApiV1MailAccounts = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts`, method: 'GET'
    },
      options);
    }
  
const postApiV1MailAccounts = (
    createMailAccountRequest: BodyType<CreateMailAccountRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createMailAccountRequest
    },
      options);
    }
  
const getApiV1MailAccountsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1MailAccountsId = (
    id: string,
    updateMailAccountDto: BodyType<UpdateMailAccountDto>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateMailAccountDto
    },
      options);
    }
  
const deleteApiV1MailAccountsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}`, method: 'DELETE'
    },
      options);
    }
  
const postApiV1MailAccountsConnect = (
    connectAccountRequest: BodyType<ConnectAccountRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/connect`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: connectAccountRequest
    },
      options);
    }
  
const getApiV1MailAccountsIdSyncStatus = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}/sync-status`, method: 'GET'
    },
      options);
    }
  
const postApiV1MailAccountsIdSync = (
    id: string,
    triggerSyncDto: BodyType<TriggerSyncDto>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}/sync`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: triggerSyncDto
    },
      options);
    }
  
const postApiV1MailAccountsIdSyncDirect = (
    id: string,
    triggerSyncDto: BodyType<TriggerSyncDto>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}/sync-direct`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: triggerSyncDto
    },
      options);
    }
  
const postApiV1MailAssignmentsMailConnectorMessageIdAssign = (
    mailConnectorMessageId: string,
    assignRequest: BodyType<AssignRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-assignments/${mailConnectorMessageId}/assign`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: assignRequest
    },
      options);
    }
  
const deleteApiV1MailAssignmentsMailConnectorMessageIdUnassign = (
    mailConnectorMessageId: string,
    unassignRequest: BodyType<UnassignRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-assignments/${mailConnectorMessageId}/unassign`, method: 'DELETE',
      headers: {'Content-Type': 'application/json', },
      data: unassignRequest
    },
      options);
    }
  
const getApiV1MailAssignmentsMy = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-assignments/my`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailAssignmentsMailConnectorMessageIdStatus = (
    mailConnectorMessageId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-assignments/${mailConnectorMessageId}/status`, method: 'GET'
    },
      options);
    }
  
const putApiV1MailAssignmentsMailConnectorMessageIdStatus = (
    mailConnectorMessageId: string,
    updateStatusRequest: BodyType<UpdateStatusRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-assignments/${mailConnectorMessageId}/status`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateStatusRequest
    },
      options);
    }
  
const postApiV1MailAssignmentsMailConnectorMessageIdReassign = (
    mailConnectorMessageId: string,
    reassignRequest: BodyType<ReassignRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-assignments/${mailConnectorMessageId}/reassign`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: reassignRequest
    },
      options);
    }
  
const postApiV1MailAssignmentsMailConnectorMessageIdConfirm = (
    mailConnectorMessageId: string,
    confirmRequest: BodyType<ConfirmRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-assignments/${mailConnectorMessageId}/confirm`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: confirmRequest
    },
      options);
    }
  
const postApiV1MailAssignmentsMailConnectorMessageIdComplete = (
    mailConnectorMessageId: string,
    completeRequest: BodyType<CompleteRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-assignments/${mailConnectorMessageId}/complete`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: completeRequest
    },
      options);
    }
  
const getApiV1MailAssignmentsByStatusStatus = (
    status: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-assignments/by-status/${status}`, method: 'GET'
    },
      options);
    }
  
const postApiV1MailAuthOauthUrl = (
    oAuthUrlRequest: BodyType<OAuthUrlRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-auth/oauth-url`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: oAuthUrlRequest
    },
      options);
    }
  
const postApiV1MailAuthExchangeToken = (
    exchangeTokenRequest: BodyType<ExchangeTokenRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-auth/exchange-token`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: exchangeTokenRequest
    },
      options);
    }
  
const postApiV1MailAuthRefreshToken = (
    refreshMailTokenRequest: BodyType<RefreshMailTokenRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-auth/refresh-token`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: refreshMailTokenRequest
    },
      options);
    }
  
const getApiV1MailMessages = (
    params?: GetApiV1MailMessagesParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1MailMessagesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailMessagesIdAttachments = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/attachments`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdDownload = (
    messageId: string,
    attachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/download`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdContent = (
    messageId: string,
    attachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/content`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdExtractText = (
    messageId: string,
    attachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/extract-text`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreview = (
    messageId: string,
    attachmentId: string,
    params?: GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/preview`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl = (
    messageId: string,
    attachmentId: string,
    params?: GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/presigned-url`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdProxy = (
    messageId: string,
    attachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/proxy`, method: 'GET'
    },
      options);
    }
  
const postApiV1MailMessagesIdProcess = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/process`, method: 'POST'
    },
      options);
    }
  
const postApiV1MailMessagesIdTriggerPipeline = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/trigger-pipeline`, method: 'POST'
    },
      options);
    }
  
const postApiV1MailMessagesIdNormalize = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/normalize`, method: 'POST'
    },
      options);
    }
  
const postApiV1MailMessagesIdClassify = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/classify`, method: 'POST'
    },
      options);
    }
  
const postApiV1MailMessagesIdExtract = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/extract`, method: 'POST'
    },
      options);
    }
  
const getApiV1MailMessagesIdProcessingJobs = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/processing-jobs`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailTemplates = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-templates`, method: 'GET'
    },
      options);
    }
  
const postApiV1MailTemplates = (
    createTemplateRequest: BodyType<CreateTemplateRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-templates`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createTemplateRequest
    },
      options);
    }
  
const getApiV1MailTemplatesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-templates/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1MailTemplatesId = (
    id: string,
    updateTemplateRequest: BodyType<UpdateTemplateRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-templates/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateTemplateRequest
    },
      options);
    }
  
const deleteApiV1MailTemplatesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-templates/${id}`, method: 'DELETE'
    },
      options);
    }
  
const getOauthCallback = (
    params?: GetOauthCallbackParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/oauth/callback`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1OrderDrafts = (
    params?: GetApiV1OrderDraftsParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1OrderDraftsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/${id}`, method: 'GET'
    },
      options);
    }
  
const postApiV1OrderDraftsIdApproveL1 = (
    id: string,
    reviewRequest: BodyType<ReviewRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/${id}/approve-l1`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: reviewRequest
    },
      options);
    }
  
const postApiV1OrderDraftsIdRejectL1 = (
    id: string,
    reviewRequest: BodyType<ReviewRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/${id}/reject-l1`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: reviewRequest
    },
      options);
    }
  
const postApiV1OrderDraftsIdConfirm = (
    id: string,
    reviewRequest: BodyType<ReviewRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/${id}/confirm`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: reviewRequest
    },
      options);
    }
  
const postApiV1OrderDraftsIdReject = (
    id: string,
    reviewRequest: BodyType<ReviewRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/${id}/reject`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: reviewRequest
    },
      options);
    }
  
const getApiV1OrderDraftsExport = (
    params?: GetApiV1OrderDraftsExportParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/export`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1Permissions = (
    params?: GetApiV1PermissionsParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/permissions`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1Permissions = (
    createPermissionRequest: BodyType<CreatePermissionRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/permissions`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createPermissionRequest
    },
      options);
    }
  
const getApiV1PermissionsModules = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/permissions/modules`, method: 'GET'
    },
      options);
    }
  
const getApiV1PermissionsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/permissions/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1PermissionsId = (
    id: string,
    updatePermissionRequest: BodyType<UpdatePermissionRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/permissions/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updatePermissionRequest
    },
      options);
    }
  
const deleteApiV1PermissionsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/permissions/${id}`, method: 'DELETE'
    },
      options);
    }
  
const postApiV1PermissionsIdRestore = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/permissions/${id}/restore`, method: 'POST'
    },
      options);
    }
  
const getApiV1Roles = (
    params?: GetApiV1RolesParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/roles`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1Roles = (
    createRoleRequest: BodyType<CreateRoleRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/roles`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createRoleRequest
    },
      options);
    }
  
const getApiV1RolesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/roles/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1RolesId = (
    id: string,
    updateRoleRequest: BodyType<UpdateRoleRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/roles/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateRoleRequest
    },
      options);
    }
  
const deleteApiV1RolesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/roles/${id}`, method: 'DELETE'
    },
      options);
    }
  
const postApiV1RolesIdRestore = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/roles/${id}/restore`, method: 'POST'
    },
      options);
    }
  
const getApiV1RolesIdPermissions = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/roles/${id}/permissions`, method: 'GET'
    },
      options);
    }
  
const postApiV1RolesIdPermissions = (
    id: string,
    assignPermissionsRequest: BodyType<AssignPermissionsRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/roles/${id}/permissions`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: assignPermissionsRequest
    },
      options);
    }
  
const putApiV1RolesIdPermissions = (
    id: string,
    assignPermissionsRequest: BodyType<AssignPermissionsRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/roles/${id}/permissions`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: assignPermissionsRequest
    },
      options);
    }
  
const deleteApiV1RolesIdPermissionsPermissionId = (
    id: string,
    permissionId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/roles/${id}/permissions/${permissionId}`, method: 'DELETE'
    },
      options);
    }
  
const getApiV1UsersMe = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/me`, method: 'GET'
    },
      options);
    }
  
const putApiV1UsersMe = (
    updateUserRequest: BodyType<UpdateUserRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/me`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateUserRequest
    },
      options);
    }
  
const getApiV1Users = (
    params?: GetApiV1UsersParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1Users = (
    createUserRequest: BodyType<CreateUserRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createUserRequest
    },
      options);
    }
  
const getApiV1UsersId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1UsersId = (
    id: string,
    updateUserRequest: BodyType<UpdateUserRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateUserRequest
    },
      options);
    }
  
const deleteApiV1UsersId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}`, method: 'DELETE'
    },
      options);
    }
  
const postApiV1UsersIdRestore = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}/restore`, method: 'POST'
    },
      options);
    }
  
const patchApiV1UsersIdStatus = (
    id: string,
    updateUserStatusRequest: BodyType<UpdateUserStatusRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}/status`, method: 'PATCH',
      headers: {'Content-Type': 'application/json', },
      data: updateUserStatusRequest
    },
      options);
    }
  
const postApiV1UsersMeChangePassword = (
    changePasswordRequest: BodyType<ChangePasswordRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/me/change-password`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: changePasswordRequest
    },
      options);
    }
  
const postApiV1UsersIdResetPassword = (
    id: string,
    resetPasswordRequest: BodyType<ResetPasswordRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}/reset-password`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: resetPasswordRequest
    },
      options);
    }
  
const putApiV1UsersIdRoles = (
    id: string,
    updateUserRolesRequest: BodyType<UpdateUserRolesRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}/roles`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateUserRolesRequest
    },
      options);
    }
  
const getApiV1UsersIdPermissions = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}/permissions`, method: 'GET'
    },
      options);
    }
  
const getApiV1UsersMePermissions = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/me/permissions`, method: 'GET'
    },
      options);
    }
  
const postApiV1WebhooksMailconnector = (
    webhookPayload: BodyType<WebhookPayload>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhooks/mailconnector`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: webhookPayload
    },
      options);
    }
  
const getApiV1WebhookSubscriptions = (
    params?: GetApiV1WebhookSubscriptionsParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1WebhookSubscriptions = (
    createWebhookSubscriptionRequest: BodyType<CreateWebhookSubscriptionRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createWebhookSubscriptionRequest
    },
      options);
    }
  
const getApiV1WebhookSubscriptionsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1WebhookSubscriptionsId = (
    id: string,
    updateWebhookSubscriptionRequest: BodyType<UpdateWebhookSubscriptionRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateWebhookSubscriptionRequest
    },
      options);
    }
  
const deleteApiV1WebhookSubscriptionsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions/${id}`, method: 'DELETE'
    },
      options);
    }
  
const postApiV1WebhookSubscriptionsIdTest = (
    id: string,
    testWebhookRequest: BodyType<TestWebhookRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions/${id}/test`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: testWebhookRequest
    },
      options);
    }
  
return {getApiV1AiOpenaiUsage,getApiV1AiOpenaiUsageCurrentMonth,getApiV1AiOpenaiUsageUserUserId,getApiV1AiOpenaiUsageUserUserIdCurrentMonth,getApiV1AiOpenaiUsageUsers,getApiV1AiOpenaiUsageUsersCurrentMonth,putApiAttachmentReviewsMailConnectorAttachmentIdApprove,putApiAttachmentReviewsMailConnectorAttachmentIdReject,getApiAttachmentReviewsByMessageMailConnectorMessageId,getApiAttachmentReviewsByStatusStatus,getApiAttachmentReviewsMy,postApiAttachmentReviewsMailConnectorAttachmentIdReset,getApiAttachmentReviewsMailConnectorAttachmentId,postApiV1AiChatConversationsConversationIdAttachments,getApiV1AiChatConversationsConversationIdAttachments,deleteApiV1AiChatConversationsConversationIdAttachmentsId,postApiV1AuthLogin,postApiV1AuthRefresh,postApiV1AuthLogout,getApiV1AuthSessions,postApiV1AuthSessionsIdRevoke,postApiV1AuthLogoutAll,postApiV1AuthForgotPasswordSendOtp,postApiV1AuthForgotPasswordConfirmReset,getApiV1AiChatConversationsConversationIdMessages,postApiV1AiChatConversationsConversationIdMessages,postApiV1AiChatConversations,getApiV1AiChatConversations,getApiV1AiChatConversationsId,putApiV1AiChatConversationsId,deleteApiV1AiChatConversationsId,getApiV1AiChatConversationsByEntity,postApiV1AiChatConversationsIdArchive,postApiV1AiChatConversationsIdLinkEntity,postApiV1DocumentProcessorProcess,postApiV1DocumentProcessorProcessMultiple,getApiV1MailAnalysisResults,postApiV1MailAnalysisResults,getApiV1MailAnalysisResultsId,putApiV1MailAnalysisResultsIdFields,postApiImportUpload,postApiImportValidateMapping,postApiImportPreview,postApiImportExecute,getApiImportHistory,getApiImportSchema,postApiV1FilesInitiateUpload,postApiV1FilesIdCompleteUpload,postApiV1FilesIdAbortUpload,getApiV1Files,getApiV1FilesId,deleteApiV1FilesId,getApiV1FilesIdDownloadUrl,getApiV1FilesQuota,postApiV1FilesBatchInitiateUpload,postApiV1FilesBatchCompleteUpload,patchApiV1FilesIdMetadata,postApiV1FilesIdRestore,postApiV1FilesBatchDownloadUrl,getApiV1MailAccounts,postApiV1MailAccounts,getApiV1MailAccountsId,putApiV1MailAccountsId,deleteApiV1MailAccountsId,postApiV1MailAccountsConnect,getApiV1MailAccountsIdSyncStatus,postApiV1MailAccountsIdSync,postApiV1MailAccountsIdSyncDirect,postApiV1MailAssignmentsMailConnectorMessageIdAssign,deleteApiV1MailAssignmentsMailConnectorMessageIdUnassign,getApiV1MailAssignmentsMy,getApiV1MailAssignmentsMailConnectorMessageIdStatus,putApiV1MailAssignmentsMailConnectorMessageIdStatus,postApiV1MailAssignmentsMailConnectorMessageIdReassign,postApiV1MailAssignmentsMailConnectorMessageIdConfirm,postApiV1MailAssignmentsMailConnectorMessageIdComplete,getApiV1MailAssignmentsByStatusStatus,postApiV1MailAuthOauthUrl,postApiV1MailAuthExchangeToken,postApiV1MailAuthRefreshToken,getApiV1MailMessages,getApiV1MailMessagesId,getApiV1MailMessagesIdAttachments,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdDownload,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdContent,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdExtractText,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreview,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdProxy,postApiV1MailMessagesIdProcess,postApiV1MailMessagesIdTriggerPipeline,postApiV1MailMessagesIdNormalize,postApiV1MailMessagesIdClassify,postApiV1MailMessagesIdExtract,getApiV1MailMessagesIdProcessingJobs,getApiV1MailTemplates,postApiV1MailTemplates,getApiV1MailTemplatesId,putApiV1MailTemplatesId,deleteApiV1MailTemplatesId,getOauthCallback,getApiV1OrderDrafts,getApiV1OrderDraftsId,postApiV1OrderDraftsIdApproveL1,postApiV1OrderDraftsIdRejectL1,postApiV1OrderDraftsIdConfirm,postApiV1OrderDraftsIdReject,getApiV1OrderDraftsExport,getApiV1Permissions,postApiV1Permissions,getApiV1PermissionsModules,getApiV1PermissionsId,putApiV1PermissionsId,deleteApiV1PermissionsId,postApiV1PermissionsIdRestore,getApiV1Roles,postApiV1Roles,getApiV1RolesId,putApiV1RolesId,deleteApiV1RolesId,postApiV1RolesIdRestore,getApiV1RolesIdPermissions,postApiV1RolesIdPermissions,putApiV1RolesIdPermissions,deleteApiV1RolesIdPermissionsPermissionId,getApiV1UsersMe,putApiV1UsersMe,getApiV1Users,postApiV1Users,getApiV1UsersId,putApiV1UsersId,deleteApiV1UsersId,postApiV1UsersIdRestore,patchApiV1UsersIdStatus,postApiV1UsersMeChangePassword,postApiV1UsersIdResetPassword,putApiV1UsersIdRoles,getApiV1UsersIdPermissions,getApiV1UsersMePermissions,postApiV1WebhooksMailconnector,getApiV1WebhookSubscriptions,postApiV1WebhookSubscriptions,getApiV1WebhookSubscriptionsId,putApiV1WebhookSubscriptionsId,deleteApiV1WebhookSubscriptionsId,postApiV1WebhookSubscriptionsIdTest}};
export type GetApiV1AiOpenaiUsageResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiOpenaiUsage']>>>
export type GetApiV1AiOpenaiUsageCurrentMonthResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiOpenaiUsageCurrentMonth']>>>
export type GetApiV1AiOpenaiUsageUserUserIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiOpenaiUsageUserUserId']>>>
export type GetApiV1AiOpenaiUsageUserUserIdCurrentMonthResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiOpenaiUsageUserUserIdCurrentMonth']>>>
export type GetApiV1AiOpenaiUsageUsersResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiOpenaiUsageUsers']>>>
export type GetApiV1AiOpenaiUsageUsersCurrentMonthResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiOpenaiUsageUsersCurrentMonth']>>>
export type PutApiAttachmentReviewsMailConnectorAttachmentIdApproveResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiAttachmentReviewsMailConnectorAttachmentIdApprove']>>>
export type PutApiAttachmentReviewsMailConnectorAttachmentIdRejectResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiAttachmentReviewsMailConnectorAttachmentIdReject']>>>
export type GetApiAttachmentReviewsByMessageMailConnectorMessageIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiAttachmentReviewsByMessageMailConnectorMessageId']>>>
export type GetApiAttachmentReviewsByStatusStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiAttachmentReviewsByStatusStatus']>>>
export type GetApiAttachmentReviewsMyResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiAttachmentReviewsMy']>>>
export type PostApiAttachmentReviewsMailConnectorAttachmentIdResetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiAttachmentReviewsMailConnectorAttachmentIdReset']>>>
export type GetApiAttachmentReviewsMailConnectorAttachmentIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiAttachmentReviewsMailConnectorAttachmentId']>>>
export type PostApiV1AiChatConversationsConversationIdAttachmentsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AiChatConversationsConversationIdAttachments']>>>
export type GetApiV1AiChatConversationsConversationIdAttachmentsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiChatConversationsConversationIdAttachments']>>>
export type DeleteApiV1AiChatConversationsConversationIdAttachmentsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1AiChatConversationsConversationIdAttachmentsId']>>>
export type PostApiV1AuthLoginResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthLogin']>>>
export type PostApiV1AuthRefreshResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthRefresh']>>>
export type PostApiV1AuthLogoutResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthLogout']>>>
export type GetApiV1AuthSessionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AuthSessions']>>>
export type PostApiV1AuthSessionsIdRevokeResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthSessionsIdRevoke']>>>
export type PostApiV1AuthLogoutAllResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthLogoutAll']>>>
export type PostApiV1AuthForgotPasswordSendOtpResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthForgotPasswordSendOtp']>>>
export type PostApiV1AuthForgotPasswordConfirmResetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthForgotPasswordConfirmReset']>>>
export type GetApiV1AiChatConversationsConversationIdMessagesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiChatConversationsConversationIdMessages']>>>
export type PostApiV1AiChatConversationsConversationIdMessagesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AiChatConversationsConversationIdMessages']>>>
export type PostApiV1AiChatConversationsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AiChatConversations']>>>
export type GetApiV1AiChatConversationsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiChatConversations']>>>
export type GetApiV1AiChatConversationsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiChatConversationsId']>>>
export type PutApiV1AiChatConversationsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1AiChatConversationsId']>>>
export type DeleteApiV1AiChatConversationsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1AiChatConversationsId']>>>
export type GetApiV1AiChatConversationsByEntityResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiChatConversationsByEntity']>>>
export type PostApiV1AiChatConversationsIdArchiveResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AiChatConversationsIdArchive']>>>
export type PostApiV1AiChatConversationsIdLinkEntityResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AiChatConversationsIdLinkEntity']>>>
export type PostApiV1DocumentProcessorProcessResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1DocumentProcessorProcess']>>>
export type PostApiV1DocumentProcessorProcessMultipleResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1DocumentProcessorProcessMultiple']>>>
export type GetApiV1MailAnalysisResultsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAnalysisResults']>>>
export type PostApiV1MailAnalysisResultsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAnalysisResults']>>>
export type GetApiV1MailAnalysisResultsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAnalysisResultsId']>>>
export type PutApiV1MailAnalysisResultsIdFieldsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1MailAnalysisResultsIdFields']>>>
export type PostApiImportUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiImportUpload']>>>
export type PostApiImportValidateMappingResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiImportValidateMapping']>>>
export type PostApiImportPreviewResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiImportPreview']>>>
export type PostApiImportExecuteResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiImportExecute']>>>
export type GetApiImportHistoryResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiImportHistory']>>>
export type GetApiImportSchemaResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiImportSchema']>>>
export type PostApiV1FilesInitiateUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesInitiateUpload']>>>
export type PostApiV1FilesIdCompleteUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesIdCompleteUpload']>>>
export type PostApiV1FilesIdAbortUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesIdAbortUpload']>>>
export type GetApiV1FilesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1Files']>>>
export type GetApiV1FilesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1FilesId']>>>
export type DeleteApiV1FilesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1FilesId']>>>
export type GetApiV1FilesIdDownloadUrlResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1FilesIdDownloadUrl']>>>
export type GetApiV1FilesQuotaResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1FilesQuota']>>>
export type PostApiV1FilesBatchInitiateUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesBatchInitiateUpload']>>>
export type PostApiV1FilesBatchCompleteUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesBatchCompleteUpload']>>>
export type PatchApiV1FilesIdMetadataResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['patchApiV1FilesIdMetadata']>>>
export type PostApiV1FilesIdRestoreResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesIdRestore']>>>
export type PostApiV1FilesBatchDownloadUrlResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesBatchDownloadUrl']>>>
export type GetApiV1MailAccountsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAccounts']>>>
export type PostApiV1MailAccountsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAccounts']>>>
export type GetApiV1MailAccountsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAccountsId']>>>
export type PutApiV1MailAccountsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1MailAccountsId']>>>
export type DeleteApiV1MailAccountsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1MailAccountsId']>>>
export type PostApiV1MailAccountsConnectResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAccountsConnect']>>>
export type GetApiV1MailAccountsIdSyncStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAccountsIdSyncStatus']>>>
export type PostApiV1MailAccountsIdSyncResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAccountsIdSync']>>>
export type PostApiV1MailAccountsIdSyncDirectResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAccountsIdSyncDirect']>>>
export type PostApiV1MailAssignmentsMailConnectorMessageIdAssignResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAssignmentsMailConnectorMessageIdAssign']>>>
export type DeleteApiV1MailAssignmentsMailConnectorMessageIdUnassignResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1MailAssignmentsMailConnectorMessageIdUnassign']>>>
export type GetApiV1MailAssignmentsMyResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAssignmentsMy']>>>
export type GetApiV1MailAssignmentsMailConnectorMessageIdStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAssignmentsMailConnectorMessageIdStatus']>>>
export type PutApiV1MailAssignmentsMailConnectorMessageIdStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1MailAssignmentsMailConnectorMessageIdStatus']>>>
export type PostApiV1MailAssignmentsMailConnectorMessageIdReassignResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAssignmentsMailConnectorMessageIdReassign']>>>
export type PostApiV1MailAssignmentsMailConnectorMessageIdConfirmResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAssignmentsMailConnectorMessageIdConfirm']>>>
export type PostApiV1MailAssignmentsMailConnectorMessageIdCompleteResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAssignmentsMailConnectorMessageIdComplete']>>>
export type GetApiV1MailAssignmentsByStatusStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAssignmentsByStatusStatus']>>>
export type PostApiV1MailAuthOauthUrlResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAuthOauthUrl']>>>
export type PostApiV1MailAuthExchangeTokenResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAuthExchangeToken']>>>
export type PostApiV1MailAuthRefreshTokenResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAuthRefreshToken']>>>
export type GetApiV1MailMessagesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessages']>>>
export type GetApiV1MailMessagesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesId']>>>
export type GetApiV1MailMessagesIdAttachmentsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesIdAttachments']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdDownloadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdDownload']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdContentResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdContent']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdExtractTextResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdExtractText']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreview']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdProxyResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdProxy']>>>
export type PostApiV1MailMessagesIdProcessResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailMessagesIdProcess']>>>
export type PostApiV1MailMessagesIdTriggerPipelineResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailMessagesIdTriggerPipeline']>>>
export type PostApiV1MailMessagesIdNormalizeResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailMessagesIdNormalize']>>>
export type PostApiV1MailMessagesIdClassifyResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailMessagesIdClassify']>>>
export type PostApiV1MailMessagesIdExtractResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailMessagesIdExtract']>>>
export type GetApiV1MailMessagesIdProcessingJobsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesIdProcessingJobs']>>>
export type GetApiV1MailTemplatesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailTemplates']>>>
export type PostApiV1MailTemplatesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailTemplates']>>>
export type GetApiV1MailTemplatesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailTemplatesId']>>>
export type PutApiV1MailTemplatesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1MailTemplatesId']>>>
export type DeleteApiV1MailTemplatesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1MailTemplatesId']>>>
export type GetOauthCallbackResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getOauthCallback']>>>
export type GetApiV1OrderDraftsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1OrderDrafts']>>>
export type GetApiV1OrderDraftsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1OrderDraftsId']>>>
export type PostApiV1OrderDraftsIdApproveL1Result = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1OrderDraftsIdApproveL1']>>>
export type PostApiV1OrderDraftsIdRejectL1Result = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1OrderDraftsIdRejectL1']>>>
export type PostApiV1OrderDraftsIdConfirmResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1OrderDraftsIdConfirm']>>>
export type PostApiV1OrderDraftsIdRejectResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1OrderDraftsIdReject']>>>
export type GetApiV1OrderDraftsExportResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1OrderDraftsExport']>>>
export type GetApiV1PermissionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1Permissions']>>>
export type PostApiV1PermissionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1Permissions']>>>
export type GetApiV1PermissionsModulesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1PermissionsModules']>>>
export type GetApiV1PermissionsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1PermissionsId']>>>
export type PutApiV1PermissionsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1PermissionsId']>>>
export type DeleteApiV1PermissionsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1PermissionsId']>>>
export type PostApiV1PermissionsIdRestoreResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1PermissionsIdRestore']>>>
export type GetApiV1RolesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1Roles']>>>
export type PostApiV1RolesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1Roles']>>>
export type GetApiV1RolesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1RolesId']>>>
export type PutApiV1RolesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1RolesId']>>>
export type DeleteApiV1RolesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1RolesId']>>>
export type PostApiV1RolesIdRestoreResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1RolesIdRestore']>>>
export type GetApiV1RolesIdPermissionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1RolesIdPermissions']>>>
export type PostApiV1RolesIdPermissionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1RolesIdPermissions']>>>
export type PutApiV1RolesIdPermissionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1RolesIdPermissions']>>>
export type DeleteApiV1RolesIdPermissionsPermissionIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1RolesIdPermissionsPermissionId']>>>
export type GetApiV1UsersMeResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1UsersMe']>>>
export type PutApiV1UsersMeResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1UsersMe']>>>
export type GetApiV1UsersResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1Users']>>>
export type PostApiV1UsersResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1Users']>>>
export type GetApiV1UsersIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1UsersId']>>>
export type PutApiV1UsersIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1UsersId']>>>
export type DeleteApiV1UsersIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1UsersId']>>>
export type PostApiV1UsersIdRestoreResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1UsersIdRestore']>>>
export type PatchApiV1UsersIdStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['patchApiV1UsersIdStatus']>>>
export type PostApiV1UsersMeChangePasswordResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1UsersMeChangePassword']>>>
export type PostApiV1UsersIdResetPasswordResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1UsersIdResetPassword']>>>
export type PutApiV1UsersIdRolesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1UsersIdRoles']>>>
export type GetApiV1UsersIdPermissionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1UsersIdPermissions']>>>
export type GetApiV1UsersMePermissionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1UsersMePermissions']>>>
export type PostApiV1WebhooksMailconnectorResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1WebhooksMailconnector']>>>
export type GetApiV1WebhookSubscriptionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1WebhookSubscriptions']>>>
export type PostApiV1WebhookSubscriptionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1WebhookSubscriptions']>>>
export type GetApiV1WebhookSubscriptionsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1WebhookSubscriptionsId']>>>
export type PutApiV1WebhookSubscriptionsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1WebhookSubscriptionsId']>>>
export type DeleteApiV1WebhookSubscriptionsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1WebhookSubscriptionsId']>>>
export type PostApiV1WebhookSubscriptionsIdTestResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1WebhookSubscriptionsIdTest']>>>

```

---

## File: `lib\generated\mail-connector\model\approveRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ApproveRequest {
  /** @nullable */
  notes?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\assignPermissionsRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface AssignPermissionsRequest {
  /** @nullable */
  permissionIds?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\assignRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface AssignRequest {
  /** @nullable */
  toUserId?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\batchCompleteUploadRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface BatchCompleteUploadRequest {
  /** @nullable */
  fileIds?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\batchDownloadUrlRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface BatchDownloadUrlRequest {
  /** @nullable */
  fileIds?: string[] | null;
  expiryMinutes?: number;
}

```

---

## File: `lib\generated\mail-connector\model\batchInitiateUploadRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { BatchInitiateUploadRequestItem } from './batchInitiateUploadRequestItem';

export interface BatchInitiateUploadRequest {
  /** @nullable */
  items?: BatchInitiateUploadRequestItem[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\batchInitiateUploadRequestItem.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { DocumentType } from './documentType';
import type { FileVisibility } from './fileVisibility';

export interface BatchInitiateUploadRequestItem {
  /** @nullable */
  fileName?: string | null;
  /** @nullable */
  contentType?: string | null;
  sizeBytes?: number;
  documentType?: DocumentType;
  /** @nullable */
  tenantId?: string | null;
  /** @nullable */
  relatedEntityType?: string | null;
  /** @nullable */
  relatedEntityId?: string | null;
  visibility?: FileVisibility;
  /** @nullable */
  uploadExpirySeconds?: number | null;
}

```

---

## File: `lib\generated\mail-connector\model\changePasswordRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ChangePasswordRequest {
  /** @nullable */
  currentPassword?: string | null;
  /** @nullable */
  newPassword?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\columnMappingDto.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ColumnMappingDto {
  /** @nullable */
  excelColumn?: string | null;
  /** @nullable */
  reportColumn?: string | null;
  /** @nullable */
  dataType?: string | null;
  isRequired?: boolean;
  /** @nullable */
  validationPattern?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\completeRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CompleteRequest {
  /** @nullable */
  notes?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\confirmPasswordResetCommand.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ConfirmPasswordResetCommand {
  /** @nullable */
  email?: string | null;
  /** @nullable */
  token?: string | null;
  /** @nullable */
  newPassword?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\confirmRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ConfirmRequest {
  /** @nullable */
  notes?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\connectAccountRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ConnectAccountRequest {
  /** @nullable */
  authorizationCode?: string | null;
  /** @nullable */
  redirectUri?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\createAnalysisResultRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreateAnalysisResultRequest {
  emailMessageId?: string;
}

```

---

## File: `lib\generated\mail-connector\model\createConversationRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreateConversationRequest {
  /** @nullable */
  title?: string | null;
  tenantId?: string;
  createdBy?: string;
  /** @nullable */
  idempotencyKey?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\createMailAccountRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreateMailAccountRequest {
  /** @nullable */
  provider?: string | null;
  /** @nullable */
  authorizationCode?: string | null;
  /** @nullable */
  redirectUri?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\createPermissionRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreatePermissionRequest {
  /** @nullable */
  code?: string | null;
  /** @nullable */
  name?: string | null;
  /** @nullable */
  module?: string | null;
  /** @nullable */
  description?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\createRoleRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreateRoleRequest {
  /** @nullable */
  code?: string | null;
  /** @nullable */
  name?: string | null;
  /** @nullable */
  description?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\createTemplateRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { CreateTemplateRequestExpectedFields } from './createTemplateRequestExpectedFields';

export interface CreateTemplateRequest {
  /** @nullable */
  templateCode?: string | null;
  /** @nullable */
  templateName?: string | null;
  /** @nullable */
  description?: string | null;
  /** @nullable */
  subjectPattern?: string | null;
  /** @nullable */
  bodyPattern?: string | null;
  /** @nullable */
  expectedFields?: CreateTemplateRequestExpectedFields;
  /** @nullable */
  documentTypes?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\createTemplateRequestExpectedFields.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

/**
 * @nullable
 */
export type CreateTemplateRequestExpectedFields = {[key: string]: string} | null;

```

---

## File: `lib\generated\mail-connector\model\createUserRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreateUserRequest {
  /** @nullable */
  email?: string | null;
  /** @nullable */
  password?: string | null;
  /** @nullable */
  fullName?: string | null;
  /** @nullable */
  roles?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\createWebhookSubscriptionRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreateWebhookSubscriptionRequest {
  /** @nullable */
  subscriberCode?: string | null;
  /** @nullable */
  callbackUrl?: string | null;
  /** @nullable */
  eventTypes?: string[] | null;
  /** @nullable */
  secretKey?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\documentProcessingRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface DocumentProcessingRequest {
  /** @nullable */
  content?: string | null;
  /** @nullable */
  prompt?: string | null;
  /** @nullable */
  model?: string | null;
  isImage?: boolean;
  /** @nullable */
  mimeType?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\documentType.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];


// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DocumentType = {
  NUMBER_1: 1,
  NUMBER_2: 2,
  NUMBER_3: 3,
  NUMBER_4: 4,
  NUMBER_5: 5,
  NUMBER_6: 6,
  NUMBER_7: 7,
  NUMBER_8: 8,
  NUMBER_9: 9,
  NUMBER_10: 10,
} as const;

```

---

## File: `lib\generated\mail-connector\model\exchangeTokenRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ExchangeTokenRequest {
  /** @nullable */
  authorizationCode?: string | null;
  /** @nullable */
  redirectUri?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\executeImportRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { ColumnMappingDto } from './columnMappingDto';

export interface ExecuteImportRequest {
  /** @nullable */
  mappings?: ColumnMappingDto[] | null;
  /** @nullable */
  fileName?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\fileContentDto.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface FileContentDto {
  /** @nullable */
  fileName?: string | null;
  /** @nullable */
  content?: string | null;
  /** @nullable */
  type?: string | null;
  /** @nullable */
  mimeType?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\fileVisibility.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type FileVisibility = typeof FileVisibility[keyof typeof FileVisibility];


// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FileVisibility = {
  NUMBER_1: 1,
  NUMBER_2: 2,
  NUMBER_3: 3,
} as const;

```

---

## File: `lib\generated\mail-connector\model\getApiV1AiChatConversationsByEntityParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1AiChatConversationsByEntityParams = {
entityType?: string;
entityId?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1AiChatConversationsParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1AiChatConversationsParams = {
tenantId?: string;
createdBy?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1AiOpenaiUsageParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1AiOpenaiUsageParams = {
startDate?: string;
endDate?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1AiOpenaiUsageUsersParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1AiOpenaiUsageUsersParams = {
startDate?: string;
endDate?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1AiOpenaiUsageUserUserIdParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1AiOpenaiUsageUserUserIdParams = {
startDate?: string;
endDate?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1FilesIdDownloadUrlParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1FilesIdDownloadUrlParams = {
expiryMinutes?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1FilesParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1FilesParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1FilesQuotaParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1FilesQuotaParams = {
tenantId?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1MailAnalysisResultsParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1MailAnalysisResultsParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams = {
expiryMinutes?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewParams = {
variant?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1MailMessagesParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1MailMessagesParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1OrderDraftsExportParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1OrderDraftsExportParams = {
status?: string;
from?: string;
to?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1OrderDraftsParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1OrderDraftsParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1PermissionsParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1PermissionsParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1RolesParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1RolesParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1UsersParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1UsersParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1WebhookSubscriptionsParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1WebhookSubscriptionsParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getOauthCallbackParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetOauthCallbackParams = {
code?: string;
state?: string;
};

```

---

## File: `lib\generated\mail-connector\model\index.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export * from './approveRequest';
export * from './assignPermissionsRequest';
export * from './assignRequest';
export * from './batchCompleteUploadRequest';
export * from './batchDownloadUrlRequest';
export * from './batchInitiateUploadRequest';
export * from './batchInitiateUploadRequestItem';
export * from './changePasswordRequest';
export * from './columnMappingDto';
export * from './completeRequest';
export * from './confirmPasswordResetCommand';
export * from './confirmRequest';
export * from './connectAccountRequest';
export * from './createAnalysisResultRequest';
export * from './createConversationRequest';
export * from './createMailAccountRequest';
export * from './createPermissionRequest';
export * from './createRoleRequest';
export * from './createTemplateRequest';
export * from './createTemplateRequestExpectedFields';
export * from './createUserRequest';
export * from './createWebhookSubscriptionRequest';
export * from './documentProcessingRequest';
export * from './documentType';
export * from './exchangeTokenRequest';
export * from './executeImportRequest';
export * from './fileContentDto';
export * from './fileVisibility';
export * from './getApiV1AiChatConversationsByEntityParams';
export * from './getApiV1AiChatConversationsParams';
export * from './getApiV1AiOpenaiUsageParams';
export * from './getApiV1AiOpenaiUsageUserUserIdParams';
export * from './getApiV1AiOpenaiUsageUsersParams';
export * from './getApiV1FilesIdDownloadUrlParams';
export * from './getApiV1FilesParams';
export * from './getApiV1FilesQuotaParams';
export * from './getApiV1MailAnalysisResultsParams';
export * from './getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams';
export * from './getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewParams';
export * from './getApiV1MailMessagesParams';
export * from './getApiV1OrderDraftsExportParams';
export * from './getApiV1OrderDraftsParams';
export * from './getApiV1PermissionsParams';
export * from './getApiV1RolesParams';
export * from './getApiV1UsersParams';
export * from './getApiV1WebhookSubscriptionsParams';
export * from './getOauthCallbackParams';
export * from './initiateUploadRequest';
export * from './linkAttachmentRequest';
export * from './linkEntityRequest';
export * from './loginCommand';
export * from './logoutAllRequest';
export * from './logoutCommand';
export * from './oAuthUrlRequest';
export * from './postApiImportUploadBody';
export * from './previewImportRequest';
export * from './processMultipleDocumentsRequest';
export * from './reassignRequest';
export * from './refreshMailTokenRequest';
export * from './refreshTokenCommand';
export * from './rejectRequest';
export * from './resetPasswordRequest';
export * from './reviewRequest';
export * from './revokeSessionRequest';
export * from './sendMessageRequest';
export * from './sendPasswordResetOtpCommand';
export * from './testWebhookRequest';
export * from './testWebhookRequestPayload';
export * from './triggerSyncDto';
export * from './unassignRequest';
export * from './updateAnalysisResultFieldsRequest';
export * from './updateAnalysisResultFieldsRequestExtractedFields';
export * from './updateConversationRequest';
export * from './updateFileMetadataRequest';
export * from './updateMailAccountDto';
export * from './updatePermissionRequest';
export * from './updateRoleRequest';
export * from './updateStatusRequest';
export * from './updateTemplateRequest';
export * from './updateTemplateRequestExpectedFields';
export * from './updateUserRequest';
export * from './updateUserRolesRequest';
export * from './updateUserStatusRequest';
export * from './updateWebhookSubscriptionRequest';
export * from './validateMappingRequest';
export * from './webhookPayload';
```

---

## File: `lib\generated\mail-connector\model\initiateUploadRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { DocumentType } from './documentType';
import type { FileVisibility } from './fileVisibility';

export interface InitiateUploadRequest {
  /** @nullable */
  fileName?: string | null;
  /** @nullable */
  contentType?: string | null;
  sizeBytes?: number;
  documentType?: DocumentType;
  /** @nullable */
  tenantId?: string | null;
  /** @nullable */
  relatedEntityType?: string | null;
  /** @nullable */
  relatedEntityId?: string | null;
  visibility?: FileVisibility;
  /** @nullable */
  uploadExpirySeconds?: number | null;
}

```

---

## File: `lib\generated\mail-connector\model\linkAttachmentRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface LinkAttachmentRequest {
  /** @nullable */
  source?: string | null;
  /** @nullable */
  messageId?: string | null;
  /** @nullable */
  attachmentId?: string | null;
  /** @nullable */
  fileName?: string | null;
  /** @nullable */
  contentType?: string | null;
  /** @nullable */
  fileSize?: number | null;
  /** @nullable */
  fileHash?: string | null;
  /** @nullable */
  storageBucket?: string | null;
  /** @nullable */
  storagePath?: string | null;
  tenantId?: string;
  createdBy?: string;
}

```

---

## File: `lib\generated\mail-connector\model\linkEntityRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface LinkEntityRequest {
  /** @nullable */
  entityType?: string | null;
  /** @nullable */
  entityId?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\loginCommand.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface LoginCommand {
  /** @nullable */
  email?: string | null;
  /** @nullable */
  password?: string | null;
  /** @nullable */
  ipAddress?: string | null;
  /** @nullable */
  userAgent?: string | null;
  /** @nullable */
  deviceId?: string | null;
  /** @nullable */
  platform?: string | null;
  /** @nullable */
  deviceName?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\logoutAllRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface LogoutAllRequest {
  /** @nullable */
  reason?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\logoutCommand.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface LogoutCommand {
  /** @nullable */
  refreshToken?: string | null;
  /** @nullable */
  ipAddress?: string | null;
  /** @nullable */
  userAgent?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\oAuthUrlRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface OAuthUrlRequest {
  /** @nullable */
  redirectUri?: string | null;
  /** @nullable */
  state?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\postApiImportUploadBody.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type PostApiImportUploadBody = {
  file?: Blob;
};

```

---

## File: `lib\generated\mail-connector\model\previewImportRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { ColumnMappingDto } from './columnMappingDto';

export interface PreviewImportRequest {
  /** @nullable */
  mappings?: ColumnMappingDto[] | null;
  previewRows?: number;
}

```

---

## File: `lib\generated\mail-connector\model\processMultipleDocumentsRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { FileContentDto } from './fileContentDto';

export interface ProcessMultipleDocumentsRequest {
  /** @nullable */
  files?: FileContentDto[] | null;
  /** @nullable */
  prompt?: string | null;
  /** @nullable */
  model?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\reassignRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ReassignRequest {
  toUserId?: string;
}

```

---

## File: `lib\generated\mail-connector\model\refreshMailTokenRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface RefreshMailTokenRequest {
  /** @nullable */
  refreshToken?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\refreshTokenCommand.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface RefreshTokenCommand {
  /** @nullable */
  refreshToken?: string | null;
  /** @nullable */
  ipAddress?: string | null;
  /** @nullable */
  userAgent?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\rejectRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface RejectRequest {
  /** @nullable */
  reason?: string | null;
  /** @nullable */
  notes?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\resetPasswordRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ResetPasswordRequest {
  /** @nullable */
  newPassword?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\reviewRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ReviewRequest {
  /** @nullable */
  note?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\revokeSessionRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface RevokeSessionRequest {
  /** @nullable */
  reason?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\sendMessageRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface SendMessageRequest {
  /** @nullable */
  message?: string | null;
  /** @nullable */
  selectedAttachmentIds?: string[] | null;
  /** @nullable */
  provider?: string | null;
  /** @nullable */
  model?: string | null;
  /** @nullable */
  responseFormat?: string | null;
  /** @nullable */
  templateType?: string | null;
  tenantId?: string;
  createdBy?: string;
}

```

---

## File: `lib\generated\mail-connector\model\sendPasswordResetOtpCommand.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface SendPasswordResetOtpCommand {
  /** @nullable */
  email?: string | null;
  /** @nullable */
  ipAddress?: string | null;
  /** @nullable */
  userAgent?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\testWebhookRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { TestWebhookRequestPayload } from './testWebhookRequestPayload';

export interface TestWebhookRequest {
  /** @nullable */
  eventType?: string | null;
  /** @nullable */
  payload?: TestWebhookRequestPayload;
}

```

---

## File: `lib\generated\mail-connector\model\testWebhookRequestPayload.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

/**
 * @nullable
 */
export type TestWebhookRequestPayload = unknown | null;

```

---

## File: `lib\generated\mail-connector\model\triggerSyncDto.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface TriggerSyncDto {
  /** @nullable */
  syncType?: string | null;
  /** @nullable */
  folderIds?: string[] | null;
  /** @nullable */
  fromDate?: string | null;
  /** @nullable */
  toDate?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\unassignRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UnassignRequest {
  /** @nullable */
  userId?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateAnalysisResultFieldsRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { UpdateAnalysisResultFieldsRequestExtractedFields } from './updateAnalysisResultFieldsRequestExtractedFields';

export interface UpdateAnalysisResultFieldsRequest {
  /** @nullable */
  extractedFields?: UpdateAnalysisResultFieldsRequestExtractedFields;
  /** @nullable */
  missingFields?: string[] | null;
  /** @nullable */
  warnings?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateAnalysisResultFieldsRequestExtractedFields.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

/**
 * @nullable
 */
export type UpdateAnalysisResultFieldsRequestExtractedFields = {[key: string]: string} | null;

```

---

## File: `lib\generated\mail-connector\model\updateConversationRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateConversationRequest {
  /** @nullable */
  title?: string | null;
  /** @nullable */
  description?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateFileMetadataRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { FileVisibility } from './fileVisibility';

export interface UpdateFileMetadataRequest {
  /** @nullable */
  relatedEntityType?: string | null;
  /** @nullable */
  relatedEntityId?: string | null;
  visibility?: FileVisibility;
}

```

---

## File: `lib\generated\mail-connector\model\updateMailAccountDto.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateMailAccountDto {
  /** @nullable */
  displayName?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\updatePermissionRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdatePermissionRequest {
  /** @nullable */
  name?: string | null;
  /** @nullable */
  description?: string | null;
  /** @nullable */
  module?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateRoleRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateRoleRequest {
  /** @nullable */
  name?: string | null;
  /** @nullable */
  description?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateStatusRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateStatusRequest {
  /** @nullable */
  status?: string | null;
  /** @nullable */
  notes?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateTemplateRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { UpdateTemplateRequestExpectedFields } from './updateTemplateRequestExpectedFields';

export interface UpdateTemplateRequest {
  /** @nullable */
  templateName?: string | null;
  /** @nullable */
  description?: string | null;
  /** @nullable */
  subjectPattern?: string | null;
  /** @nullable */
  bodyPattern?: string | null;
  /** @nullable */
  expectedFields?: UpdateTemplateRequestExpectedFields;
  /** @nullable */
  documentTypes?: string[] | null;
  /** @nullable */
  isActive?: boolean | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateTemplateRequestExpectedFields.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

/**
 * @nullable
 */
export type UpdateTemplateRequestExpectedFields = {[key: string]: string} | null;

```

---

## File: `lib\generated\mail-connector\model\updateUserRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateUserRequest {
  /** @nullable */
  fullName?: string | null;
  /** @nullable */
  roles?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateUserRolesRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateUserRolesRequest {
  /** @nullable */
  roles?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateUserStatusRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateUserStatusRequest {
  isActive?: boolean;
}

```

---

## File: `lib\generated\mail-connector\model\updateWebhookSubscriptionRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateWebhookSubscriptionRequest {
  /** @nullable */
  callbackUrl?: string | null;
  /** @nullable */
  eventTypes?: string[] | null;
  /** @nullable */
  isActive?: boolean | null;
}

```

---

## File: `lib\generated\mail-connector\model\validateMappingRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { ColumnMappingDto } from './columnMappingDto';

export interface ValidateMappingRequest {
  /** @nullable */
  mappings?: ColumnMappingDto[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\webhookPayload.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface WebhookPayload {
  /** @nullable */
  eventType?: string | null;
  eventId?: string;
  timestamp?: string;
  data?: unknown;
}

```

---

## File: `lib\generated\mail-connector-api.ts`

```ts
export * from "./mail-connector/endpoints"
export * from "./mail-connector/model"

```

---

## File: `lib\get-error-message.ts`

```ts
import axios from "axios"

type ApiErrorShape = {
  errors?: Array<{ message?: string }>
  message?: string
}

export function getErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra"): string {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    const firstApiError = error.response?.data?.errors?.[0]?.message
    if (firstApiError) return firstApiError
    if (typeof error.response?.data?.message === "string") return error.response.data.message
    if (error.message) return error.message
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}

```

---

## File: `lib\orval\mail-connector-mutator.ts`

```ts
import Axios, { AxiosError, AxiosRequestConfig } from "axios"
import { RefreshTokenCommand } from "@/lib/generated/mail-connector/model"
import { useAuthStore } from "@/lib/stores/auth-store"

const MAIL_CONNECTOR_BASE_URL =
  process.env.NEXT_PUBLIC_MAIL_CONNECTOR_API_URL ??
  "https://vietprodev.duckdns.org/gateway/logistics"

// Separate axios instance without interceptors for refresh token to avoid loop
const REFRESH_AXIOS = Axios.create({
  baseURL: MAIL_CONNECTOR_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const MAIL_CONNECTOR_AXIOS = Axios.create({
  baseURL: MAIL_CONNECTOR_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

async function doRefreshToken() {
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) throw new Error("No refresh token")

  const refreshTokenCommand: RefreshTokenCommand = { refreshToken }

  // Use Orval-generated model but direct axios call to avoid interceptor loop
  const res = await REFRESH_AXIOS.post<{ accessToken?: string; refreshToken?: string }>(
    "/api/v1/auth/refresh",
    refreshTokenCommand
  )

  const data = res.data
  if (!data?.accessToken) throw new Error("Refresh failed: no accessToken in response")

  localStorage.setItem("token", data.accessToken)
  if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
  return data.accessToken
}

MAIL_CONNECTOR_AXIOS.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

MAIL_CONNECTOR_AXIOS.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (typeof window === "undefined") {
      return Promise.reject(error)
    }

    // Skip refresh if user is not logged in (no token) — e.g., login page
    const token = localStorage.getItem("token")
    if (!token) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          resolve(MAIL_CONNECTOR_AXIOS(originalRequest))
        })
      })
    }

    isRefreshing = true

    try {
      const newToken = await doRefreshToken()
      onTokenRefreshed(newToken)
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
      }
      return MAIL_CONNECTOR_AXIOS(originalRequest)
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userId")
      useAuthStore.getState().clearAuth()
      window.location.href = "/login"
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export const mailConnectorInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return MAIL_CONNECTOR_AXIOS({
    ...config,
    ...options,
  }).then(({ data }) => data)
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData

```

---

## File: `lib\orval\user-api-mutator.ts`

```ts
import { MAIL_CONNECTOR_AXIOS } from "./mail-connector-mutator"
import type { AxiosError, AxiosRequestConfig } from "axios"

export const userApiInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return MAIL_CONNECTOR_AXIOS({
    ...config,
    ...options,
  }).then(({ data }) => data)
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData

```

---

## File: `lib\stores\auth-store.ts`

```ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AuthUser {
  userId: string
  email: string
  fullName: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (data: {
    user: AuthUser
    accessToken: string
    refreshToken: string
  }) => void
  clearAuth: () => void
  isAdmin: () => boolean
  isUser: () => boolean
}

export function getTenantIdFromToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      console.warn("[getTenantIdFromToken] No token found")
      return null
    }
    const base64Url = token.split(".")[1]
    if (!base64Url) {
      console.warn("[getTenantIdFromToken] Token has no payload segment")
      return null
    }
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    const payload = JSON.parse(jsonPayload)
    const tenantId =
      payload.tenantId ??
      payload.tenant_id ??
      payload.tid ??
      payload.tenantid ??
      null
    if (!tenantId) {
      console.warn("[getTenantIdFromToken] No tenantId in payload, keys:", Object.keys(payload))
    }
    return tenantId || null
  } catch (err) {
    console.error("[getTenantIdFromToken] Failed to decode token:", err)
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: ({ user, accessToken, refreshToken }) => {
        set({ user, accessToken, refreshToken })
      },
      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null })
      },
      isAdmin: () => {
        const { user } = get()
        return user?.roles.includes("admin") ?? false
      },
      isUser: () => {
        const { user } = get()
        return user?.roles.includes("user") ?? false
      },
    }),
    {
      name: "auth-storage",
    }
  )
)

```

---

## File: `lib\utils.ts`

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

---

## File: `luong-app.md`

```md
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

```

---

## File: `mail-assignments-api (1).md`

```md
# Mail Assignments API Documentation

## Overview

The `MailAssignmentsController` provides endpoints for managing mail assignments within the logistics platform. It handles mail assignment, reassignment, and status tracking.

**Base Path:** `/api/v1/mail-assignments`
**Authentication:** Required (Bearer Token)
**Module:** `LogisticsPlatform.MailIntegration.Api.Controllers`

## Features

- **Assignment Management**: Assign, unassign, and reassign mails between users
- **Status Tracking**: Track mail processing status (Assigned, InProgress, Completed, etc.)
- **Personal Dashboard**: View assigned mails for the current user

## Endpoints

### 1. Assign Mail

Assigns a mail to a user. If no `toUserId` is provided, assigns to the current authenticated user.

**Endpoint:** `POST /api/v1/mail-assignments/{mailConnectorMessageId}/assign`

**Parameters:**
- `mailConnectorMessageId` (path, GUID): The ID of the mail connector message to assign

**Request Body (optional):**
```json
{
  "toUserId": "guid (optional)"
}
```

**Authentication:** Required

**Authorization:**
- If `toUserId` is not provided: Any authenticated user can assign to themselves
- If `toUserId` is provided: Requires Admin or Supervisor role to assign to another user

**Response (200 OK):**
```json
{
  "id": "guid",
  "mailConnectorMessageId": "guid",
  "assignedToUserId": "guid",
  "assignedAt": "datetime",
  "status": "string"
}
```

**Error Responses:**
- `409 Conflict`: Mail is already assigned to another user
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User does not have permission to assign to another user

**Use Case:**
- Regular user: Assigns a mail to themselves to start processing
- Admin/Supervisor: Assigns a mail to a specific user for delegation

---

### 2. Unassign Mail

Removes the assignment from a user. If no `userId` is provided, removes assignment from the current authenticated user.

**Endpoint:** `DELETE /api/v1/mail-assignments/{mailConnectorMessageId}/unassign`

**Parameters:**
- `mailConnectorMessageId` (path, GUID): The ID of the mail connector message

**Request Body (optional):**
```json
{
  "userId": "guid (optional)"
}
```

**Authentication:** Required

**Authorization:**
- If `userId` is not provided: Any authenticated user can unassign their own mail
- If `userId` is provided: Requires Admin or Supervisor role to unassign from another user

**Response (204 No Content):** Assignment successfully removed

**Error Responses:**
- `404 Not Found`: Assignment not found
- `400 Bad Request`: Operation not allowed
- `403 Forbidden`: User does not have permission to unassign from another user

**Use Case:**
- Regular user: Releases their own mail assignment for others to pick up
- Admin/Supervisor: Removes assignment from a specific user (e.g., reassignment, cleanup)

---

### 3. Get My Assignments

Retrieves all mail assignments for the currently authenticated user.

**Endpoint:** `GET /api/v1/mail-assignments/my`

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": "guid",
    "mailConnectorMessageId": "guid",
    "assignedToUserId": "guid",
    "assignedAt": "datetime",
    "status": "string",
    "confirmedAt": "datetime",
    "completedAt": "datetime",
    "notes": "string"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated

**Use Case:** Displaying the user's personal dashboard of assigned mails.

---

### 4. Get Assignment Status

Retrieves the current assignment status for a specific mail.

**Endpoint:** `GET /api/v1/mail-assignments/{mailConnectorMessageId}/status`

**Parameters:**
- `mailConnectorMessageId` (path, GUID): The ID of the mail connector message

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": "guid",
  "mailConnectorMessageId": "guid",
  "assignedToUserId": "guid",
  "assignedAt": "datetime",
  "status": "string",
  "confirmedAt": "datetime",
  "completedAt": "datetime",
  "notes": "string"
}
```

**Error Responses:**
- `404 Not Found`: Assignment not found

**Use Case:** Checking if a mail is currently assigned before attempting to assign it.

---

### 5. Reassign Mail

Transfers mail assignment from the current user to another user.

**Endpoint:** `POST /api/v1/mail-assignments/{mailConnectorMessageId}/reassign`

**Parameters:**
- `mailConnectorMessageId` (path, GUID): The ID of the mail connector message

**Request Body:**
```json
{
  "toUserId": "guid"
}
```

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": "guid",
  "mailConnectorMessageId": "guid",
  "assignedToUserId": "guid",
  "assignedAt": "datetime",
  "status": "string"
}
```

**Error Responses:**
- `404 Not Found`: Assignment not found
- `400 Bad Request`: Operation not allowed

**Use Case:** When a user needs to delegate a mail to another user (e.g., escalation, handoff).

---

### 6. Update Status

Updates the processing status of a mail assignment.

**Endpoint:** `PUT /api/v1/mail-assignments/{mailConnectorMessageId}/status`

**Parameters:**
- `mailConnectorMessageId` (path, GUID): The ID of the mail connector message

**Request Body:**
```json
{
  "status": "string",
  "notes": "string (optional)"
}
```

**Authentication:** Required

**Response (200 OK):**
```json
{
  "message": "Status updated successfully"
}
```

**Error Responses:**
- `404 Not Found`: Assignment not found

**Use Case:** Tracking progress through different stages (e.g., Assigned → InProgress → Reviewing).

---

### 7. Confirm Mail

Confirms a mail assignment, transitioning status from "Assigned" to "Confirmed".

**Endpoint:** `POST /api/v1/mail-assignments/{mailConnectorMessageId}/confirm`

**Parameters:**
- `mailConnectorMessageId` (path, GUID): The ID of the mail connector message

**Request Body (optional):**
```json
{
  "notes": "string (optional)"
}
```

**Authentication:** Required

**Response (200 OK):**
```json
{
  "message": "Mail confirmed successfully"
}
```

**Error Responses:**
- `404 Not Found`: Assignment not found
- `400 Bad Request`: Mail is not in "Assigned" status

**Use Case:** When a user has reviewed the mail and confirms it for further processing (e.g., extraction, export).

---

### 8. Mark as Completed

Marks a mail assignment as completed with optional notes.

**Endpoint:** `POST /api/v1/mail-assignments/{mailConnectorMessageId}/complete`

**Parameters:**
- `mailConnectorMessageId` (path, GUID): The ID of the mail connector message

**Request Body (optional):**
```json
{
  "notes": "string (optional)"
}
```

**Authentication:** Required

**Response (200 OK):**
```json
{
  "message": "Mail marked as completed"
}
```

**Error Responses:**
- `404 Not Found`: Assignment not found

**Use Case:** Finalizing mail processing after all required actions are completed.

---


### 10. Get By Status

Retrieves all mail assignments filtered by status.

**Endpoint:** `GET /api/v1/mail-assignments/by-status/{status}`

**Parameters:**
- `status` (path, string): The status to filter by (e.g., "Assigned", "InProgress", "Completed")

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": "guid",
    "mailConnectorMessageId": "guid",
    "assignedToUserId": "guid",
    "assignedToUserName": "string",
    "assignedToUserEmail": "string",
    "assignedAt": "datetime",
    "status": "string",
    "completedAt": "datetime",
    "notes": "string"
  }
]
```

**Use Case:** Generating reports or views filtered by processing status.

---

## Request Models

### AssignRequest
```csharp
public class AssignRequest
{
    public Guid? ToUserId { get; set; }
}
```

### UnassignRequest
```csharp
public class UnassignRequest
{
    public Guid? UserId { get; set; }
}
```

### ReassignRequest
```csharp
public class ReassignRequest
{
    public Guid ToUserId { get; set; }
}
```

### UpdateStatusRequest
```csharp
public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
```

### CompleteRequest
```csharp
public class CompleteRequest
{
    public string? Notes { get; set; }
}
```

### ConfirmRequest
```csharp
public class ConfirmRequest
{
    public string? Notes { get; set; }
}
```


## Status Values

Common status values (exact values depend on domain configuration):
- `Unassigned`: Mail has not been assigned yet
- `Assigned`: Mail has been assigned to a user
- `Confirmed`: Mail has been confirmed by the assigned user
- `NeedSupplement`: Additional information is required
- `Extracted`: Mail data has been extracted
- `Exported`: Mail data has been exported
- `Imported`: Mail data has been imported
- `ManualProcessing`: Requires manual processing

## Error Handling

All endpoints follow consistent error handling patterns:

- **401 Unauthorized**: User is not authenticated or `UserId` is null
- **404 Not Found**: Resource (assignment) does not exist
- **400 Bad Request**: Invalid request data
- **409 Conflict**: Mail is already assigned to another user

## Dependencies

- `MailAssignmentService`: Application service handling business logic
- `ICurrentUserService`: Service providing current user information
- `LogisticsPlatform.MailIntegration.Domain`: Domain models and entities

## Business Requirements Reference

- Mail assignment management for processing workflow
- Ensures proper tracking of mail processing status

## Usage Example

### Typical Workflow

1. **Assign Mail**: User calls `POST /api/v1/mail-assignments/{id}/assign` to claim a mail
2. **Process Mail**: User works on the mail (external process)
3. **Update Status**: User calls `PUT /api/v1/mail-assignments/{id}/status` to track progress
4. **Complete**: User calls `POST /api/v1/mail-assignments/{id}/complete` to finish

### Escalation Workflow

1. User has an active assignment
2. User calls `POST /api/v1/mail-assignments/{id}/reassign` with `toUserId` of the target user
3. Assignment is transferred
4. Target user can now process the mail

## Security Considerations

- All endpoints require authentication via `[Authorize]` attribute
- Users can only unassign/reassign mails they currently own
- User ID is extracted from `ICurrentUserService` to prevent impersonation

```

---

## File: `next-env.d.ts`

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

---

## File: `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```

---

## File: `orval.config.ts`

```ts
import { defineConfig } from "orval"

export default defineConfig({
  mailConnector: {
    input: {
      target: "https://vietprodev.duckdns.org/gateway/logistics/swagger/v1/swagger.json",
    },
    output: {
      mode: "split",
      target: "./lib/generated/mail-connector/endpoints.ts",
      schemas: "./lib/generated/mail-connector/model",
      client: "axios",
      clean: true,
      override: {
        mutator: {
          path: "./lib/orval/mail-connector-mutator.ts",
          name: "mailConnectorInstance",
        },
      },
    },
  },
})

```

---

## File: `package.json`

```json
{
  "name": "logistics",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "api:gen": "pnpm run api:gen:mail-connector",
    "api:gen:mail-connector": "orval --config orval.config.ts"
  },
  "dependencies": {
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-toast": "^1.2.15",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^5.100.14",
    "axios": "^1.16.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dayjs": "^1.11.20",
    "docx-preview": "^0.3.7",
    "driver.js": "^1.4.0",
    "framer-motion": "^12.40.0",
    "lucide-react": "^1.16.0",
    "mammoth": "^1.12.0",
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "recharts": "^3.8.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.6.0",
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@tanstack/react-query-devtools": "^5.100.14",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "orval": "^7.15.0",
    "sharp": "^0.34.5",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}

```

---

## File: `permission-api.md`

```md
# Permission Management API Documentation

**Version:** 1.0  
**Module:** Identity  
**Target Audience:** Frontend Developers

---

## Overview

Permission Management API cung cấp các endpoint để quản lý permissions trong hệ thống, bao gồm tạo, cập nhật, xóa, khôi phục và liệt kê permissions theo module.

**Base URL:** `https://{domain}/api/v1/permissions`

**Authentication:** Tất cả endpoints yêu cầu Bearer token (Access Token)

---

## Endpoints

### 1. List Permissions (Paginated)

Lấy danh sách permissions với hỗ trợ filter, sort và pagination.

**Endpoint:** `GET /api/v1/permissions`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | int | No | 1 | Số trang (1-based) |
| pageSize | int | No | 20 | Số items mỗi trang (max 100) |
| sortField | string | No | createdAtUtc | Field để sort (code, name, module, createdAtUtc) |
| sortOrder | string | No | asc | Hướng sort (asc, desc) |
| filters | string | No | - | Filter expression (DSL format) |

**Filter Syntax:**

- `code@=value` - Contains (case-insensitive)
- `code==value` - Exact match (case-insensitive)
- `name@=value` - Contains (case-insensitive)
- `module@=value` - Contains (case-insensitive)
- `module==value` - Exact match (case-insensitive)

**Examples:**
```
?filters=module==user&sortField=code&sortOrder=asc&page=1&pageSize=20
?filters=name@=read,code@=user&sortField=createdAtUtc&sortOrder=desc
```

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": [
    {
      "id": "perm-1",
      "code": "user.read",
      "name": "View Users",
      "description": "Can view user list",
      "module": "user"
    },
    {
      "id": "perm-2",
      "code": "user.create",
      "name": "Create User",
      "description": "Can create new users",
      "module": "user"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 15,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  },
  "errors": []
}
```

---

### 2. Get Permission by ID

Lấy chi tiết một permission theo ID.

**Endpoint:** `GET /api/v1/permissions/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Permission ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "perm-1",
    "code": "user.read",
    "name": "View Users",
    "description": "Can view user list",
    "module": "user"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "code": "PERMISSION_NOT_FOUND",
      "message": "Permission not found",
      "severity": "medium"
    }
  ]
}
```

---

### 3. List Modules

Lấy danh sách các module có permissions.

**Endpoint:** `GET /api/v1/permissions/modules`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": [
    "user",
    "mail",
    "report",
    "order_draft"
  ],
  "meta": {},
  "errors": []
}
```

---

### 4. Create Permission

Tạo permission mới.

**Endpoint:** `POST /api/v1/permissions`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "code": "user.export",
  "name": "Export Users",
  "module": "user",
  "description": "Can export user list to CSV"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Permission code (unique, will be lowercased) |
| name | string | Yes | Permission display name |
| module | string | Yes | Module name (will be lowercased) |
| description | string | No | Permission description |

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "perm-new",
    "code": "user.export",
    "name": "Export Users",
    "description": "Can export user list to CSV",
    "module": "user"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "code": "PERMISSION_EXISTS",
      "message": "Permission code already exists",
      "severity": "medium"
    }
  ]
}
```

---

### 5. Update Permission

Cập nhật thông tin permission.

**Endpoint:** `PUT /api/v1/permissions/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Permission ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Export User Data",
  "description": "Updated description",
  "module": "user"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | New permission name |
| description | string | No | New permission description |
| module | string | No | New module name |

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "perm-new",
    "code": "user.export",
    "name": "Export User Data",
    "description": "Updated description",
    "module": "user"
  },
  "meta": {},
  "errors": []
}
```

---

### 6. Delete Permission (Soft Delete)

Xóa permission (soft delete, có thể khôi phục).

**Endpoint:** `DELETE /api/v1/permissions/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Permission ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "perm-new",
    "deleted": true
  },
  "meta": {},
  "errors": []
}
```

---

### 7. Restore Permission

Khôi phục permission đã bị xóa.

**Endpoint:** `POST /api/v1/permissions/{id}/restore`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Permission ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "perm-new",
    "code": "user.export",
    "name": "Export Users",
    "description": "Can export user list to CSV",
    "module": "user"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "code": "PERMISSION_NOT_DELETED",
      "message": "Permission is not deleted",
      "severity": "low"
    }
  ]
}
```

---

## Common Error Codes

| Code | Message | Severity | Description |
|------|---------|----------|-------------|
| PERMISSION_NOT_FOUND | Permission not found | medium | Permission không tồn tại |
| PERMISSION_EXISTS | Permission code already exists | medium | Permission code đã được sử dụng |
| PERMISSION_NOT_DELETED | Permission is not deleted | low | Permission chưa bị xóa, không thể khôi phục |

---

## TypeScript Types

```typescript
interface PermissionDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
}

interface CreatePermissionRequest {
  code: string;
  name: string;
  module: string;
  description?: string;
}

interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  module?: string;
}

interface PagedQuery {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

---

## Usage Examples

### List permissions with filtering

```typescript
const response = await fetch('/api/v1/permissions?filters=module==user&sortField=code&sortOrder=asc&page=1&pageSize=20', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const result = await response.json();
const permissions = result.data;
const pagination = result.meta.pagination;
```

### Get available modules

```typescript
const response = await fetch('/api/v1/permissions/modules', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const result = await response.json();
const modules = result.data; // ["user", "mail", "report", "order_draft"]
```

### Create a new permission

```typescript
const newPermission = await fetch('/api/v1/permissions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'user.export',
    name: 'Export Users',
    module: 'user',
    description: 'Can export user list to CSV'
  })
});
```

### Update permission

```typescript
await fetch(`/api/v1/permissions/${permissionId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Export User Data',
    description: 'Updated description'
  })
});
```

### Delete permission

```typescript
await fetch(`/api/v1/permissions/${permissionId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Restore permission

```typescript
await fetch(`/api/v1/permissions/${permissionId}/restore`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## Permission Modules

System hỗ trợ các module permissions sau:

| Module | Description | Example Permissions |
|--------|-------------|---------------------|
| user | Quản lý người dùng | user.read, user.create, user.update, user.delete |
| mail | Quản lý email | mail.read, mail.send, mail.delete |
| report | Báo cáo | report.view, report.export |
| order_draft | Draft đơn hàng | order_draft.read, order_draft.review_l1, order_draft.review_l2, order_draft.export |

---

## Best Practices

1. **Sử dụng module filter**: Khi hiển thị permissions, nên filter theo module để nhóm permissions logic lại
2. **Code convention**: Permission code nên theo format `{module}.{action}` (ví dụ: `user.read`, `mail.send`)
3. **Soft delete**: Luôn sử dụng soft delete để giữ audit trail. Chỉ hard delete khi thật sự cần thiết
4. **Permission seeding**: Permissions system được seed từ `PermissionSeeder.cs`, nên thêm permissions mới vào đó cho consistency
5. **Role-permission mapping**: Khi gán permissions cho role, nên sử dụng endpoint `PUT /roles/{id}/permissions` để replace toàn bộ thay vì add/remove từng cái

```

---

## File: `postcss.config.mjs`

```mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

```

---

## File: `README.md`

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

---

## File: `role-api.md`

```md
# Role Management API Documentation

**Version:** 1.0  
**Module:** Identity  
**Target Audience:** Frontend Developers

---

## Overview

Role Management API cung cấp các endpoint để quản lý roles trong hệ thống, bao gồm tạo, cập nhật, xóa, khôi phục và quản lý permissions của roles.

**Base URL:** `https://{domain}/api/v1/roles`

**Authentication:** Tất cả endpoints yêu cầu Bearer token (Access Token)

---

## Endpoints

### 1. List Roles (Paginated)

Lấy danh sách roles với hỗ trợ filter, sort và pagination.

**Endpoint:** `GET /api/v1/roles`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | int | No | 1 | Số trang (1-based) |
| pageSize | int | No | 20 | Số items mỗi trang (max 100) |
| sortField | string | No | createdAtUtc | Field để sort (code, name, isSystem, createdAtUtc) |
| sortOrder | string | No | asc | Hướng sort (asc, desc) |
| filters | string | No | - | Filter expression (DSL format) |

**Filter Syntax:**

- `code@=value` - Contains (case-insensitive)
- `code==value` - Exact match (case-insensitive)
- `name@=value` - Contains (case-insensitive)
- `isSystem==true/false` - Exact match

**Examples:**
```
?filters=name@=admin,isSystem==false&sortField=name&sortOrder=asc&page=1&pageSize=20
?filters=code@=manager&sortField=createdAtUtc&sortOrder=desc
```

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "admin",
      "name": "Administrator",
      "description": "Full system access",
      "isSystem": true,
      "permissions": [
        {
          "id": "perm-1",
          "code": "user.read",
          "name": "View Users",
          "description": "Can view user list",
          "module": "user"
        }
      ]
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 5,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  },
  "errors": []
}
```

---

### 2. Get Role by ID

Lấy chi tiết một role theo ID.

**Endpoint:** `GET /api/v1/roles/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Role ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "admin",
    "name": "Administrator",
    "description": "Full system access",
    "isSystem": true,
    "permissions": [
      {
        "id": "perm-1",
        "code": "user.read",
        "name": "View Users",
        "description": "Can view user list",
        "module": "user"
      }
    ]
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "code": "ROLE_NOT_FOUND",
      "message": "Role not found",
      "severity": "medium"
    }
  ]
}
```

---

### 3. Create Role

Tạo role mới (chỉ cho custom roles, không cho system roles).

**Endpoint:** `POST /api/v1/roles`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "code": "manager",
  "name": "Manager",
  "description": "Manager role with limited access"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Role code (unique, will be lowercased) |
| name | string | Yes | Role display name |
| description | string | No | Role description |

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "manager",
    "name": "Manager",
    "description": "Manager role with limited access",
    "isSystem": false,
    "permissions": []
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "code": "ROLE_EXISTS",
      "message": "Role code already exists",
      "severity": "medium"
    }
  ]
}
```

---

### 4. Update Role

Cập nhật thông tin role (chỉ custom roles).

**Endpoint:** `PUT /api/v1/roles/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Role ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Senior Manager",
  "description": "Updated description"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | New role name |
| description | string | No | New role description |

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "manager",
    "name": "Senior Manager",
    "description": "Updated description",
    "isSystem": false,
    "permissions": []
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "code": "SYSTEM_ROLE_READONLY",
      "message": "Cannot modify system role",
      "severity": "high"
    }
  ]
}
```

---

### 5. Delete Role (Soft Delete)

Xóa role (soft delete, có thể khôi phục). Chỉ áp dụng cho custom roles.

**Endpoint:** `DELETE /api/v1/roles/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Role ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deleted": true
  },
  "meta": {},
  "errors": []
}
```

---

### 6. Restore Role

Khôi phục role đã bị xóa.

**Endpoint:** `POST /api/v1/roles/{id}/restore`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Role ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "manager",
    "name": "Manager",
    "description": "Manager role with limited access",
    "isSystem": false,
    "permissions": []
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "code": "ROLE_NOT_DELETED",
      "message": "Role is not deleted",
      "severity": "low"
    }
  ]
}
```

---

### 7. Get Role Permissions

Lấy danh sách permissions của một role.

**Endpoint:** `GET /api/v1/roles/{id}/permissions`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Role ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": [
    {
      "id": "perm-1",
      "code": "user.read",
      "name": "View Users",
      "description": "Can view user list",
      "module": "user"
    },
    {
      "id": "perm-2",
      "code": "user.create",
      "name": "Create User",
      "description": "Can create new users",
      "module": "user"
    }
  ],
  "meta": {},
  "errors": []
}
```

---

### 8. Assign Permissions to Role

Gán permissions cho role (thêm vào danh sách hiện có).

**Endpoint:** `POST /api/v1/roles/{id}/permissions`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Role ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "permissionIds": [
    "perm-1",
    "perm-2",
    "perm-3"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| permissionIds | array | Yes | List of permission IDs to assign |

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "message": "Permissions assigned successfully"
  },
  "meta": {},
  "errors": []
}
```

---

### 9. Remove Permission from Role

Xóa một permission khỏi role.

**Endpoint:** `DELETE /api/v1/roles/{id}/permissions/{permissionId}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Role ID |
| permissionId | guid | Yes | Permission ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "message": "Permission removed successfully"
  },
  "meta": {},
  "errors": []
}
```

---

### 10. Replace Role Permissions

Thay thế toàn bộ permissions của role (xóa tất cả hiện tại, gán mới).

**Endpoint:** `PUT /api/v1/roles/{id}/permissions`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | guid | Yes | Role ID |

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "permissionIds": [
    "perm-1",
    "perm-2"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| permissionIds | array | Yes | List of permission IDs to replace with |

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "message": "Permissions replaced successfully"
  },
  "meta": {},
  "errors": []
}
```

---

## Common Error Codes

| Code | Message | Severity | Description |
|------|---------|----------|-------------|
| ROLE_NOT_FOUND | Role not found | medium | Role không tồn tại |
| ROLE_EXISTS | Role code already exists | medium | Role code đã được sử dụng |
| SYSTEM_ROLE_READONLY | Cannot modify system role | high | Không thể sửa/xóa system role |
| ROLE_NOT_DELETED | Role is not deleted | low | Role chưa bị xóa, không thể khôi phục |

---

## TypeScript Types

```typescript
interface RoleDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: PermissionDto[];
}

interface PermissionDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
}

interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string;
}

interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

interface AssignPermissionsRequest {
  permissionIds: string[];
}

interface PagedQuery {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

---

## Usage Examples

### List roles with filtering

```typescript
const response = await fetch('/api/v1/roles?filters=name@=admin,isSystem==false&sortField=name&sortOrder=asc&page=1&pageSize=20', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const result = await response.json();
const roles = result.data;
const pagination = result.meta.pagination;
```

### Create a new role

```typescript
const newRole = await fetch('/api/v1/roles', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'manager',
    name: 'Manager',
    description: 'Manager role'
  })
});
```

### Assign permissions to role

```typescript
await fetch(`/api/v1/roles/${roleId}/permissions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    permissionIds: ['perm-1', 'perm-2', 'perm-3']
  })
});
```

```

---

## File: `session-summary.md`

```md
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

```

---

## File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}

```

---

## File: `types\index.ts`

```ts
export interface ApiResponse<T> {
  correlationId: string
  traceId: string
  timestamp: string
  data: T | null
  meta: ApiMeta
  errors: ApiError[]
}

export interface ApiMeta {
  pagination?: PaginationMeta
  job?: JobMeta
  extra?: Record<string, unknown>
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface JobMeta {
  jobId: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  pollUrl?: string
}

export interface ApiError {
  field?: string
  code: string
  message: string
  messageKey?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export interface MailAccount {
  id: string
  provider: string
  emailAddress: string
  displayName?: string
  status: 'active' | 'inactive' | 'error'
  lastSyncedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SyncStatus {
  accountId: string
  status: 'idle' | 'syncing' | 'completed' | 'failed'
  totalMessages: number
  syncedMessages: number
  failedMessages: number
  currentFolder?: string
  lastSyncedAt?: string
}

export interface MailMessage {
  id: string
  provider: string
  subject?: string
  fromEmail?: string
  fromName?: string
  receivedAt?: string
  hasAttachments: boolean
  syncStatus: string
  processStatus: string
}

export interface MailMessageDetail {
  id: string
  subject?: string
  fromEmail?: string
  fromName?: string
  toEmails: string[]
  ccEmails: string[]
  receivedAt?: string
  bodyText?: string
  bodyHtml?: string
  attachments: Attachment[]
}

export interface Attachment {
  id: string
  fileName: string
  contentType?: string
  fileSize?: number
  downloadStatus: string
  downloadUrl?: string
}

export interface EmailAnalysisResult {
  id: string
  emailMessageId: string
  category?: string
  detectedIntent?: string
  status: 'pending' | 'completed' | 'approved' | 'rejected'
  confidenceScore?: number
  extractedFields?: Record<string, string>
  missingFields?: string[]
  warnings?: string[]
  modelName?: string
  inputTokenCount?: number
  outputTokenCount?: number
  costEstimate?: number
  reviewedByUserId?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface EmailTemplate {
  id: string
  templateCode: string
  templateName: string
  description?: string
  subjectPattern?: string
  bodyPattern?: string
  expectedFields?: Record<string, string>
  documentTypes?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
  avatar?: string
  createdAt: string
}

export interface LogEntry {
  id: string
  level: 'info' | 'warning' | 'error'
  source: string
  message: string
  details?: string
  createdAt: string
}

export interface ReportData {
  id: string
  invoiceNumber?: string
  sender?: string
  amount?: number
  currency?: string
  date?: string
  status: string
  importedAt: string
}

```

---

## File: `user-api.md`

```md
# User Management API Documentation

**Version:** 1.0  
**Module:** Identity  
**Target Audience:** Frontend Developers

---

## Overview

User Management API cung cấp các endpoint để quản lý người dùng trong hệ thống, bao gồm tạo, cập nhật, xóa, activate/deactivate và quản lý roles.

**Base URL:** `https://{domain}/api/v1/users`

**Authentication:** Tất cả endpoints yêu cầu Bearer token (Access Token)

---

## Endpoints

### 1. Get Current User

Lấy thông tin người dùng hiện tại (đang đăng nhập).

**Endpoint:** `GET /api/v1/users/me`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "roles": ["admin", "user"],
    "isActive": true
  },
  "meta": {},
  "errors": []
}
```

**Error Response (401 Unauthorized):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "UNAUTHORIZED",
      "message": "User claims not found",
      "messageKey": "auth.unauthorized",
      "severity": "high"
    }
  ]
}
```

---

### 2. Update My Profile

Cập nhật thông tin profile của chính người dùng đang đăng nhập.

**Endpoint:** `PUT /api/v1/users/me`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "fullName": "Updated Name"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | No | Tên đầy đủ mới |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Updated Name",
    "roles": ["viewer"],
    "isActive": true
  },
  "meta": {},
  "errors": []
}
```

**Error Response (401 Unauthorized):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "UNAUTHORIZED",
      "message": "User not found or inactive",
      "messageKey": "auth.unauthorized",
      "severity": "high"
    }
  ]
}
```

**Note:** Endpoint này chỉ cho phép user cập nhật thông tin của chính mình. Không thể cập nhật email hoặc roles qua endpoint này.

---

### 3. List Users

Lấy danh sách người dùng với pagination, filtering và sorting.

**Endpoint:** `GET /api/v1/users`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filters` | string | No | Filter expression DSL (xem bên dưới) |
| `sortField` | string | No | Field để sort (mặc định: `CreatedAtUtc`). Các field có thể: `CreatedAtUtc`, `UpdatedAtUtc`, `Email`, `FullName` |
| `sortOrder` | string | No | Thứ tự sort: `asc` hoặc `desc` (mặc định: `desc`) |
| `page` | integer | No | Số trang (mặc định: 1) |
| `pageSize` | integer | No | Số items mỗi trang (mặc định: 20, max: 100) |

**Filter DSL Syntax:**

Endpoint sử dụng filter DSL tương tự Bekind backend convention:

- **Operators:**
  - `==` - Equal: `email==admin@example.com`
  - `@=` - Contains: `email@=gmail`, `fullName@=John`
  - `!=` - Not equal
  - `>=`, `<=`, `>`, `<` - Comparison
  - `@` - Starts with
  - `_=` - Ends with
  - `!@=`, `!_=` - Not contains, not ends with
  - `[]` - Is null

- **AND conditions:** Separated by comma
  - `email@=gmail,isActive==true`

- **OR conditions:** Pipe within one term
  - `isActive==true|isActive==false`

**Supported Filters:**

| Filter | Example | Description |
|--------|---------|-------------|
| `email@=` | `email@=gmail` | Email contains text (case-insensitive) |
| `email==` | `email==admin@example.com` | Email exact match |
| `fullName@=` | `fullName@=John` | Full name contains text |
| `fullName==` | `fullName==John Doe` | Full name exact match |
| `isActive==` | `isActive==true` | Filter by active status |
| `role==` | `role==admin` | Filter by role code |

**Examples:**

```
# Get all users with pagination
GET /api/v1/users?page=1&pageSize=20

# Filter by email contains gmail
GET /api/v1/users?filters=email@=gmail

# Filter by active status and role
GET /api/v1/users?filters=isActive==true,role==admin

# Search by full name
GET /api/v1/users?filters=fullName@=John

# Sort by creation date descending
GET /api/v1/users?sortField=CreatedAtUtc&sortOrder=desc

# Combine filters with pagination
GET /api/v1/users?filters=email@=gmail,isActive==true&sortField=CreatedAtUtc&sortOrder=desc&page=1&pageSize=10
```

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "roles": ["admin"],
      "isActive": true,
      "isLocked": false,
      "createdAtUtc": "2026-05-24T17:16:30.545Z",
      "updatedAtUtc": "2026-05-26T14:05:34.540Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "email": "user@example.com",
      "fullName": "Regular User",
      "roles": ["viewer"],
      "isActive": true,
      "isLocked": false,
      "createdAtUtc": "2026-05-26T14:05:41.592Z",
      "updatedAtUtc": "2026-05-26T14:05:41.593Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 45,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "job": null,
    "extra": {}
  },
  "errors": []
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `data` | array[] | Danh sách users trong trang hiện tại |
| `meta.pagination.page` | integer | Số trang hiện tại |
| `meta.pagination.pageSize` | integer | Số items mỗi trang |
| `meta.pagination.totalItems` | integer | Tổng số users (không phân trang) |
| `meta.pagination.totalPages` | integer | Tổng số trang |
| `meta.pagination.hasNextPage` | boolean | Có trang sau không |
| `meta.pagination.hasPreviousPage` | boolean | Có trang trước không |

---

### 4. Get User by ID

Lấy thông tin chi tiết của một người dùng cụ thể.

**Endpoint:** `GET /api/v1/users/{id}`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "roles": ["viewer", "editor"],
    "isActive": true,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:07:15.403Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

---

### 5. Create User

Tạo người dùng mới.

**Endpoint:** `POST /api/v1/users`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "fullName": "New User",
  "roles": ["viewer"]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Email người dùng (unique) |
| `password` | string | Yes | Mật khẩu (tối thiểu 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt) |
| `fullName` | string | Yes | Tên đầy đủ |
| `roles` | string[] | No | Danh sách roles (mặc định: ["VIEWER"]) |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "7f6b4795-3a7a-4f99-80fd-913e9f190874",
    "email": "newuser@example.com",
    "fullName": "New User",
    "roles": ["viewer"],
    "isActive": true,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:05:41.593Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": "email",
      "code": "EMAIL_EXISTS",
      "message": "Email already registered",
      "messageKey": "user.email_exists",
      "severity": "medium"
    }
  ]
}
```

**Error Codes:**
- `EMAIL_EXISTS` - Email đã được đăng ký
- `VALIDATION_PASSWORD_REQUIREMENTS` - Mật khẩu không đáp ứng yêu cầu

---

### 6. Update User

Cập nhật thông tin người dùng (FullName).

**Endpoint:** `PUT /api/v1/users/{id}`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Request Body:**

```json
{
  "fullName": "Updated Name"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | No | Tên đầy đủ mới |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Updated Name",
    "roles": ["viewer"],
    "isActive": true,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:06:48.315Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Note:** Để cập nhật roles, sử dụng endpoint `PUT /api/v1/users/{id}/roles`.

---

### 7. Update User Roles

Cập nhật roles của người dùng.

**Endpoint:** `PUT /api/v1/users/{id}/roles`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Request Body:**

```json
{
  "roles": ["viewer", "editor", "admin"]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roles` | string[] | Yes | Danh sách roles mới (sẽ thay thế toàn bộ roles hiện tại) |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "User Name",
    "roles": ["viewer", "editor"],
    "isActive": true,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:09:08.060Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Note:** Endpoint này sẽ thay thế toàn bộ roles hiện tại bằng roles mới. Không support partial update.

---

### 8. Update User Status

Cập nhật trạng thái active/inactive của người dùng.

**Endpoint:** `PATCH /api/v1/users/{id}/status`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Request Body:**

```json
{
  "isActive": false
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isActive` | boolean | Yes | `true` để activate, `false` để deactivate |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "User Name",
    "roles": ["viewer"],
    "isActive": false,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:07:15.403Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Note:** User bị deactivate sẽ không thể đăng nhập.

---

### 8. Delete User

Soft delete người dùng (đánh dấu là deleted, không xóa thực tế).

**Endpoint:** `DELETE /api/v1/users/{id}`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deleted": true
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Note:** Đây là soft delete, user vẫn tồn tại trong database nhưng được đánh dấu `isDeleted = true`. User bị delete sẽ không thể đăng nhập.

---

### 9. Restore User

Khôi phục user đã bị soft delete.

**Endpoint:** `POST /api/v1/users/{id}/restore`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID cần restore |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "User Name",
    "roles": ["viewer"],
    "isActive": true,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:10:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_DELETED",
      "message": "User is not deleted",
      "messageKey": "user.not_deleted",
      "severity": "low"
    }
  ]
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Note:** Chỉ restore được user đã bị soft delete. User sẽ có thể đăng nhập lại sau khi restore.

---

### 10. Change My Password

Đổi mật khẩu của chính người dùng đang đăng nhập.

**Endpoint:** `POST /api/v1/users/me/change-password`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | string | Yes | Mật khẩu hiện tại |
| `newPassword` | string | Yes | Mật khẩu mới |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "passwordChanged": true
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "INVALID_PASSWORD",
      "message": "Current password is incorrect",
      "messageKey": "user.invalid_password",
      "severity": "medium"
    }
  ]
}
```

**Error Response (401 Unauthorized):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "UNAUTHORIZED",
      "message": "User not found or inactive",
      "messageKey": "auth.unauthorized",
      "severity": "high"
    }
  ]
}
```

**Error Codes:**
- `INVALID_PASSWORD` - Mật khẩu hiện tại không đúng
- `VALIDATION_PASSWORD_REQUIREMENTS` - Mật khẩu mới không đáp ứng yêu cầu
- `UNAUTHORIZED` - User không tồn tại hoặc đã bị deactivate

**Note:** Endpoint này chỉ cho phép user đổi mật khẩu của chính mình. Không cần truyền user ID.

---

### 11. Reset User Password (Admin)

Reset mật khẩu của một người dùng (chỉ dành cho admin).

**Endpoint:** `POST /api/v1/users/{id}/reset-password`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID cần reset mật khẩu |

**Request Body:**

```json
{
  "newPassword": "NewSecurePassword456!"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `newPassword` | string | Yes | Mật khẩu mới |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "passwordReset": true
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Error Codes:**
- `USER_NOT_FOUND` - User không tồn tại
- `VALIDATION_PASSWORD_REQUIREMENTS` - Mật khẩu mới không đáp ứng yêu cầu

**Note:** Endpoint này yêu cầu quyền admin. Không cần verify mật khẩu hiện tại. Nên sử dụng kết hợp với gửi email thông báo cho user về việc mật khẩu đã được reset.

---

## TypeScript Interfaces

```typescript
// User DTO
interface UserDto {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
  isLocked: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

// Current User Response
interface CurrentUserResponse {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
}

// Update My Profile Response
interface UpdateMyProfileResponse {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
}

// Create User Request
interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  roles?: string[];
}

// Update User Request
interface UpdateUserRequest {
  fullName?: string;
}

// Update User Roles Request
interface UpdateUserRolesRequest {
  roles: string[];
}

// Update User Status Request
interface UpdateUserStatusRequest {
  isActive: boolean;
}

// Change Password Request
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Reset Password Request
interface ResetPasswordRequest {
  newPassword: string;
}

// Delete User Response
interface DeleteUserResponse {
  id: string;
  deleted: boolean;
}

// Change Password Response
interface ChangePasswordResponse {
  id: string;
  passwordChanged: boolean;
}

// Reset Password Response
interface ResetPasswordResponse {
  id: string;
  passwordReset: boolean;
}

// API Response Wrapper
interface ApiResponse<T> {
  correlationId: string;
  traceId: string;
  timestamp: string;
  data: T | null;
  meta: Record<string, unknown>;
  errors: ApiError[];
}

interface ApiError {
  field: string | null;
  code: string;
  message: string;
  messageKey?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}
```

---

## Frontend Implementation Guide

### 1. User Service

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://{domain}/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Get current user
async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await api.get<ApiResponse<CurrentUserResponse>>('/users/me');
  return response.data.data;
}

// Update my profile
async function updateMyProfile(data: UpdateUserRequest): Promise<UpdateMyProfileResponse> {
  const response = await api.put<ApiResponse<UpdateMyProfileResponse>>('/users/me', data);
  return response.data.data;
}

// List all users with pagination and filters
async function listUsers(query: PagedQuery): Promise<UserDto[]> {
  const params = new URLSearchParams();
  if (query.filters) params.append('filters', query.filters);
  if (query.sortField) params.append('sortField', query.sortField);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  params.append('page', query.page.toString());
  params.append('pageSize', query.pageSize.toString());

  const response = await api.get<ApiResponse<UserDto[]>>(`/users?${params.toString()}`);
  return response.data.data;
}

// Get user by ID
async function getUserById(id: string): Promise<UserDto> {
  const response = await api.get<ApiResponse<UserDto>>(`/users/${id}`);
  return response.data.data;
}

// Create user
async function createUser(data: CreateUserRequest): Promise<UserDto> {
  const response = await api.post<ApiResponse<UserDto>>('/users', data);
  return response.data.data;
}

// Update user
async function updateUser(id: string, data: UpdateUserRequest): Promise<UserDto> {
  const response = await api.put<ApiResponse<UserDto>>(`/users/${id}`, data);
  return response.data.data;
}

// Update user roles
async function updateUserRoles(id: string, data: UpdateUserRolesRequest): Promise<UserDto> {
  const response = await api.put<ApiResponse<UserDto>>(`/users/${id}/roles`, data);
  return response.data.data;
}

// Update user status
async function updateUserStatus(id: string, isActive: boolean): Promise<UserDto> {
  const response = await api.patch<ApiResponse<UserDto>>(
    `/users/${id}/status`,
    { isActive }
  );
  return response.data.data;
}

// Change my password
async function changeMyPassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const response = await api.post<ApiResponse<ChangePasswordResponse>>(
    '/users/me/change-password',
    data
  );
  return response.data.data;
}

// Reset user password (admin)
async function resetUserPassword(id: string, data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response = await api.post<ApiResponse<ResetPasswordResponse>>(
    `/users/${id}/reset-password`,
    data
  );
  return response.data.data;
}

// Delete user
async function deleteUser(id: string): Promise<DeleteUserResponse> {
  const response = await api.delete<ApiResponse<DeleteUserResponse>>(`/users/${id}`);
  return response.data.data;
}

// Restore user
async function restoreUser(id: string): Promise<UserDto> {
  const response = await api.post<ApiResponse<UserDto>>(`/users/${id}/restore`);
  return response.data.data;
}
```

### 2. React Component Example

```typescript
import React, { useState, useEffect } from 'react';

interface UserListProps {}

const UserList: React.FC<UserListProps> = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(id, !currentStatus);
      await loadUsers();
    } catch (err) {
      setError('Failed to update user status');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>User Management</h1>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Full Name</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.fullName}</td>
              <td>{user.roles.join(', ')}</td>
              <td>
                <span style={{ color: user.isActive ? 'green' : 'red' }}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button onClick={() => handleToggleActive(user.id, user.isActive)}>
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
```

---

## Security Best Practices

1. **Authorization:**
   - Chỉ admin hoặc user có quyền `user.manage` mới có thể truy cập các endpoint quản lý user
   - User thường chỉ có thể xem thông tin của chính mình qua `/users/me`

2. **Password Requirements:**
   - Tối thiểu 8 ký tự
   - Phải chứa chữ hoa, chữ thường, số
   - Khuyến khích có ký tự đặc biệt

3. **Soft Delete:**
   - Sử dụng soft delete thay vì hard delete
   - User bị delete vẫn có thể restore nếu cần

4. **Role Management:**
   - Role update là thay thế toàn bộ, không phải partial update
   - Luôn validate roles trước khi update

5. **Audit Trail:**
   - Mọi thay đổi user đều được log qua `updatedAtUtc`
   - Có thể thêm audit log chi tiết trong tương lai

---

## Error Handling

### Common Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `USER_NOT_FOUND` | User không tồn tại | Hiển thị thông báo, redirect về list |
| `EMAIL_EXISTS` | Email đã tồn tại | Hiển thị thông báo lỗi cho user |
| `INVALID_PASSWORD` | Mật khẩu sai | Yêu cầu nhập lại mật khẩu hiện tại |
| `VALIDATION_PASSWORD_REQUIREMENTS` | Mật khẩu không đủ mạnh | Hiển thị yêu cầu mật khẩu |
| `UNAUTHORIZED` | Không có quyền truy cập | Redirect về login hoặc hiển thị lỗi quyền |

---

## Testing

### User Management Flow Test

```bash
# Get current user
curl -X GET https://{domain}/api/v1/users/me \
  -H "Authorization: Bearer {accessToken}"

# Update my profile
curl -X PUT https://{domain}/api/v1/users/me \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name"
  }'

# List all users with pagination and filters
curl -X GET "https://{domain}/api/v1/users?filters=email@=gmail,isActive==true&sortField=CreatedAtUtc&sortOrder=desc&page=1&pageSize=20" \
  -H "Authorization: Bearer {accessToken}"

# Create user
curl -X POST https://{domain}/api/v1/users \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!",
    "fullName": "Test User",
    "roles": ["VIEWER"]
  }'

# Get user by ID
curl -X GET https://{domain}/api/v1/users/{userId} \
  -H "Authorization: Bearer {accessToken}"

# Update user
curl -X PUT https://{domain}/api/v1/users/{userId} \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name"
  }'

# Update user roles
curl -X PUT https://{domain}/api/v1/users/{userId}/roles \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["VIEWER", "EDITOR"]
  }'

# Update user status
curl -X PATCH https://{domain}/api/v1/users/{userId}/status \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'

# Delete user
curl -X DELETE https://{domain}/api/v1/users/{userId} \
  -H "Authorization: Bearer {accessToken}"

# Restore user
curl -X POST https://{domain}/api/v1/users/{userId}/restore \
  -H "Authorization: Bearer {accessToken}"

# Change my password
curl -X POST https://{domain}/api/v1/users/me/change-password \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword456!"
  }'

# Reset user password (admin)
curl -X POST https://{domain}/api/v1/users/{userId}/reset-password \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewPassword456!"
  }'
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-26 | Initial version - Full CRUD user management |

```

---
