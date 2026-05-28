import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AuthUser {
  userId: string
  email: string
  fullName: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (data: {
    user: AuthUser
    accessToken: string
    refreshToken: string
  }) => void
  clearAuth: () => void
  isAdmin: () => boolean
  isUser: () => boolean
}

export function getTenantIdFromToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      console.warn("[getTenantIdFromToken] No token found")
      return null
    }
    const base64Url = token.split(".")[1]
    if (!base64Url) {
      console.warn("[getTenantIdFromToken] Token has no payload segment")
      return null
    }
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    const payload = JSON.parse(jsonPayload)
    const tenantId =
      payload.tenantId ??
      payload.tenant_id ??
      payload.tid ??
      payload.tenantid ??
      null
    if (!tenantId) {
      console.warn("[getTenantIdFromToken] No tenantId in payload, keys:", Object.keys(payload))
    }
    return tenantId || null
  } catch (err) {
    console.error("[getTenantIdFromToken] Failed to decode token:", err)
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: ({ user, accessToken, refreshToken }) => {
        set({ user, accessToken, refreshToken })
      },
      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null })
      },
      isAdmin: () => {
        const { user } = get()
        return user?.roles.includes("admin") ?? false
      },
      isUser: () => {
        const { user } = get()
        return user?.roles.includes("user") ?? false
      },
    }),
    {
      name: "auth-storage",
    }
  )
)
