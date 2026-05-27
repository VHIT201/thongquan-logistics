"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import { useAuthStore } from "@/lib/stores/auth-store"

export function useAuth() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const logout = useCallback(async () => {
    const api = getLogisticsPlatformAPI()
    const refreshToken = localStorage.getItem("refreshToken") || ""
    try {
      await api.postApiV1AuthLogout({ refreshToken })
    } catch {
      // Ignore logout API errors
    }
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userId")
    localStorage.removeItem("email")
    localStorage.removeItem("name")
    clearAuth()
    router.push("/login")
  }, [router, clearAuth])

  return { user, isLoading: false, logout }
}
