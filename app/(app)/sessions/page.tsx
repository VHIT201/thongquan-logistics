"use client"
// ROUTE: Quản lý phiên đăng nhập — xem và hủy phiên của chính mình

import { useState } from "react"
import {
  Loader,
  LogOut,
  Monitor,
  Smartphone,
  Globe,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAuthSessionsQuery,
  useAuthRevokeSessionMutation,
  useAuthLogoutAllMutation,
} from "@/hooks/use-auth-queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SessionRecord = Record<string, unknown>

function normalizeSessions(raw: unknown): SessionRecord[] {
  if (raw && typeof raw === "object") {
    const d = raw as Record<string, unknown>
    if (Array.isArray(d.sessions)) return d.sessions as SessionRecord[]
  }
  return []
}

function getDeviceIcon(platform?: string | null) {
  const p = (platform ?? "").toLowerCase()
  if (p.includes("mobile") || p.includes("android") || p.includes("ios")) {
    return <Smartphone className="h-5 w-5 text-neutral-200" />
  }
  return <Monitor className="h-5 w-5 text-neutral-200" />
}

export default function SessionsPage() {
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const sessionsQuery = useAuthSessionsQuery()
  const revokeMutation = useAuthRevokeSessionMutation()
  const logoutAllMutation = useAuthLogoutAllMutation()

  const sessions = normalizeSessions(sessionsQuery.data)

  const handleRevoke = async (id: string) => {
    setRevokingId(id)
    try {
      await revokeMutation.mutateAsync({
        id,
        payload: { reason: "User revoked from web UI" },
      })
      toast.success("Đã hủy phiên đăng nhập.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Hủy phiên thất bại."))
    } finally {
      setRevokingId(null)
    }
  }

  const handleLogoutAll = async () => {
    const confirmed = window.confirm("Đăng xuất khỏi tất cả thiết bị?")
    if (!confirmed) return
    try {
      await logoutAllMutation.mutateAsync({ reason: "User logout all from web UI" })
      toast.success("Đã đăng xuất khỏi tất cả thiết bị.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Thao tác thất bại."))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý phiên đăng nhập</h1>
        <Button
          variant="outline"
          onClick={handleLogoutAll}
          disabled={logoutAllMutation.isPending}
          className="text-accent border-accent/20 hover:bg-accent/5 cursor-pointer"
        >
          {logoutAllMutation.isPending ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Đăng xuất tất cả
        </Button>
      </div>

      {sessionsQuery.isPending && (
        <div className="flex items-center gap-2 text-sm text-neutral-200">
          <Loader className="h-4 w-4 animate-spin" />
          Đang tải...
        </div>
      )}

      {!sessionsQuery.isPending && sessions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-neutral-200" />
            <p className="mt-3 text-sm text-neutral-200">Không có phiên đăng nhập nào.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sessions.map((s) => {
          const id = String(s.id ?? "")
          const platform = s.platform as string | null
          const deviceName = (s.deviceName as string | null) ?? null
          const ip = (s.ipAddress as string | null) ?? "—"
          const createdAt = s.createdAtUtc as string | undefined
          const lastActive = s.lastActivityAtUtc as string | undefined
          const expiresAt = s.expiresAtUtc as string | undefined
          const isCurrent = Boolean(s.isCurrent)

          return (
            <Card
              key={id}
              className={`transition-colors ${isCurrent ? "border-primary/30 bg-primary/5" : ""}`}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-50">
                  {getDeviceIcon(platform)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-300">
                      {deviceName ?? (platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : "Thiết bị")}
                    </p>
                    {isCurrent && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Hiện tại
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-200">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {ip}
                    </span>
                    {typeof createdAt === "string" && (
                      <span>Đăng nhập: {dayjs(createdAt).format("DD/MM/YYYY HH:mm")}</span>
                    )}
                    {typeof lastActive === "string" && (
                      <span>Hoạt động: {dayjs(lastActive).format("DD/MM/YYYY HH:mm")}</span>
                    )}
                    {typeof expiresAt === "string" && (
                      <span>Hết hạn: {dayjs(expiresAt).format("DD/MM/YYYY HH:mm")}</span>
                    )}
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleRevoke(id)}
                    disabled={revokingId === id || revokeMutation.isPending}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {revokingId === id ? (
                      <Loader className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Hủy
                  </button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

