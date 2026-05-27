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
