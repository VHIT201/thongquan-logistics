"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { useCurrentUserPermissionsQuery } from "@/hooks/use-user-queries"

type PermissionItem = {
  id?: string
  code?: string
  name?: string
  module?: string
}

function extractCodes(data: unknown): string[] {
  if (!data) return []
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        const p = item as PermissionItem
        return p.code ?? ""
      })
      .filter(Boolean)
  }
  if (typeof data === "object" && data !== null) {
    const d = data as Record<string, unknown>
    if (Array.isArray(d.data)) {
      return extractCodes(d.data)
    }
  }
  return []
}

export function usePermission(permissionCode: string) {
  const authUser = useAuthStore((s) => s.user)
  const permissionsQuery = useCurrentUserPermissionsQuery()

  // Use auth store as primary source, API as fallback
  const storeCodes = authUser?.permissions ?? []
  const apiCodes = extractCodes(permissionsQuery.data)
  const allCodes = apiCodes.length > 0 ? apiCodes : storeCodes

  const has = allCodes.includes(permissionCode)

  return {
    has,
    isLoading: permissionsQuery.isPending,
    codes: allCodes,
  }
}

export function usePermissions(permissionCodes: string[]) {
  const authUser = useAuthStore((s) => s.user)
  const permissionsQuery = useCurrentUserPermissionsQuery()

  const storeCodes = authUser?.permissions ?? []
  const apiCodes = extractCodes(permissionsQuery.data)
  const allCodes = apiCodes.length > 0 ? apiCodes : storeCodes

  const hasAll = permissionCodes.every((code) => allCodes.includes(code))
  const hasAny = permissionCodes.some((code) => allCodes.includes(code))
  const check = (code: string) => allCodes.includes(code)

  return {
    hasAll,
    hasAny,
    check,
    isLoading: permissionsQuery.isPending,
    codes: allCodes,
  }
}
