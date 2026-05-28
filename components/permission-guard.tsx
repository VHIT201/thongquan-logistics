"use client"

import { Shield } from "lucide-react"
import { usePermission, usePermissions } from "@/hooks/use-permission"

interface PermissionGuardProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({
  permission,
  permissions,
  requireAll = true,
  children,
  fallback,
}: PermissionGuardProps) {
  if (permission) {
    return (
      <SinglePermissionGuard
        permission={permission}
        children={children}
        fallback={fallback}
      />
    )
  }

  if (permissions && permissions.length > 0) {
    return (
      <MultiPermissionGuard
        permissions={permissions}
        requireAll={requireAll}
        children={children}
        fallback={fallback}
      />
    )
  }

  return <>{children}</>
}

function SinglePermissionGuard({
  permission,
  children,
  fallback,
}: {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { has, isLoading } = usePermission(permission)

  if (isLoading) return null

  if (!has) {
    return (
      <>
        {fallback ?? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Shield className="h-6 w-6 text-neutral-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300">Không có quyền truy cập</p>
              <p className="text-xs text-neutral-200">
                Bạn cần quyền <code className="rounded bg-neutral-100 px-1 py-0.5 text-[10px]">{permission}</code> để sử dụng tính năng này.
              </p>
            </div>
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}

function MultiPermissionGuard({
  permissions,
  requireAll,
  children,
  fallback,
}: {
  permissions: string[]
  requireAll: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasAll, hasAny, isLoading } = usePermissions(permissions)

  const has = requireAll ? hasAll : hasAny

  if (isLoading) return null

  if (!has) {
    return (
      <>
        {fallback ?? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Shield className="h-6 w-6 text-neutral-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300">Không có quyền truy cập</p>
              <p className="text-xs text-neutral-200">
                Bạn cần quyền phù hợp để sử dụng tính năng này.
              </p>
            </div>
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}
