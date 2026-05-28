"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { UnassignRequest } from "@/lib/generated/mail-connector/model/unassignRequest"
import type { UpdateStatusRequest } from "@/lib/generated/mail-connector/model/updateStatusRequest"
import type { ReassignRequest } from "@/lib/generated/mail-connector/model/reassignRequest"
import type { CompleteRequest } from "@/lib/generated/mail-connector/model/completeRequest"
import type { ConfirmRequest } from "@/lib/generated/mail-connector/model/confirmRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const mailAssignmentQueryKeys = {
  my: ["mail-assignments-my"] as const,
  byStatus: (status: string) => ["mail-assignments-by-status", status] as const,
  status: (messageId: string) => ["mail-assignment-status", messageId] as const,
}

export function useMailAssignmentsMyQuery() {
  return useQuery({
    queryKey: mailAssignmentQueryKeys.my,
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAssignmentsMy()
      return response?.data ?? response
    },
  })
}

export function useMailAssignmentsByStatusQuery(status: string) {
  return useQuery({
    queryKey: mailAssignmentQueryKeys.byStatus(status),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAssignmentsByStatusStatus(status)
      return response?.data ?? response
    },
  })
}

export function useMailAssignmentStatusQuery(messageId: string | null) {
  return useQuery({
    queryKey: messageId ? mailAssignmentQueryKeys.status(messageId) : ["mail-assignment-status", "none"],
    enabled: Boolean(messageId),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAssignmentsMailConnectorMessageIdStatus(messageId)
      return response?.data ?? response
    },
  })
}

function invalidateAssignments(queryClient: ReturnType<typeof useQueryClient>, messageId?: string) {
  void queryClient.invalidateQueries({ queryKey: mailAssignmentQueryKeys.my })
  void queryClient.invalidateQueries({ queryKey: ["mail-assignments-by-status"] })
  void queryClient.invalidateQueries({ queryKey: ["mail-messages"] })
  if (messageId) {
    void queryClient.invalidateQueries({ queryKey: mailAssignmentQueryKeys.status(messageId) })
  }
}

export function useAssignMailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      messageId,
      payload,
    }: {
      messageId: string
      payload?: { toUserId?: string | null }
    }) => {
      const response = await mailApi.postApiV1MailAssignmentsMailConnectorMessageIdAssign(messageId, payload ?? {})
      return response?.data ?? response
    },
    onSuccess: () => {
      invalidateAssignments(queryClient)
    },
  })
}

export function useUnassignMailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, payload }: { messageId: string; payload: UnassignRequest }) => {
      const response = await mailApi.deleteApiV1MailAssignmentsMailConnectorMessageIdUnassign(messageId, payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      invalidateAssignments(queryClient)
    },
  })
}

export function useUpdateMailAssignmentStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, payload }: { messageId: string; payload: UpdateStatusRequest }) => {
      const response = await mailApi.putApiV1MailAssignmentsMailConnectorMessageIdStatus(messageId, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      invalidateAssignments(queryClient, variables.messageId)
    },
  })
}

export function useReassignMailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, payload }: { messageId: string; payload: ReassignRequest }) => {
      const response = await mailApi.postApiV1MailAssignmentsMailConnectorMessageIdReassign(messageId, payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      invalidateAssignments(queryClient)
    },
  })
}

export function useConfirmMailAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, payload }: { messageId: string; payload?: ConfirmRequest }) => {
      const response = await mailApi.postApiV1MailAssignmentsMailConnectorMessageIdConfirm(messageId, payload ?? {})
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      invalidateAssignments(queryClient, variables.messageId)
    },
  })
}

export function useCompleteMailAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, payload }: { messageId: string; payload: CompleteRequest }) => {
      const response = await mailApi.postApiV1MailAssignmentsMailConnectorMessageIdComplete(messageId, payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      invalidateAssignments(queryClient)
    },
  })
}

