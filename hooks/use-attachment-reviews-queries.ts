"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { ApproveRequest } from "@/lib/generated/mail-connector/model/approveRequest"
import type { RejectRequest } from "@/lib/generated/mail-connector/model/rejectRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const attachmentReviewQueryKeys = {
  my: ["attachment-reviews-my"] as const,
  byStatus: (status: string) => ["attachment-reviews-by-status", status] as const,
  byMessage: (messageId: string) => ["attachment-reviews-by-message", messageId] as const,
  review: (id: string) => ["attachment-review", id] as const,
}

export function useAttachmentReviewsMyQuery() {
  return useQuery({
    queryKey: attachmentReviewQueryKeys.my,
    queryFn: async () => {
      const response = await mailApi.getApiAttachmentReviewsMy()
      return response?.data ?? response
    },
  })
}

export function useAttachmentReviewsByStatusQuery(status: string) {
  return useQuery({
    queryKey: attachmentReviewQueryKeys.byStatus(status),
    queryFn: async () => {
      const response = await mailApi.getApiAttachmentReviewsByStatusStatus(status)
      return response?.data ?? response
    },
  })
}

export function useAttachmentReviewsByMessageQuery(messageId: string | null) {
  return useQuery({
    queryKey: messageId ? attachmentReviewQueryKeys.byMessage(messageId) : ["attachment-reviews-by-message", "none"],
    enabled: Boolean(messageId),
    queryFn: async () => {
      const response = await mailApi.getApiAttachmentReviewsByMessageMailConnectorMessageId(messageId)
      return response?.data ?? response
    },
  })
}

export function useAttachmentReviewQuery(id: string | null) {
  return useQuery({
    queryKey: id ? attachmentReviewQueryKeys.review(id) : ["attachment-review", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiAttachmentReviewsMailConnectorAttachmentId(id)
      return response?.data ?? response
    },
  })
}

export function useApproveAttachmentReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ApproveRequest }) => {
      const response = await mailApi.putApiAttachmentReviewsMailConnectorAttachmentIdApprove(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: attachmentReviewQueryKeys.review(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["attachment-reviews-my"] })
    },
  })
}

export function useRejectAttachmentReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RejectRequest }) => {
      const response = await mailApi.putApiAttachmentReviewsMailConnectorAttachmentIdReject(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: attachmentReviewQueryKeys.review(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["attachment-reviews-my"] })
    },
  })
}

export function useResetAttachmentReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.postApiAttachmentReviewsMailConnectorAttachmentIdReset(id)
      return response?.data ?? response
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: attachmentReviewQueryKeys.review(id) })
      void queryClient.invalidateQueries({ queryKey: ["attachment-reviews-my"] })
    },
  })
}
