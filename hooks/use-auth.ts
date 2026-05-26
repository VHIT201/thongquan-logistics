"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"

interface AuthUser {
  userId: string
  email?: string
  name?: string
}

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const userId = localStorage.getItem("userId")
  if (!userId) return null
  return {
    userId,
    email: localStorage.getItem("email") || undefined,
    name: localStorage.getItem("name") || undefined,
  }
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
    setIsLoading(false)
  }, [])

  const logout = useCallback(async () => {
    const api = getLogisticsPlatformAPI()
    try {
      await api.postApiV1AuthLogout({ refreshToken: localStorage.getItem("refreshToken") || "" })
    } catch {
      // Ignore logout API errors
    }
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userId")
    localStorage.removeItem("email")
    localStorage.removeItem("name")
    setUser(null)
    router.push("/login")
  }, [router])

  return { user, isLoading, logout }
}
