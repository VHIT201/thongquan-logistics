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
