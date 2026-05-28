"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { GetApiV1PermissionsParams } from "@/lib/generated/mail-connector/model/getApiV1PermissionsParams"
import type { CreatePermissionRequest } from "@/lib/generated/mail-connector/model/createPermissionRequest"
import type { UpdatePermissionRequest } from "@/lib/generated/mail-connector/model/updatePermissionRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const permissionQueryKeys = {
  permissions: (params?: GetApiV1PermissionsParams) => ["permissions", params] as const,
  permission: (id: string) => ["permission", id] as const,
  modules: ["permission-modules"] as const,
}

export function usePermissionsQuery(params?: GetApiV1PermissionsParams) {
  return useQuery({
    queryKey: permissionQueryKeys.permissions(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1Permissions(params)
      return response?.data ?? response
    },
  })
}

export function usePermissionModulesQuery() {
  return useQuery({
    queryKey: permissionQueryKeys.modules,
    queryFn: async () => {
      const response = await mailApi.getApiV1PermissionsModules()
      return response?.data ?? response
    },
  })
}

export function usePermissionQuery(id: string | null) {
  return useQuery({
    queryKey: id ? permissionQueryKeys.permission(id) : ["permission", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1PermissionsId(id)
      return response?.data ?? response
    },
  })
}

export function useCreatePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreatePermissionRequest) => {
      const response = await mailApi.postApiV1Permissions(payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdatePermissionRequest }) => {
      const response = await mailApi.putApiV1PermissionsId(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: permissionQueryKeys.permission(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.deleteApiV1PermissionsId(id)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useRestorePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.postApiV1PermissionsIdRestore(id)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}
