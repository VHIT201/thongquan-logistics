"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Cpu,
  Mail,
  RefreshCw,
  Users,
} from "lucide-react"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAiOpenaiUsageUsersCurrentMonthQuery,
  useAiOpenaiUsageUsersQuery,
  useMailAccountsQuery,
  useOAuthUrlMutation,
  useSyncStatusQuery,
  useTriggerSyncDirectMutation,
  useTriggerSyncMutation,
} from "@/hooks/use-mail-queries"

type UsageRecord = Record<string, unknown>
type UsageSummary = {
  totalRequests: number
  totalTokens: number
  totalCost: number
  activeUsers: number
}

const numberOf = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const readNumber = (record: UsageRecord, keys: string[]) => {
  for (const key of keys) {
    if (key in record) return numberOf(record[key])
  }
  return 0
}

const getUsageItems = (value: unknown): UsageRecord[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === "object") as UsageRecord[]
  }
  if (!value || typeof value !== "object") return []

  const record = value as UsageRecord
  const nestedCandidates = [record.items, record.data, record.results, record.users]

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item) => item && typeof item === "object") as UsageRecord[]
    }
  }

  return [record]
}

const buildUsageSummary = (value: unknown): UsageSummary => {
  const items = getUsageItems(value)
  if (items.length === 0) {
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      activeUsers: 0,
    }
  }

  const first = items[0]
  const directTotalRequests = readNumber(first, [
    "totalRequests",
    "totalCalls",
    "requestCount",
    "totalRequestCount",
  ])
  const directTotalTokens = readNumber(first, [
    "totalTokens",
    "tokenCount",
    "totalTokenCount",
  ])
  const directTotalCost = readNumber(first, [
    "totalCost",
    "costEstimate",
    "cost",
    "amount",
  ])
  const directActiveUsers = readNumber(first, [
    "activeUsers",
    "userCount",
    "totalUsers",
  ])

  if (
    items.length === 1 &&
    (directTotalRequests > 0 ||
      directTotalTokens > 0 ||
      directTotalCost > 0 ||
      directActiveUsers > 0)
  ) {
    return {
      totalRequests: directTotalRequests,
      totalTokens: directTotalTokens,
      totalCost: directTotalCost,
      activeUsers: directActiveUsers,
    }
  }

  const userIds = new Set<string>()
  const summary = items.reduce<Pick<UsageSummary, "totalRequests" | "totalTokens" | "totalCost">>(
    (accumulator, item) => {
      const inputTokens = readNumber(item, ["inputTokenCount", "inputTokens"])
      const outputTokens = readNumber(item, ["outputTokenCount", "outputTokens"])
      const tokens =
        readNumber(item, ["totalTokens", "tokenCount", "totalTokenCount"]) ||
        inputTokens + outputTokens
      accumulator.totalRequests += readNumber(item, [
        "totalRequests",
        "requestCount",
        "calls",
        "totalCalls",
      ])
      accumulator.totalTokens += tokens
      accumulator.totalCost += readNumber(item, [
        "totalCost",
        "costEstimate",
        "cost",
        "amount",
      ])

      const userIdValue =
        item.userId ?? item.id ?? item.accountId ?? item.email ?? item.userEmail ?? item.username
      if (typeof userIdValue === "string" && userIdValue.trim()) {
        userIds.add(userIdValue)
      }

      return accumulator
    },
    { totalRequests: 0, totalTokens: 0, totalCost: 0 }
  )

  return {
    ...summary,
    activeUsers: userIds.size,
  }
}

function SettingsContent() {
  const [aiPrompt, setAiPrompt] = useState(
    "Extract invoice details: invoice number, amount, currency, due date, sender"
  )
  const [saved, setSaved] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const {
    data: accounts = [],
    isPending: loadingAccounts,
    error: accountsError,
  } = useMailAccountsQuery()
  const oauthMutation = useOAuthUrlMutation()
  const activeAccount = useMemo(() => accounts[0] ?? null, [accounts])
  const syncStatusQuery = useSyncStatusQuery(activeAccount?.id ?? null)
  const triggerSyncMutation = useTriggerSyncMutation(activeAccount?.id ?? null)
  const triggerSyncDirectMutation = useTriggerSyncDirectMutation(activeAccount?.id ?? null)
  const aiUsersCurrentMonthQuery = useAiOpenaiUsageUsersCurrentMonthQuery()
  const aiUsersQuery = useAiOpenaiUsageUsersQuery()

  const syncStatus = syncStatusQuery.data?.status
  const currentlySyncing =
    String(syncStatus || "").toLowerCase() === "syncing" ||
    triggerSyncMutation.isPending ||
    triggerSyncDirectMutation.isPending

  const monthUsageSummary = useMemo(
    () => buildUsageSummary(aiUsersCurrentMonthQuery.data),
    [aiUsersCurrentMonthQuery.data]
  )
  const totalUsageSummary = useMemo(
    () => buildUsageSummary(aiUsersQuery.data),
    [aiUsersQuery.data]
  )

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
        throw new Error("Khong lay duoc duong dan OAuth.")
      }

      window.location.href = response.authUrl
    } catch (error) {
      setActionError(getErrorMessage(error, "Ket noi Gmail that bai."))
    }
  }

  const handleSync = async () => {
    try {
      setActionError(null)
      setActionMessage(null)
      await triggerSyncMutation.mutateAsync()
      setActionMessage("Da gui yeu cau dong bo. He thong dang cap nhat trang thai.")
    } catch (error) {
      setActionError(getErrorMessage(error, "Khong the bat dau dong bo email."))
    }
  }

  const handleSyncDirect = async () => {
    try {
      setActionError(null)
      setActionMessage(null)
      await triggerSyncDirectMutation.mutateAsync()
      setActionMessage("Da chay dong bo truc tiep thanh cong.")
    } catch (error) {
      setActionError(getErrorMessage(error, "Khong the chay dong bo truc tiep."))
    }
  }

  const handleSavePrompt = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Cau hinh He thong</h1>

      <div
        id="tour-settings-gmail"
        className="rounded-xl border border-blue-200 bg-white p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">Tai khoan Gmail</h2>
        </div>

        {searchParams.get("connected") === "1" && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" /> Ket noi Gmail thanh cong.
          </div>
        )}

        {accountsError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {getErrorMessage(accountsError, "Khong tai duoc danh sach tai khoan.")}
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
          <p className="text-sm text-blue-700">Dang tai tai khoan...</p>
        ) : activeAccount ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" /> Da ket noi: {activeAccount.emailAddress}
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 text-sm text-blue-700">
              <p className="font-medium">Trang thai dong bo: {syncStatus || "idle"}</p>
              <p className="mt-1 text-xs text-blue-600">
                Da dong bo: {syncStatusQuery.data?.syncedMessages ?? 0} /{" "}
                {syncStatusQuery.data?.totalMessages ?? 0}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSync}
                disabled={currentlySyncing}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", currentlySyncing && "animate-spin")} />
                {currentlySyncing ? "Dang dong bo..." : "Dong bo ngay"}
              </button>
              <button
                onClick={handleSyncDirect}
                disabled={currentlySyncing}
                className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={cn("h-4 w-4", triggerSyncDirectMutation.isPending && "animate-spin")}
                />
                {triggerSyncDirectMutation.isPending ? "Dang sync direct..." : "Sync direct"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnectGmail}
            disabled={oauthMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {oauthMutation.isPending ? "Dang tao link OAuth..." : "Ket noi tai khoan Gmail"}
          </button>
        )}
      </div>

      <div
        id="tour-settings-ai"
        className="rounded-xl border border-blue-200 bg-white p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-blue-900">AI / Rule Engine</h2>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-blue-700">
            Prompt boc tach mac dinh
          </label>
          <textarea
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-blue-50/50 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-blue-700">
            Pattern loc tieu de (Regex)
          </label>
          <input
            type="text"
            defaultValue="(invoice|shipping|logistics|freight|cargo)"
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-blue-50/50 focus:bg-white transition-colors"
          />
          <p className="mt-1 text-xs text-blue-500">
            Chi xu ly email co tieu de khop voi pattern nay
          </p>
        </div>

        <button
          onClick={handleSavePrompt}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {saved ? <CheckCircle className="h-4 w-4" /> : "Luu cau hinh"}
          {saved && " Da luu"}
        </button>

        <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-blue-900">OpenAI Usage</p>
          </div>

          {(aiUsersCurrentMonthQuery.isPending || aiUsersQuery.isPending) && (
            <p className="text-sm text-blue-700">Dang tai usage...</p>
          )}

          {(aiUsersCurrentMonthQuery.error || aiUsersQuery.error) && (
            <p className="text-sm text-red-700">
              {getErrorMessage(
                aiUsersCurrentMonthQuery.error || aiUsersQuery.error,
                "Khong tai duoc OpenAI usage."
              )}
            </p>
          )}

          {!aiUsersCurrentMonthQuery.isPending &&
            !aiUsersQuery.isPending &&
            !aiUsersCurrentMonthQuery.error &&
            !aiUsersQuery.error && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-blue-100 bg-white p-3">
                  <p className="text-xs text-blue-600">Requests thang nay</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {monthUsageSummary.totalRequests.toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-white p-3">
                  <p className="text-xs text-blue-600">Tokens thang nay</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {monthUsageSummary.totalTokens.toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-white p-3">
                  <p className="text-xs text-blue-600">Cost thang nay (USD)</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {monthUsageSummary.totalCost.toLocaleString("en-US", {
                      maximumFractionDigits: 4,
                    })}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-white p-3">
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Users className="h-3 w-3" />
                    User co usage (all-time)
                  </div>
                  <p className="text-lg font-semibold text-blue-900">
                    {totalUsageSummary.activeUsers.toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-blue-700">Dang tai...</div>}>
      <SettingsContent />
    </Suspense>
  )
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
