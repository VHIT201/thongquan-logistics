"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { LoginCommand } from "@/lib/generated/mail-connector/model/loginCommand"
import type { RefreshTokenCommand } from "@/lib/generated/mail-connector/model/refreshTokenCommand"
import type { LogoutCommand } from "@/lib/generated/mail-connector/model/logoutCommand"
import type { LogoutAllRequest } from "@/lib/generated/mail-connector/model/logoutAllRequest"
import type { RevokeSessionRequest } from "@/lib/generated/mail-connector/model/revokeSessionRequest"
import type { SendPasswordResetOtpCommand } from "@/lib/generated/mail-connector/model/sendPasswordResetOtpCommand"
import type { ConfirmPasswordResetCommand } from "@/lib/generated/mail-connector/model/confirmPasswordResetCommand"
import type { ExchangeTokenRequest } from "@/lib/generated/mail-connector/model/exchangeTokenRequest"
import type { RefreshMailTokenRequest } from "@/lib/generated/mail-connector/model/refreshMailTokenRequest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mailApi: any = getLogisticsPlatformAPI()

export const authQueryKeys = {
  sessions: ["auth-sessions"] as const,
}

export function useAuthLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginCommand) => {
      const response = await mailApi.postApiV1AuthLogin(payload)
      return response
    },
  })
}

export function useAuthRefreshMutation() {
  return useMutation({
    mutationFn: async (payload: RefreshTokenCommand) => {
      const response = await mailApi.postApiV1AuthRefresh(payload)
      return response.data
    },
  })
}

export function useAuthLogoutMutation() {
  return useMutation({
    mutationFn: async (payload: LogoutCommand) => {
      const response = await mailApi.postApiV1AuthLogout(payload)
      return response.data
    },
  })
}

export function useAuthSessionsQuery() {
  return useQuery({
    queryKey: authQueryKeys.sessions,
    queryFn: async () => {
      const response = await mailApi.getApiV1AuthSessions()
      return response.data
    },
  })
}

export function useAuthRevokeSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RevokeSessionRequest }) => {
      const response = await mailApi.postApiV1AuthSessionsIdRevoke(id, payload)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions })
    },
  })
}

export function useAuthLogoutAllMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: LogoutAllRequest) => {
      const response = await mailApi.postApiV1AuthLogoutAll(payload)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions })
    },
  })
}

export function useAuthForgotPasswordSendOtpMutation() {
  return useMutation({
    mutationFn: async (payload: SendPasswordResetOtpCommand) => {
      const response = await mailApi.postApiV1AuthForgotPasswordSendOtp(payload)
      return response.data
    },
  })
}

export function useAuthForgotPasswordConfirmResetMutation() {
  return useMutation({
    mutationFn: async (payload: ConfirmPasswordResetCommand) => {
      const response = await mailApi.postApiV1AuthForgotPasswordConfirmReset(payload)
      return response.data
    },
  })
}

export function useMailAuthExchangeTokenMutation() {
  return useMutation({
    mutationFn: async (payload: ExchangeTokenRequest) => {
      const response = await mailApi.postApiV1MailAuthExchangeToken(payload)
      return response.data
    },
  })
}

export function useMailAuthRefreshTokenMutation() {
  return useMutation({
    mutationFn: async (payload: RefreshMailTokenRequest) => {
      const response = await mailApi.postApiV1MailAuthRefreshToken(payload)
      return response.data
    },
  })
}
