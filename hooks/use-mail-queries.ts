"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMailConnectorAPI } from "@/lib/generated/mail-connector/endpoints"
import type { EmailAnalysisResultDto } from "@/lib/generated/mail-connector/model/emailAnalysisResultDto"
import type { CreateTemplateRequest } from "@/lib/generated/mail-connector/model/createTemplateRequest"
import type { GetApiV1MailMessagesParams } from "@/lib/generated/mail-connector/model/getApiV1MailMessagesParams"
import type { UpdateTemplateRequest } from "@/lib/generated/mail-connector/model/updateTemplateRequest"

const mailApi = getMailConnectorAPI()

const getAnalysisItems = (data: unknown): EmailAnalysisResultDto[] => {
  if (!Array.isArray(data)) return []
  return data as EmailAnalysisResultDto[]
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
        syncType: "full",
        folderIds: ["INBOX"],
      }),
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
}) {
  const queryParams: GetApiV1MailMessagesParams = {
    accountId: params.accountId,
    page: params.page,
    pageSize: params.pageSize,
    fromEmail: params.fromEmail,
    hasAttachment: params.hasAttachment,
  }

  return useQuery({
    queryKey: mailQueryKeys.messages(queryParams),
    enabled: Boolean(params.accountId),
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
      await mailApi.postApiV1EmailMessagesIdProcess(id)
      await mailApi.postApiV1EmailAnalysisResults({ emailMessageId: id })
      const resultResponse = await mailApi.getApiV1EmailAnalysisResults()
      const matched = getAnalysisItems(resultResponse.data)
        .filter((item) => item.emailMessageId === id)
        .sort((first, second) => {
          const firstTime = new Date(first.updatedAt ?? first.createdAt ?? 0).getTime()
          const secondTime = new Date(second.updatedAt ?? second.createdAt ?? 0).getTime()
          return secondTime - firstTime
        })
      return matched[0] ?? null
    },
  })
}

export function useDownloadAttachmentMutation(messageId: string | null) {
  return useMutation({
    mutationFn: async ({ attachmentId, fileName }: { attachmentId: string; fileName?: string | null }) => {
      if (!messageId) throw new Error("Thiếu messageId để tải tệp.")
      const blob = (await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdDownload(
        messageId,
        attachmentId,
        { responseType: "blob" }
      )) as unknown as Blob
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
      const response = await mailApi.getApiV1EmailAnalysisResultsId(id as string)
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
      const response = await mailApi.getApiV1EmailAnalysisResults()
      const matched = getAnalysisItems(response.data)
        .filter((item) => item.emailMessageId === messageId)
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
      mailApi.putApiV1EmailAnalysisResultsIdFields(analysisId as string, {
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
      mailApi.postApiV1EmailAnalysisResultsIdApprove(analysisId as string, { userId }),
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
      mailApi.postApiV1EmailAnalysisResultsIdReject(analysisId as string, { userId, reason }),
    onSuccess: () => {
      if (analysisId) {
        void queryClient.invalidateQueries({ queryKey: mailQueryKeys.analysis(analysisId) })
      }
    },
  })
}

export function useEmailTemplatesQuery() {
  return useQuery({
    queryKey: mailQueryKeys.templates,
    queryFn: async () => {
      const response = await mailApi.getApiV1EmailTemplates()
      return response.data ?? []
    },
  })
}

export function useCreateEmailTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTemplateRequest) => mailApi.postApiV1EmailTemplates(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.templates })
    },
  })
}

export function useUpdateEmailTemplateMutation(templateId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTemplateRequest) =>
      mailApi.putApiV1EmailTemplatesId(templateId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.templates })
    },
  })
}

export function useDeleteEmailTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => mailApi.deleteApiV1EmailTemplatesId(templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.templates })
    },
  })
}
