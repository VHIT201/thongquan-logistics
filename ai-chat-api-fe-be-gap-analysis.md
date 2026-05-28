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
