"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { GetApiV1OrderDraftsParams } from "@/lib/generated/mail-connector/model/getApiV1OrderDraftsParams"
import type { GetApiV1OrderDraftsExportParams } from "@/lib/generated/mail-connector/model/getApiV1OrderDraftsExportParams"
import type { ReviewRequest } from "@/lib/generated/mail-connector/model/reviewRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const orderDraftQueryKeys = {
  orderDrafts: (params?: GetApiV1OrderDraftsParams) => ["order-drafts", params] as const,
  orderDraft: (id: string) => ["order-draft", id] as const,
  export: (params?: GetApiV1OrderDraftsExportParams) => ["order-drafts-export", params] as const,
}

export function useOrderDraftsQuery(params?: GetApiV1OrderDraftsParams) {
  return useQuery({
    queryKey: orderDraftQueryKeys.orderDrafts(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1OrderDrafts(params)
      return response?.data ?? response
    },
  })
}

export function useOrderDraftQuery(id: string | null) {
  return useQuery({
    queryKey: id ? orderDraftQueryKeys.orderDraft(id) : ["order-draft", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1OrderDraftsId(id)
      return response?.data ?? response
    },
  })
}

export function useApproveOrderDraftL1Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewRequest }) => {
      const response = await mailApi.postApiV1OrderDraftsIdApproveL1(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: orderDraftQueryKeys.orderDraft(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["order-drafts"] })
    },
  })
}

export function useRejectOrderDraftL1Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewRequest }) => {
      const response = await mailApi.postApiV1OrderDraftsIdRejectL1(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: orderDraftQueryKeys.orderDraft(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["order-drafts"] })
    },
  })
}

export function useConfirmOrderDraftMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewRequest }) => {
      const response = await mailApi.postApiV1OrderDraftsIdConfirm(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: orderDraftQueryKeys.orderDraft(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["order-drafts"] })
    },
  })
}

export function useRejectOrderDraftMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewRequest }) => {
      const response = await mailApi.postApiV1OrderDraftsIdReject(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: orderDraftQueryKeys.orderDraft(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["order-drafts"] })
    },
  })
}

export function useExportOrderDraftsQuery(params?: GetApiV1OrderDraftsExportParams) {
  return useQuery({
    queryKey: orderDraftQueryKeys.export(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1OrderDraftsExport(params)
      return response?.data ?? response
    },
  })
}
