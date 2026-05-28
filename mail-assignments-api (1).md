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
