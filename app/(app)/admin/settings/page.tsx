"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, CheckCircle, Cpu, Mail, RefreshCw } from "lucide-react"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useMailAccountsQuery,
  useOAuthUrlMutation,
  useSyncStatusQuery,
  useTriggerSyncMutation,
} from "@/hooks/use-mail-queries"

function SettingsContent() {
  const [aiPrompt, setAiPrompt] = useState(
    "Extract invoice details: invoice number, amount, currency, due date, sender"
  )
  const [saved, setSaved] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const { data: accounts = [], isPending: loadingAccounts, error: accountsError } = useMailAccountsQuery()
  const oauthMutation = useOAuthUrlMutation()
  const activeAccount = useMemo(() => accounts[0] ?? null, [accounts])
  const syncStatusQuery = useSyncStatusQuery(activeAccount?.id ?? null)
  const triggerSyncMutation = useTriggerSyncMutation(activeAccount?.id ?? null)

  const syncStatus = syncStatusQuery.data?.status
  const currentlySyncing =
    String(syncStatus || "").toLowerCase() === "syncing" || triggerSyncMutation.isPending

  const handleConnectGmail = async () => {
    try {
      setActionError(null)
      setActionMessage(null)

      const redirectUri = `${window.location.origin}/mail-auth/callback`
      const state =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `mail-${Date.now()}`

      sessionStorage.setItem("mail_oauth_state", state)
      const response = await oauthMutation.mutateAsync({ redirectUri, state })

      if (!response?.authUrl) {
        throw new Error("Không lấy được đường dẫn OAuth.")
      }

      window.location.href = response.authUrl
    } catch (error) {
      setActionError(getErrorMessage(error, "Kết nối Gmail thất bại."))
    }
  }

  const handleSync = async () => {
    try {
      setActionError(null)
      setActionMessage(null)
      await triggerSyncMutation.mutateAsync()
      setActionMessage("Đã gửi yêu cầu đồng bộ. Hệ thống đang cập nhật trạng thái.")
    } catch (error) {
      setActionError(getErrorMessage(error, "Không thể bắt đầu đồng bộ email."))
    }
  }

  const handleSavePrompt = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Cấu hình Hệ thống</h1>

      <div id="tour-settings-gmail" className="rounded-xl border border-blue-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">Tài khoản Gmail</h2>
        </div>

        {searchParams.get("connected") === "1" && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" /> Kết nối Gmail thành công.
          </div>
        )}

        {accountsError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {getErrorMessage(accountsError, "Không tải được danh sách tài khoản.")}
          </div>
        )}

        {actionError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" /> {actionError}
          </div>
        )}

        {actionMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" /> {actionMessage}
          </div>
        )}

        {loadingAccounts ? (
          <p className="text-sm text-blue-700">Đang tải tài khoản...</p>
        ) : activeAccount ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" /> Đã kết nối: {activeAccount.emailAddress}
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 text-sm text-blue-700">
              <p className="font-medium">Trạng thái đồng bộ: {syncStatus || "idle"}</p>
              <p className="mt-1 text-xs text-blue-600">
                Đã đồng bộ: {syncStatusQuery.data?.syncedMessages ?? 0} /{" "}
                {syncStatusQuery.data?.totalMessages ?? 0}
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={currentlySyncing}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", currentlySyncing && "animate-spin")} />
              {currentlySyncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectGmail}
            disabled={oauthMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {oauthMutation.isPending ? "Đang tạo link OAuth..." : "Kết nối tài khoản Gmail"}
          </button>
        )}
      </div>

      <div id="tour-settings-ai" className="rounded-xl border border-blue-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-blue-900">AI / Rule Engine</h2>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-blue-700">Prompt bóc tách mặc định</label>
          <textarea
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-blue-50/50 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-blue-700">
            Pattern lọc tiêu đề (Regex)
          </label>
          <input
            type="text"
            defaultValue="(invoice|shipping|logistics|freight|cargo)"
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-blue-50/50 focus:bg-white transition-colors"
          />
          <p className="mt-1 text-xs text-blue-500">
            Chỉ xử lý email có tiêu đề khớp với pattern này
          </p>
        </div>

        <button
          onClick={handleSavePrompt}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {saved ? <CheckCircle className="h-4 w-4" /> : "Lưu cấu hình"}
          {saved && " Đã lưu"}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-blue-700">Đang tải...</div>}>
      <SettingsContent />
    </Suspense>
  )
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
