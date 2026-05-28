"use client"
// USER ROUTE: Quản lý tài khoản email — user quản lý kết nối tài khoản mail

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Inbox,
  Link2,
  Loader,
  PauseCircle,
  Play,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react"
import dayjs from "dayjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getErrorMessage } from "@/lib/get-error-message"
import { toast } from "sonner"
import {
  useMailAccountsQuery,
  useDeleteMailAccountMutation,
  useOAuthUrlMutation,
  useSyncStatusQuery,
  useTriggerSyncMutation,
  useTriggerSyncDirectMutation,
} from "@/hooks/use-mail-queries"

type MailAccountItem = {
  id?: string | null
  provider?: string | null
  emailAddress?: string | null
  displayName?: string | null
  status?: string | null
  lastSyncedAt?: string | null
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = (status || "").toLowerCase()
  switch (normalized) {
    case "connected":
    case "active":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
          <CheckCircle className="mr-1 h-3 w-3" /> Đã kết nối
        </Badge>
      )
    case "authrequired":
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
          <AlertCircle className="mr-1 h-3 w-3" /> Cần xác thực
        </Badge>
      )
    case "syncing":
      return (
        <Badge className="bg-primary-50 text-primary hover:bg-primary-50">
          <Loader className="mr-1 h-3 w-3 animate-spin" /> Đang đồng bộ
        </Badge>
      )
    case "paused":
      return (
        <Badge className="bg-neutral-100 text-neutral-400 hover:bg-neutral-100">
          <PauseCircle className="mr-1 h-3 w-3" /> Tạm dừng
        </Badge>
      )
    case "disconnected":
      return (
        <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-50">
          <XCircle className="mr-1 h-3 w-3" /> Ngắt kết nối
        </Badge>
      )
    case "error":
      return (
        <Badge className="bg-red-50 text-red-700 hover:bg-red-50">
          <XCircle className="mr-1 h-3 w-3" /> Lỗi
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-neutral-400">
          {status || "Không rõ"}
        </Badge>
      )
  }
}

function MailAccountsContent() {
  const router = useRouter()

  const { data: accountsData = [], isPending: accountsPending } = useMailAccountsQuery()
  const accounts: MailAccountItem[] = accountsData as MailAccountItem[]
  const oauthMutation = useOAuthUrlMutation()
  const deleteMutation = useDeleteMailAccountMutation()

  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null)
  const triggerSync = useTriggerSyncMutation(syncingAccountId)
  const triggerSyncDirect = useTriggerSyncDirectMutation(syncingAccountId)
  const syncStatus = useSyncStatusQuery(syncingAccountId)

  const handleConnect = async () => {
    try {
      // BE callback - BE sẽ xử lý toàn bộ OAuth
      const redirectUri = "https://vietprodev.duckdns.org/gateway/mail-connector/oauth/callback"
      const randomState = Math.random().toString(36).substring(2)
      const response = await oauthMutation.mutateAsync({ redirectUri, state: randomState })
      const authUrl = (response as { authUrl?: string })?.authUrl
      if (authUrl) {
        window.location.href = authUrl
      } else {
        toast.error("Không nhận được URL xác thực từ server.")
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể bắt đầu xác thực OAuth."))
    }
  }

  const handleSync = (accountId: string) => {
    setSyncingAccountId(accountId)
    triggerSync.mutate(undefined, {
      onError: (err) => toast.error(getErrorMessage(err, "Kích hoạt đồng bộ thất bại.")),
    })
  }

  const handleDirectSync = (accountId: string) => {
    setSyncingAccountId(accountId)
    triggerSyncDirect.mutate(undefined, {
      onSuccess: () => toast.success("Đồng bộ trực tiếp thành công."),
      onError: (err) => toast.error(getErrorMessage(err, "Đồng bộ trực tiếp thất bại.")),
    })
  }

  const handleDelete = (accountId: string) => {
    if (!window.confirm("Xóa tài khoản email này? Hành động không thể hoàn tác.")) return
    deleteMutation.mutate(accountId, {
      onError: (err) => toast.error(getErrorMessage(err, "Xóa tài khoản thất bại.")),
    })
  }

  const isSyncing =
    syncingAccountId &&
    (syncStatus.data?.status || "").toLowerCase() === "syncing"

  const progress = syncStatus.data
    ? Math.round(
        ((syncStatus.data.syncedMessages || 0) / (syncStatus.data.totalMessages || 1)) * 100
      )
    : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Tài khoản Email</h1>
        <button
          onClick={handleConnect}
          disabled={oauthMutation.isPending}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Link2 className="h-4 w-4" />
          {oauthMutation.isPending ? "Đang xử lý..." : "Kết nối Gmail"}
        </button>
      </div>

      {isSyncing && syncStatus.data && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary animate-spin" />
              Đang đồng bộ: {syncStatus.data.currentFolder || "INBOX"}
            </CardTitle>
            <CardDescription>
              {syncStatus.data.syncedMessages} / {syncStatus.data.totalMessages} tin nhắn
              {syncStatus.data.failedMessages ? ` · Lỗi: ${syncStatus.data.failedMessages}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded-full bg-neutral-100">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-neutral-200">{progress}%</p>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Email</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Nhà cung cấp</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Đồng bộ lần cuối</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {accountsPending && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải tài khoản...</p>
                  </td>
                </tr>
              )}

              {!accountsPending && accounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    <Inbox className="mx-auto h-8 w-8 text-neutral-100" />
                    <p className="mt-2 text-sm">Chưa có tài khoản email nào.</p>
                    <button
                      onClick={handleConnect}
                      className="mt-2 cursor-pointer text-sm text-primary hover:underline"
                    >
                      Kết nối tài khoản mới
                    </button>
                  </td>
                </tr>
              )}

              {accounts.map((account) => (
                <tr key={account.id} className="cursor-pointer hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-neutral-300">{account.emailAddress || "N/A"}</p>
                      {account.displayName && (
                        <p className="text-xs text-neutral-200">{account.displayName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-200 capitalize">
                    {account.provider || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={account.status ?? undefined} />
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {account.lastSyncedAt ? (
                      dayjs(account.lastSyncedAt).format("DD/MM/YYYY HH:mm")
                    ) : (
                      <span className="text-neutral-100">Chưa đồng bộ</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => account.id && handleSync(account.id)}
                        disabled={triggerSync.isPending || triggerSyncDirect.isPending || deleteMutation.isPending}
                        title="Đồng bộ"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => account.id && handleDirectSync(account.id)}
                        disabled={triggerSync.isPending || triggerSyncDirect.isPending || deleteMutation.isPending}
                        title="Đồng bộ trực tiếp"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={triggerSyncDirect.isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                      </button>
                      <button
                        onClick={() => account.id && handleDelete(account.id)}
                        disabled={deleteMutation.isPending}
                        title="Xóa"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function MailAccountsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-neutral-200">Đang tải...</div>}>
      <MailAccountsContent />
    </Suspense>
  )
}
