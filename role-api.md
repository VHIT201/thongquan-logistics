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
