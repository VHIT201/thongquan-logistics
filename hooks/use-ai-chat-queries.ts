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
