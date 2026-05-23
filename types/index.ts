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
