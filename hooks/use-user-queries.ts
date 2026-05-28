"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { GetApiV1UsersParams } from "@/lib/generated/mail-connector/model/getApiV1UsersParams"
import type { CreateUserRequest } from "@/lib/generated/mail-connector/model/createUserRequest"
import type { UpdateUserRequest } from "@/lib/generated/mail-connector/model/updateUserRequest"
import type { UpdateUserRolesRequest } from "@/lib/generated/mail-connector/model/updateUserRolesRequest"
import type { UpdateUserStatusRequest } from "@/lib/generated/mail-connector/model/updateUserStatusRequest"
import type { ChangePasswordRequest } from "@/lib/generated/mail-connector/model/changePasswordRequest"
import type { ResetPasswordRequest } from "@/lib/generated/mail-connector/model/resetPasswordRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export interface UserDto {
  id: string
  email: string
  fullName: string
  roles: string[]
  isActive: boolean
  isLocked: boolean
  createdAtUtc: string
  updatedAtUtc: string | null
}

export interface CurrentUserResponse {
  userId: string
  email: string
  fullName: string
  roles: string[]
  isActive: boolean
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface UserListResponse {
  data: UserDto[]
  meta: {
    pagination: PaginationMeta
    job: null
    extra: Record<string, unknown>
  }
}

const getUserList = (data: unknown): UserListResponse => {
  if (typeof data !== "object" || data === null) {
    return { data: [], meta: { pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }, job: null, extra: {} } }
  }
  return data as UserListResponse
}

const getUserDto = (data: unknown): UserDto | null => {
  if (typeof data !== "object" || data === null) return null
  const d = data as Record<string, unknown>
  if (d.data && typeof d.data === "object") return d.data as UserDto
  return data as UserDto
}

export const userQueryKeys = {
  users: (params: GetApiV1UsersParams) => ["users", params] as const,
  user: (id: string) => ["user", id] as const,
  me: ["users-me"] as const,
  userPermissions: (id: string) => ["user-permissions", id] as const,
}

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: userQueryKeys.me,
    queryFn: async () => {
      const response = await mailApi.getApiV1UsersMe()
      const data = response?.data ?? response ?? null
      return data as CurrentUserResponse | null
    },
  })
}

export function useUsersQuery(params: GetApiV1UsersParams) {
  return useQuery({
    queryKey: userQueryKeys.users(params),
    queryFn: async () => {
      const response = await mailApi.getApiV1Users(params)
      return getUserList(response)
    },
  })
}

export function useUserQuery(id: string | null) {
  return useQuery({
    queryKey: id ? userQueryKeys.user(id) : ["user", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1UsersId(id)
      return getUserDto(response?.data ?? response)
    },
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateUserRequest) => {
      const response = await mailApi.postApiV1Users(payload)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateUserRequest }) => {
      const response = await mailApi.putApiV1UsersId(id, payload)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserRolesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateUserRolesRequest }) => {
      const response = await mailApi.putApiV1UsersIdRoles(id, payload)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await mailApi.patchApiV1UsersIdStatus(id, { isActive } as UpdateUserStatusRequest)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.deleteApiV1UsersId(id)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useRestoreUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mailApi.postApiV1UsersIdRestore(id)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateUserRequest) => {
      const response = await mailApi.putApiV1UsersMe(payload)
      return getUserDto(response?.data ?? response)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.me })
    },
  })
}

export function useChangeMyPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordRequest) => {
      const response = await mailApi.postApiV1UsersMeChangePassword(payload)
      return response?.data ?? response
    },
  })
}

export function useResetUserPasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ResetPasswordRequest }) => {
      const response = await mailApi.postApiV1UsersIdResetPassword(id, payload)
      return response?.data ?? response
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUserPermissionsQuery(id: string | null) {
  return useQuery({
    queryKey: id ? userQueryKeys.userPermissions(id) : ["user-permissions", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1UsersIdPermissions(id)
      return response?.data ?? response
    },
  })
}

export function useCurrentUserPermissionsQuery() {
  return useQuery({
    queryKey: ["users-me-permissions"],
    queryFn: async () => {
      const response = await mailApi.getApiV1UsersMePermissions()
      return response?.data ?? response
    },
  })
}

export function useUsersWithPermissionQuery(permissionCode: string) {
  return useQuery({
    queryKey: ["users-with-permission", permissionCode],
    queryFn: async () => {
      // 1. Get all users
      const usersRes = await mailApi.getApiV1Users({ page: 1, pageSize: 100 })
      const usersRaw = usersRes?.data ?? usersRes
      const users = (() => {
        if (Array.isArray(usersRaw)) return usersRaw
        if (usersRaw && typeof usersRaw === "object" && "data" in usersRaw) {
          const d = usersRaw as unknown as Record<string, unknown>
          if (Array.isArray(d.data)) return d.data
        }
        return []
      })() as Record<string, unknown>[]

      // 2. For each user, fetch permissions in parallel
      const usersWithPerms = await Promise.all(
        users.map(async (user) => {
          const userId = String(user.id ?? "")
          if (!userId) return { user, hasPermission: false }
          try {
            const permRes = await mailApi.getApiV1UsersIdPermissions(userId)
            const permRaw = permRes?.data ?? permRes
            const perms = (() => {
              if (Array.isArray(permRaw)) return permRaw
              if (permRaw && typeof permRaw === "object" && "data" in permRaw) {
                const d = permRaw as unknown as Record<string, unknown>
                if (Array.isArray(d.data)) return d.data
              }
              return []
            })() as { code?: string }[]
            const hasPermission = perms.some((p) => p.code === permissionCode)
            return { user, hasPermission }
          } catch {
            return { user, hasPermission: false }
          }
        })
      )

      return usersWithPerms.filter((u) => u.hasPermission).map((u) => u.user)
    },
  })
}
