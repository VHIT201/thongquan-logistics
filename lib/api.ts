import axios from "axios"
import type { ApiResponse, MailAccount, MailMessage, MailMessageDetail, EmailAnalysisResult, EmailTemplate, SyncStatus, User, LogEntry, ReportData } from "@/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1"

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Auth
export async function login(email: string, password: string) {
  const res = await api.post<ApiResponse<{ token: string; user: User }>>("/auth/login", { email, password })
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

export async function deleteAccount(id: string) {
  await api.delete(`/mail-accounts/${id}`)
}

export async function triggerSync(id: string) {
  const res = await api.post<ApiResponse<{ jobId: string; status: string }>>(`/mail-accounts/${id}/sync`, {
    syncType: "full",
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

export async function getMailMessage(id: string) {
  const res = await api.get<ApiResponse<MailMessageDetail>>(`/mail-messages/${id}`)
  return res.data.data
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
