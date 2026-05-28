"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { GetApiV1RolesParams } from "@/lib/generated/mail-connector/model/getApiV1RolesParams"
import type { CreateRoleRequest } from "@/lib/generated/mail-connector/model/createRoleRequest"
import type { UpdateRoleRequest } from "@/lib/generated/mail-connector/model/updateRoleRequest"
import type { AssignPermissionsRequest } from "@/lib/generated/mail-connector/model/assignPermissionsRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const roleQueryKeys = {
  roles: (params?: GetApiV1RolesParams) => ["roles", params] as const,
  role: (id: string) => ["role", id] as const,
  rolePermissions: (id: string) => ["role-permissions", id] as const,
}

export function useRolesQuery(params?: GetApiV1RolesParams) {
  return useQuery({
    queryKey: roleQueryKeys.roles(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1Roles(params)
      return response?.data ?? response
    },
  })
}

export function useRoleQuery(id: string | null) {
  return useQuery({
    queryKey: id ? roleQueryKeys.role(id) : ["role", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1RolesId(id)
      return response?.data ?? response
    },
  })
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateRoleRequest) => {
      const response = await mailApi.postApiV1Roles(payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateRoleRequest }) => {
      const response = await mailApi.putApiV1RolesId(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: roleQueryKeys.role(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.deleteApiV1RolesId(id)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useRestoreRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.postApiV1RolesIdRestore(id)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useRolePermissionsQuery(id: string | null) {
  return useQuery({
    queryKey: id ? roleQueryKeys.rolePermissions(id) : ["role-permissions", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1RolesIdPermissions(id)
      return response?.data ?? response
    },
  })
}

export function useAssignRolePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AssignPermissionsRequest }) => {
      const response = await mailApi.postApiV1RolesIdPermissions(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: roleQueryKeys.rolePermissions(variables.id) })
    },
  })
}

export function useUpdateRolePermissionsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AssignPermissionsRequest }) => {
      const response = await mailApi.putApiV1RolesIdPermissions(id, payload)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: roleQueryKeys.rolePermissions(variables.id) })
    },
  })
}

export function useRemoveRolePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, permissionId }: { id: string; permissionId: string }) => {
      const response = await mailApi.deleteApiV1RolesIdPermissionsPermissionId(id, permissionId)
      return response?.data ?? response
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: roleQueryKeys.rolePermissions(variables.id) })
    },
  })
}
