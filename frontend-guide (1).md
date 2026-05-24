# MailConnector - Frontend Integration Guide

**Version:** 1.0  
**Last Updated:** 2026-05-22  
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

### Mail Messages

#### Lấy danh sách tin nhắn

```http
GET /api/v1/mail-messages?accountId={accountId}&page=1&pageSize=20&fromEmail={email}&hasAttachment=true
```

**Query Parameters:**
- `accountId` (optional, GUID) - Lọc theo tài khoản
- `page` (default: 1) - Số trang
- `pageSize` (default: 20) - Số item/trang
- `fromEmail` (optional) - Lọc theo người gửi
- `hasAttachment` (optional, boolean) - Lọc có đính kèm

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
    "bodyText": "Plain text content...",
    "bodyHtml": "<p>HTML content...</p>",
    "attachments": [
      {
        "id": "uuid",
        "fileName": "document.pdf",
        "contentType": "application/pdf",
        "fileSize": 1024000,
        "downloadStatus": "available",
        "downloadUrl": null
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
GET /api/v1/email-analysis-results?status=pending
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
      "emailMessageId": "uuid",
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
POST /api/v1/email-analysis-results
Content-Type: application/json

{
  "emailMessageId": "uuid"
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto

#### Phê duyệt kết quả

```http
POST /api/v1/email-analysis-results/{id}/approve
Content-Type: application/json

{
  "userId": "uuid"
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto với status = approved

#### Từ chối kết quả

```http
POST /api/v1/email-analysis-results/{id}/reject
Content-Type: application/json

{
  "userId": "uuid",
  "reason": "Incorrect extraction"
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto với status = rejected

#### Cập nhật fields

```http
PUT /api/v1/email-analysis-results/{id}/fields
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
GET /api/v1/email-analysis-results/{id}/delivery-logs
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
POST /api/v1/email-messages/{id}/process
```

**Response (200 OK):** Tạo analysis result mới

#### Chuẩn hóa email

```http
POST /api/v1/email-messages/{id}/normalize
```

**Response (200 OK):** Email được chuẩn hóa

#### Phân loại email

```http
POST /api/v1/email-messages/{id}/classify
```

**Response (200 OK):** Email được phân loại

#### Kích hoạt pipeline xử lý

```http
POST /api/v1/email-messages/{id}/trigger-pipeline
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
GET /api/v1/email-messages/{id}/processing-jobs
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
POST /api/v1/email-messages/{id}/extract
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
GET /api/v1/email-templates
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
POST /api/v1/email-templates
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

**Location Header:** `/api/v1/email-templates/{id}`

#### Cập nhật template

```http
PUT /api/v1/email-templates/{id}
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
DELETE /api/v1/email-templates/{id}
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
| `emailMessageId` | GUID | ID email message |
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
  emailMessageId: string;
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
  emailMessageId: string;
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
  emailMessageId: string;
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
  createResult: (emailMessageId: string) => Promise<void>;
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
        `${API_BASE}/email-analysis-results`,
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

  const createResult = async (emailMessageId: string) => {
    await axios.post(`${API_BASE}/email-analysis-results`, { emailMessageId });
    await fetchResults();
  };

  const approveResult = async (id: string, userId: string) => {
    await axios.post(`${API_BASE}/email-analysis-results/${id}/approve`, { userId });
    await fetchResults();
  };

  const rejectResult = async (id: string, userId: string, reason?: string) => {
    await axios.post(`${API_BASE}/email-analysis-results/${id}/reject`, { userId, reason });
    await fetchResults();
  };

  const updateFields = async (id: string, fields: Record<string, string>) => {
    await axios.put(`${API_BASE}/email-analysis-results/${id}/fields`, { extractedFields: fields });
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
        `${API_BASE}/email-templates`
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
    await axios.post(`${API_BASE}/email-templates`, template);
    await fetchTemplates();
  };

  const updateTemplate = async (id: string, template: UpdateTemplateRequest) => {
    await axios.put(`${API_BASE}/email-templates/${id}`, template);
    await fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    await axios.delete(`${API_BASE}/email-templates/${id}`);
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
2. User kích hoạt phân tích → POST /email-messages/{id}/process
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
