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
