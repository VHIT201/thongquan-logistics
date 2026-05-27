"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"
import type { GetApiV1UsersParams } from "@/lib/generated/mail-connector/model/getApiV1UsersParams"
import type { CreateUserRequest } from "@/lib/generated/mail-connector/model/createUserRequest"
import type { UpdateUserRequest } from "@/lib/generated/mail-connector/model/updateUserRequest"
import type { UpdateUserRolesRequest } from "@/lib/generated/mail-connector/model/updateUserRolesRequest"
import type { UpdateUserStatusRequest } from "@/lib/generated/mail-connector/model/updateUserStatusRequest"
import type { ChangePasswordRequest } from "@/lib/generated/mail-connector/model/changePasswordRequest"
import type { ResetPasswordRequest } from "@/lib/generated/mail-connector/model/resetPasswordRequest"

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
}

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: userQueryKeys.me,
    queryFn: async () => {
      const { data } = await MAIL_CONNECTOR_AXIOS.get("/api/v1/users/me")
      return (data?.data ?? data ?? null) as CurrentUserResponse | null
    },
  })
}

export function useUsersQuery(params: GetApiV1UsersParams) {
  return useQuery({
    queryKey: userQueryKeys.users(params),
    queryFn: async () => {
      const { data } = await MAIL_CONNECTOR_AXIOS.get("/api/v1/users", { params })
      return getUserList(data)
    },
  })
}

export function useUserQuery(id: string | null) {
  return useQuery({
    queryKey: id ? userQueryKeys.user(id) : ["user", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await MAIL_CONNECTOR_AXIOS.get(`/api/v1/users/${id}`)
      return getUserDto(data)
    },
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateUserRequest) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.post("/api/v1/users", payload)
      return getUserDto(data)
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
      const { data } = await MAIL_CONNECTOR_AXIOS.put(`/api/v1/users/${id}`, payload)
      return getUserDto(data)
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
      const { data } = await MAIL_CONNECTOR_AXIOS.put(`/api/v1/users/${id}/roles`, payload)
      return getUserDto(data)
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
      const { data } = await MAIL_CONNECTOR_AXIOS.patch(`/api/v1/users/${id}/status`, { isActive } as UpdateUserStatusRequest)
      return getUserDto(data)
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
      const { data } = await MAIL_CONNECTOR_AXIOS.delete(`/api/v1/users/${id}`)
      return data
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
      const { data } = await MAIL_CONNECTOR_AXIOS.post(`/api/v1/users/${id}/restore`)
      return getUserDto(data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { fullName?: string | null; roles?: string[] | null }) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.put("/api/v1/users/me", payload)
      return getUserDto(data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.me })
    },
  })
}

export function useChangeMyPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordRequest) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.post("/api/v1/users/me/change-password", payload)
      return data
    },
  })
}

export function useResetUserPasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ResetPasswordRequest }) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.post(`/api/v1/users/${id}/reset-password`, payload)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
