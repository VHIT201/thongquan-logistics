# Logistics Platform – Source Export

Generated: 2026-05-27T02:42:08.293Z

---

## File: `AGENTS.md`

```md
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

Luôn trả lời bằng tiếng Việt
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

```

---

## File: `app\(app)\admin\logs\page.tsx`

```tsx
"use client"

import { useState } from "react"
import { AlertTriangle, Info, XCircle, Filter } from "lucide-react"
import dayjs from "dayjs"

const allLogs = [
  { id: "1", level: "error" as const, source: "sync", message: "Gmail sync failed: rate limit exceeded", details: "Account: logistics@company.com", createdAt: "2026-05-22T10:30:00Z" },
  { id: "2", level: "warning" as const, source: "ai", message: "AI extraction confidence low (45%)", details: "Email ID: 550e8400-e29b", createdAt: "2026-05-22T09:15:00Z" },
  { id: "3", level: "info" as const, source: "import", message: "Successfully imported 25 records", details: "File: report_may.xlsx", createdAt: "2026-05-21T16:00:00Z" },
  { id: "4", level: "error" as const, source: "import", message: "Import failed: invalid row 12", details: "Missing required field 'amount'", createdAt: "2026-05-21T15:45:00Z" },
]

export default function LogsPage() {
  const [filterLevel, setFilterLevel] = useState<string>("all")

  const filtered = filterLevel === "all" ? allLogs : allLogs.filter((l) => l.level === filterLevel)

  const levelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const levelBadge = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-700"
      case "warning":
        return "bg-amber-100 text-amber-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Logs & Lỗi</h1>
        <div id="tour-logs-filter" className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-500" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-blue-50/50 focus:bg-white transition-colors"
          >
            <option value="all">Tất cả</option>
            <option value="error">Lỗi</option>
            <option value="warning">Cảnh báo</option>
            <option value="info">Thông tin</option>
          </select>
        </div>
      </div>

      <div id="tour-logs-table" className="rounded-xl border border-blue-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Level</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Nguồn</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Thông báo</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Chi tiết</th>
              <th className="px-4 py-3 text-left font-medium text-blue-700">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {levelIcon(log.level)}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelBadge(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-blue-700 font-medium">{log.source}</td>
                <td className="px-4 py-3 text-blue-900">{log.message}</td>
                <td className="px-4 py-3 text-blue-600 text-xs">{log.details}</td>
                <td className="px-4 py-3 text-blue-600 whitespace-nowrap">
                  {dayjs(log.createdAt).format("DD/MM/YYYY HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\admin\page.tsx`

```tsx
"use client"

import Link from "next/link"
import {
  Users,
  Settings,
  FileText,
  Shield,
  TrendingUp,
  AlertTriangle,
  Activity,
  FileCode,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const adminCards = [
  {
    href: "/admin/users",
    title: "Quản lý tài khoản",
    description: "Thêm, sửa, xóa tài khoản người dùng và phân quyền",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary-50",
    count: "3 tài khoản",
  },
  {
    href: "/admin/settings",
    title: "Cấu hình hệ thống",
    description: "Cài đặt đồng bộ email, AI extraction, thông báo",
    icon: Settings,
    color: "text-green-600",
    bg: "bg-green-50",
    count: "12 cấu hình",
  },
  {
    href: "/admin/logs",
    title: "Logs & lỗi",
    description: "Nhật ký hoạt động, lỗi và cảnh báo hệ thống",
    icon: FileText,
    color: "text-amber-600",
    bg: "bg-amber-50",
    count: "4 bản ghi",
  },
  {
    href: "/admin/templates",
    title: "Template email",
    description: "Quản lý mẫu bóc tách email, expected fields và điều kiện nhận diện",
    icon: FileCode,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    count: "Template CRUD",
  },
]

const systemStats = [
  { label: "Tổng người dùng", value: "3", icon: Users, color: "text-primary", bg: "bg-primary-50" },
  { label: "Admin", value: "1", icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Nhân viên", value: "2", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
  { label: "Cảnh báo", value: "2", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-300">Admin tổng</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {systemStats.map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">{stat.label}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-300">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full cursor-pointer border-neutral-100 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    <CardDescription className="text-xs">{card.count}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-200">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Hoạt động gần đây
          </CardTitle>
          <CardDescription>Các thao tác quản trị mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Tạo tài khoản", target: "staff2@company.com", time: "20/04/2026", user: "Admin" },
              { action: "Cập nhật cấu hình", target: "Gmail sync", time: "19/04/2026", user: "Admin" },
              { action: "Đăng nhập hệ thống", target: "—", time: "22/05/2026 10:30", user: "Admin" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium text-neutral-300">{item.action}</p>
                    <p className="text-xs text-neutral-200">{item.target}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-200">{item.time}</p>
                  <p className="text-xs text-neutral-200">{item.user}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

```

---

## File: `app\(app)\admin\settings\page.tsx`

```tsx
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

```

---

## File: `app\(app)\admin\templates\page.tsx`

```tsx
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { toast } from "sonner"
import {
  useCreateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
  useEmailTemplatesQuery,
  useUpdateEmailTemplateMutation,
} from "@/hooks/use-mail-queries"

type TemplateFormState = {
  templateCode: string
  templateName: string
  description: string
  subjectPattern: string
  bodyPattern: string
  expectedFieldsJson: string
  documentTypesCsv: string
  isActive: boolean
}

const emptyForm: TemplateFormState = {
  templateCode: "",
  templateName: "",
  description: "",
  subjectPattern: "",
  bodyPattern: "",
  expectedFieldsJson: "{}",
  documentTypesCsv: "",
  isActive: true,
}

export default function AdminTemplatesPage() {
  const templatesQuery = useEmailTemplatesQuery()
  const createTemplateMutation = useCreateEmailTemplateMutation()
  const deleteTemplateMutation = useDeleteEmailTemplateMutation()

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [formState, setFormState] = useState<TemplateFormState>(emptyForm)
  const [message, setMessage] = useState<string | null>(null)
  const updateTemplateMutation = useUpdateEmailTemplateMutation(editingTemplateId)

  const templates = templatesQuery.data ?? []
  const isSaving = createTemplateMutation.isPending || updateTemplateMutation.isPending

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort((first, second) => {
        const firstTime = new Date(first.updatedAt ?? first.createdAt ?? 0).getTime()
        const secondTime = new Date(second.updatedAt ?? second.createdAt ?? 0).getTime()
        return secondTime - firstTime
      }),
    [templates]
  )

  const parseExpectedFields = () => {
    try {
      const parsed = JSON.parse(formState.expectedFieldsJson || "{}")
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Expected fields phải là object JSON.")
      }
      return parsed as Record<string, string>
    } catch {
      throw new Error("Expected fields JSON không hợp lệ.")
    }
  }

  const resetForm = () => {
    setEditingTemplateId(null)
    setFormState(emptyForm)
  }

  const handleSubmit = async () => {
    try {
      const expectedFields = parseExpectedFields()
      const documentTypes = formState.documentTypesCsv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      if (editingTemplateId) {
        await updateTemplateMutation.mutateAsync({
          templateName: formState.templateName,
          description: formState.description,
          subjectPattern: formState.subjectPattern,
          bodyPattern: formState.bodyPattern,
          expectedFields,
          documentTypes,
          isActive: formState.isActive,
        })
        toast.success("Đã cập nhật template.")
      } else {
        await createTemplateMutation.mutateAsync({
          templateCode: formState.templateCode,
          templateName: formState.templateName,
          description: formState.description,
          subjectPattern: formState.subjectPattern,
          bodyPattern: formState.bodyPattern,
          expectedFields,
          documentTypes,
        })
        toast.success("Đã tạo template mới.")
      }
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không lưu được template."))
    }
  }

  const handleEdit = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId)
    if (!template) return
    setEditingTemplateId(template.id || null)
    setFormState({
      templateCode: template.templateCode || "",
      templateName: template.templateName || "",
      description: template.description || "",
      subjectPattern: template.subjectPattern || "",
      bodyPattern: template.bodyPattern || "",
      expectedFieldsJson: JSON.stringify(template.expectedFields ?? {}, null, 2),
      documentTypesCsv: (template.documentTypes ?? []).join(", "),
      isActive: Boolean(template.isActive),
    })
  }

  const handleDelete = async (templateId: string) => {
    const confirmed = window.confirm("Xóa template này?")
    if (!confirmed) return
    try {
      await deleteTemplateMutation.mutateAsync(templateId)
      if (editingTemplateId === templateId) {
        resetForm()
      }
      toast.success("Đã xóa template.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa template thất bại."))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại Admin
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-neutral-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-neutral-300">
              {editingTemplateId ? "Cập nhật template" : "Tạo template"}
            </h1>
            {editingTemplateId && (
              <button
                onClick={resetForm}
                className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Template code"
              value={formState.templateCode}
              onChange={(event) => setFormState((state) => ({ ...state, templateCode: event.target.value }))}
              disabled={Boolean(editingTemplateId)}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50"
            />
            <input
              type="text"
              placeholder="Template name"
              value={formState.templateName}
              onChange={(event) => setFormState((state) => ({ ...state, templateName: event.target.value }))}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Subject pattern"
              value={formState.subjectPattern}
              onChange={(event) => setFormState((state) => ({ ...state, subjectPattern: event.target.value }))}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Description"
              value={formState.description}
              onChange={(event) => setFormState((state) => ({ ...state, description: event.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Body pattern"
              value={formState.bodyPattern}
              onChange={(event) => setFormState((state) => ({ ...state, bodyPattern: event.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder='Expected fields JSON, ví dụ {"invoiceNumber":"Mã hóa đơn"}'
              value={formState.expectedFieldsJson}
              onChange={(event) => setFormState((state) => ({ ...state, expectedFieldsJson: event.target.value }))}
              rows={5}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 font-mono text-xs text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Document types (csv) ví dụ invoice,receipt"
              value={formState.documentTypesCsv}
              onChange={(event) => setFormState((state) => ({ ...state, documentTypesCsv: event.target.value }))}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <label className="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) => setFormState((state) => ({ ...state, isActive: event.target.checked }))}
                disabled={!editingTemplateId}
              />
              Kích hoạt template
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingTemplateId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSaving ? "Đang lưu..." : editingTemplateId ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-neutral-300">Danh sách template</h2>
          {templatesQuery.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {getErrorMessage(templatesQuery.error, "Không tải được template.")}
            </div>
          )}
          {templatesQuery.isPending && (
            <p className="text-sm text-neutral-200">Đang tải template...</p>
          )}
          {!templatesQuery.isPending && sortedTemplates.length === 0 && (
            <p className="text-sm text-neutral-200">Chưa có template nào.</p>
          )}

          <div className="space-y-2">
            {sortedTemplates.map((template) => (
              <div
                key={template.id}
                className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-300">
                    {template.templateCode} - {template.templateName}
                  </p>
                  <p className="text-xs text-neutral-200">
                    Cập nhật:{" "}
                    {template.updatedAt
                      ? dayjs(template.updatedAt).format("DD/MM/YYYY HH:mm")
                      : "N/A"}
                    {" · "}
                    {template.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(template.id || "")}
                    className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(template.id || "")}
                    disabled={deleteTemplateMutation.isPending}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3 w-3" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\admin\users\page.tsx`

```tsx
"use client"

import { useState } from "react"
import {
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  XCircle,
} from "lucide-react"
import dayjs from "dayjs"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserRolesMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useResetUserPasswordMutation,
  type UserDto,
} from "@/hooks/use-user-queries"

const ALL_ROLES = ["admin", "user", "viewer", "editor"]

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)

  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<UserDto | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formFullName, setFormFullName] = useState("")
  const [formRoles, setFormRoles] = useState<string[]>(["viewer"])
  const [formIsActive, setFormIsActive] = useState(true)
  const [showFormPassword, setShowFormPassword] = useState(false)

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserDto | null>(null)

  const filtersParts: string[] = []
  if (search.trim()) {
    filtersParts.push(`email@=${search.trim()},fullName@=${search.trim()}`)
  }
  if (statusFilter === "active") filtersParts.push("isActive==true")
  if (statusFilter === "inactive") filtersParts.push("isActive==false")
  if (roleFilter !== "all") filtersParts.push(`role==${roleFilter}`)

  const params = {
    filters: filtersParts.join(",") || undefined,
    page,
    pageSize,
    sortField: "CreatedAtUtc",
    sortOrder: "desc",
  }

  const usersQuery = useUsersQuery(params)
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()
  const updateRolesMutation = useUpdateUserRolesMutation()
  const updateStatusMutation = useUpdateUserStatusMutation()
  const deleteMutation = useDeleteUserMutation()
  const restoreMutation = useRestoreUserMutation()
  const resetPasswordMutation = useResetUserPasswordMutation()

  const listData = usersQuery.data
  const users = listData?.data ?? []
  const pagination = listData?.meta?.pagination

  const openCreate = () => {
    setModalMode("create")
    setSelectedUser(null)
    setFormEmail("")
    setFormPassword("")
    setFormFullName("")
    setFormRoles(["viewer"])
    setFormIsActive(true)
    setModalOpen(true)
  }

  const openEdit = (user: UserDto) => {
    setModalMode("edit")
    setSelectedUser(user)
    setFormEmail(user.email)
    setFormPassword("")
    setFormFullName(user.fullName)
    setFormRoles(user.roles)
    setFormIsActive(user.isActive)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({
          email: formEmail,
          password: formPassword,
          fullName: formFullName,
          roles: formRoles,
        })
        toast.success("Tạo tài khoản thành công.")
      } else if (selectedUser) {
        await updateMutation.mutateAsync({
          id: selectedUser.id,
          payload: { fullName: formFullName },
        })
        await updateRolesMutation.mutateAsync({
          id: selectedUser.id,
          payload: { roles: formRoles },
        })
        toast.success("Cập nhật tài khoản thành công.")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Thao tác thất bại."))
    }
  }

  const handleToggleStatus = async (user: UserDto) => {
    try {
      await updateStatusMutation.mutateAsync({ id: user.id, isActive: !user.isActive })
      toast.success(`${!user.isActive ? "Kích hoạt" : "Vô hiệu hóa"} tài khoản thành công.`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật trạng thái thất bại."))
    }
  }

  const openDeleteConfirm = (user: UserDto) => {
    setConfirmDeleteUser(user)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!confirmDeleteUser) return
    try {
      await deleteMutation.mutateAsync(confirmDeleteUser.id)
      toast.success("Đã xóa tài khoản.")
      setConfirmDeleteOpen(false)
      setConfirmDeleteUser(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Xóa tài khoản thất bại."))
    }
  }

  const handleRestore = async (user: UserDto) => {
    try {
      await restoreMutation.mutateAsync(user.id)
      toast.success("Khôi phục tài khoản thành công.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Khôi phục thất bại."))
    }
  }

  const openResetPassword = (user: UserDto) => {
    setResetPasswordUser(user)
    setNewPassword("")
    setResetPasswordOpen(true)
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return
    try {
      await resetPasswordMutation.mutateAsync({
        id: resetPasswordUser.id,
        payload: { newPassword },
      })
      toast.success("Reset mật khẩu thành công.")
      setResetPasswordOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Reset mật khẩu thất bại."))
    }
  }

  const toggleRole = (role: string) => {
    setFormRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateRolesMutation.isPending ||
    updateStatusMutation.isPending ||
    deleteMutation.isPending ||
    restoreMutation.isPending ||
    resetPasswordMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý Tài khoản</h1>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" /> Tạo tài khoản
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm theo email hoặc tên..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any)
            setPage(1)
          }}
          className="h-10 rounded-lg border border-neutral-100 bg-white px-3 text-sm text-neutral-300 focus:border-primary focus:outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(1)
          }}
          className="h-10 rounded-lg border border-neutral-100 bg-white px-3 text-sm text-neutral-300 focus:border-primary focus:outline-none"
        >
          <option value="all">Tất cả vai trò</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Email</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Họ tên</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Vai trò</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Ngày tạo</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {usersQuery.isPending && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải...</p>
                  </td>
                </tr>
              )}
              {!usersQuery.isPending && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    Không có tài khoản nào.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-neutral-300">{user.email}</td>
                  <td className="px-4 py-3 text-neutral-300">{user.fullName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className={
                            role === "admin"
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : role === "user"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                          }
                        >
                          {role === "admin" && <Shield className="mr-1 h-3 w-3" />}
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle className="h-3 w-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        <XCircle className="h-3 w-3" /> Không hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {user.createdAtUtc
                      ? dayjs(user.createdAtUtc).format("DD/MM/YYYY HH:mm")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        title="Sửa"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                      >
                        {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openResetPassword(user)}
                        title="Reset mật khẩu"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-amber-600"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(user)}
                        title="Xóa"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600"
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-200">
            Trang {pagination.page} / {pagination.totalPages} · {pagination.totalItems} tài khoản
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPreviousPage}
              className="rounded-lg border border-neutral-100 bg-white px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNextPage}
              className="rounded-lg border border-neutral-100 bg-white px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black">
              {modalMode === "create" ? "Tạo tài khoản mới" : "Cập nhật tài khoản"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-neutral-300">Email</Label>
              <Input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                disabled={modalMode === "edit"}
                placeholder="user@example.com"
                className="text-neutral-300"
              />
            </div>
            {modalMode === "create" && (
              <div className="space-y-1">
                <Label className="text-neutral-300">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    type={showFormPassword ? "text" : "password"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự..."
                    className="pr-10 text-neutral-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300"
                  >
                    {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-neutral-300">Họ và tên</Label>
              <Input
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300">Vai trò</Label>
              <div className="flex flex-wrap gap-3">
                {ALL_ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm text-neutral-300">
                    <input
                      type="checkbox"
                      checked={formRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <Label className="mb-0 text-neutral-300">Kích hoạt tài khoản</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isMutating}>
                {isMutating ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                {modalMode === "create" ? "Tạo" : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-black">Reset mật khẩu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-neutral-200">
              Tài khoản: <strong className="text-neutral-300">{resetPasswordUser?.email}</strong>
            </p>
            <div className="space-y-1">
              <Label className="text-neutral-300">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="pr-10 text-neutral-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleResetPassword} disabled={isMutating || !newPassword}>
                {isMutating ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                Xác nhận
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-black">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-neutral-200">
              Bạn có chắc muốn xóa tài khoản{" "}
              <strong className="text-neutral-300">{confirmDeleteUser?.email}</strong>?<br />
              Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                Xóa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

```

---

## File: `app\(app)\analysis-results\page.tsx`

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { useAnalysisResultsQuery } from "@/hooks/use-mail-queries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search, ThumbsUp, ThumbsDown, Eye, ChevronLeft, ChevronRight } from "lucide-react"

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "notStarted", label: "Chưa bắt đầu" },
  { value: "processing", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn thành" },
  { value: "pendingReview", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "failed", label: "Thất bại" },
]

const categoryOptions = [
  { value: "all", label: "Tất cả category" },
  { value: "businessDocument", label: "Business Document" },
  { value: "orderRequest", label: "Order Request" },
  { value: "supportRequest", label: "Support Request" },
  { value: "notification", label: "Notification" },
  { value: "systemMail", label: "System Mail" },
  { value: "spam", label: "Spam" },
  { value: "unknown", label: "Unknown" },
]

const statusLabelMap: Record<string, string> = {
  notStarted: "Chưa bắt đầu",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  pendingReview: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  failed: "Thất bại",
}

const statusColorMap: Record<string, string> = {
  notStarted: "bg-gray-50 text-gray-700",
  processing: "bg-blue-50 text-blue-700",
  completed: "bg-blue-50 text-blue-700",
  pendingReview: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  failed: "bg-red-50 text-red-700",
}

export default function AnalysisResultsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const analysisQuery = useAnalysisResultsQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    page,
    pageSize,
  })

  const results = analysisQuery.data ?? []

  const visibleResults = search.trim()
    ? results.filter((item) =>
        item.mailMessageId?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase())
      )
    : results

  const totalItems = visibleResults.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const visiblePageNumbers = pageNumbers.filter((pageNumber) => {
    if (totalPages <= 7) return true
    if (pageNumber <= 2 || pageNumber > totalPages - 2) return true
    if (Math.abs(pageNumber - page) <= 1) return true
    return false
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Kết quả phân tích AI</h1>
      </div>

      {analysisQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(analysisQuery.error, "Không tải được kết quả phân tích.")}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-100" />
          <input
            type="text"
            placeholder="Tìm kiếm theo message ID, category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-neutral-100 bg-white py-2 pl-9 pr-4 text-sm text-neutral-800 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
          <Filter className="h-4 w-4 text-neutral-200" />
          <Select
            value={statusFilter}
            onValueChange={(value: string) => {
              setStatusFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[170px] text-neutral-800">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(value: string) => {
              setCategoryFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[190px] text-neutral-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Email ID</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Category</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Intent</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Độ tin cậy</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Thời gian</th>
                <th className="px-4 py-3 text-right font-medium text-white/80">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {analysisQuery.isPending && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-200">
                    Đang tải...
                  </td>
                </tr>
              )}

              {!analysisQuery.isPending && visibleResults.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-200">
                    Không tìm thấy kết quả nào
                  </td>
                </tr>
              )}

              {visibleResults.map((result) => {
                const status = result.status ?? "notStarted"
                const statusClass = statusColorMap[status] ?? "bg-gray-50 text-gray-700"
                const confidence = result.confidenceScore ?? 0
                return (
                  <tr key={result.id} className="cursor-pointer transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-neutral-300">{result.mailMessageId || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-200 capitalize">{result.category || "—"}</td>
                    <td className="px-4 py-3 text-neutral-200 capitalize">{result.detectedIntent || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.round(confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-200">{Math.round(confidence * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                        {statusLabelMap[status] || status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">
                      {result.createdAt ? dayjs(result.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {result.mailMessageId && (
                          <Link
                            href={`/emails/${result.mailMessageId}/extract`}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                          >
                            <Eye className="h-3 w-3" /> Xem
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {analysisQuery.isPending && (
            <div className="px-4 py-8 text-center text-sm text-neutral-200">Đang tải...</div>
          )}

          {!analysisQuery.isPending && visibleResults.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-neutral-200">Không tìm thấy kết quả nào</div>
          )}

          {visibleResults.map((result) => {
            const status = result.status ?? "notStarted"
            const statusClass = statusColorMap[status] ?? "bg-gray-50 text-gray-700"
            const confidence = result.confidenceScore ?? 0
            return (
              <div key={result.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="wrap-break-word text-sm font-medium text-neutral-300">
                    {result.mailMessageId || "—"}
                  </p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                    {statusLabelMap[status] || status}
                  </span>
                </div>
                <p className="text-xs text-neutral-200 capitalize">
                  {result.category || "—"} · {result.detectedIntent || "—"}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(confidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-200">{Math.round(confidence * 100)}%</span>
                </div>
                <p className="text-xs text-neutral-200">
                  {result.createdAt ? dayjs(result.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                </p>
                {result.mailMessageId && (
                  <Link
                    href={`/emails/${result.mailMessageId}/extract`}
                    className="inline-flex cursor-pointer items-center rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    <Eye className="h-3 w-3" /> Xem
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-200 sm:text-sm">
            Trang <span className="font-medium text-neutral-300">{page}</span> /{" "}
            <span className="font-medium text-neutral-300">{totalPages}</span> · Tổng{" "}
            <span className="font-medium text-neutral-300">{totalItems}</span> kết quả
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setPage((previousPage) => Math.max(1, previousPage - 1))}
              disabled={page === 1}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {visiblePageNumbers.map((pageNumber, index) => {
              const previousPageNumber = visiblePageNumbers[index - 1]
              const shouldShowGap = previousPageNumber && pageNumber - previousPageNumber > 1
              return (
                <div key={pageNumber} className="flex items-center gap-1">
                  {shouldShowGap ? <span className="px-1 text-neutral-200">…</span> : null}
                  <button
                    onClick={() => setPage(pageNumber)}
                    className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                      pageNumber === page
                        ? "bg-primary text-white"
                        : "border border-neutral-100 bg-white text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                </div>
              )
            })}
            <button
              onClick={() => setPage((previousPage) => Math.min(totalPages, previousPage + 1))}
              disabled={page === totalPages}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\emails\page.tsx`

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Loader,
  Mail,
  Paperclip,
  Search,
} from "lucide-react"
import dayjs from "dayjs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getErrorMessage } from "@/lib/get-error-message"
import { useMailAccountsQuery, useMailMessagesQuery } from "@/hooks/use-mail-queries"

const ITEMS_PER_PAGE = 10

export default function EmailsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [senderFilter, setSenderFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState("sentAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const { data: accounts = [], isPending: accountsPending } = useMailAccountsQuery()
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (accounts.length > 0 && !activeAccountId) {
      setActiveAccountId(accounts[0].id)
    }
  }, [accounts, activeAccountId])

  const processStatusFilter =
    statusFilter !== "all" && statusFilter !== "hasAttachment" ? statusFilter : undefined

  const mailQuery = useMailMessagesQuery({
    accountId: activeAccountId,
    page,
    pageSize: ITEMS_PER_PAGE,
    hasAttachment: statusFilter === "hasAttachment" ? true : undefined,
    processStatus: processStatusFilter,
    sortField,
    sortOrder,
  })

  const pagedEmails = mailQuery.data?.data ?? []
  const pagination = mailQuery.data?.meta?.pagination
  const totalPages = Math.max(1, pagination?.totalPages ?? 1)
  const totalItems = pagination?.totalItems ?? pagedEmails.length

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const allSenders = useMemo(
    () => [...new Set(pagedEmails.map((email) => email.fromName).filter(Boolean) as string[])].sort(),
    [pagedEmails]
  )

  const visibleEmails = useMemo(() => {
    return pagedEmails.filter((email) => {
      const subject = email.subject || ""
      const senderEmail = email.fromEmail || ""
      const senderName = email.fromName || ""

      const keyword = search.toLowerCase()
      const matchSearch =
        subject.toLowerCase().includes(keyword) ||
        senderEmail.toLowerCase().includes(keyword) ||
        senderName.toLowerCase().includes(keyword)

      if (!matchSearch) return false
      if (senderFilter !== "all" && senderName !== senderFilter) {
        return false
      }
      return true
    })
  }, [pagedEmails, search, senderFilter])

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
    const pages = new Set([1, totalPages, page - 1, page, page + 1])
    return Array.from(pages)
      .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
      .sort((firstPage, secondPage) => firstPage - secondPage)
  }, [page, totalPages])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Danh sách Email</h1>
      </div>

      {mailQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(mailQuery.error, "Không tải được danh sách email.")}
        </div>
      )}

      {!accountsPending && !activeAccountId && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Chưa có mail account khả dụng. Kết nối account trước để tải email.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div id="tour-emails-search" className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-100" />
          <input
            type="text"
            placeholder="Tìm kiếm email, người gửi..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-neutral-100 bg-white py-2 pl-9 pr-4 text-sm text-neutral-800 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div id="tour-emails-filter" className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
          <Select
            value={activeAccountId || ""}
            onValueChange={(value: string) => {
              setActiveAccountId(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[220px] text-neutral-800">
              <SelectValue placeholder="Chọn tài khoản" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id || ""}>
                  {account.emailAddress || account.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Filter className="h-4 w-4 text-neutral-200" />
          <Select
            value={statusFilter}
            onValueChange={(value: string) => {
              setStatusFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[170px] text-neutral-800">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="unprocessed">Chưa xử lý</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="processed">Đã xử lý</SelectItem>
              <SelectItem value="hasAttachment">Có đính kèm</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={senderFilter}
            onValueChange={(value: string) => {
              setSenderFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[180px] text-neutral-800">
              <SelectValue placeholder="Người gửi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả người gửi</SelectItem>
              {allSenders.map((senderName) => (
                <SelectItem key={senderName} value={senderName}>
                  {senderName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => {
              setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              setPage(1)
            }}
            title={`Sắp xếp: ${sortOrder === "desc" ? "mới nhất trước" : "cũ nhất trước"}`}
            className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-neutral-100 bg-white px-3 text-sm text-neutral-300 transition-colors hover:bg-neutral-50"
          >
            {sortOrder === "desc" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
            <span className="hidden sm:inline">{sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}</span>
          </button>
        </div>
      </div>

      <div id="tour-emails-table" className="overflow-hidden rounded-xl border border-neutral-100 bg-white">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Tiêu đề</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Người gửi</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Nhận lúc</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Đính kèm</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {(accountsPending || mailQuery.isPending) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    Đang tải email...
                  </td>
                </tr>
              )}

              {!accountsPending && !mailQuery.isPending && visibleEmails.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    Không tìm thấy email nào
                  </td>
                </tr>
              )}

              {visibleEmails.map((email) => {
                const status = email.processStatus
                const needsAttention = status === "unprocessed" || status === "processing"
                return (
                  <tr
                    key={email.id}
                    className={`cursor-pointer transition-colors hover:bg-neutral-50 ${
                      needsAttention ? "border-l-2 border-l-primary bg-primary-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className={`h-4 w-4 ${needsAttention ? "text-primary" : "text-neutral-200"}`} />
                        <span className="font-medium text-neutral-300">{email.subject || "(Không có tiêu đề)"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">{email.fromName || email.fromEmail || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-200">
                      {email.receivedAt ? dayjs(email.receivedAt).format("DD/MM/YYYY HH:mm") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {status === "unprocessed" ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <Clock className="h-3 w-3" /> Chờ xử lý
                        </span>
                      ) : status === "processing" ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                          <Loader className="h-3 w-3" /> Đang xử lý
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          <AlertCircle className="h-3 w-3" /> Đã xử lý
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {email.hasAttachments ? (
                        <Paperclip className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-neutral-100">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/emails/${email.id}`}
                        className="inline-flex cursor-pointer items-center rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                      >
                        Xử lý
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-primary/15 md:hidden">
          {(accountsPending || mailQuery.isPending) && (
            <div className="px-4 py-8 text-center text-sm text-neutral-200">Đang tải email...</div>
          )}

          {!accountsPending && !mailQuery.isPending && visibleEmails.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-neutral-200">Không tìm thấy email nào</div>
          )}

          {visibleEmails.map((email) => {
            const status = email.processStatus
            const needsAttention = status === "unprocessed" || status === "processing"
            return (
              <div key={email.id} className={`space-y-2 p-4 ${needsAttention ? "bg-primary-50/30" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="wrap-break-word text-sm font-medium text-neutral-300">
                    {email.subject || "(Không có tiêu đề)"}
                  </p>
                  {email.hasAttachments ? <Paperclip className="h-4 w-4 shrink-0 text-primary" /> : null}
                </div>
                <p className="text-xs text-neutral-200">{email.fromName || email.fromEmail || "—"}</p>
                <p className="text-xs text-neutral-200">
                  {email.receivedAt ? dayjs(email.receivedAt).format("DD/MM/YYYY HH:mm") : "—"}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    {status === "unprocessed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <Clock className="h-3 w-3" /> Chờ xử lý
                      </span>
                    ) : status === "processing" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                        <Loader className="h-3 w-3" /> Đang xử lý
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        <AlertCircle className="h-3 w-3" /> Đã xử lý
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/emails/${email.id}`}
                    className="inline-flex cursor-pointer items-center rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    Xử lý
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-200 sm:text-sm">
            Trang <span className="font-medium text-neutral-300">{page}</span> /{" "}
            <span className="font-medium text-neutral-300">{totalPages}</span> · Tổng{" "}
            <span className="font-medium text-neutral-300">{totalItems}</span> email
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setPage((previousPage) => Math.max(1, previousPage - 1))}
              disabled={!activeAccountId || page === 1}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {visiblePageNumbers.map((pageNumber, index) => {
              const previousPageNumber = visiblePageNumbers[index - 1]
              const shouldShowGap = previousPageNumber && pageNumber - previousPageNumber > 1
              return (
                <div key={pageNumber} className="flex items-center gap-1">
                  {shouldShowGap ? <span className="px-1 text-neutral-200">…</span> : null}
                  <button
                    onClick={() => setPage(pageNumber)}
                    className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                      pageNumber === page
                        ? "bg-primary text-white"
                        : "border border-neutral-100 bg-white text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                </div>
              )
            })}
            <button
              onClick={() => setPage((previousPage) => Math.min(totalPages, previousPage + 1))}
              disabled={!activeAccountId || page === totalPages}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\emails\[id]\extract\page.tsx`

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { AlertTriangle, ArrowLeft, CheckCircle, FileSpreadsheet, Save, ThumbsDown, ThumbsUp } from "lucide-react"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAnalysisResultQuery,
  useApproveAnalysisMutation,
  useLatestAnalysisByMessageIdQuery,
  useRejectAnalysisMutation,
  useUpdateAnalysisFieldsMutation,
} from "@/hooks/use-mail-queries"

export default function ExtractPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const messageId = params.id
  const analysisIdFromQuery = searchParams.get("analysisId")
  const latestAnalysisQuery = useLatestAnalysisByMessageIdQuery(analysisIdFromQuery ? null : messageId)
  const analysisId = analysisIdFromQuery ?? latestAnalysisQuery.data?.id ?? null

  const analysisQuery = useAnalysisResultQuery(analysisId)
  const updateFieldsMutation = useUpdateAnalysisFieldsMutation(analysisId)
  const approveMutation = useApproveAnalysisMutation(analysisId)
  const rejectMutation = useRejectAnalysisMutation(analysisId)

  const [fields, setFields] = useState<Record<string, string>>({})
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    const extractedFields = analysisQuery.data?.extractedFields ?? {}
    setFields(extractedFields)
  }, [analysisQuery.data?.extractedFields])

  const missingFields = useMemo(() => analysisQuery.data?.missingFields ?? [], [analysisQuery.data?.missingFields])
  const warnings = useMemo(() => analysisQuery.data?.warnings ?? [], [analysisQuery.data?.warnings])

  const handleFieldChange = (key: string, value: string) => {
    setFields((previousState) => ({ ...previousState, [key]: value }))
  }

  const handleSave = async () => {
    try {
      if (!analysisId) return
      setSaveMessage(null)
      await updateFieldsMutation.mutateAsync(fields)
      setSaveMessage("Đã lưu chỉnh sửa.")
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Lưu chỉnh sửa thất bại."))
    }
  }

  const handleApprove = async () => {
    try {
      if (!analysisId) return
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "admin-ui" : "admin-ui"
      await approveMutation.mutateAsync(userId)
      setSaveMessage("Đã duyệt kết quả bóc tách.")
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Duyệt kết quả thất bại."))
    }
  }

  const handleReject = async () => {
    try {
      if (!analysisId) return
      const reason = window.prompt("Lý do từ chối (có thể bỏ trống):") ?? ""
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "admin-ui" : "admin-ui"
      await rejectMutation.mutateAsync({ userId, reason: reason || undefined })
      setSaveMessage("Đã từ chối kết quả bóc tách.")
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Từ chối kết quả thất bại."))
    }
  }

  const handleExport = () => {
    const csv = Object.entries(fields)
      .map(([key, value]) => `${key},${value}`)
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `extract-${messageId}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (latestAnalysisQuery.isPending && !analysisIdFromQuery) {
    return <div className="text-sm text-neutral-200">Đang tìm kết quả phân tích gần nhất...</div>
  }

  if (!analysisId) {
    return (
      <div className="space-y-3">
        <Link href={`/emails/${messageId}`} className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại email
        </Link>
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Chưa có kết quả phân tích. Vui lòng bấm <strong>Gửi AI bóc tách</strong> từ màn chi tiết email.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/emails/${messageId}`} className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại email
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            disabled={updateFieldsMutation.isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {updateFieldsMutation.isPending ? "Đang lưu..." : "Lưu chỉnh sửa"}
          </button>
          <button
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsUp className="h-4 w-4" />
            {approveMutation.isPending ? "Đang duyệt..." : "Duyệt"}
          </button>
          <button
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsDown className="h-4 w-4" />
            {rejectMutation.isPending ? "Đang từ chối..." : "Từ chối"}
          </button>
          <button
            id="tour-extract-export"
            onClick={handleExport}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{saveMessage}</div>
      )}

      {analysisQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(analysisQuery.error, "Không tải được kết quả bóc tách.")}
        </div>
      )}

      <div id="tour-extract-result" className="space-y-4 rounded-xl border border-neutral-100 bg-white p-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-neutral-300">Kết quả bóc tách</h1>
          <span className="rounded-full bg-[#EDF3EC] px-2.5 py-0.5 text-xs font-medium text-[#346538]">
            {analysisQuery.data?.status || "pending"}
          </span>
        </div>

        {analysisQuery.isPending && <p className="text-sm text-neutral-200">Đang tải dữ liệu phân tích...</p>}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-200">Độ tin cậy AI:</span>
          <div className="h-2 w-32 rounded-full bg-neutral-50">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${Math.round((analysisQuery.data?.confidenceScore ?? 0) * 100)}%` }}
            />
          </div>
          <span className="font-medium">
            {Math.round((analysisQuery.data?.confidenceScore ?? 0) * 100)}%
          </span>
        </div>

        {missingFields.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Thiếu thông tin:</p>
              <p>{missingFields.join(", ")}</p>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Cảnh báo:</p>
              <ul className="list-inside list-disc">
                {warnings.map((warningText, index) => (
                  <li key={index}>{warningText}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div id="tour-extract-fields" className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-200">Dữ liệu trích xuất</h3>
          <div className="grid gap-3">
            {Object.keys(fields).length === 0 && (
              <p className="text-sm text-neutral-200">Chưa có trường dữ liệu để hiển thị.</p>
            )}
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} className="grid grid-cols-1 gap-2 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
                <label className="text-sm font-medium text-neutral-200">{key}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(event) => handleFieldChange(key, event.target.value)}
                  className="rounded-lg border border-neutral-100 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1 rounded-lg bg-neutral-50 p-4 text-xs text-neutral-200">
          <p>Model: {analysisQuery.data?.modelName || "N/A"}</p>
          <p>Input tokens: {analysisQuery.data?.inputTokenCount ?? 0}</p>
          <p>Output tokens: {analysisQuery.data?.outputTokenCount ?? 0}</p>
          <p>Chi phí ước tính: ${analysisQuery.data?.costEstimate ?? 0}</p>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\emails\[id]\page.tsx`

```tsx
"use client"

import { useMemo, useState } from "react"
import mammoth from "mammoth"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Paperclip, Send } from "lucide-react"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"
// API_BASE must match lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://vietprodev.duckdns.org/gateway/logistics/api/v1"
import { FileAttachmentItem } from "@/components/file-attachment-item"
import { AttachmentViewerModal } from "@/components/attachment-viewer-modal"
import { FileViewerModal } from "@/components/ui/file-viewer-modal"
import { ExtractionResultModal } from "@/components/extraction-result-modal"
import {
  useAttachmentContentQuery,
  useAttachmentExtractTextQuery,
  useDownloadAttachmentMutation,
  useMailMessageQuery,
  useProcessDocumentsMutation,
} from "@/hooks/use-mail-queries"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"

const mailApi = getLogisticsPlatformAPI()

export default function EmailDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const messageId = params.id

  const messageQuery = useMailMessageQuery(messageId)
  const processDocumentsMutation = useProcessDocumentsMutation()
  const downloadAttachmentMutation = useDownloadAttachmentMutation(messageId)

  const [contentMode, setContentMode] = useState<"auto" | "text" | "html">("auto")
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null)
  const [attachmentViewMode, setAttachmentViewMode] = useState<"extract" | "content">("extract")
  const [selectedForAI, setSelectedForAI] = useState<Set<string>>(new Set())

  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [fileViewerUrl, setFileViewerUrl] = useState("")
  const [fileViewerName, setFileViewerName] = useState("")
  const [fileViewerType, setFileViewerType] = useState("")

  const [extractionResultOpen, setExtractionResultOpen] = useState(false)
  const [extractionResult, setExtractionResult] = useState<string | null>(null)
  const [extractionPreviewUrl, setExtractionPreviewUrl] = useState<string | null>(null)
  const [extractionFileName, setExtractionFileName] = useState<string | null>(null)

  const emailData = messageQuery.data
  const attachments: {
    id: string
    fileName: string
    contentType?: string
    fileSize?: number
  }[] = emailData?.attachments ?? []
  const bodyText = emailData?.bodyText || ""
  const bodyHtml = emailData?.bodyHtml || ""

  const htmlContent = useMemo(() => {
    if (bodyHtml.trim()) return bodyHtml
    const trimmed = bodyText.trim()
    const looksLikeHtml =
      /^<!doctype html/i.test(trimmed) ||
      /^<html/i.test(trimmed) ||
      /<body[\s>]/i.test(trimmed) ||
      /<table[\s>]/i.test(trimmed) ||
      /<head[\s>]/i.test(trimmed)
    return looksLikeHtml ? trimmed : ""
  }, [bodyHtml, bodyText])

  const attachmentExtractTextQuery = useAttachmentExtractTextQuery(
    messageId,
    attachmentViewMode === "extract" ? selectedAttachmentId : null
  )
  const attachmentContentQuery = useAttachmentContentQuery(
    messageId,
    attachmentViewMode === "content" ? selectedAttachmentId : null
  )

  const handleSendToAI = async () => {
    if (selectedForAI.size === 0) {
      alert("Vui lòng chọn ít nhất một file đính kèm để gửi AI bóc tách.")
      return
    }

    try {
      // Fetch content for all selected attachments using authenticated axios
      const files = await Promise.all(
        Array.from(selectedForAI).map(async (attachmentId) => {
          const attachment = attachments.find((a) => a.id === attachmentId)
          if (!attachment) throw new Error(`Attachment ${attachmentId} not found`)

          // Get attachment content using authenticated axios instance
          const response = await MAIL_CONNECTOR_AXIOS.get(
            `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/content`
          )

          // Extract content from response - handle various response formats
          const responseData = response.data
          let content = ""
          if (typeof responseData === 'string') {
            content = responseData
          } else if (responseData?.data?.content) {
            content = responseData.data.content
          } else if (responseData?.content) {
            content = responseData.content
          } else if (responseData?.text) {
            content = responseData.text
          }

          // Extract text from DOCX if needed before sending to AI
          let aiContent = content
          const mimeType = attachment.contentType || "application/octet-stream"
          if (mimeType.includes("wordprocessingml") && content) {
            try {
              const byteCharacters = atob(content)
              const byteNumbers = new Array(byteCharacters.length)
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
              }
              const byteArray = new Uint8Array(byteNumbers)
              const arrayBuffer = byteArray.buffer
              const extractResult = await mammoth.extractRawText({ arrayBuffer })
              aiContent = extractResult.value
            } catch (e) {
              console.error("Error extracting text from DOCX:", e)
            }
          }

          return {
            fileName: attachment.fileName,
            content: aiContent,
            type: "text",
            mimeType: mimeType,
          }
        })
      )

      // Send to document processor
      const result = await processDocumentsMutation.mutateAsync(files)

      // Get presigned URL for preview
      const firstAttachmentId = Array.from(selectedForAI)[0]
      const firstAttachment = attachments.find((a) => a.id === firstAttachmentId)
      if (firstAttachment) {
        const presignedResponse = await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl(
          messageId,
          firstAttachmentId,
          { expiryMinutes: 30 }
        )
        const presignedData = (presignedResponse as unknown as { data?: { data?: { url?: string } } }).data
        const presignedUrl = presignedData?.data?.url || ""
        setExtractionPreviewUrl(presignedUrl)
        setExtractionFileName(firstAttachment.fileName)
      }

      // Open modal with result
      setExtractionResult(result?.result || null)
      setExtractionResultOpen(true)
    } catch (error) {
      alert(getErrorMessage(error, "Gửi AI bóc tách thất bại."))
    }
  }

  const handleShowAttachmentExtractText = (attachmentId: string | undefined) => {
    if (!attachmentId) return
    setAttachmentViewMode("extract")
    setSelectedAttachmentId(attachmentId)
  }

  const handleShowAttachmentContent = (attachmentId: string | undefined, fileName?: string, contentType?: string) => {
    if (!attachmentId) return
    const url = `${API_BASE}/mail-messages/${messageId}/attachments/${attachmentId}/download`
    setFileViewerUrl(url)
    setFileViewerName(fileName || "")
    setFileViewerType(contentType || "")
    setFileViewerOpen(true)
  }

  const handleDownloadAttachment = async (attachmentId: string | undefined, fileName?: string | null) => {
    if (!attachmentId) return
    try {
      await downloadAttachmentMutation.mutateAsync({ attachmentId, fileName })
    } catch (error) {
      alert(getErrorMessage(error, "Tải tệp thất bại."))
    }
  }

  if (messageQuery.isPending) {
    return <div className="text-sm text-neutral-200">Đang tải chi tiết email...</div>
  }

  if (messageQuery.error || !messageQuery.data) {
    return (
      <div className="space-y-3">
        <Link href="/emails" className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(messageQuery.error, "Không tải được chi tiết email.")}
        </div>
      </div>
    )
  }

  const shouldShowHtml = contentMode === "html" || (contentMode === "auto" && Boolean(htmlContent))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/emails" className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
      </div>

      <div className="flex gap-4">
        {/* Left — 70% Nội dung */}
        <div className="w-[70%] space-y-4 rounded-xl border border-neutral-100 bg-white p-6">
          <div id="tour-email-header" className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-neutral-300">{emailData?.subject || "(Không có tiêu đề)"}</h1>
              <p className="mt-1 text-sm text-neutral-200">
                Từ: {emailData?.fromName || "N/A"} ({emailData?.fromEmail || "N/A"})
              </p>
              <p className="text-sm text-neutral-200">
                Nhận lúc: {emailData?.receivedAt ? dayjs(emailData.receivedAt).format("DD/MM/YYYY HH:mm") : "—"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/emails/${messageId}/extract`}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50"
              >
                Trích xuất
              </Link>
              <button
                id="tour-email-ai-btn"
                onClick={handleSendToAI}
                disabled={processDocumentsMutation.isPending}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {processDocumentsMutation.isPending ? "Đang xử lý..." : `Gửi AI bóc tách${selectedForAI.size > 0 ? ` (${selectedForAI.size})` : ""}`}
              </button>
            </div>
          </div>

          <div id="tour-email-body" className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-200">Nội dung email</h3>
              {htmlContent && (
                <div className="flex items-center gap-1 rounded-md border border-neutral-100 bg-white p-1 text-xs">
                  <button
                    onClick={() => setContentMode("auto")}
                    className={`cursor-pointer rounded px-2 py-1 ${
                      contentMode === "auto" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setContentMode("text")}
                    className={`cursor-pointer rounded px-2 py-1 ${
                      contentMode === "text" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setContentMode("html")}
                    className={`cursor-pointer rounded px-2 py-1 ${
                      contentMode === "html" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    HTML
                  </button>
                </div>
              )}
            </div>

            {shouldShowHtml ? (
              <iframe
                title="email-html-content"
                srcDoc={htmlContent}
                sandbox="allow-popups allow-popups-to-escape-sandbox"
                className="h-[720px] w-full rounded border border-neutral-100 bg-white"
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm text-neutral-300">
                {bodyText || "Không có nội dung text."}
              </div>
            )}
          </div>
        </div>

        {/* Right — 30% File đính kèm */}
        {attachments.length > 0 && (
          <div className="w-[30%] min-w-0 overflow-hidden rounded-xl border border-neutral-100 bg-white p-3">
            <div id="tour-email-attachments">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-200">
                <Paperclip className="h-4 w-4" /> Tệp đính kèm ({attachments.length})
              </h3>
              <div className="grid gap-2 min-w-0">
                {attachments.map((attachment) => (
                  <FileAttachmentItem
                    key={attachment.id}
                    id={attachment.id}
                    fileName={attachment.fileName}
                    fileType={attachment.contentType?.split("/").pop() || "unknown"}
                    fileSize={attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : "N/A"}
                    isChecked={selectedForAI.has(attachment.id)}
                    onCheckChange={(checked) => {
                      const next = new Set(selectedForAI)
                      if (checked) next.add(attachment.id)
                      else next.delete(attachment.id)
                      setSelectedForAI(next)
                    }}
                    onViewExtract={() => handleShowAttachmentExtractText(attachment.id)}
                    onViewContent={() => handleShowAttachmentContent(attachment.id, attachment.fileName, attachment.contentType)}
                    onDownload={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                    status="completed"
                  />
                ))}
              </div>

              <AttachmentViewerModal
                open={!!selectedAttachmentId}
                onOpenChange={(open) => {
                  if (!open) setSelectedAttachmentId(null)
                }}
                title={attachmentViewMode === "extract" ? "Text trích xuất từ tệp" : "Nội dung tệp"}
                isLoading={attachmentExtractTextQuery.isPending || attachmentContentQuery.isPending}
                error={(attachmentExtractTextQuery.error || attachmentContentQuery.error) as Error | null}
                content={attachmentViewMode === "extract" ? (attachmentExtractTextQuery.data ?? null) : (attachmentContentQuery.data ?? null)}
              />

              <FileViewerModal
                open={fileViewerOpen}
                onOpenChange={setFileViewerOpen}
                fileUrl={fileViewerUrl}
                fileName={fileViewerName}
                fileType={fileViewerType}
              />

              <ExtractionResultModal
                open={extractionResultOpen}
                onOpenChange={setExtractionResultOpen}
                result={extractionResult}
                previewUrl={extractionPreviewUrl}
                fileName={extractionFileName}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\employees\page.tsx`

```tsx
import { redirect } from "next/navigation"

export default function EmployeesPage() {
  redirect("/employees/me")
}

```

---

## File: `app\(app)\employees\[employeeId]\page.tsx`

```tsx
"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Mail, Clock, CheckCircle, AlertTriangle, ArrowRight, TrendingUp, Package, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import dayjs from "dayjs"

const myStats = [
  { label: "Email được giao", value: 12, icon: Mail, color: "text-primary", bg: "bg-primary-50" },
  { label: "Đang xử lý", value: 3, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Đã hoàn tất", value: 8, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  { label: "Cần chú ý", value: 1, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
]

const myTasks = [
  { id: "1", subject: "Invoice #INV-001 - ABC Logistics", fromName: "ABC Logistics", deadline: "2026-05-23T17:00:00Z", priority: "high", status: "unprocessed" },
  { id: "3", subject: "Freight quote request", fromName: "Global Freight", deadline: "2026-05-23T12:00:00Z", priority: "medium", status: "processing" },
  { id: "6", subject: "Customs declaration #CD-1122", fromName: "Customs Dept", deadline: "2026-05-24T09:00:00Z", priority: "high", status: "unprocessed" },
  { id: "8", subject: "Warehouse inbound notice", fromName: "Saigon Depot", deadline: "2026-05-24T15:00:00Z", priority: "low", status: "processing" },
  { id: "10", subject: "Container release order", fromName: "Hapag-Lloyd", deadline: "2026-05-25T10:00:00Z", priority: "medium", status: "unprocessed" },
  { id: "14", subject: "Delivery delay notice", fromName: "FedEx Logistics", deadline: "2026-05-25T08:00:00Z", priority: "high", status: "unprocessed" },
]

const weeklyProgress = [
  { day: "T2", completed: 3, assigned: 4 },
  { day: "T3", completed: 5, assigned: 5 },
  { day: "T4", completed: 2, assigned: 3 },
  { day: "T5", completed: 4, assigned: 6 },
  { day: "T6", completed: 6, assigned: 6 },
  { day: "T7", completed: 1, assigned: 2 },
  { day: "CN", completed: 0, assigned: 1 },
]

export default function NhanVienPage() {
  const params = useParams<{ employeeId: string }>()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-300 tracking-tight">Khu vực Nhân viên</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            ID: {params.employeeId}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {dayjs().format("DD/MM/YYYY")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {myStats.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">{card.label}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-300">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card id="tour-staff-tasks">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Công việc của tôi
                </CardTitle>
                <CardDescription>Danh sách email được giao xử lý</CardDescription>
              </div>
              <Link href="/emails">
                <Badge variant="outline" className="hover:bg-neutral-50 cursor-pointer">
                  Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-neutral-300 text-sm">{task.subject}</p>
                      {task.priority === "high" && (
                        <Badge variant="destructive" className="text-[10px] h-5">Cao</Badge>
                      )}
                      {task.priority === "medium" && (
                        <Badge variant="outline" className="text-[10px] h-5 text-amber-600 border-amber-200 bg-amber-50">TB</Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-200 mt-1">{task.fromName} · Hạn: {dayjs(task.deadline).format("DD/MM HH:mm")}</p>
                  </div>
                  <div className="ml-3 shrink-0">
                    {task.status === "unprocessed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <Clock className="h-3 w-3" /> Chờ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                        <TrendingUp className="h-3 w-3" /> Đang xử lý
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tiến độ tuần này
            </CardTitle>
            <CardDescription>Số công việc hoàn thành / được giao</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyProgress.map((w) => {
                const pct = w.assigned > 0 ? (w.completed / w.assigned) * 100 : 0
                return (
                  <div key={w.day} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-medium text-neutral-300">{w.day}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-neutral-200">{w.completed}/{w.assigned}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-primary-50 p-3">
              <span className="text-sm font-medium text-primary">Tỷ lệ hoàn thành</span>
              <span className="text-lg font-bold text-primary">
                {Math.round((weeklyProgress.reduce((a, b) => a + b.completed, 0) / weeklyProgress.reduce((a, b) => a + b.assigned, 0)) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\layout.tsx`

```tsx
"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  type LucideIcon,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileCode,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Settings as SettingsIcon,
  Shield,
  User,
  Users,
  ClipboardList,
  Inbox,
  Webhook,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/stores/auth-store"
import TourButton from "@/components/tour-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster } from "sonner"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mail-accounts", label: "Tài khoản Email", icon: Inbox },
  { href: "/emails", label: "Email", icon: Mail },
  { href: "/analysis-results", label: "Kết quả AI", icon: ClipboardList },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/reports", label: "Báo cáo", icon: BarChart3 },
]

const adminItems: NavItem[] = [
  { href: "/admin", label: "Admin Tổng", icon: Shield },
  { href: "/admin/users", label: "Tài khoản", icon: Users },
  { href: "/admin/settings", label: "Cấu hình", icon: Settings },
  { href: "/admin/logs", label: "Logs", icon: FileText },
  { href: "/admin/templates", label: "Templates", icon: FileCode },
]

const getBreadcrumbItems = (pathname: string) => {
  if (pathname === "/") return [{ label: "Dashboard", href: "/" }]

  if (pathname.startsWith("/analysis-results")) {
    return [{ label: "Kết quả AI", href: "/analysis-results" }]
  }

  if (pathname.startsWith("/webhooks")) {
    return [{ label: "Webhooks", href: "/webhooks" }]
  }

  if (pathname.startsWith("/mail-accounts")) {
    return [{ label: "Tài khoản Email", href: "/mail-accounts" }]
  }

  if (pathname.startsWith("/emails")) {
    if (pathname === "/emails") return [{ label: "Email", href: "/emails" }]
    if (pathname.includes("/extract")) {
      return [
        { label: "Email", href: "/emails" },
        { label: "Chi tiết", href: "#" },
        { label: "Trích xuất", href: "#" },
      ]
    }

    return [
      { label: "Email", href: "/emails" },
      { label: "Chi tiết", href: "#" },
    ]
  }

  if (pathname.startsWith("/reports")) {
    if (pathname === "/reports") return [{ label: "Báo cáo", href: "/reports" }]
    if (pathname.includes("/import")) {
      return [
        { label: "Báo cáo", href: "/reports" },
        { label: "Import", href: "#" },
      ]
    }

    return [{ label: "Báo cáo", href: "/reports" }]
  }

  if (pathname.startsWith("/user")) {
    return [{ label: "Tài khoản", href: "/user" }]
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin") {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Admin Tổng", href: "#" },
      ]
    }
    if (pathname.includes("/users")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Tài khoản", href: "#" },
      ]
    }
    if (pathname.includes("/settings")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Cấu hình", href: "#" },
      ]
    }
    if (pathname.includes("/logs")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Logs", href: "#" },
      ]
    }
    if (pathname.includes("/templates")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Templates", href: "#" },
      ]
    }

    return [{ label: "Quản trị", href: "#" }]
  }

  if (pathname.startsWith("/employees")) {
    const employeeId = pathname.split("/")[2]
    if (employeeId) {
      return [
        { label: "Nhân viên", href: "/employees" },
        { label: employeeId, href: "#" },
      ]
    }

    return [{ label: "Nhân viên", href: "/employees" }]
  }

  return [{ label: "Trang chủ", href: "/" }]
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const breadcrumbItems = getBreadcrumbItems(pathname)
  const { logout } = useAuth()
  const authUser = useAuthStore((s) => s.user)
  const isAdmin = useAuthStore((s) => s.isAdmin)()

  // Redirect non-admin users away from admin routes
  useEffect(() => {
    if (!isAdmin && pathname.startsWith("/admin")) {
      router.replace("/user")
    }
  }, [isAdmin, pathname, router])

  const handleLogout = () => {
    logout()
  }

  const renderNavItem = (item: NavItem) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/")
    const navItem = (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group relative flex min-h-11 items-center gap-3 rounded-[10px] border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200",
          collapsed && "justify-center px-0",
          active
            ? "z-30 border-white/10 bg-white/10 text-white"
            : "text-neutral-100 hover:bg-white/10 hover:text-white"
        )}
      >
        {active && (
          <span
            aria-hidden
            className={cn(
              "absolute left-0 top-2 bottom-2 w-px bg-white",
              collapsed && "left-1/2 top-auto bottom-1 h-px w-6 -translate-x-1/2"
            )}
          />
        )}

        <item.icon
          className={cn(
            "h-5 w-5 shrink-0",
            active ? "text-white" : "text-neutral-100 group-hover:text-white"
          )}
        />
        {!collapsed && <span>{item.label}</span>}

      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{navItem}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return navItem
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-neutral-50 p-4">
        <div className="flex h-[calc(100vh-2rem)] overflow-hidden">
          <aside
            id="tour-sidebar"
            className={cn(
              "relative z-20 flex h-full max-h-[920px] flex-col rounded-[12px] border border-neutral-200/10 bg-primary transition-all duration-300",
              collapsed ? "w-16" : "w-64"
            )}
          >
            <div className="relative flex h-16 items-center gap-3 border-b border-neutral-200/10 px-4 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-neutral-200/10 bg-white/10">
                <Mail className="h-5 w-5 shrink-0 text-white" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="block truncate text-lg font-semibold tracking-tight text-white">Logistics</span>
                  <span className="block text-xs uppercase tracking-[0.18em] text-neutral-100">Operations Desk</span>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              <nav className="space-y-1.5 p-3">
                {navItems.map(renderNavItem)}

                {isAdmin && (
                  <>
                    {!collapsed && (
                      <div className="px-3 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-100">
                        Quản trị
                      </div>
                    )}
                    {collapsed && <Separator className="my-3 bg-neutral-200/20" />}
                    {adminItems.map(renderNavItem)}
                  </>
                )}
              </nav>
            </ScrollArea>

            <div className="space-y-1 border-t border-neutral-200/10 p-3 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-neutral-100 transition-all duration-200 hover:bg-white/10 hover:text-white",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    {!collapsed && "Thu gọn"}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{collapsed ? "Mở rộng" : "Thu gọn"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-accent transition-all duration-200 hover:bg-accent/10",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!collapsed && "Đăng xuất"}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Đăng xuất</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </aside>

          <div className="relative z-10 ml-4 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-neutral-100 bg-white">
            <header className="relative flex h-16 shrink-0 items-center justify-between bg-white border-b border-neutral-100 px-6">
              <Breadcrumb>
                <BreadcrumbList className="text-neutral-200">
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={`${item.href}-${item.label}`}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {index === breadcrumbItems.length - 1 ? (
                          <BreadcrumbPage className="text-neutral-300 font-medium">{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.href} className="hover:text-neutral-300 transition-colors">{item.label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative rounded-full bg-neutral-50 p-2.5 transition-colors hover:bg-neutral-100">
                      <Bell className="h-5 w-5 text-neutral-300" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-white">
                        3
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md focus:bg-neutral-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-300">Email mới từ ABC Logistics</p>
                        <p className="text-[11px] text-neutral-200 truncate">Invoice #INV-001 đã được nhận</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-neutral-200">2p</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md focus:bg-neutral-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-300">Import thành công</p>
                        <p className="text-[11px] text-neutral-200 truncate">25 bản ghi đã được import</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-neutral-200">1h</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md focus:bg-neutral-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-300">Cảnh báo hệ thống</p>
                        <p className="text-[11px] text-neutral-200 truncate">Tỷ lệ xử lý giảm dưới 90%</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-neutral-200">3h</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center text-primary">
                      Xem tất cả thông báo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 rounded-full border border-neutral-100 bg-white px-2 py-1.5 transition-colors hover:bg-neutral-50">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-50 text-primary text-xs font-semibold">
                          {authUser?.fullName
                            ? authUser.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden text-left sm:block pr-1">
                        <p className="text-sm font-medium text-neutral-300">{authUser?.fullName || "User"}</p>
                        <p className="text-[11px] text-neutral-200">{authUser?.email || ""}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/user" className="flex cursor-pointer items-center">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <span>Hồ sơ</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="flex cursor-pointer items-center">
                        <SettingsIcon className="mr-2 h-4 w-4 text-primary" />
                        <span>Cài đặt</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-accent">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="relative flex-1 overflow-auto px-8 py-7">
              <div key={pathname} className="route-shell-reveal relative">
                {children}
              </div>
            </main>
          </div>

          <TourButton />
          <Toaster
            position="top-right"
            toastOptions={{
              className: "text-sm",
            }}
            richColors
          />
        </div>
      </div>
    </TooltipProvider>
  )
}



```

---

## File: `app\(app)\mail-accounts\page.tsx`

```tsx
"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  useConnectAccountMutation,
  useDeleteMailAccountMutation,
  useOAuthUrlMutation,
  useSyncStatusQuery,
  useTriggerSyncMutation,
} from "@/hooks/use-mail-queries"

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
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  const { data: accounts = [], isPending: accountsPending } = useMailAccountsQuery()
  const oauthMutation = useOAuthUrlMutation()
  const connectMutation = useConnectAccountMutation()
  const deleteMutation = useDeleteMailAccountMutation()

  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null)
  const triggerSync = useTriggerSyncMutation(syncingAccountId)
  const syncStatus = useSyncStatusQuery(syncingAccountId)

  // Handle OAuth callback inline
  useEffect(() => {
    const oauthError = searchParams.get("error")
    if (oauthError) {
      toast.error(`OAuth bị từ chối: ${oauthError}`)
      router.replace("/mail-accounts")
      return
    }

    if (!code) return

    const redirectUri = `${window.location.origin}/mail-accounts`
    connectMutation.mutate(
      { authorizationCode: code, redirectUri },
      {
        onSuccess: () => {
          toast.success("Kết nối tài khoản thành công.")
          router.replace("/mail-accounts")
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, "Kết nối tài khoản thất bại."))
          router.replace("/mail-accounts")
        },
      }
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const handleConnect = async () => {
    try {
      const redirectUri = `${window.location.origin}/mail-accounts`
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
                        disabled={triggerSync.isPending || deleteMutation.isPending}
                        title="Đồng bộ"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Play className="h-4 w-4" />
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

```

---

## File: `app\(app)\mail-templates\page.tsx`

```tsx
"use client"

import { useState } from "react"
import { getErrorMessage } from "@/lib/get-error-message"
import { toast } from "sonner"
import {
  useEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
} from "@/hooks/use-mail-queries"
import {
  Plus,
  Save,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  LayoutTemplate,
} from "lucide-react"

type TemplateFormState = {
  templateCode: string
  templateName: string
  description: string
  subjectPattern: string
  bodyPattern: string
  expectedFields: string
  documentTypes: string
  isActive: boolean
}

const emptyForm: TemplateFormState = {
  templateCode: "",
  templateName: "",
  description: "",
  subjectPattern: "",
  bodyPattern: "",
  expectedFields: "",
  documentTypes: "",
  isActive: true,
}

export default function MailTemplatesPage() {
  const templatesQuery = useEmailTemplatesQuery()
  const createMutation = useCreateEmailTemplateMutation()
  const deleteMutation = useDeleteEmailTemplateMutation()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<TemplateFormState>(emptyForm)

  const updateMutation = useUpdateEmailTemplateMutation(editingId)

  const templates = templatesQuery.data ?? []
  const isSaving = createMutation.isPending || updateMutation.isPending

  const resetForm = () => {
    setEditingId(null)
    setFormState(emptyForm)
  }

  const handleSubmit = async () => {
    try {
      const documentTypes = formState.documentTypes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      let expectedFields: Record<string, string> | undefined
      if (formState.expectedFields.trim()) {
        try {
          expectedFields = JSON.parse(formState.expectedFields)
        } catch {
          toast.error("Expected fields phải là JSON hợp lệ.")
          return
        }
      }

      if (editingId) {
        await updateMutation.mutateAsync({
          templateName: formState.templateName || null,
          description: formState.description || null,
          subjectPattern: formState.subjectPattern || null,
          bodyPattern: formState.bodyPattern || null,
          expectedFields: expectedFields || null,
          documentTypes: documentTypes.length ? documentTypes : null,
          isActive: formState.isActive,
        })
        toast.success("Đã cập nhật template.")
      } else {
        await createMutation.mutateAsync({
          templateCode: formState.templateCode || null,
          templateName: formState.templateName || null,
          description: formState.description || null,
          subjectPattern: formState.subjectPattern || null,
          bodyPattern: formState.bodyPattern || null,
          expectedFields: expectedFields || null,
          documentTypes: documentTypes.length ? documentTypes : null,
        })
        toast.success("Đã tạo template mới.")
      }
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không lưu được template."))
    }
  }

  const handleEdit = (template: Record<string, unknown>) => {
    setEditingId(String(template.id ?? ""))
    setFormState({
      templateCode: String(template.templateCode ?? ""),
      templateName: String(template.templateName ?? ""),
      description: String(template.description ?? ""),
      subjectPattern: String(template.subjectPattern ?? ""),
      bodyPattern: String(template.bodyPattern ?? ""),
      expectedFields:
        template.expectedFields && typeof template.expectedFields === "object"
          ? JSON.stringify(template.expectedFields, null, 2)
          : "",
      documentTypes: Array.isArray(template.documentTypes)
        ? template.documentTypes.join(", ")
        : "",
      isActive: Boolean(template.isActive ?? true),
    })
  }

  const handleDelete = async (templateId: string) => {
    const confirmed = window.confirm("Xóa template này?")
    if (!confirmed) return
    try {
      await deleteMutation.mutateAsync(templateId)
      if (editingId === templateId) {
        resetForm()
      }
      toast.success("Đã xóa template.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa template thất bại."))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Email Templates</h1>
      </div>

      {templatesQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(templatesQuery.error, "Không tải được templates.")}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4 rounded-xl border border-neutral-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-300">
              {editingId ? "Cập nhật template" : "Tạo template"}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Template code (VD: invoice_template)"
              value={formState.templateCode}
              onChange={(event) =>
                setFormState((state) => ({ ...state, templateCode: event.target.value }))
              }
              disabled={Boolean(editingId)}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50"
            />
            <input
              type="text"
              placeholder="Template name"
              value={formState.templateName}
              onChange={(event) =>
                setFormState((state) => ({ ...state, templateName: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Mô tả"
              value={formState.description}
              onChange={(event) =>
                setFormState((state) => ({ ...state, description: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Subject pattern (regex)"
              value={formState.subjectPattern}
              onChange={(event) =>
                setFormState((state) => ({ ...state, subjectPattern: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Body pattern (regex)"
              value={formState.bodyPattern}
              onChange={(event) =>
                setFormState((state) => ({ ...state, bodyPattern: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Expected fields (JSON) VD: {&quot;invoiceNumber&quot;: &quot;Số hóa đơn&quot;}"
              value={formState.expectedFields}
              onChange={(event) =>
                setFormState((state) => ({ ...state, expectedFields: event.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Document types (csv) VD: pdf,docx"
              value={formState.documentTypes}
              onChange={(event) =>
                setFormState((state) => ({ ...state, documentTypes: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <label className="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, isActive: event.target.checked }))
                }
                disabled={!editingId}
              />
              Kích hoạt
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSaving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-neutral-300">Danh sách template</h2>
          {templatesQuery.isPending && (
            <p className="text-sm text-neutral-200">Đang tải...</p>
          )}
          {!templatesQuery.isPending && templates.length === 0 && (
            <p className="text-sm text-neutral-200">Chưa có template nào.</p>
          )}

          <div className="space-y-2">
            {templates.map((template: Record<string, unknown>) => {
              const id = String(template.id ?? "")
              const isActive = Boolean(template.isActive ?? false)
              return (
                <div
                  key={id}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-neutral-300">
                        {String(template.templateName || "—")}
                      </p>
                      <span className="text-xs text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {String(template.templateCode || "—")}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-200 mt-1">
                      {String(template.description || "—")}
                    </p>
                    <p className="text-xs text-neutral-200 mt-1">
                      Subject: {String(template.subjectPattern || "—")} · Body:{" "}
                      {String(template.bodyPattern || "—")}
                    </p>
                    <p className="text-xs text-neutral-200 mt-1">
                      Document types:{" "}
                      {Array.isArray(template.documentTypes)
                        ? template.documentTypes.join(", ")
                        : "—"}
                      {" · "}
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-neutral-300">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-3 w-3" /> Xóa
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\page.tsx`

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, CheckCircle, AlertTriangle, Clock, ArrowRight, TrendingUp, Package, DollarSign, BarChart3 } from "lucide-react"
import dayjs from "dayjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const stats = [
  { label: "Tổng email", value: 124, icon: Mail, color: "text-primary", bg: "bg-primary-50", change: "+12%" },
  { label: "Chờ xử lý", value: 18, icon: Clock, color: "text-amber-600", bg: "bg-[#FBF3DB]", change: "-5%" },
  { label: "Đã hoàn tất", value: 98, icon: CheckCircle, color: "text-green-600", bg: "bg-[#EDF3EC]", change: "+18%" },
  { label: "Lỗi / Từ chối", value: 8, icon: AlertTriangle, color: "text-red-600", bg: "bg-[#FDEBEC]", change: "-2%" },
]

const recentEmails = [
  { id: "1", subject: "Invoice #INV-001 - ABC Logistics", fromEmail: "billing@abclogistics.com", receivedAt: "2026-05-22T09:30:00Z", processStatus: "unprocessed" },
  { id: "2", subject: "Shipping confirmation XYZ-2026", fromEmail: "ops@xyzshipping.com", receivedAt: "2026-05-22T08:15:00Z", processStatus: "processed" },
  { id: "3", subject: "Freight quote request", fromEmail: "sales@globalfreight.com", receivedAt: "2026-05-21T16:45:00Z", processStatus: "unprocessed" },
  { id: "4", subject: "Cargo manifest - Voyage 4521", fromEmail: "manifest@ocean cargo.com", receivedAt: "2026-05-21T14:20:00Z", processStatus: "processed" },
  { id: "5", subject: "Delivery receipt #DR-8821", fromEmail: "receipts@fast delivery.com", receivedAt: "2026-05-21T11:00:00Z", processStatus: "processed" },
]

const emailTrendData = [
  { name: "T2", processed: 12, pending: 5, error: 1 },
  { name: "T3", processed: 18, pending: 8, error: 2 },
  { name: "T4", processed: 15, pending: 6, error: 0 },
  { name: "T5", processed: 22, pending: 4, error: 1 },
  { name: "T6", processed: 25, pending: 7, error: 3 },
  { name: "T7", processed: 20, pending: 5, error: 1 },
  { name: "CN", processed: 8, pending: 2, error: 0 },
]

const statusDistribution = [
  { name: "Đã xử lý", value: 98, color: "#22c55e" },
  { name: "Chờ xử lý", value: 18, color: "#3b82f6" },
  { name: "Lỗi", value: 8, color: "#ef4444" },
]

const topSenders = [
  { name: "ABC Logistics", count: 24, amount: "125M" },
  { name: "XYZ Shipping", count: 18, amount: "87M" },
  { name: "Global Freight", count: 15, amount: "152M" },
  { name: "Ocean Cargo", count: 12, amount: "45M" },
  { name: "Fast Delivery", count: 10, amount: "32M" },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-300 tracking-tight">Dashboard</h1>
        <Badge variant="secondary" className="text-sm">
          Cập nhật: {dayjs().format("DD/MM/YYYY HH:mm")}
        </Badge>
      </div>

      <div id="tour-dashboard-stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">{card.label}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-neutral-300">{card.value}</div>
                <Badge variant={card.change.startsWith("+") ? "success" : "warning"} className="text-xs">
                  {card.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Xu hướng xử lý email
            </CardTitle>
            <CardDescription>Số lượng email theo trạng thái trong 7 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emailTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="processed" stroke="#22c55e" strokeWidth={2} name="Đã xử lý" />
                <Line type="monotone" dataKey="pending" stroke="#3b82f6" strokeWidth={2} name="Chờ xử lý" />
                <Line type="monotone" dataKey="error" stroke="#ef4444" strokeWidth={2} name="Lỗi" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Phân bố trạng thái
            </CardTitle>
            <CardDescription>Tỷ lệ email theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-200">{item.name}</span>
                  </div>
                  <span className="font-medium text-neutral-300">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top người gửi
            </CardTitle>
            <CardDescription>5 người gửi email nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topSenders} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card id="tour-dashboard-recent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email gần đây
                </CardTitle>
                <CardDescription>5 email mới nhất</CardDescription>
              </div>
              <Link href="/emails">
                <Badge variant="outline" className="hover:bg-neutral-50 cursor-pointer">
                  Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-300 text-sm">{email.subject}</p>
                    <p className="text-xs text-neutral-200 mt-1">{email.fromEmail}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs text-neutral-200">{dayjs(email.receivedAt).format("HH:mm")}</span>
                    <Badge variant={email.processStatus === "processed" ? "success" : "warning"} className="text-xs">
                      {email.processStatus === "processed" ? "Đã xử lý" : "Chờ xử lý"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan hệ thống</CardTitle>
              <CardDescription>Thống kê chi tiết về hoạt động hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary-50 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Tổng giá trị</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-300">364.5M VND</p>
                  <p className="text-xs text-neutral-200 mt-1">+15% so với tháng trước</p>
                </div>
                <div className="p-4 rounded-lg bg-[#EDF3EC] border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-[#346538]" />
                    <span className="text-sm font-medium text-[#346538]">Tỷ lệ thành công</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-300">94.2%</p>
                  <p className="text-xs text-neutral-200 mt-1">+2.3% so với tháng trước</p>
                </div>
                <div className="p-4 rounded-lg bg-[#FBF3DB] border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[#956400]" />
                    <span className="text-sm font-medium text-[#956400]">Thời gian xử lý TB</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-300">2.4h</p>
                  <p className="text-xs text-neutral-200 mt-1">-0.5h so với tháng trước</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất xử lý</CardTitle>
              <CardDescription>Biểu đồ hiệu suất theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-primary-100">
                <p className="text-sm">Dữ liệu hiệu suất sẽ được hiển thị tại đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nhật ký hoạt động</CardTitle>
              <CardDescription>Lịch sử các hoạt động gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-primary-100">
                <p className="text-sm">Nhật ký hoạt động sẽ được hiển thị tại đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

```

---

## File: `app\(app)\reports\import\page.tsx`

```tsx
"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, FileSpreadsheet, AlertTriangle, CheckCircle, RotateCcw } from "lucide-react"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError("")
    setImported(false)

    // Simple preview reading first 10 lines as text
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split("\n").slice(0, 10)
      setPreview(lines.map((l) => l.split(",")))
    }
    reader.readAsText(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setError("")
    try {
      // Mock import - replace with real API when BE supports it
      await new Promise((r) => setTimeout(r, 1500))
      setImported(true)
    } catch {
      setError("Import thất bại. File có thể sai định dạng.")
    } finally {
      setImporting(false)
    }
  }

  const handleRollback = () => {
    setFile(null)
    setPreview([])
    setImported(false)
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-4">
      <Link href="/reports" className="flex items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
        <ArrowLeft className="h-4 w-4" /> Quay lại Báo cáo
      </Link>

      <h1 className="text-2xl font-bold text-neutral-300">Import Dữ liệu</h1>

      <div className="rounded-xl border border-neutral-100 bg-white p-6 space-y-4">
        {/* Upload */}
        <div
          id="tour-import-upload"
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-neutral-100 p-8 text-center hover:border-primary hover:bg-neutral-50"
        >
          <Upload className="mx-auto h-8 w-8 text-neutral-200" />
          <p className="mt-2 text-sm font-medium text-neutral-200">Click để chọn file Excel/CSV</p>
          <p className="text-xs text-neutral-200">Hỗ trợ .xlsx, .csv</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {file && (
          <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3">
            <FileSpreadsheet className="h-5 w-5 text-[#346538]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-300">{file.name}</p>
              <p className="text-xs text-neutral-200">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={handleRollback} className="text-sm text-accent-200 hover:text-accent-200/80">
              Xóa
            </button>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div id="tour-import-preview">
            <h3 className="mb-2 text-sm font-medium text-neutral-200">Preview (10 dòng đầu)</h3>
            <div className="overflow-auto rounded-lg border border-neutral-100">
              <table className="w-full text-xs">
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className={i === 0 ? "bg-neutral-50 font-medium" : "border-t border-neutral-100"}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-accent-50 p-3 text-sm text-accent-200">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        {imported && (
          <div className="flex items-center gap-2 rounded-lg bg-[#EDF3EC] p-3 text-sm text-[#346538]">
            <CheckCircle className="h-4 w-4" /> Import thành công! Dữ liệu đã được thêm vào Báo cáo Tổng.
          </div>
        )}

        <div className="flex gap-2">
          <button
            id="tour-import-btn"
            onClick={handleImport}
            disabled={!file || importing || imported}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
          >
            {importing ? "Đang import..." : "Thực hiện Import"}
          </button>
          {(imported || error) && (
            <button
              onClick={handleRollback}
              className="flex items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50"
            >
              <RotateCcw className="h-4 w-4" /> Rollback / Import lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\reports\page.tsx`

```tsx
"use client"

import Link from "next/link"
import { FileSpreadsheet, TrendingUp, Package, DollarSign } from "lucide-react"
import dayjs from "dayjs"

const reports = [
  { id: "1", invoiceNumber: "INV-001", sender: "ABC Logistics", amount: 12500000, currency: "VND", date: "2026-05-20", status: "completed", importedAt: "2026-05-21T10:00:00Z" },
  { id: "2", invoiceNumber: "INV-002", sender: "XYZ Shipping", amount: 8750000, currency: "VND", date: "2026-05-19", status: "completed", importedAt: "2026-05-20T09:30:00Z" },
  { id: "3", invoiceNumber: "INV-003", sender: "Global Freight", amount: 15200000, currency: "VND", date: "2026-05-18", status: "completed", importedAt: "2026-05-19T14:00:00Z" },
]

const totalAmount = reports.reduce((sum, r) => sum + (r.amount || 0), 0)

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Báo cáo Tổng</h1>
        <Link
          id="tour-reports-import-btn"
          href="/reports/import"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Import dữ liệu mới
        </Link>
      </div>

      <div id="tour-reports-stats" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2.5">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-200">Tổng bản ghi</p>
              <p className="text-2xl font-bold text-neutral-300">{reports.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#EDF3EC] p-2.5">
              <DollarSign className="h-5 w-5 text-[#346538]" />
            </div>
            <div>
              <p className="text-sm text-neutral-200">Tổng giá trị</p>
              <p className="text-2xl font-bold text-neutral-300">{totalAmount.toLocaleString("vi-VN")} VND</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FBF3DB] p-2.5">
              <TrendingUp className="h-5 w-5 text-[#956400]" />
            </div>
            <div>
              <p className="text-sm text-neutral-200">Bản ghi tháng này</p>
              <p className="text-2xl font-bold text-neutral-300">{reports.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div id="tour-reports-table" className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="font-semibold text-neutral-300">Dữ liệu đã import</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Invoice #</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Người gửi</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Ngày</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-200">Số tiền</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-200">Import lúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-300">{r.invoiceNumber}</td>
                <td className="px-4 py-3 text-neutral-200">{r.sender}</td>
                <td className="px-4 py-3 text-neutral-200">{dayjs(r.date).format("DD/MM/YYYY")}</td>
                <td className="px-4 py-3 text-right font-medium text-neutral-300">
                  {r.amount.toLocaleString("vi-VN")} {r.currency}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#EDF3EC] px-2 py-0.5 text-xs font-medium text-[#346538]">
                    Hoàn thành
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-200">{dayjs(r.importedAt).format("DD/MM/YYYY HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

```

---

## File: `app\(app)\template.tsx`

```tsx
export default function AppTemplate({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}

```

---

## File: `app\(app)\user\page.tsx`

```tsx
"use client"

import { useState } from "react"
import {
  Loader2,
  Pencil,
  Save,
  KeyRound,
  Mail,
  User,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  AlertCircle,
  ChevronRight,
  Lock,
  UserCircle,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useCurrentUserQuery,
  useUpdateMyProfileMutation,
  useChangeMyPasswordMutation,
} from "@/hooks/use-user-queries"

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 animate-pulse rounded-full bg-neutral-100" />
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function UserDashboardPage() {
  const currentUserQuery = useCurrentUserQuery()
  const updateProfileMutation = useUpdateMyProfileMutation()
  const changePasswordMutation = useChangeMyPasswordMutation()

  const user = currentUserQuery.data

  const [editingProfile, setEditingProfile] = useState(false)
  const [editFullName, setEditFullName] = useState("")

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)

  const startEditProfile = () => {
    setEditFullName(user?.fullName ?? "")
    setEditingProfile(true)
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({ fullName: editFullName })
      toast.success("Cập nhật hồ sơ thành công.")
      setEditingProfile(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật hồ sơ thất bại."))
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword })
      toast.success("Đổi mật khẩu thành công.")
      setShowChangePassword(false)
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      toast.error(getErrorMessage(err, "Đổi mật khẩu thất bại."))
    }
  }

  const isMutating = updateProfileMutation.isPending || changePasswordMutation.isPending

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Tài khoản của tôi</h1>
        <p className="mt-1 text-sm text-neutral-500">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      {currentUserQuery.isPending && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <ProfileSkeleton />
        </div>
      )}

      {!currentUserQuery.isPending && !user && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <p className="mt-4 text-base font-medium text-neutral-900">Không tải được thông tin</p>
          <p className="mt-1 text-sm text-neutral-500">Vui lòng thử tải lại trang</p>
        </div>
      )}

      {user && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {/* Card Header with Avatar */}
            <div className="bg-linear-to-r from-neutral-50 to-white px-8 py-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-primary text-2xl font-bold text-white">
                      {getInitials(user.fullName || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">{user.fullName || "Chưa cập nhật"}</h2>
                    <p className="mt-0.5 text-sm text-neutral-500">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        >
                          {role}
                        </Badge>
                      ))}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                        Hoạt động
                      </span>
                    </div>
                  </div>
                </div>
                {!editingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startEditProfile}
                    className="gap-2"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Card Content */}
            <div className="px-8 py-6">
              <AnimatePresence mode="wait">
                {editingProfile ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-neutral-50 text-neutral-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-neutral-700">
                        Họ và tên
                      </Label>
                      <Input
                        id="fullName"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        autoFocus
                        className="text-neutral-900"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProfile(false)}
                      >
                        <X className="mr-1.5 h-4 w-4" /> Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isMutating}
                      >
                        {isMutating ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-1.5 h-4 w-4" />
                        )}
                        Lưu thay đổi
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0"
                  >
                    {[
                      {
                        icon: <Mail className="h-5 w-5 text-neutral-400" />,
                        label: "Email",
                        value: user.email,
                      },
                      {
                        icon: <UserCircle className="h-5 w-5 text-neutral-400" />,
                        label: "Họ và tên",
                        value: user.fullName || <span className="italic text-neutral-400">Chưa cập nhật</span>,
                      },
                      {
                        icon: <ShieldCheck className="h-5 w-5 text-neutral-400" />,
                        label: "Vai trò",
                        value: (
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="outline"
                                className="border-neutral-200 bg-neutral-50 text-neutral-700"
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        ),
                      },
                      {
                        icon: <Activity className="h-5 w-5 text-neutral-400" />,
                        label: "Trạng thái",
                        value: (
                          <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            Đang hoạt động
                          </span>
                        ),
                      },
                    ].map((item, index, arr) => (
                      <div key={item.label}>
                        <div className="flex items-start gap-4 py-4">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50">
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                              {item.label}
                            </p>
                            <div className="mt-1 text-sm text-neutral-900">{item.value}</div>
                          </div>
                        </div>
                        {index < arr.length - 1 && <Separator />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Security Card */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="px-8 py-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                    <Lock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Bảo mật</h2>
                    <p className="text-sm text-neutral-500">Quản lý mật khẩu và bảo mật tài khoản</p>
                  </div>
                </div>
                {!showChangePassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChangePassword(true)}
                    className="gap-2"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Đổi mật khẩu
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {showChangePassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <Separator className="mb-6" />
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-medium text-neutral-700">
                          Mật khẩu hiện tại
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPwd ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Nhập mật khẩu hiện tại"
                            className="pr-11 text-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                          >
                            {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium text-neutral-700">
                          Mật khẩu mới
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPwd ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Tối thiểu 8 ký tự"
                            className="pr-11 text-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPwd(!showNewPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                          >
                            {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowChangePassword(false)}
                        >
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleChangePassword}
                          disabled={isMutating || !currentPassword || !newPassword}
                        >
                          {isMutating ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          ) : (
                            <KeyRound className="mr-1.5 h-4 w-4" />
                          )}
                          Xác nhận
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

```

---

## File: `app\(app)\webhooks\page.tsx`

```tsx
"use client"

import { useState } from "react"
import { getErrorMessage } from "@/lib/get-error-message"
import { toast } from "sonner"
import {
  useWebhookSubscriptionsQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
} from "@/hooks/use-mail-queries"
import { Plus, Save, Trash2, Play, Webhook, CheckCircle2, XCircle } from "lucide-react"

type WebhookFormState = {
  subscriberCode: string
  callbackUrl: string
  eventTypes: string
  secretKey: string
  isActive: boolean
}

const emptyForm: WebhookFormState = {
  subscriberCode: "",
  callbackUrl: "",
  eventTypes: "",
  secretKey: "",
  isActive: true,
}

export default function WebhooksPage() {
  const webhooksQuery = useWebhookSubscriptionsQuery()
  const createMutation = useCreateWebhookMutation()
  const deleteMutation = useDeleteWebhookMutation()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<WebhookFormState>(emptyForm)

  const updateMutation = useUpdateWebhookMutation(editingId)
  const testMutation = useTestWebhookMutation(editingId)

  const webhooks = webhooksQuery.data ?? []
  const isSaving = createMutation.isPending || updateMutation.isPending

  const resetForm = () => {
    setEditingId(null)
    setFormState(emptyForm)
  }

  const handleSubmit = async () => {
    try {
      const eventTypes = formState.eventTypes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      if (editingId) {
        await updateMutation.mutateAsync({
          callbackUrl: formState.callbackUrl || null,
          eventTypes: eventTypes.length ? eventTypes : null,
          isActive: formState.isActive,
        })
        toast.success("Đã cập nhật webhook.")
      } else {
        await createMutation.mutateAsync({
          subscriberCode: formState.subscriberCode || null,
          callbackUrl: formState.callbackUrl || null,
          eventTypes: eventTypes.length ? eventTypes : null,
          secretKey: formState.secretKey || null,
        })
        toast.success("Đã tạo webhook mới.")
      }
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không lưu được webhook."))
    }
  }

  const handleEdit = (webhook: Record<string, unknown>) => {
    setEditingId(String(webhook.id ?? ""))
    setFormState({
      subscriberCode: String(webhook.subscriberCode ?? ""),
      callbackUrl: String(webhook.callbackUrl ?? ""),
      eventTypes: Array.isArray(webhook.eventTypes) ? webhook.eventTypes.join(", ") : "",
      secretKey: String(webhook.secretKey ?? ""),
      isActive: Boolean(webhook.isActive ?? true),
    })
  }

  const handleDelete = async (webhookId: string) => {
    const confirmed = window.confirm("Xóa webhook này?")
    if (!confirmed) return
    try {
      await deleteMutation.mutateAsync(webhookId)
      if (editingId === webhookId) {
        resetForm()
      }
      toast.success("Đã xóa webhook.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa webhook thất bại."))
    }
  }

  const handleTest = async (webhookId: string) => {
    try {
      await testMutation.mutateAsync({
        eventType: "mail.received",
        payload: { test: true, message: "Hello from test" },
      })
      toast.success("Đã gửi test webhook.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Test webhook thất bại."))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Webhook Subscriptions</h1>
      </div>

      {webhooksQuery.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(webhooksQuery.error, "Không tải được webhooks.")}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-xl border border-neutral-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-300">
              {editingId ? "Cập nhật webhook" : "Tạo webhook"}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Subscriber code"
              value={formState.subscriberCode}
              onChange={(event) =>
                setFormState((state) => ({ ...state, subscriberCode: event.target.value }))
              }
              disabled={Boolean(editingId)}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50"
            />
            <input
              type="text"
              placeholder="Callback URL"
              value={formState.callbackUrl}
              onChange={(event) =>
                setFormState((state) => ({ ...state, callbackUrl: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Event types (csv) ví dụ mail.received,mail.processed"
              value={formState.eventTypes}
              onChange={(event) =>
                setFormState((state) => ({ ...state, eventTypes: event.target.value }))
              }
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Secret key (optional)"
              value={formState.secretKey}
              onChange={(event) =>
                setFormState((state) => ({ ...state, secretKey: event.target.value }))
              }
              disabled={Boolean(editingId)}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50"
            />
            <label className="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, isActive: event.target.checked }))
                }
                disabled={!editingId}
              />
              Kích hoạt
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSaving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-neutral-300">Danh sách webhook</h2>
          {webhooksQuery.isPending && (
            <p className="text-sm text-neutral-200">Đang tải...</p>
          )}
          {!webhooksQuery.isPending && webhooks.length === 0 && (
            <p className="text-sm text-neutral-200">Chưa có webhook nào.</p>
          )}

          <div className="space-y-2">
            {webhooks.map((webhook) => {
              const id = String(webhook.id ?? "")
              const isActive = Boolean(webhook.isActive ?? false)
              return (
                <div
                  key={id}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-300">
                      {String(webhook.subscriberCode || "—")}
                    </p>
                    <p className="text-xs text-neutral-200 wrap-break-word">
                      {String(webhook.callbackUrl || "—")}
                    </p>
                    <p className="text-xs text-neutral-200">
                      Events: {Array.isArray(webhook.eventTypes) ? webhook.eventTypes.join(", ") : "—"}
                      {" · "}
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-neutral-300">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTest(id)}
                      disabled={testMutation.isPending}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="h-3 w-3" /> Test
                    </button>
                    <button
                      onClick={() => handleEdit(webhook)}
                      className="cursor-pointer rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-3 w-3" /> Xóa
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\globals.css`

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Brand palette extracted from logo */
  --color-primary: #0c549c;
  --color-primary-50: #E1F3FE;
  --color-primary-100: #6c9ccc;
  --color-primary-200: #0c6cb4;
  --color-primary-300: #0c6c9c;
  --color-primary-400: #0c549c;
  --color-primary-500: #0a3f75;
  --color-primary-600: #08305c;

  --color-accent: #e42424;
  --color-accent-50: #FDEBEC;
  --color-accent-100: #f25c4d;
  --color-accent-200: #cc240c;
  --color-accent-300: #a81e0a;

  --color-neutral-50: #F7F6F3;
  --color-neutral-100: #EAEAEA;
  --color-neutral-200: #787774;
  --color-neutral-300: #111111;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
}

@keyframes route-content-enter {
  from {
    opacity: 0;
    transform: translateX(-36px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
}

.route-content-enter {
  animation: route-content-enter 440ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity, filter;
}

@keyframes route-shell-reveal {
  from {
    opacity: 0.6;
    transform: translateX(-44px);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
}

.route-shell-reveal {
  animation: route-shell-reveal 700ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform, filter;
}

@media (prefers-reduced-motion: reduce) {
  .route-content-enter {
    animation: none;
  }
}

```

---

## File: `app\layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Logistics Mail - Bóc tách dữ liệu",
  description: "Hệ thống xử lý email logistics tự động",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

```

---

## File: `app\login\page.tsx`

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Shield, Clock, BarChart3, User, Lock } from "lucide-react"
import Image from "next/image"
import { login } from "@/lib/api"
import { getErrorMessage } from "@/lib/get-error-message"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login(email, password)
      const accessToken = res.data?.accessToken
      const refreshToken = res.data?.refreshToken
      const user = res.data?.user
      if (accessToken && user && typeof window !== "undefined") {
        localStorage.setItem("token", accessToken)
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken)
        if (user?.userId) localStorage.setItem("userId", user.userId)

        setAuth({
          user,
          accessToken,
          refreshToken: refreshToken ?? "",
        })

        // Redirect based on role
        if (user.roles?.includes("admin")) {
          router.push("/")
        } else {
          router.push("/user")
        }
      } else {
        throw new Error("Đăng nhập thất bại, thiếu thông tin.")
      }
    } catch (err) {
      setError(getErrorMessage(err, "Đăng nhập thất bại."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-end">
      {/* Full screen background image */}
      <Image
        src="/loginthongquan.png"
        alt="Logistics background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-r from-[#1e3a5f]/70 via-[#1e3a5f]/40 to-transparent" />

      {/* Left content overlay */}
      <div className="absolute left-0 top-0 hidden h-full w-1/2 flex-col justify-between p-12 text-white lg:flex">
        {/* <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight">LOGISTICS</span>
              <span className="block text-xs font-medium tracking-widest text-primary-50">MAIL</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Kết nối vận chuyển<br />– Giao nhận toàn cầu
          </h2>
          <p className="mt-4 max-w-md text-base text-primary-50">
            Giải pháp quản lý logistics hiệu quả, an toàn và nhanh chóng.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary-100" />
            <div>
              <p className="text-sm font-semibold">Bảo mật tuyệt đối</p>
              <p className="text-xs text-primary-50">Thông tin được mã hóa và bảo vệ an toàn</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary-100" />
            <div>
              <p className="text-sm font-semibold">Hiệu quả vượt trội</p>
              <p className="text-xs text-primary-50">Quy trình tối ưu, tiết kiệm thời gian</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary-100" />
            <div>
              <p className="text-sm font-semibold">Quản lý toàn diện</p>
              <p className="text-xs text-primary-50">Kiểm soát mọi đơn hàng mọi lúc, mọi nơi</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Right side - Login form */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div id="tour-login-form" className="w-full max-w-[420px] rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-300">Logistics Mail</h1>
            <p className="mt-1 text-sm text-neutral-200">Đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-200" />
                <input
                  id="tour-login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                  placeholder="admin@company.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-200" />
                <input
                  id="tour-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-100 text-primary focus:ring-primary"
                />
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-sm font-medium text-primary hover:text-primary-500">
                Quên mật khẩu?
              </a>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              id="tour-login-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-neutral-200">hoặc</span>
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-100 bg-white px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Đăng nhập với Google
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-neutral-200">
            © 2026 THONG QUAN JOINT STOCK COMPANY.
          </p>
          <p className="text-center text-xs text-neutral-200">
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

```

---

## File: `app\mail-auth\callback\page.tsx`

```tsx
"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Mail, XCircle } from "lucide-react"
import { getMailConnectorAPI } from "@/lib/generated/mail-connector/endpoints"
import { getErrorMessage } from "@/lib/get-error-message"

const mailApi = getMailConnectorAPI()

function MailAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const authorizationCode = useMemo(
    () => searchParams.get("code") ?? searchParams.get("authorizationCode"),
    [searchParams]
  )
  const state = useMemo(() => searchParams.get("state"), [searchParams])

  useEffect(() => {
    const run = async () => {
      try {
        if (!authorizationCode) {
          throw new Error("Thiếu authorization code từ Gmail.")
        }

        const storedState = sessionStorage.getItem("mail_oauth_state")
        if (storedState && state && storedState !== state) {
          throw new Error("OAuth state không hợp lệ. Vui lòng thử lại.")
        }

        const redirectUri = `${window.location.origin}/mail-auth/callback`
        await mailApi.postApiV1MailAccountsConnect({
          authorizationCode,
          redirectUri,
        })
        sessionStorage.removeItem("mail_oauth_state")
        router.replace("/admin/settings?connected=1")
      } catch (callbackError) {
        setError(getErrorMessage(callbackError, "Xử lý callback Gmail thất bại."))
      }
    }

    void run()
  }, [authorizationCode, router, state])

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-neutral-300">Xác thực Gmail</h1>
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => router.replace("/admin/settings")}
              className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Quay về cấu hình
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang hoàn tất kết nối tài khoản...
          </div>
        )}
      </div>
    </div>
  )
}

export default function MailAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}>
      <MailAuthCallbackContent />
    </Suspense>
  )
}

```

---

## File: `CLAUDE.md`

```md
@AGENTS.md

```

---

## File: `components\attachment-viewer-modal.tsx`

```tsx
"use client"

import * as React from "react"
import { X, Loader } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getErrorMessage } from "@/lib/get-error-message"

interface AttachmentViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  isLoading: boolean
  error: Error | null
  content: string | null
}

export function AttachmentViewerModal({
  open,
  onOpenChange,
  title,
  isLoading,
  error,
  content,
}: AttachmentViewerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-neutral-300 truncate pr-4">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-neutral-50 p-4 min-h-0">
          {isLoading && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="flex items-center gap-2 text-sm text-neutral-200">
                <Loader className="h-4 w-4 animate-spin" />
                Đang tải nội dung...
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-sm text-red-600">
                {String(getErrorMessage(error, "Không tải được nội dung tệp."))}
              </p>
            </div>
          )}

          {!isLoading && !error && content && (
            <pre className="h-full overflow-auto whitespace-pre-wrap rounded-lg bg-white border border-neutral-100 p-4 text-xs text-neutral-300 leading-relaxed">
              {content}
            </pre>
          )}

          {!isLoading && !error && !content && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-sm text-neutral-200">Không có nội dung.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

```

---

## File: `components\extraction-result-modal.tsx`

```tsx
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ExtractionResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: string | null
  previewUrl?: string | null
  fileName?: string | null
}

interface LogisticsData {
  stt: number
  maKhachHang: string
  nhanVien: string
  khachHang: string
  congViec: string
  soToKhai: string
  loaiHinh: string
  ngayToKhai: string
  loaiHang: string
  luongTk: string
  haiQuan: string
  co: string
  soInvVat: string
  soBill: string
  soBooking: string
  soLuongKien: string
  soLuongKg: string
  soContainer20: string
  soContainer40: string
  soContainerLcl: string
  soContainerTc: string
  thongBaoPhiCsht: string
  soTienCsht: string
  cangXuatNhap: string
  ghiChu: string
  trangThaiLoHang: string
}

export function ExtractionResultModal({ open, onOpenChange, result, previewUrl, fileName }: ExtractionResultModalProps) {
  const [data, setData] = useState<LogisticsData[]>([])
  const [message, setMessage] = useState<string | null>(null)

  // Parse result string into structured data
  const parseResult = (resultStr: string): LogisticsData[] => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(resultStr)
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => ({
          stt: index + 1,
          maKhachHang: item.maKhachHang || item.customerCode || "",
          nhanVien: item.nhanVien || item.staff || "",
          khachHang: item.khachHang || item.customer || "",
          congViec: item.congViec || item.job || "",
          soToKhai: item.soToKhai || item.declarationNo || "",
          loaiHinh: item.loaiHinh || item.type || "",
          ngayToKhai: item.ngayToKhai || item.declarationDate || "",
          loaiHang: item.loaiHang || item.goodsType || "",
          luongTk: item.luongTk || item.customsStream || "",
          haiQuan: item.haiQuan || item.customs || "",
          co: item.co || item.certificate || "",
          soInvVat: item.soInvVat || item.invoiceNo || "",
          soBill: item.soBill || item.billNo || "",
          soBooking: item.soBooking || item.bookingNo || "",
          soLuongKien: item.soLuongKien || item.quantityPackages || "",
          soLuongKg: item.soLuongKg || item.quantityKg || "",
          soContainer20: item.soContainer20 || item.container20 || "",
          soContainer40: item.soContainer40 || item.container40 || "",
          soContainerLcl: item.soContainerLcl || item.containerLcl || "",
          soContainerTc: item.soContainerTc || item.containerTc || "",
          thongBaoPhiCsht: item.thongBaoPhiCsht || item.cshtNotice || "",
          soTienCsht: item.soTienCsht || item.cshtAmount || "",
          cangXuatNhap: item.cangXuatNhap || item.port || "",
          ghiChu: item.ghiChu || item.note || "",
          trangThaiLoHang: item.trangThaiLoHang || item.shipmentStatus || "",
        }))
      }
      return []
    } catch {
      // If not JSON, return empty array and set message
      return []
    }
  }

  // Update data when result changes using useEffect
  useEffect(() => {
    if (result) {
      const parsedData = parseResult(result)
      if (parsedData.length > 0) {
        setData(parsedData)
        setMessage(null)
      } else {
        setData([])
        setMessage(result)
      }
    } else {
      setData([])
      setMessage(null)
    }
  }, [result])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-black">Kết quả bóc tách thông tin logistics</DialogTitle>
        </DialogHeader>
        <div className="flex h-[calc(95vh-80px)]">
          {/* Left column: Extraction results */}
          <div className="w-1/2 p-4 overflow-y-auto border-r">
            {data.length > 0 ? (
              data.map((row) => (
                <div key={row.stt} className="space-y-3 p-4 border rounded-lg bg-white mb-4">
                  <h3 className="text-lg font-semibold text-primary">Lô hàng #{row.stt}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "MÃ KHÁCH HÀNG", value: row.maKhachHang },
                      { label: "NHÂN VIÊN", value: row.nhanVien },
                      { label: "KHÁCH HÀNG", value: row.khachHang },
                      { label: "CÔNG VIỆC", value: row.congViec },
                      { label: "SỐ TỜ KHAI", value: row.soToKhai },
                      { label: "LOẠI HÌNH", value: row.loaiHinh },
                      { label: "NGÀY TỜ KHAI", value: row.ngayToKhai },
                      { label: "LOẠI HÀNG", value: row.loaiHang },
                      { label: "LUỒNG TK", value: row.luongTk },
                      { label: "HẢI QUAN", value: row.haiQuan },
                      { label: "C/O", value: row.co },
                      { label: "SỐ INV/VAT", value: row.soInvVat },
                      { label: "SỐ BILL", value: row.soBill },
                      { label: "SỐ BOOKING", value: row.soBooking },
                      { label: "SỐ LƯỢNG (KIỆN)", value: row.soLuongKien },
                      { label: "SỐ LƯỢNG (KG)", value: row.soLuongKg },
                      { label: "CONT 20'", value: row.soContainer20 },
                      { label: "CONT 40'", value: row.soContainer40 },
                      { label: "CONT LCL", value: row.soContainerLcl },
                      { label: "CONT TC", value: row.soContainerTc },
                      { label: "THÔNG BÁO PHÍ CSHT", value: row.thongBaoPhiCsht },
                      { label: "SỐ TIỀN CSHT", value: row.soTienCsht },
                      { label: "CẢNG XUẤT - CẢNG NHẬP", value: row.cangXuatNhap },
                      { label: "GHI CHÚ", value: row.ghiChu },
                      { label: "TRẠNG THÁI LÔ HÀNG", value: row.trangThaiLoHang },
                    ].map((field, idx) => (
                      <div key={idx} className="space-y-1">
                        <Label>{field.label}</Label>
                        <Input value={field.value} readOnly />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : message ? (
              <div className="p-4 border rounded-lg bg-white">
                <p className="text-black whitespace-pre-wrap">{message}</p>
              </div>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-white">
                <h3 className="text-lg font-semibold text-primary">Lô hàng #1</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "MÃ KHÁCH HÀNG", "NHÂN VIÊN", "KHÁCH HÀNG", "CÔNG VIỆC",
                    "SỐ TỜ KHAI", "LOẠI HÌNH", "NGÀY TỜ KHAI", "LOẠI HÀNG",
                    "LUỒNG TK", "HẢI QUAN", "C/O", "SỐ INV/VAT",
                    "SỐ BILL", "SỐ BOOKING", "SỐ LƯỢNG (KIỆN)", "SỐ LƯỢNG (KG)",
                    "CONT 20'", "CONT 40'", "CONT LCL", "CONT TC",
                    "THÔNG BÁO PHÍ CSHT", "SỐ TIỀN CSHT", "CẢNG XUẤT - CẢNG NHẬP",
                    "GHI CHÚ", "TRẠNG THÁI LÔ HÀNG"
                  ].map((label, idx) => (
                    <div key={idx} className="space-y-1">
                      <Label>{label}</Label>
                      <Input value="" readOnly placeholder="Chưa có dữ liệu" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: File viewer */}
          <div className="w-1/2 p-4 overflow-hidden">
            {previewUrl ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
                className="w-full h-full border rounded-lg"
                title={fileName || "File preview"}
              />
            ) : (
              <div className="text-center py-8 text-black">
                Không có file để hiển thị
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

```

---

## File: `components\file-attachment-item.tsx`

```tsx
"use client"

import * as React from "react"
import { FileText, FileImage, FileSpreadsheet, FileCode, Download, Check, Square, CheckSquare } from "lucide-react"
import { Card } from "@/components/ui/card"

interface FileAttachmentItemProps {
  id: string
  fileName: string
  fileType: string
  fileSize: string
  isChecked?: boolean
  onCheckChange?: (checked: boolean) => void
  onViewExtract?: () => void
  onViewContent?: () => void
  onDownload?: () => void
  status?: "pending" | "completed" | "error"
}

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase()
  if (type.includes("image") || ["png", "jpg", "jpeg", "gif", "webp"].some((ext) => type.includes(ext)))
    return <FileImage className="h-4 w-4 text-primary" />
  if (type.includes("excel") || type.includes("csv") || type.includes("sheet"))
    return <FileSpreadsheet className="h-4 w-4 text-primary" />
  if (type.includes("json") || type.includes("xml") || type.includes("html"))
    return <FileCode className="h-4 w-4 text-primary" />
  return <FileText className="h-4 w-4 text-primary" />
}

export function FileAttachmentItem({
  id,
  fileName,
  fileType,
  fileSize,
  isChecked = false,
  onCheckChange,
  onViewExtract,
  onViewContent,
  onDownload,
  status = "completed",
}: FileAttachmentItemProps) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 min-w-0 overflow-hidden hover:border-neutral-200 transition-colors">
      {/* Row 1: checkbox + icon + title + type/size + status */}
      <div className="flex items-start gap-3 min-w-0 overflow-hidden">
        {/* Selection */}
        {onCheckChange && (
          <button
            onClick={() => onCheckChange(!isChecked)}
            className={`flex shrink-0 h-8 w-8 mt-0.5 items-center justify-center rounded-md border transition-colors ${
              isChecked
                ? "border-primary bg-primary text-white"
                : "border-neutral-100 bg-white text-neutral-200 hover:border-primary/50 hover:text-primary"
            }`}
          >
            {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          </button>
        )}

        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 mt-0.5 items-center justify-center rounded-lg bg-primary-50">
          {getFileIcon(fileType)}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0 overflow-hidden" style={{ minWidth: 0 }}>
          <div className="text-sm font-medium text-neutral-300 leading-snug wrap-break-word overflow-hidden max-h-[3.9em]">
            {fileName}
          </div>
          <div className="flex items-center gap-2 mt-1 min-w-0">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wide truncate max-w-[100px]">
              {fileType}
            </span>
            <span className="text-[11px] text-neutral-200 shrink-0">{fileSize}</span>
          </div>
        </div>

        {/* Status */}
        {status === "completed" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 shrink-0 mt-0.5">
            <Check className="h-3 w-3" /> Đã xong
          </span>
        )}
      </div>

      {/* Row 2: actions */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-neutral-100">
        {onViewExtract && (
          <button
            onClick={onViewExtract}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-100 bg-white px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
          >
            <FileText className="h-3.5 w-3.5" />
            Trích xuất
          </button>
        )}
        {onViewContent && (
          <button
            onClick={onViewContent}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-100 bg-white px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
          >
            <FileText className="h-3.5 w-3.5" />
            Xem nội dung
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-100 bg-white px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Tải xuống
          </button>
        )}
      </div>
    </div>
  )
}

```

---

## File: `components\providers\query-provider.tsx`

```tsx
"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

type QueryProviderProps = {
  children: React.ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  )
}

```

---

## File: `components\tour-button.tsx`

```tsx
"use client"

import { HelpCircle } from "lucide-react"
import { useTour } from "@/hooks/useTour"

export default function TourButton() {
  const { startTour } = useTour()

  return (
    <button
      onClick={startTour}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      title="Hướng dẫn sử dụng"
    >
      <HelpCircle className="h-6 w-6" />
    </button>
  )
}

```

---

## File: `components\ui\avatar.tsx`

```tsx
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-blue-100 text-blue-700",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }

```

---

## File: `components\ui\badge.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        {
          "border-transparent bg-blue-600 text-white shadow-sm": variant === "default",
          "border-transparent bg-blue-100 text-blue-900": variant === "secondary",
          "border-transparent bg-red-600 text-white shadow-sm": variant === "destructive",
          "text-blue-950 border-blue-200": variant === "outline",
          "border-transparent bg-green-100 text-green-700": variant === "success",
          "border-transparent bg-amber-100 text-amber-700": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }

```

---

## File: `components\ui\breadcrumb.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-blue-600 sm:gap-2.5",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a">
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "transition-colors hover:text-blue-900",
      className
    )}
    {...props}
  />
))
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("font-medium text-blue-900", className)}
    aria-current="page"
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipsis"

function ChevronRight({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function MoreHorizontal({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

```

---

## File: `components\ui\button.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-600 text-white hover:bg-blue-700 shadow-sm": variant === "default",
            "bg-red-600 text-white hover:bg-red-700 shadow-sm": variant === "destructive",
            "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50": variant === "outline",
            "bg-blue-100 text-blue-900 hover:bg-blue-200": variant === "secondary",
            "text-blue-700 hover:bg-blue-50": variant === "ghost",
            "text-blue-600 underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3 text-xs": size === "sm",
            "h-11 rounded-lg px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

```

---

## File: `components\ui\card.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-blue-200 bg-white text-blue-950 shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-blue-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

---

## File: `components\ui\checkbox.tsx`

```tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-blue-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

```

---

## File: `components\ui\dialog.tsx`

```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

```

---

## File: `components\ui\dropdown-menu.tsx`

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-blue-50 data-[state=open]:bg-blue-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-blue-200 bg-white p-1 text-blue-950 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-blue-200 bg-white p-1 text-blue-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-blue-50 focus:text-blue-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-blue-50 focus:text-blue-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-blue-50 focus:text-blue-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-blue-200", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

function Check({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function Circle({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-2 w-2", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

```

---

## File: `components\ui\file-viewer-modal.tsx`

```tsx
"use client"

import * as React from "react"
import { X, Download, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface FileViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileUrl: string
  fileName?: string
  fileType?: string
}

export function FileViewerModal({ open, onOpenChange, fileUrl, fileName, fileType }: FileViewerModalProps) {
  const getFileType = (url: string, type?: string) => {
    if (type) return type
    const ext = url.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) return 'image'
    if (['doc', 'docx'].includes(ext || '')) return 'word'
    if (['xls', 'xlsx'].includes(ext || '')) return 'excel'
    if (['ppt', 'pptx'].includes(ext || '')) return 'powerpoint'
    return 'unknown'
  }

  const type = getFileType(fileUrl, fileType)

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <div className="flex items-center justify-center bg-black/5 rounded-lg p-4">
            <img 
              src={fileUrl} 
              alt={fileName || "Preview"} 
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        )

      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-[85vh] rounded-lg border"
            title={fileName || "PDF Preview"}
          />
        )

      case 'word':
      case 'excel':
      case 'powerpoint':
        // Sử dụng Office Online Viewer cho Office files
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
        return (
          <iframe
            src={officeViewerUrl}
            className="w-full h-[85vh] rounded-lg border"
            title={fileName || "Office Document Preview"}
          />
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[85vh] bg-muted rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-muted-foreground mb-4">Không thể xem trước file này</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              Mở file trong tab mới
            </a>
          </div>
        )
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4">{fileName || "Xem file"}</DialogTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Tải xuống
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
                Đóng
              </button>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

```

---

## File: `components\ui\input.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm text-black shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

---

## File: `components\ui\label.tsx`

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), "text-black", className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```

---

## File: `components\ui\scroll-area.tsx`

```tsx
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-blue-200/50 hover:bg-blue-300/50 transition-colors" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }

```

---

## File: `components\ui\select.tsx`

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-lg border border-neutral-100 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white transition-colors focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-neutral-100 bg-white text-neutral-300 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-neutral-50 focus:text-neutral-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
}

```

---

## File: `components\ui\separator.tsx`

```tsx
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-blue-200",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

```

---

## File: `components\ui\table.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-neutral-50/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-neutral-50/50 data-[state=selected]:bg-neutral-100",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-4 text-left align-middle font-medium text-primary [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-neutral-500", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

```

---

## File: `components\ui\tabs.tsx`

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: "",
  onValueChange: () => {},
})

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    onValueChange: (value: string) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div ref={ref} className={cn("", className)} {...props} />
  </TabsContext.Provider>
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-blue-50 p-1 text-blue-600",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context.value === value

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-blue-900 shadow-sm"
          : "text-blue-600 hover:bg-blue-100",
        className
      )}
      onClick={() => context.onValueChange(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context.value === value

  if (!isActive) return null

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }

```

---

## File: `components\ui\tooltip.tsx`

```tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-blue-200 bg-white px-3 py-1.5 text-sm text-blue-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

```

---

## File: `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}

```

---

## File: `eslint.config.mjs`

```mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

```

---

## File: `frontend-guide.md`

```md
# MailConnector - Frontend Integration Guide

**Version:** 1.1  
**Last Updated:** 2026-05-24  
**Target Audience:** Frontend Developers, UI/UX Designers

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [UI Components Guidelines](#ui-components-guidelines)
6. [Error Handling](#error-handling)
7. [TypeScript Interfaces](#typescript-interfaces)
8. [Example Implementation](#example-implementation)
9. [Advanced Features](#advanced-features)

---

## Overview

MailConnector là hệ thống tích hợp email hỗ trợ kết nối tài khoản Gmail qua OAuth2, đồng bộ email, và quản lý tin nhắn.

### Base URL

```
https://{domain}/api/v1
```

### Supported Providers

- **Gmail** (hiện tại)
- Outlook/Exchange (dự kiến)

---

## Authentication Flow

### 1. OAuth2 Flow cho Gmail

#### Bước 1: Lấy Authorization URL

```http
POST /api/v1/mail-auth/oauth-url
Content-Type: application/json

{
  "redirectUri": "https://your-app.com/callback",
  "state": "random-state-string"
}
```

**Query Parameters:**
- `redirectUri` (required) - URL callback sau khi authorize
- `state` (required) - Chuỗi ngẫu nhiên để prevent CSRF

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "provider": "gmail"
  },
  "meta": {},
  "errors": []
}
```

**UI Action:** Redirect user đến `authUrl`

#### Bước 2: Xử lý Callback

Sau khi user authorize, Google redirect về `redirectUri` với `authorizationCode`.

#### Bước 3: Kết nối tài khoản

```http
POST /api/v1/mail-accounts/connect
Content-Type: application/json

{
  "authorizationCode": "4/0AX4XfWh...",
  "redirectUri": "https://your-app.com/callback"
}
```

**Response (201 Created):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "provider": "gmail",
    "emailAddress": "user@gmail.com",
    "displayName": "John Doe",
    "status": "active",
    "lastSyncedAt": null,
    "createdAt": "2026-05-22T10:30:00.000Z",
    "updatedAt": "2026-05-22T10:30:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

**UI Action:** Hiển thị thông báo thành công, chuyển đến danh sách tài khoản

---

## API Endpoints

### Mail Accounts

#### Lấy danh sách tài khoản email

```http
GET /api/v1/mail-accounts
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "provider": "gmail",
      "emailAddress": "user@gmail.com",
      "displayName": "John Doe",
      "status": "active",
      "lastSyncedAt": "2026-05-22T09:00:00.000Z",
      "createdAt": "2026-05-20T10:30:00.000Z",
      "updatedAt": "2026-05-22T09:00:00.000Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

#### Lấy chi tiết tài khoản

```http
GET /api/v1/mail-accounts/{id}
```

**Response (200 OK):** Tương tự như item trong danh sách

#### Cập nhật tài khoản

```http
PUT /api/v1/mail-accounts/{id}
Content-Type: application/json

{
  "displayName": "New Display Name"
}
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "uuid",
    "provider": "gmail",
    "emailAddress": "user@gmail.com",
    "displayName": "New Display Name",
    "status": "active",
    "lastSyncedAt": "2026-05-22T09:00:00.000Z",
    "createdAt": "2026-05-20T10:30:00.000Z",
    "updatedAt": "2026-05-22T10:30:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

#### Xóa tài khoản

```http
DELETE /api/v1/mail-accounts/{id}
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "uuid",
    "deleted": true
  },
  "meta": {},
  "errors": []
}
```

#### Lấy trạng thái đồng bộ

```http
GET /api/v1/mail-accounts/{id}/sync-status
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "accountId": "uuid",
    "status": "syncing",
    "totalMessages": 1500,
    "syncedMessages": 750,
    "failedMessages": 2,
    "currentFolder": "INBOX",
    "lastSyncedAt": "2026-05-22T09:00:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

**Status values:**
- `Pending` - Chờ đồng bộ
- `Syncing` - Đang đồng bộ
- `Success` - Hoàn thành thành công
- `PartialSuccess` - Hoàn thành một phần
- `Failed` - Thất bại

#### Kích hoạt đồng bộ

```http
POST /api/v1/mail-accounts/{id}/sync
Content-Type: application/json

{
  "syncType": "full",
  "folderIds": ["INBOX", "SENT"],
  "fromDate": "2026-01-01T00:00:00.000Z",
  "toDate": "2026-05-22T00:00:00.000Z"
}
```

**Response (202 Accepted):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "jobId": "uuid",
    "status": "queued"
  },
  "meta": {
    "job": {
      "jobId": "uuid",
      "status": "queued",
      "pollUrl": "/api/v1/mail-accounts/{id}/sync-status"
    }
  },
  "errors": []
}
```

**UI Action:** Hiển thị progress bar, poll `/sync-status` để cập nhật

#### Tạo tài khoản trực tiếp

```http
POST /api/v1/mail-accounts
Content-Type: application/json

{
  "provider": "gmail",
  "authorizationCode": "4/0AX4XfWh...",
  "redirectUri": "https://your-app.com/callback"
}
```

**Response (201 Created):** Tương tự như endpoint `/connect`

**UI Action:** Alternative endpoint để tạo tài khoản, trả về kết quả tương tự

#### Ping tài khoản

```http
GET /api/v1/mail-accounts/{id}/ping
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "status": "ok"
}
```

**UI Action:** Health check cho tài khoản, dùng để kiểm tra kết nối

#### Đồng bộ trực tiếp (không qua queue)

```http
POST /api/v1/mail-accounts/{id}/sync-direct
Content-Type: application/json

{
  "syncType": "full",
  "folderIds": ["INBOX", "SENT"],
  "fromDate": "2026-01-01T00:00:00.000Z",
  "toDate": "2026-05-22T00:00:00.000Z"
}
```

**Response (200 OK):**

```json
{
  "synced": true
}
```

**UI Action:** Đồng bộ trực tiếp mà không qua job queue - chủ yếu dùng cho testing

### Mail Messages

#### Lấy danh sách tin nhắn

```http
GET /api/v1/mail-messages?page=1&pageSize=20&filters=mailAccountId==<guid>&sortField=receivedAt&sortOrder=desc
```

**Query Parameters:**
- `page` (default: 1) - Số trang
- `pageSize` (default: 20) - Số item/trang
- `filters` (optional) - Bộ lọc theo DSL (xem ví dụ dưới)
- `sortField` (optional) - Trường để sort (default: receivedAt)
- `sortOrder` (optional) - Thứ tự sort (asc/desc, default: desc)

**Filter DSL Examples:**
- `mailAccountId==<guid>` - Lọc theo tài khoản
- `fromEmail@=gmail` - Lọc theo người gửi (contains)
- `hasAttachments==true` - Lọc có đính kèm
- `syncStatus==Synced|syncStatus==Failed` - Lọc theo trạng thái đồng bộ (OR)
- `receivedAt>=2025-01-01` - Lọc theo ngày nhận
- `receivedAt>=2025-01-01&receivedAt<=2025-12-31` - Lọc theo khoảng ngày

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "provider": "gmail",
      "subject": "Project Update",
      "fromEmail": "sender@example.com",
      "fromName": "Jane Smith",
      "receivedAt": "2026-05-22T09:00:00.000Z",
      "sentAt": "2026-05-22T08:55:00.000Z",
      "createdAt": "2026-05-22T09:00:00.000Z",
      "updatedAt": "2026-05-22T09:00:00.000Z",
      "hasAttachments": true,
      "syncStatus": "synced",
      "processStatus": "processed"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "errors": []
}
```

#### Lấy chi tiết tin nhắn

```http
GET /api/v1/mail-messages/{id}
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "uuid",
    "subject": "Project Update",
    "fromEmail": "sender@example.com",
    "fromName": "Jane Smith",
    "toEmails": ["recipient@example.com"],
    "ccEmails": ["cc@example.com"],
    "receivedAt": "2026-05-22T09:00:00.000Z",
    "sentAt": "2026-05-22T08:55:00.000Z",
    "createdAt": "2026-05-22T09:00:00.000Z",
    "updatedAt": "2026-05-22T09:00:00.000Z",
    "bodyText": "Plain text content...",
    "bodyHtml": "<p>HTML content...</p>",
    "attachments": [
      {
        "id": "uuid",
        "fileName": "document.pdf",
        "contentType": "application/pdf",
        "fileSize": 1024000,
        "downloadStatus": "available",
        "downloadUrl": null,
        "createdAt": "2026-05-22T09:00:00.000Z",
        "updatedAt": "2026-05-22T09:00:00.000Z"
      }
    ]
  },
  "meta": {},
  "errors": []
}
```

#### Lấy danh sách đính kèm

```http
GET /api/v1/mail-messages/{id}/attachments
```

**Response (200 OK):** Tương tự như `attachments` trong chi tiết tin nhắn

#### Tải xuống đính kèm

```http
GET /api/v1/mail-messages/{messageId}/attachments/{attachmentId}/download
```

**Response:** Binary file stream

**UI Action:** Tạo download link hoặc trigger browser download

#### Lấy nội dung đính kèm (base64)

```http
GET /api/v1/mail-messages/{messageId}/attachments/{attachmentId}/content
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "content": "base64_encoded_content",
    "fileName": "document.pdf",
    "contentType": "application/pdf"
  },
  "meta": {},
  "errors": []
}
```

#### Trích xuất văn bản từ đính kèm PDF

```http
GET /api/v1/mail-messages/{messageId}/attachments/{attachmentId}/extract-text
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "text": "Extracted text content from PDF...",
    "fileName": "document.pdf"
  },
  "meta": {},
  "errors": []
}
```

**Note:** Chỉ hỗ trợ file PDF

### Document Processing

#### Xử lý tài liệu đơn với AI

```http
POST /api/v1/document-processor/process
Content-Type: application/json

{
  "content": "Document content here...",
  "prompt": "Extract key information",
  "model": "gpt-4",
  "isImage": false,
  "mimeType": "text/plain"
}
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "result": "Extracted information...",
    "model": "gpt-4",
    "tokensUsed": 150
  },
  "meta": {},
  "errors": []
}
```

#### Xử lý nhiều tài liệu

```http
POST /api/v1/document-processor/process-multiple
Content-Type: application/json

{
  "files": [
    {
      "fileName": "document1.pdf",
      "content": "base64 or text content",
      "type": "text",
      "mimeType": "application/pdf"
    }
  ],
  "prompt": "Compare these documents",
  "model": "gpt-4"
}
```

**Response (200 OK):** Tương tự như xử lý đơn

### Email Analysis Results

#### Lấy danh sách kết quả phân tích

```http
GET /api/v1/mail-analysis-results?status=pending
```

**Query Parameters:**
- `status` (optional) - Lọc theo trạng thái (NotStarted, Processing, Completed, PendingReview, Approved, Rejected, Failed)

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "mailMessageId": "uuid",
      "category": "BusinessDocument",
      "detectedIntent": "CreateOrderRequest",
      "status": "PendingReview",
      "confidenceScore": 0.95,
      "extractedFields": {
        "invoiceNumber": "INV-001",
        "amount": "1000",
        "dueDate": "2026-06-01"
      },
      "missingFields": [],
      "warnings": [],
      "modelName": "gpt-4",
      "inputTokenCount": 500,
      "outputTokenCount": 200,
      "costEstimate": 0.01,
      "reviewedByUserId": null,
      "reviewedAt": null,
      "createdAt": "2026-05-22T10:00:00.000Z",
      "updatedAt": "2026-05-22T10:00:00.000Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

#### Tạo kết quả phân tích mới

```http
POST /api/v1/mail-analysis-results
Content-Type: application/json

{
  "mailMessageId": "uuid"
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto

#### Phê duyệt kết quả

```http
POST /api/v1/mail-analysis-results/{id}/approve
Content-Type: application/json

{
  "userId": "uuid"
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto với status = approved

#### Từ chối kết quả

```http
POST /api/v1/mail-analysis-results/{id}/reject
Content-Type: application/json

{
  "userId": "uuid",
  "reason": "Incorrect extraction"
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto với status = rejected

#### Cập nhật fields

```http
PUT /api/v1/mail-analysis-results/{id}/fields
Content-Type: application/json

{
  "extractedFields": {
    "invoiceNumber": "INV-001",
    "amount": "1000"
  },
  "missingFields": ["dueDate"],
  "warnings": ["Amount seems low"]
}
```

**Response (200 OK):** Trả về EmailAnalysisResultDto đã cập nhật

#### Lấy delivery logs

```http
GET /api/v1/mail-analysis-results/{id}/delivery-logs
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "subscriberCode": "sub_001",
      "eventType": "analysis.completed",
      "callbackUrl": "https://your-app.com/webhook",
      "responseStatus": 200,
      "responseBody": "{\"status\": \"success\"}",
      "status": "delivered",
      "retryCount": 0,
      "errorMessage": null,
      "deliveredAt": "2026-05-22T10:05:00.000Z",
      "createdAt": "2026-05-22T10:00:00.000Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

### Email Processing

#### Xử lý email

```http
POST /api/v1/mail-messages/{id}/process
```

**Response (200 OK):** Tạo analysis result mới

#### Chuẩn hóa email

```http
POST /api/v1/mail-messages/{id}/normalize
```

**Response (200 OK):** Email được chuẩn hóa

#### Phân loại email

```http
POST /api/v1/mail-messages/{id}/classify
```

**Response (200 OK):** Email được phân loại

#### Kích hoạt pipeline xử lý

```http
POST /api/v1/mail-messages/{id}/trigger-pipeline
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "message": "Processing pipeline triggered successfully"
  },
  "meta": {},
  "errors": []
}
```

**UI Action:** Hiển thị thông báo pipeline đã được kích hoạt

#### Lấy danh sách processing jobs

```http
GET /api/v1/mail-messages/{id}/processing-jobs
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "jobType": "normalize",
      "status": "completed",
      "createdAt": "2026-05-22T10:00:00.000Z",
      "startedAt": "2026-05-22T10:00:01.000Z",
      "completedAt": "2026-05-22T10:00:05.000Z",
      "errorMessage": null,
      "retryCount": 0
    }
  ],
  "meta": {},
  "errors": []
}
```

#### Trích xuất trường từ email

```http
POST /api/v1/mail-messages/{id}/extract
Content-Type: application/json

{
  "templateCode": "invoice_template",
  "expectedFields": {
    "invoiceNumber": "string",
    "amount": "number"
  }
}
```

**Response (200 OK):** Trích xuất fields theo template

### Email Templates

#### Lấy danh sách templates

```http
GET /api/v1/mail-templates
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "templateCode": "invoice_template",
      "templateName": "Invoice Template",
      "description": "Template for processing invoices",
      "subjectPattern": "Invoice.*",
      "bodyPattern": "Total:.*",
      "expectedFields": {
        "invoiceNumber": "Invoice #",
        "amount": "Total amount"
      },
      "documentTypes": ["pdf", "docx"],
      "isActive": true,
      "createdAt": "2026-05-20T10:00:00.000Z",
      "updatedAt": "2026-05-20T10:00:00.000Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

#### Tạo template mới

```http
POST /api/v1/mail-templates
Content-Type: application/json

{
  "templateCode": "new_template",
  "templateName": "New Template",
  "description": "Template description",
  "subjectPattern": "Pattern.*",
  "bodyPattern": "Body pattern",
  "expectedFields": {
    "field1": "description"
  },
  "documentTypes": ["pdf"]
}
```

**Response (201 Created):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "uuid",
    "templateCode": "new_template",
    "templateName": "New Template",
    "description": "Template description",
    "subjectPattern": "Pattern.*",
    "bodyPattern": "Body pattern",
    "expectedFields": {
      "field1": "description"
    },
    "documentTypes": ["pdf"],
    "isActive": true,
    "createdAt": "2026-05-22T10:30:00.000Z",
    "updatedAt": "2026-05-22T10:30:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

**Location Header:** `/api/v1/mail-templates/{id}`

#### Cập nhật template

```http
PUT /api/v1/mail-templates/{id}
Content-Type: application/json

{
  "templateName": "Updated Name",
  "isActive": false
}
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "id": "uuid",
    "templateCode": "invoice_template",
    "templateName": "Updated Name",
    "description": "Template description",
    "subjectPattern": "Pattern.*",
    "bodyPattern": "Body pattern",
    "expectedFields": {
      "field1": "description"
    },
    "documentTypes": ["pdf"],
    "isActive": false,
    "createdAt": "2026-05-20T10:00:00.000Z",
    "updatedAt": "2026-05-22T10:30:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

#### Xóa template

```http
DELETE /api/v1/mail-templates/{id}
```

**Response (204 No Content)**

### Webhook Subscriptions

#### Lấy danh sách subscriptions

```http
GET /api/v1/webhook-subscriptions
```

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "subscriberCode": "sub_001",
      "callbackUrl": "https://your-app.com/webhook",
      "eventTypes": ["email.received", "analysis.completed"],
      "isActive": true,
      "createdAt": "2026-05-20T10:00:00.000Z",
      "updatedAt": "2026-05-20T10:00:00.000Z"
    }
  ],
  "meta": {},
  "errors": []
}
```

#### Tạo subscription mới

```http
POST /api/v1/webhook-subscriptions
Content-Type: application/json

{
  "subscriberCode": "sub_001",
  "callbackUrl": "https://your-app.com/webhook",
  "eventTypes": ["email.received", "analysis.completed"],
  "secretKey": "optional-secret"
}
```

**Response (201 Created):** Trả về WebhookSubscriptionDto

#### Cập nhật subscription

```http
PUT /api/v1/webhook-subscriptions/{id}
Content-Type: application/json

{
  "callbackUrl": "https://new-url.com/webhook",
  "eventTypes": ["email.received"],
  "isActive": false
}
```

**Response (200 OK):** Trả về WebhookSubscriptionDto đã cập nhật

#### Xóa subscription

```http
DELETE /api/v1/webhook-subscriptions/{id}
```

**Response (204 No Content)**

#### Test webhook

```http
POST /api/v1/webhook-subscriptions/{id}/test
Content-Type: application/json

{
  "eventType": "email.received",
  "payload": {
    "test": true
  }
}
```

**Response (200 OK):**

```json
{
  "message": "Test webhook dispatched successfully"
}
```

---

## Data Models

### MailAccount

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID tài khoản |
| `provider` | string | Nhà cung cấp (gmail, outlook) |
| `emailAddress` | string | Địa chỉ email |
| `displayName` | string? | Tên hiển thị |
| `status` | string | Trạng thái (Connected, AuthRequired, Syncing, Paused, Disconnected, Error) |
| `lastSyncedAt` | DateTime? | Thời gian đồng bộ cuối |
| `createdAt` | DateTime | Thời gian tạo |
| `updatedAt` | DateTime | Thời gian cập nhật |

### MailMessage

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID tin nhắn |
| `provider` | string | Nhà cung cấp |
| `subject` | string? | Tiêu đề |
| `fromEmail` | string? | Email người gửi |
| `fromName` | string? | Tên người gửi |
| `receivedAt` | DateTime? | Thời gian nhận |
| `sentAt` | DateTime? | Thời gian gửi |
| `createdAt` | DateTime | Thời gian tạo bản ghi |
| `updatedAt` | DateTime | Thời gian cập nhật bản ghi |
| `hasAttachments` | boolean | Có đính kèm không |
| `syncStatus` | string | Trạng thái đồng bộ |
| `processStatus` | string | Trạng thái xử lý |

### Attachment

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID đính kèm |
| `fileName` | string | Tên file |
| `contentType` | string? | MIME type |
| `fileSize` | long? | Kích thước (bytes) |
| `downloadStatus` | string | Trạng thái tải xuống |
| `downloadUrl` | string? | URL tải xuống |
| `createdAt` | DateTime | Thời gian tạo bản ghi |
| `updatedAt` | DateTime | Thời gian cập nhật bản ghi |

### SyncStatus

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | GUID | ID tài khoản |
| `status` | string | Trạng thái (Pending, Syncing, Success, PartialSuccess, Failed) |
| `totalMessages` | number | Tổng số tin nhắn |
| `syncedMessages` | number | Số đã đồng bộ |
| `failedMessages` | number | Số thất bại |
| `currentFolder` | string? | Folder hiện tại |
| `lastSyncedAt` | DateTime? | Thời gian đồng bộ cuối |

### EmailAnalysisResult

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID kết quả phân tích |
| `mailMessageId` | GUID | ID email message |
| `category` | string? | Category (BusinessDocument, OrderRequest, SupportRequest, Notification, SystemEmail, Spam, Unknown) |
| `detectedIntent` | string? | Intent detected (CreateOrderRequest, UpdateOrderRequest, CancelOrderRequest, SupportInquiry, InformationRequest, Unknown) |
| `status` | string | Trạng thái (NotStarted, Processing, Completed, PendingReview, Approved, Rejected, Failed) |
| `confidenceScore` | decimal? | Độ tin cậy (0-1) |
| `extractedFields` | object? | Fields đã trích xuất |
| `missingFields` | string[]? | Fields còn thiếu |
| `warnings` | string[]? | Cảnh báo |
| `modelName` | string? | Model AI sử dụng |
| `inputTokenCount` | int? | Số token input |
| `outputTokenCount` | int? | Số token output |
| `costEstimate` | decimal? | Chi phí ước tính |
| `reviewedByUserId` | GUID? | ID user review |
| `reviewedAt` | DateTime? | Thời gian review |
| `createdAt` | DateTime | Thời gian tạo |
| `updatedAt` | DateTime | Thời gian cập nhật |

### EmailTemplate

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID template |
| `templateCode` | string | Mã template (unique) |
| `templateName` | string | Tên template |
| `description` | string? | Mô tả |
| `subjectPattern` | string? | Pattern subject (regex) |
| `bodyPattern` | string? | Pattern body (regex) |
| `expectedFields` | object? | Fields mong đợi |
| `documentTypes` | string[]? | Loại document hỗ trợ |
| `isActive` | boolean | Có active không |
| `createdAt` | DateTime | Thời gian tạo |
| `updatedAt` | DateTime | Thời gian cập nhật |

### WebhookSubscription

| Field | Type | Description |
|-------|------|-------------|
| `id` | GUID | ID subscription |
| `subscriberCode` | string | Mã subscriber (unique) |
| `callbackUrl` | string | URL callback |
| `eventTypes` | string[] | Event types subscribed |
| `isActive` | boolean | Có active không |
| `createdAt` | DateTime | Thời gian tạo |
| `updatedAt` | DateTime | Thời gian cập nhật |

### DocumentProcessingResponse

| Field | Type | Description |
|-------|------|-------------|
| `result` | string | Kết quả xử lý |
| `model` | string | Model AI sử dụng |
| `tokensUsed` | int | Số token đã dùng |

---

## UI Components Guidelines

### 1. Mail Accounts List Page

**Layout:**
- Header: "Email Accounts" + "Add Account" button
- Table/Grid hiển thị danh sách tài khoản
- Columns: Email, Provider, Status, Last Synced, Actions

**Actions:**
- Add Account → Mở modal OAuth flow
- Sync → Kích hoạt đồng bộ
- Delete → Xác nhận xóa
- View Details → Chuyển đến trang chi tiết

**Status Indicators:**
- Connected: Green badge
- AuthRequired: Yellow badge
- Syncing: Blue badge + spinner
- Paused: Gray badge
- Disconnected: Orange badge
- Error: Red badge

### 2. OAuth Connect Modal

**Flow:**
1. User click "Add Account"
2. Hiển thị modal với provider selection (Gmail hiện tại)
3. User chọn provider → gọi `/oauth-url`
4. Redirect đến Google OAuth page
5. Callback → gọi `/connect` với authorization code
6. Success → Đóng modal, refresh danh sách
7. Error → Hiển thị error message

**UI Elements:**
- Provider cards (Gmail icon + label)
- Loading state trong khi redirect
- Error message nếu failed

### 3. Sync Progress

**Display:**
- Progress bar: `(syncedMessages / totalMessages) * 100`
- Status text: "Syncing... 750/1500 messages"
- Current folder: "Current: INBOX"
- Failed count: "Failed: 2" (nếu > 0)

**Behavior:**
- Poll `/sync-status` mỗi 2-3 giây
- Auto-stop khi status = `completed` hoặc `failed`
- Show retry button nếu failed

### 4. Mail Messages List

**Layout:**
- Header: "Messages" + Filters
- Filters: Account dropdown, Search by sender, Has attachment toggle
- Table/List view với pagination

**Columns:**
- Subject (clickable → detail)
- From
- Received At
- Attachment icon (nếu có)
- Status badges

**Pagination:**
- Page size selector (10, 20, 50, 100)
- Page navigation (Previous, Next, Page numbers)
- Total count display

### 5. Message Detail

**Layout:**
- Header: Subject + Back button
- Info section: From, To, CC, Date
- Body: HTML content (sanitized)
- Attachments section (nếu có)

**Attachments:**
- List view với icon, filename, size
- Download button → gọi `/download` endpoint
- Preview cho images (nếu hỗ trợ)

### 6. Analysis Results List

**Layout:**
- Header: "Analysis Results" + Filters
- Filters: Status dropdown, Category dropdown, Date range
- Table/List view với pagination

**Columns:**
- Email Subject (clickable → email detail)
- Category badge
- Intent badge
- Confidence score (progress bar)
- Status badge
- Actions (Approve, Reject, View)

**Status Indicators:**
- NotStarted: Gray badge
- Processing: Blue badge + spinner
- Completed: Blue badge
- PendingReview: Yellow badge
- Approved: Green badge
- Rejected: Red badge
- Failed: Red badge

**Actions:**
- Approve → Phê duyệt kết quả
- Reject → Mở modal nhập lý do
- View → Xem chi tiết extracted fields

### 7. Analysis Result Detail

**Layout:**
- Header: "Analysis Result" + Back button
- Info section: Email info, Category, Intent, Confidence
- Extracted Fields section (key-value pairs)
- Missing Fields section (nếu có)
- Warnings section (nếu có)
- AI Info section: Model, Tokens, Cost
- Actions: Approve/Reject buttons

**Extracted Fields:**
- Display as key-value table
- Editable fields (nếu cần chỉnh sửa)
- Copy button cho từng field

### 8. Templates Management

**Layout:**
- Header: "Email Templates" + "Create Template" button
- Table/Grid hiển thị danh sách templates
- Columns: Template Code, Name, Description, Document Types, Active, Actions

**Actions:**
- Create → Mở form tạo template
- Edit → Mở form chỉnh sửa
- Delete → Xác nhận xóa
- Toggle Active → Bật/tắt template

**Template Form:**
- Template Code (required, unique)
- Template Name (required)
- Description (optional)
- Subject Pattern (regex, optional)
- Body Pattern (regex, optional)
- Expected Fields (key-value pairs)
- Document Types (multi-select)
- Active toggle

### 9. Webhook Subscriptions

**Layout:**
- Header: "Webhook Subscriptions" + "Add Subscription" button
- Table hiển thị danh sách subscriptions
- Columns: Subscriber Code, Callback URL, Event Types, Active, Actions

**Actions:**
- Add → Mở form tạo subscription
- Edit → Mở form chỉnh sửa
- Delete → Xác nhận xóa
- Test → Test webhook với payload tùy chỉnh
- Toggle Active → Bật/tắt subscription

**Subscription Form:**
- Subscriber Code (required, unique)
- Callback URL (required, must be valid URL)
- Event Types (multi-select from available events)
- Secret Key (optional, for signature verification)
- Active toggle

**Available Event Types:**
- `email.received` - Email mới được đồng bộ
- `email.synced` - Email đồng bộ hoàn tất
- `analysis.completed` - Phân tích email hoàn tất
- `analysis.approved` - Kết quả được phê duyệt
- `analysis.rejected` - Kết quả bị từ chối

### AI Usage

#### Lấy thống kê sử dụng OpenAI

```http
GET /api/v1/ai/openai-usage?startDate=2026-05-01&endDate=2026-05-31
```

**Query Parameters:**
- `startDate` (optional, date) - Ngày bắt đầu (default: 30 ngày trước)
- `endDate` (optional, date) - Ngày kết thúc (default: hiện tại)

**Response (200 OK):**

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": {
    "startDate": "2026-05-01",
    "endDate": "2026-05-31",
    "summary": {
      "totalRequests": 1500,
      "totalContextTokens": 500000,
      "totalGeneratedTokens": 300000,
      "totalTokens": 800000,
      "totalCost": 12.50
    },
    "dailyUsage": [
      {
        "date": "2026-05-22T00:00:00.000Z",
        "requests": 50,
        "contextTokens": 15000,
        "generatedTokens": 10000,
        "totalTokens": 25000,
        "cost": 0.40
      }
    ]
  },
  "meta": {},
  "errors": []
}
```

**UI Action:** Hiển thị dashboard thống kê chi phí AI

#### Lấy thống kê sử dụng OpenAI tháng hiện tại

```http
GET /api/v1/ai/openai-usage/current-month
```

**Response (200 OK):** Tương tự như trên nhưng chỉ cho tháng hiện tại

**UI Action:** Hiển thị tổng quan chi phí tháng hiện tại

### OAuth Callback

#### Xử lý OAuth callback từ Google

```http
GET /oauth/callback?code=4/0AX4XfWh...&state=random-state-string
```

**Query Parameters:**
- `code` (required) - Authorization code từ Google
- `state` (required) - State string để prevent CSRF

**Response:** HTML page hiển thị kết quả (thành công hoặc thất bại)

**UI Action:**
- Endpoint này được Google redirect về sau khi user authorize
- Frontend không cần gọi trực tiếp, chỉ cần cấu hình redirect URI trong Google OAuth console
- Sau khi callback thành công, user có thể được redirect về frontend app

---

## Error Handling

### Standard Error Response

```json
{
  "correlationId": "uuid",
  "traceId": "uuid",
  "timestamp": "2026-05-22T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": "email",
      "code": "VALIDATION_INVALID_EMAIL",
      "message": "Email không hợp lệ",
      "messageKey": "validation.email.invalid",
      "severity": "low"
    }
  ]
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Tài nguyên không tồn tại |
| `VALIDATION_ERROR` | 422 | Lỗi validation |
| `UNAUTHORIZED` | 401 | Chưa xác thực |
| `FORBIDDEN` | 403 | Không có quyền |
| `EXTERNAL_SERVICE_ERROR` | 502 | Lỗi service bên ngoài (Google API) |
| `RATE_LIMIT_EXCEEDED` | 429 | Vượt quá giới hạn |

### UI Error Handling

**Validation Errors:**
- Hiển thị error message dưới field tương ứng
- Use `messageKey` cho i18n nếu cần

**Not Found:**
- Hiển thị 404 page hoặc empty state
- Message: "Resource not found"

**External Service Errors:**
- Hiển thị friendly message: "Cannot connect to email provider"
- Suggest user thử lại sau

**Rate Limit:**
- Hiển thị message với retry time
- Disable action temporarily

---

## TypeScript Interfaces

```typescript
// API Response Envelope
interface ApiResponse<T> {
  correlationId: string;
  traceId: string;
  timestamp: string;
  data: T | null;
  meta: ApiMeta;
  errors: ApiError[];
}

interface ApiMeta {
  pagination?: PaginationMeta;
  cursor?: CursorPaginationMeta;
  sort?: SortMeta;
  job?: JobMeta;
  extra?: Record<string, unknown>;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface JobMeta {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  pollUrl?: string;
}

interface ApiError {
  field?: string;
  code: string;
  message: string;
  messageKey?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Mail Account
interface MailAccount {
  id: string;
  provider: string;
  emailAddress: string;
  displayName?: string;
  status: AccountStatus;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateMailAccountRequest {
  provider: string;
  authorizationCode: string;
  redirectUri: string;
}

interface UpdateMailAccountRequest {
  displayName?: string;
}

interface ConnectAccountRequest {
  authorizationCode: string;
  redirectUri: string;
}

// Sync
interface SyncStatus {
  accountId: string;
  status: SyncStatusEnum;
  totalMessages: number;
  syncedMessages: number;
  failedMessages: number;
  currentFolder?: string;
  lastSyncedAt?: string;
}

interface TriggerSyncRequest {
  syncType: string;
  folderIds: string[];
  fromDate?: string;
  toDate?: string;
}

// Mail Message
interface MailMessage {
  id: string;
  provider: string;
  subject?: string;
  fromEmail?: string;
  fromName?: string;
  receivedAt?: string;
  hasAttachments: boolean;
  syncStatus: string;
  processStatus: string;
}

interface MailMessageDetail {
  id: string;
  subject?: string;
  fromEmail?: string;
  fromName?: string;
  toEmails: string[];
  ccEmails: string[];
  receivedAt?: string;
  bodyText?: string;
  bodyHtml?: string;
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  fileName: string;
  contentType?: string;
  fileSize?: number;
  downloadStatus: string;
  downloadUrl?: string;
}

// OAuth
interface OAuthUrlRequest {
  redirectUri: string;
  state: string;
}

interface OAuthUrlResponse {
  authUrl: string;
  provider: string;
}

interface TokenExchangeRequest {
  authorizationCode: string;
  redirectUri: string;
}

interface TokenExchangeResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  userProfile: UserProfile;
}

interface UserProfile {
  id: string;
  emailAddress: string;
  displayName?: string;
  photoUrl?: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
}

// Enums
type EmailCategory = 'BusinessDocument' | 'OrderRequest' | 'SupportRequest' | 'Notification' | 'SystemEmail' | 'Spam' | 'Unknown';
type EmailIntent = 'CreateOrderRequest' | 'UpdateOrderRequest' | 'CancelOrderRequest' | 'SupportInquiry' | 'InformationRequest' | 'Unknown';
type AnalysisStatus = 'NotStarted' | 'Processing' | 'Completed' | 'PendingReview' | 'Approved' | 'Rejected' | 'Failed';
type AccountStatus = 'Connected' | 'AuthRequired' | 'Syncing' | 'Paused' | 'Disconnected' | 'Error';
type SyncStatusEnum = 'Pending' | 'Syncing' | 'Success' | 'PartialSuccess' | 'Failed';

// Email Analysis Result
interface EmailAnalysisResult {
  id: string;
  mailMessageId: string;
  category?: EmailCategory;
  detectedIntent?: EmailIntent;
  status: AnalysisStatus;
  confidenceScore?: number;
  extractedFields?: Record<string, string>;
  missingFields?: string[];
  warnings?: string[];
  modelName?: string;
  inputTokenCount?: number;
  outputTokenCount?: number;
  costEstimate?: number;
  reviewedByUserId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateAnalysisResultRequest {
  mailMessageId: string;
}

interface UpdateAnalysisResultRequest {
  extractedFields?: Record<string, string>;
  missingFields?: string[];
  warnings?: string[];
}

interface ApproveAnalysisResultRequest {
  userId: string;
}

interface RejectAnalysisResultRequest {
  userId: string;
  reason?: string;
}

// Email Template
interface EmailTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  description?: string;
  subjectPattern?: string;
  bodyPattern?: string;
  expectedFields?: Record<string, string>;
  documentTypes?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateTemplateRequest {
  templateCode: string;
  templateName: string;
  description?: string;
  subjectPattern?: string;
  bodyPattern?: string;
  expectedFields?: Record<string, string>;
  documentTypes?: string[];
}

interface UpdateTemplateRequest {
  templateName?: string;
  description?: string;
  subjectPattern?: string;
  bodyPattern?: string;
  expectedFields?: Record<string, string>;
  documentTypes?: string[];
  isActive?: boolean;
}

// Webhook Subscription
interface WebhookSubscription {
  id: string;
  subscriberCode: string;
  callbackUrl: string;
  eventTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateWebhookSubscriptionRequest {
  subscriberCode: string;
  callbackUrl: string;
  eventTypes: string[];
  secretKey?: string;
}

interface UpdateWebhookSubscriptionRequest {
  callbackUrl?: string;
  eventTypes?: string[];
  isActive?: boolean;
}

interface TestWebhookRequest {
  eventType: string;
  payload?: object;
}

// Document Processing
interface DocumentProcessingRequest {
  content: string;
  prompt?: string;
  model?: string;
  isImage: boolean;
  mimeType?: string;
}

interface DocumentProcessingResponse {
  result: string;
  model: string;
  tokensUsed: number;
}

interface FileContentDto {
  fileName: string;
  content: string;
  type: 'text' | 'image';
  mimeType?: string;
}

interface ProcessMultipleDocumentsRequest {
  files: FileContentDto[];
  prompt?: string;
  model?: string;
}

// AI Usage
interface OpenAiUsageSummary {
  totalRequests: number;
  totalContextTokens: number;
  totalGeneratedTokens: number;
  totalTokens: number;
  totalCost: number;
}

interface DailyUsage {
  date: string;
  requests: number;
  contextTokens: number;
  generatedTokens: number;
  totalTokens: number;
  cost: number;
}

interface OpenAiUsageResponse {
  startDate: string;
  endDate: string;
  summary: OpenAiUsageSummary;
  dailyUsage: DailyUsage[];
}

// Email Processing
interface ExtractEmailRequest {
  mailMessageId: string;
  templateCode?: string;
  expectedFields?: Record<string, string>;
}
```

---

## Example Implementation

### React Hook cho Mail Accounts

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = '/api/v1';

interface UseMailAccountsResult {
  accounts: MailAccount[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  connectAccount: (code: string, redirectUri: string) => Promise<void>;
  updateAccount: (id: string, displayName: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  triggerSync: (id: string, options?: TriggerSyncRequest) => Promise<string>;
}

export function useMailAccounts(): UseMailAccountsResult {
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<MailAccount[]>>(
        `${API_BASE}/mail-accounts`
      );
      setAccounts(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (code: string, redirectUri: string) => {
    await axios.post(`${API_BASE}/mail-accounts/connect`, {
      authorizationCode: code,
      redirectUri
    });
    await fetchAccounts();
  };

  const deleteAccount = async (id: string) => {
    await axios.delete(`${API_BASE}/mail-accounts/${id}`);
    await fetchAccounts();
  };

  const updateAccount = async (id: string, displayName: string) => {
    await axios.put(`${API_BASE}/mail-accounts/${id}`, { displayName });
    await fetchAccounts();
  };

  const triggerSync = async (id: string, options?: TriggerSyncRequest) => {
    const response = await axios.post<ApiResponse<{ jobId: string; status: string }>>(
      `${API_BASE}/mail-accounts/${id}/sync`,
      options || { syncType: 'full', folderIds: [] }
    );
    return response.data.data?.jobId || '';
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    refresh: fetchAccounts,
    connectAccount,
    deleteAccount,
    triggerSync
  };
}
```

### React Hook cho Sync Progress

```typescript
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface UseSyncProgressResult {
  status: SyncStatus | null;
  progress: number;
  isSyncing: boolean;
  startPolling: (accountId: string) => void;
  stopPolling: () => void;
}

export function useSyncProgress(): UseSyncProgressResult {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!accountId) return;
    
    const response = await axios.get<ApiResponse<SyncStatus>>(
      `${API_BASE}/mail-accounts/${accountId}/sync-status`
    );
    setStatus(response.data.data);
    
    // Stop polling if completed or failed
    if (response.data.data?.status === 'completed' || 
        response.data.data?.status === 'failed') {
      setPolling(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (!polling || !accountId) return;

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [polling, accountId, fetchStatus]);

  const progress = status 
    ? (status.syncedMessages / status.totalMessages) * 100 
    : 0;

  const isSyncing = status?.status === 'syncing';

  return {
    status,
    progress,
    isSyncing,
    startPolling: (id: string) => {
      setAccountId(id);
      setPolling(true);
    },
    stopPolling: () => setPolling(false)
  };
}
```

### OAuth Flow Component

```typescript
import { useState } from 'react';
import { useMailAccounts } from './hooks/useMailAccounts';

export function OAuthConnectButton() {
  const { connectAccount } = useMailAccounts();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      
      // Step 1: Get OAuth URL
      const redirectUri = `${window.location.origin}/callback`;
      const state = Math.random().toString(36).substring(7);
      
      const response = await axios.post<ApiResponse<OAuthUrlResponse>>(
        `${API_BASE}/mail-auth/oauth-url`,
        { redirectUri, state }
      );
      
      // Step 2: Redirect to Google
      window.location.href = response.data.data.authUrl;
      
    } catch (error) {
      console.error('OAuth failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle callback (in callback page component)
  const handleCallback = async (authorizationCode: string) => {
    const redirectUri = `${window.location.origin}/callback`;
    await connectAccount(authorizationCode, redirectUri);
    // Redirect back to accounts list
  };

  return (
    <button onClick={handleConnect} disabled={loading}>
      {loading ? 'Connecting...' : 'Add Gmail Account'}
    </button>
  );
}
```

### React Hook cho Analysis Results

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseAnalysisResultsResult {
  results: EmailAnalysisResult[];
  loading: boolean;
  error: string | null;
  createResult: (mailMessageId: string) => Promise<void>;
  approveResult: (id: string, userId: string) => Promise<void>;
  rejectResult: (id: string, userId: string, reason?: string) => Promise<void>;
  updateFields: (id: string, fields: Record<string, string>) => Promise<void>;
}

export function useAnalysisResults(status?: string): UseAnalysisResultsResult {
  const [results, setResults] = useState<EmailAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = status ? { status } : {};
      const response = await axios.get<ApiResponse<EmailAnalysisResult[]>>(
        `${API_BASE}/mail-analysis-results`,
        { params }
      );
      setResults(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analysis results');
    } finally {
      setLoading(false);
    }
  };

  const createResult = async (mailMessageId: string) => {
    await axios.post(`${API_BASE}/mail-analysis-results`, { mailMessageId });
    await fetchResults();
  };

  const approveResult = async (id: string, userId: string) => {
    await axios.post(`${API_BASE}/mail-analysis-results/${id}/approve`, { userId });
    await fetchResults();
  };

  const rejectResult = async (id: string, userId: string, reason?: string) => {
    await axios.post(`${API_BASE}/mail-analysis-results/${id}/reject`, { userId, reason });
    await fetchResults();
  };

  const updateFields = async (id: string, fields: Record<string, string>) => {
    await axios.put(`${API_BASE}/mail-analysis-results/${id}/fields`, { extractedFields: fields });
    await fetchResults();
  };

  useEffect(() => {
    fetchResults();
  }, [status]);

  return {
    results,
    loading,
    error,
    createResult,
    approveResult,
    rejectResult,
    updateFields
  };
}
```

### React Hook cho Templates

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseTemplatesResult {
  templates: EmailTemplate[];
  loading: boolean;
  error: string | null;
  createTemplate: (template: CreateTemplateRequest) => Promise<void>;
  updateTemplate: (id: string, template: UpdateTemplateRequest) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export function useTemplates(): UseTemplatesResult {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<EmailTemplate[]>>(
        `${API_BASE}/mail-templates`
      );
      setTemplates(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: CreateTemplateRequest) => {
    await axios.post(`${API_BASE}/mail-templates`, template);
    await fetchTemplates();
  };

  const updateTemplate = async (id: string, template: UpdateTemplateRequest) => {
    await axios.put(`${API_BASE}/mail-templates/${id}`, template);
    await fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    await axios.delete(`${API_BASE}/mail-templates/${id}`);
    await fetchTemplates();
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
}
```

### React Hook cho Webhook Subscriptions

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseWebhooksResult {
  subscriptions: WebhookSubscription[];
  loading: boolean;
  error: string | null;
  createSubscription: (sub: CreateWebhookSubscriptionRequest) => Promise<void>;
  updateSubscription: (id: string, sub: UpdateWebhookSubscriptionRequest) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  testWebhook: (id: string, eventType: string, payload?: object) => Promise<void>;
}

export function useWebhooks(): UseWebhooksResult {
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<WebhookSubscription[]>>(
        `${API_BASE}/webhook-subscriptions`
      );
      setSubscriptions(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch webhook subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (sub: CreateWebhookSubscriptionRequest) => {
    await axios.post(`${API_BASE}/webhook-subscriptions`, sub);
    await fetchSubscriptions();
  };

  const updateSubscription = async (id: string, sub: UpdateWebhookSubscriptionRequest) => {
    await axios.put(`${API_BASE}/webhook-subscriptions/${id}`, sub);
    await fetchSubscriptions();
  };

  const deleteSubscription = async (id: string) => {
    await axios.delete(`${API_BASE}/webhook-subscriptions/${id}`);
    await fetchSubscriptions();
  };

  const testWebhook = async (id: string, eventType: string, payload?: object) => {
    await axios.post(`${API_BASE}/webhook-subscriptions/${id}/test`, { eventType, payload });
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    testWebhook
  };
}
```

---

## Best Practices

### 1. Error Boundaries

Wrap components với Error Boundary để handle unexpected errors:

```typescript
class APIErrorBoundary extends React.Component {
  // Handle API errors gracefully
}
```

### 2. Loading States

Luôn hiển thị loading state khi gọi API:
- Skeleton loaders cho lists
- Spinners cho actions
- Disable buttons trong khi loading

### 3. Optimistic Updates

Cho các actions không critical (ví dụ: delete), có thể optimistic update:

```typescript
const deleteAccount = async (id: string) => {
  // Optimistic update
  setAccounts(prev => prev.filter(a => a.id !== id));
  
  try {
    await axios.delete(`${API_BASE}/mail-accounts/${id}`);
  } catch {
    // Rollback on error
    await fetchAccounts();
  }
};
```

### 4. Retry Logic

Implement retry cho transient errors (502, 503):

```typescript
const fetchWithRetry = async (url: string, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await axios.get(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
```

### 5. Caching

Sử dụng React Query hoặc SWR cho caching và auto-refetch:

```typescript
import { useQuery } from '@tanstack/react-query';

function useMailAccounts() {
  return useQuery({
    queryKey: ['mail-accounts'],
    queryFn: () => axios.get(`${API_BASE}/mail-accounts`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## Advanced Features

### Real-time Notifications with Webhooks

MailConnector hỗ trợ webhook subscriptions để nhận real-time notifications về các sự kiện quan trọng.

**Event Types Available:**
- `email.received` - Email mới được đồng bộ
- `email.synced` - Email đồng bộ hoàn tất
- `analysis.completed` - Phân tích email hoàn tất
- `analysis.approved` - Kết quả được phê duyệt
- `analysis.rejected` - Kết quả bị từ chối

**Webhook Payload Structure:**

```typescript
interface WebhookPayload {
  eventType: string;
  timestamp: string;
  data: {
    id: string;
    // Event-specific data
  };
  signature?: string; // HMAC signature if secret key provided
}
```

**Implementing Webhook Handler:**

```typescript
// On your backend server
app.post('/webhook', async (req, res) => {
  const { eventType, data, signature } = req.body;
  
  // Verify signature if secret key is configured
  if (signature) {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).send('Invalid signature');
    }
  }
  
  // Handle different event types
  switch (eventType) {
    case 'email.received':
      // Handle new email
      break;
    case 'analysis.completed':
      // Update UI with analysis result
      break;
    // ... other events
  }
  
  res.status(200).send('OK');
});
```

**Frontend Real-time Updates:**

```typescript
// Using WebSocket or polling
import { useEffect, useState } from 'react';

export function useRealtimeUpdates() {
  const [updates, setUpdates] = useState([]);
  
  useEffect(() => {
    // Option 1: WebSocket connection
    const ws = new WebSocket('wss://your-backend.com/ws');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setUpdates(prev => [...prev, update]);
    };
    
    // Option 2: Polling (fallback)
    const interval = setInterval(async () => {
      const response = await fetch('/api/v1/updates');
      const data = await response.json();
      setUpdates(data);
    }, 5000);
    
    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);
  
  return updates;
}
```

### AI Analysis Workflow

Quy trình phân tích email với AI:

```
1. Email được đồng bộ → status: synced
2. User kích hoạt phân tích → POST /mail-messages/{id}/process
3. AI phân tích email → status: pending
4. Kết quả trả về → status: completed
5. User review kết quả
   - Approve → status: approved
   - Reject → status: rejected
```

**Implementing Analysis Workflow:**

```typescript
export function EmailAnalysisWorkflow({ messageId }: { messageId: string }) {
  const { createResult, approveResult, rejectResult, results } = useAnalysisResults();
  const [currentResult, setCurrentResult] = useState<EmailAnalysisResult | null>(null);
  
  const handleAnalyze = async () => {
    await createResult(messageId);
    // Poll for result or wait for webhook
  };
  
  const handleApprove = async () => {
    if (currentResult) {
      await approveResult(currentResult.id, currentUserId);
    }
  };
  
  const handleReject = async (reason: string) => {
    if (currentResult) {
      await rejectResult(currentResult.id, currentUserId, reason);
    }
  };
  
  return (
    <div>
      <button onClick={handleAnalyze}>Analyze with AI</button>
      {currentResult && (
        <AnalysisResultCard 
          result={currentResult}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
```

### Template Matching

Email templates được sử dụng để tự động trích xuất thông tin từ email có cấu trúc lặp lại.

**How Template Matching Works:**

1. Email đến → Check subject pattern
2. Nếu match → Check body pattern
3. Nếu match → Extract expected fields
4. Return extracted data

**Creating Custom Templates:**

```typescript
export function TemplateCreator() {
  const { createTemplate } = useTemplates();
  const [template, setTemplate] = useState<CreateTemplateRequest>({
    templateCode: '',
    templateName: '',
    subjectPattern: '',
    bodyPattern: '',
    expectedFields: {},
    documentTypes: []
  });
  
  const handleSave = async () => {
    await createTemplate(template);
  };
  
  return (
    <form onSubmit={handleSave}>
      <input
        value={template.templateCode}
        onChange={(e) => setTemplate({...template, templateCode: e.target.value})}
        placeholder="Template Code (unique)"
      />
      <input
        value={template.subjectPattern}
        onChange={(e) => setTemplate({...template, subjectPattern: e.target.value})}
        placeholder="Subject Pattern (regex)"
      />
      {/* More fields */}
      <button type="submit">Save Template</button>
    </form>
  );
}
```

**Testing Template Patterns:**

```typescript
export function TemplateTester() {
  const [subject, setSubject] = useState('');
  const [pattern, setPattern] = useState('');
  
  const testPattern = () => {
    const regex = new RegExp(pattern, 'i');
    const matches = regex.test(subject);
    console.log('Pattern matches:', matches);
  };
  
  return (
    <div>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} />
      <input value={pattern} onChange={(e) => setPattern(e.target.value)} />
      <button onClick={testPattern}>Test Pattern</button>
    </div>
  );
}
```

### Approval Workflow

Quy trình phê duyệt kết quả phân tích:

**States:**
- `pending` - Chờ xử lý
- `completed` - AI đã phân tích xong
- `approved` - Đã phê duyệt
- `rejected` - Đã từ chối

**Implementing Approval UI:**

```typescript
export function ApprovalQueue() {
  const { results, approveResult, rejectResult } = useAnalysisResults('completed');
  
  const pendingResults = results.filter(r => r.status === 'completed');
  
  return (
    <div>
      <h2>Pending Approvals ({pendingResults.length})</h2>
      {pendingResults.map(result => (
        <ApprovalCard
          key={result.id}
          result={result}
          onApprove={() => approveResult(result.id, currentUserId)}
          onReject={(reason) => rejectResult(result.id, currentUserId, reason)}
        />
      ))}
    </div>
  );
}

function ApprovalCard({ result, onApprove, onReject }: any) {
  const [rejectReason, setRejectReason] = useState('');
  
  return (
    <div className="approval-card">
      <h3>{result.category}</h3>
      <div>Confidence: {(result.confidenceScore! * 100).toFixed(1)}%</div>
      
      <div className="extracted-fields">
        {Object.entries(result.extractedFields || {}).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {value}
          </div>
        ))}
      </div>
      
      <div className="actions">
        <button onClick={onApprove}>Approve</button>
        <button onClick={() => onReject(rejectReason)}>Reject</button>
        <input
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection"
        />
      </div>
    </div>
  );
}
```

### Document Processing with AI

Xử lý tài liệu đính kèm với AI để trích xuất thông tin.

**Processing Attachments:**

```typescript
export function AttachmentProcessor({ attachmentId }: { attachmentId: string }) {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<DocumentProcessingResponse | null>(null);
  
  const handleProcess = async () => {
    setProcessing(true);
    try {
      // Download attachment
      const attachment = await fetch(`/api/v1/mail-messages/attachments/${attachmentId}`);
      const content = await attachment.text();
      
      // Process with AI
      const response = await axios.post<ApiResponse<DocumentProcessingResponse>>(
        '/api/v1/document-processor/process',
        {
          content,
          prompt: 'Extract all invoice details',
          model: 'gpt-4',
          isImage: false
        }
      );
      
      setResult(response.data.data);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleProcess} disabled={processing}>
        {processing ? 'Processing...' : 'Process with AI'}
      </button>
      {result && (
        <div>
          <h3>Processing Result</h3>
          <pre>{result.result}</pre>
          <div>Tokens used: {result.tokensUsed}</div>
        </div>
      )}
    </div>
  );
}
```

**Batch Processing:**

```typescript
export function BatchAttachmentProcessor({ attachmentIds }: { attachmentIds: string[] }) {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<DocumentProcessingResponse[]>([]);
  
  const handleBatchProcess = async () => {
    setProcessing(true);
    try {
      // Fetch all attachments
      const files = await Promise.all(
        attachmentIds.map(async (id) => {
          const response = await fetch(`/api/v1/mail-messages/attachments/${id}`);
          const blob = await response.blob();
          return {
            fileName: `attachment_${id}`,
            content: await blob.text(),
            type: 'text' as const,
            mimeType: blob.type
          };
        })
      );
      
      // Process all at once
      const response = await axios.post<ApiResponse<DocumentProcessingResponse>>(
        '/api/v1/document-processor/process-multiple',
        {
          files,
          prompt: 'Compare these documents and extract common fields',
          model: 'gpt-4'
        }
      );
      
      setResults([response.data.data]);
    } catch (error) {
      console.error('Batch processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleBatchProcess} disabled={processing}>
        {processing ? 'Processing...' : `Process ${attachmentIds.length} Files`}
      </button>
      {results.map((result, index) => (
        <div key={index}>
          <pre>{result.result}</pre>
        </div>
      ))}
    </div>
  );
}
```

---

## Testing Checklist

### Core Features
- [ ] OAuth flow hoàn chỉnh (redirect → callback → connect)
- [ ] List accounts hiển thị đúng
- [ ] Sync progress cập nhật real-time
- [ ] Pagination hoạt động đúng
- [ ] Error handling cho tất cả scenarios
- [ ] Attachment download hoạt động
- [ ] Responsive design trên mobile
- [ ] Loading states cho tất cả actions
- [ ] Form validation
- [ ] Accessibility (ARIA labels, keyboard navigation)

### Advanced Features
- [ ] Email analysis workflow (process → approve/reject)
- [ ] Analysis results list với filters
- [ ] Approval/reject actions với reason input
- [ ] Template creation và editing
- [ ] Template pattern testing
- [ ] Webhook subscription creation
- [ ] Webhook testing functionality
- [ ] Document processing với AI
- [ ] Batch document processing
- [ ] Real-time updates (webhook hoặc polling)
- [ ] Extracted fields editing
- [ ] Confidence score display
- [ ] Token usage tracking
- [ ] Cost estimation display

---

## Support

For questions or issues, contact:
- Backend Team: backend@company.com
- API Documentation: [API_CONTRACT.md](./API_CONTRACT.md)
- OpenAPI Spec: Available at `/swagger` (when deployed)

```

---

## File: `hooks\use-auth.ts`

```ts
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

```

---

## File: `hooks\use-mail-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import type { MailAnalysisResultDto } from "@/lib/generated/mail-connector/model/mailAnalysisResultDto"
import type { CreateTemplateRequest } from "@/lib/generated/mail-connector/model/createTemplateRequest"
import type { CreateWebhookSubscriptionRequest } from "@/lib/generated/mail-connector/model/createWebhookSubscriptionRequest"
import type { GetApiV1MailAnalysisResultsParams } from "@/lib/generated/mail-connector/model/getApiV1MailAnalysisResultsParams"
import type { GetApiV1MailMessagesParams } from "@/lib/generated/mail-connector/model/getApiV1MailMessagesParams"
import type { GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams } from "@/lib/generated/mail-connector/model/getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams"
import type { UpdateTemplateRequest } from "@/lib/generated/mail-connector/model/updateTemplateRequest"
import type { UpdateWebhookSubscriptionRequest } from "@/lib/generated/mail-connector/model/updateWebhookSubscriptionRequest"

const mailApi = getLogisticsPlatformAPI()

const getAnalysisItems = (data: unknown): MailAnalysisResultDto[] => {
  if (!Array.isArray(data)) return []
  return data as MailAnalysisResultDto[]
}

const getAttachmentTextContent = (data: unknown): string => {
  if (!data) return ""
  if (typeof data === "string") return data
  if (typeof data !== "object") return ""
  const value = data as Record<string, unknown>
  const textCandidate =
    value.text ??
    value.content ??
    value.body ??
    value.extractedText ??
    value.result ??
    value.value
  if (typeof textCandidate === "string") return textCandidate
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return ""
  }
}

export const mailQueryKeys = {
  accounts: ["mail-accounts"] as const,
  syncStatus: (accountId: string) => ["mail-sync-status", accountId] as const,
  messages: (params: object) => ["mail-messages", params] as const,
  message: (id: string) => ["mail-message", id] as const,
  attachments: (id: string) => ["mail-message-attachments", id] as const,
  attachmentContent: (messageId: string, attachmentId: string) =>
    ["mail-message-attachment-content", messageId, attachmentId] as const,
  attachmentExtractText: (messageId: string, attachmentId: string) =>
    ["mail-message-attachment-extract-text", messageId, attachmentId] as const,
  analysis: (id: string) => ["mail-analysis", id] as const,
  latestAnalysisByMessage: (messageId: string) => ["mail-analysis-latest", messageId] as const,
  templates: ["mail-templates"] as const,
  analysisResults: (params: GetApiV1MailAnalysisResultsParams) =>
    ["mail-analysis-results", params] as const,
  webhooks: ["webhook-subscriptions"] as const,
}

export function useMailAccountsQuery() {
  return useQuery({
    queryKey: mailQueryKeys.accounts,
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAccounts()
      return response.data ?? []
    },
  })
}

export function useConnectAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ authorizationCode, redirectUri }: { authorizationCode: string; redirectUri: string }) =>
      mailApi.postApiV1MailAccountsConnect({ authorizationCode, redirectUri }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.accounts })
    },
  })
}

export function useDeleteMailAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: string) => mailApi.deleteApiV1MailAccountsId(accountId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.accounts })
    },
  })
}

export function useOAuthUrlMutation() {
  return useMutation({
    mutationFn: async ({ redirectUri, state }: { redirectUri: string; state: string }) => {
      const response = await mailApi.postApiV1MailAuthOauthUrl({ redirectUri, state })
      return response.data
    },
  })
}

export function useSyncStatusQuery(accountId: string | null) {
  return useQuery({
    queryKey: accountId ? mailQueryKeys.syncStatus(accountId) : ["mail-sync-status", "none"],
    enabled: Boolean(accountId),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAccountsIdSyncStatus(accountId as string)
      return response.data
    },
    refetchInterval: (query) => {
      const status = String(query.state.data?.status || "").toLowerCase()
      const shouldPoll =
        status === "syncing" ||
        status === "pending" ||
        status === "queued" ||
        status === "running"
      return shouldPoll ? 2000 : false
    },
  })
}

export function useTriggerSyncMutation(accountId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      mailApi.postApiV1MailAccountsIdSync(accountId as string, {
        syncType: "MANUAL_RESYNC",
        folderIds: ["INBOX"],
      }),
    onSuccess: () => {
      if (accountId) {
        void queryClient.invalidateQueries({ queryKey: mailQueryKeys.syncStatus(accountId) })
      }
    },
  })
}

export function useMailMessagesQuery(params: {
  accountId?: string
  page: number
  pageSize: number
  fromEmail?: string
  hasAttachment?: boolean
  processStatus?: string
  sortField?: string
  sortOrder?: "asc" | "desc"
}) {
  const filters: string[] = []
  if (params.accountId) filters.push(`mailAccountId==${params.accountId}`)
  if (params.fromEmail) filters.push(`fromEmail@=${params.fromEmail}`)
  if (params.hasAttachment) filters.push(`hasAttachments==true`)
  if (params.processStatus) filters.push(`processStatus==${params.processStatus}`)

  const queryParams: GetApiV1MailMessagesParams = {
    Page: params.page,
    PageSize: params.pageSize,
    Filters: filters.join("&") || undefined,
    SortField: params.sortField ?? "sentAt",
    SortOrder: params.sortOrder ?? "desc",
  }

  return useQuery({
    queryKey: mailQueryKeys.messages(queryParams),
    enabled: Boolean(params.accountId),
    queryFn: () => mailApi.getApiV1MailMessages(queryParams),
  })
}

export function useMailMessageQuery(id: string | null) {
  return useQuery({
    queryKey: id ? mailQueryKeys.message(id) : ["mail-message", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailMessagesId(id as string)
      return response.data
    },
  })
}

export function useMailMessageAttachmentsQuery(id: string | null) {
  return useQuery({
    queryKey: id ? mailQueryKeys.attachments(id) : ["mail-message-attachments", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailMessagesIdAttachments(id as string)
      return response.data ?? []
    },
  })
}

export function useProcessMailMutation() {
  return useMutation({
    mutationFn: async (id: string) => {
      await mailApi.postApiV1MailMessagesIdProcess(id)
      await mailApi.postApiV1MailAnalysisResults({ mailMessageId: id })
      const resultResponse = await mailApi.getApiV1MailAnalysisResults()
      const matched = getAnalysisItems(resultResponse.data)
        .filter((item) => item.mailMessageId === id)
        .sort((first, second) => {
          const firstTime = new Date(first.updatedAt ?? first.createdAt ?? 0).getTime()
          const secondTime = new Date(second.updatedAt ?? second.createdAt ?? 0).getTime()
          return secondTime - firstTime
        })
      return matched[0] ?? null
    },
  })
}

export function useProcessDocumentsMutation() {
  return useMutation({
    mutationFn: async (files: Array<{ fileName: string; content: string; type: string; mimeType: string }>) => {
      const response = await mailApi.postApiV1DocumentProcessorProcessMultiple({
        files,
        prompt: "Extract key information from these documents",
        model: "gpt-4",
      })
      return response.data
    },
  })
}

export function useDownloadAttachmentMutation(messageId: string | null) {
  return useMutation({
    mutationFn: async ({ attachmentId, fileName }: { attachmentId: string; fileName?: string | null }) => {
      if (!messageId) throw new Error("Thiếu messageId để tải tệp.")
      const response = await MAIL_CONNECTOR_AXIOS.get(
        `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/download`,
        { responseType: "blob" }
      )
      const blob = response.data as Blob
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = fileName || `attachment-${attachmentId}`
      anchor.click()
      URL.revokeObjectURL(url)
    },
  })
}

export function useAttachmentContentQuery(messageId: string | null, attachmentId: string | null) {
  const enabled = Boolean(messageId && attachmentId)
  return useQuery({
    queryKey:
      enabled
        ? mailQueryKeys.attachmentContent(messageId as string, attachmentId as string)
        : ["mail-message-attachment-content", "none"],
    enabled,
    queryFn: async () => {
      const response = await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdContent(
        messageId as string,
        attachmentId as string
      )
      return getAttachmentTextContent(response.data)
    },
  })
}

export function useAttachmentExtractTextQuery(messageId: string | null, attachmentId: string | null) {
  const enabled = Boolean(messageId && attachmentId)
  return useQuery({
    queryKey:
      enabled
        ? mailQueryKeys.attachmentExtractText(messageId as string, attachmentId as string)
        : ["mail-message-attachment-extract-text", "none"],
    enabled,
    queryFn: async () => {
      const response = await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdExtractText(
        messageId as string,
        attachmentId as string
      )
      return getAttachmentTextContent(response.data)
    },
  })
}

export function useAnalysisResultQuery(id: string | null) {
  return useQuery({
    queryKey: id ? mailQueryKeys.analysis(id) : ["mail-analysis", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAnalysisResultsId(id as string)
      return response.data
    },
    refetchInterval: (query) => {
      const status = String(query.state.data?.status || "").toLowerCase()
      const shouldPoll =
        status === "pending" || status === "processing" || status === "notstarted"
      return shouldPoll ? 2000 : false
    },
  })
}

export function useLatestAnalysisByMessageIdQuery(messageId: string | null) {
  return useQuery({
    queryKey: messageId ? mailQueryKeys.latestAnalysisByMessage(messageId) : ["mail-analysis-latest", "none"],
    enabled: Boolean(messageId),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAnalysisResults()
      const matched = getAnalysisItems(response.data)
        .filter((item) => item.mailMessageId === messageId)
        .sort((first, second) => {
          const firstTime = new Date(first.updatedAt ?? first.createdAt ?? 0).getTime()
          const secondTime = new Date(second.updatedAt ?? second.createdAt ?? 0).getTime()
          return secondTime - firstTime
        })
      return matched[0] ?? null
    },
  })
}

export function useUpdateAnalysisFieldsMutation(analysisId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fields: Record<string, string>) =>
      mailApi.putApiV1MailAnalysisResultsIdFields(analysisId as string, {
        extractedFields: fields,
      }),
    onSuccess: () => {
      if (analysisId) {
        void queryClient.invalidateQueries({ queryKey: mailQueryKeys.analysis(analysisId) })
      }
    },
  })
}

export function useApproveAnalysisMutation(analysisId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      mailApi.postApiV1MailAnalysisResultsIdApprove(analysisId as string, { userId }),
    onSuccess: () => {
      if (analysisId) {
        void queryClient.invalidateQueries({ queryKey: mailQueryKeys.analysis(analysisId) })
      }
    },
  })
}

export function useRejectAnalysisMutation(analysisId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      mailApi.postApiV1MailAnalysisResultsIdReject(analysisId as string, { userId, reason }),
    onSuccess: () => {
      if (analysisId) {
        void queryClient.invalidateQueries({ queryKey: mailQueryKeys.analysis(analysisId) })
      }
    },
  })
}

export function useAnalysisResultsQuery(params: {
  status?: string
  category?: string
  sortField?: string
  sortOrder?: "asc" | "desc"
  page: number
  pageSize: number
}) {
  const filters: string[] = []
  if (params.status) filters.push(`status==${params.status}`)
  if (params.category) filters.push(`category==${params.category}`)

  const queryParams: GetApiV1MailAnalysisResultsParams = {
    Filters: filters.join("&") || undefined,
    SortField: params.sortField ?? "createdAt",
    SortOrder: params.sortOrder ?? "desc",
    Page: params.page,
    PageSize: params.pageSize,
  }

  return useQuery({
    queryKey: mailQueryKeys.analysisResults(queryParams),
    queryFn: async () => {
      const response = await mailApi.getApiV1MailAnalysisResults(queryParams)
      return getAnalysisItems(response.data)
    },
  })
}

export function useEmailTemplatesQuery() {
  return useQuery({
    queryKey: mailQueryKeys.templates,
    queryFn: async () => {
      const response = await mailApi.getApiV1MailTemplates()
      return response.data ?? []
    },
  })
}

export function useCreateEmailTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTemplateRequest) => mailApi.postApiV1MailTemplates(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.templates })
    },
  })
}

export function useUpdateEmailTemplateMutation(templateId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTemplateRequest) =>
      mailApi.putApiV1MailTemplatesId(templateId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.templates })
    },
  })
}

export function useDeleteEmailTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => mailApi.deleteApiV1MailTemplatesId(templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.templates })
    },
  })
}

export function useAttachmentPresignedUrlQuery(
  messageId: string | null,
  attachmentId: string | null,
  params?: GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams
) {
  return useQuery({
    queryKey: ["attachment-presigned-url", messageId, attachmentId, params],
    queryFn: async () => {
      if (!messageId || !attachmentId) return null
      const response = await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl(
        messageId,
        attachmentId,
        params
      )
      return response.data?.data as { url: string; expiresAt: string } | null
    },
    enabled: Boolean(messageId && attachmentId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

const getWebhookItems = (data: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(data)) return []
  return data as Record<string, unknown>[]
}

export function useWebhookSubscriptionsQuery() {
  return useQuery({
    queryKey: mailQueryKeys.webhooks,
    queryFn: async () => {
      const response = await mailApi.getApiV1WebhookSubscriptions()
      return getWebhookItems(response.data)
    },
  })
}

export function useCreateWebhookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateWebhookSubscriptionRequest) =>
      mailApi.postApiV1WebhookSubscriptions(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.webhooks })
    },
  })
}

export function useUpdateWebhookMutation(webhookId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateWebhookSubscriptionRequest) =>
      mailApi.putApiV1WebhookSubscriptionsId(webhookId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.webhooks })
    },
  })
}

export function useDeleteWebhookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (webhookId: string) => mailApi.deleteApiV1WebhookSubscriptionsId(webhookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mailQueryKeys.webhooks })
    },
  })
}

export function useTestWebhookMutation(webhookId: string | null) {
  return useMutation({
    mutationFn: (payload: { eventType?: string; payload?: unknown }) =>
      mailApi.postApiV1WebhookSubscriptionsIdTest(webhookId as string, {
        eventType: payload.eventType,
        payload: payload.payload,
      }),
  })
}

```

---

## File: `hooks\use-user-queries.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"
import type { GetApiV1UsersParams } from "@/lib/generated/mail-connector/model/getApiV1UsersParams"
import type { CreateUserRequest } from "@/lib/generated/mail-connector/model/createUserRequest"
import type { UpdateUserRequest } from "@/lib/generated/mail-connector/model/updateUserRequest"
import type { UpdateUserRolesRequest } from "@/lib/generated/mail-connector/model/updateUserRolesRequest"
import type { UpdateUserStatusRequest } from "@/lib/generated/mail-connector/model/updateUserStatusRequest"
import type { ChangePasswordRequest } from "@/lib/generated/mail-connector/model/changePasswordRequest"
import type { ResetPasswordRequest } from "@/lib/generated/mail-connector/model/resetPasswordRequest"

export interface UserDto {
  id: string
  email: string
  fullName: string
  roles: string[]
  isActive: boolean
  isLocked: boolean
  createdAtUtc: string
  updatedAtUtc: string | null
}

export interface CurrentUserResponse {
  userId: string
  email: string
  fullName: string
  roles: string[]
  isActive: boolean
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface UserListResponse {
  data: UserDto[]
  meta: {
    pagination: PaginationMeta
    job: null
    extra: Record<string, unknown>
  }
}

const getUserList = (data: unknown): UserListResponse => {
  if (typeof data !== "object" || data === null) {
    return { data: [], meta: { pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }, job: null, extra: {} } }
  }
  return data as UserListResponse
}

const getUserDto = (data: unknown): UserDto | null => {
  if (typeof data !== "object" || data === null) return null
  const d = data as Record<string, unknown>
  if (d.data && typeof d.data === "object") return d.data as UserDto
  return data as UserDto
}

export const userQueryKeys = {
  users: (params: GetApiV1UsersParams) => ["users", params] as const,
  user: (id: string) => ["user", id] as const,
  me: ["users-me"] as const,
}

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: userQueryKeys.me,
    queryFn: async () => {
      const { data } = await MAIL_CONNECTOR_AXIOS.get("/api/v1/users/me")
      return (data?.data ?? data ?? null) as CurrentUserResponse | null
    },
  })
}

export function useUsersQuery(params: GetApiV1UsersParams) {
  return useQuery({
    queryKey: userQueryKeys.users(params),
    queryFn: async () => {
      const { data } = await MAIL_CONNECTOR_AXIOS.get("/api/v1/users", { params })
      return getUserList(data)
    },
  })
}

export function useUserQuery(id: string | null) {
  return useQuery({
    queryKey: id ? userQueryKeys.user(id) : ["user", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await MAIL_CONNECTOR_AXIOS.get(`/api/v1/users/${id}`)
      return getUserDto(data)
    },
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateUserRequest) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.post("/api/v1/users", payload)
      return getUserDto(data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateUserRequest }) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.put(`/api/v1/users/${id}`, payload)
      return getUserDto(data)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserRolesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateUserRolesRequest }) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.put(`/api/v1/users/${id}/roles`, payload)
      return getUserDto(data)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.patch(`/api/v1/users/${id}/status`, { isActive } as UpdateUserStatusRequest)
      return getUserDto(data)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.delete(`/api/v1/users/${id}`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useRestoreUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.post(`/api/v1/users/${id}/restore`)
      return getUserDto(data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { fullName?: string | null; roles?: string[] | null }) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.put("/api/v1/users/me", payload)
      return getUserDto(data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.me })
    },
  })
}

export function useChangeMyPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordRequest) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.post("/api/v1/users/me/change-password", payload)
      return data
    },
  })
}

export function useResetUserPasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ResetPasswordRequest }) => {
      const { data } = await MAIL_CONNECTOR_AXIOS.post(`/api/v1/users/${id}/reset-password`, payload)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

```

---

## File: `hooks\useTour.ts`

```ts
"use client"

import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

const tourSteps: Record<string, Array<{ element: string; popover: { title: string; description: string; side?: "top" | "bottom" | "left" | "right" } }>> = {
  "/login": [
    {
      element: "#tour-login-form",
      popover: { title: "Đăng nhập", description: "Nhập thông tin tài khoản để truy cập hệ thống Logistics Mail.", side: "bottom" },
    },
    {
      element: "#tour-login-email",
      popover: { title: "Email", description: "Nhập địa chỉ email của bạn tại đây.", side: "right" },
    },
    {
      element: "#tour-login-password",
      popover: { title: "Mật khẩu", description: "Nhập mật khẩu để đăng nhập.", side: "right" },
    },
    {
      element: "#tour-login-btn",
      popover: { title: "Đăng nhập", description: "Click để vào hệ thống.", side: "top" },
    },
  ],
  "/": [
    {
      element: "#tour-sidebar",
      popover: { title: "Thanh điều hướng", description: "Truy cập nhanh các trang chính: Dashboard, Email, Báo cáo và Quản trị.", side: "right" },
    },
    {
      element: "#tour-dashboard-stats",
      popover: { title: "Thống kê", description: "Xem tổng quan số lượng email, chờ xử lý, đã hoàn tất và lỗi.", side: "bottom" },
    },
    {
      element: "#tour-dashboard-recent",
      popover: { title: "Email gần đây", description: "Danh sách email vừa được đồng bộ. Click để xem chi tiết.", side: "top" },
    },
  ],
  "/emails": [
    {
      element: "#tour-emails-search",
      popover: { title: "Tìm kiếm", description: "Tìm email theo tiêu đề hoặc người gửi.", side: "bottom" },
    },
    {
      element: "#tour-emails-filter",
      popover: { title: "Bộ lọc", description: "Lọc email theo trạng thái: tất cả, chưa xử lý, đã xử lý, có đính kèm.", side: "bottom" },
    },
    {
      element: "#tour-emails-table",
      popover: { title: "Danh sách Email", description: "Danh sách email đã đồng bộ. Click 'Xử lý' để mở chi tiết.", side: "top" },
    },
  ],
  "/emails/1": [
    {
      element: "#tour-email-header",
      popover: { title: "Thông tin email", description: "Xem người gửi, tiêu đề và thời gian nhận email.", side: "bottom" },
    },
    {
      element: "#tour-email-body",
      popover: { title: "Nội dung", description: "Đọc nội dung chính của email tại đây.", side: "top" },
    },
    {
      element: "#tour-email-attachments",
      popover: { title: "Tệp đính kèm", description: "Kiểm tra tệp đính kèm hợp lệ trước khi gửi AI.", side: "top" },
    },
    {
      element: "#tour-email-ai-btn",
      popover: { title: "Gửi AI bóc tách", description: "Click để AI phân tích và trích xuất dữ liệu từ email.", side: "left" },
    },
  ],
  "/emails/1/extract": [
    {
      element: "#tour-extract-result",
      popover: { title: "Kết quả bóc tách", description: "Dữ liệu AI đã trích xuất. Kiểm tra độ tin cậy và thông tin còn thiếu.", side: "bottom" },
    },
    {
      element: "#tour-extract-fields",
      popover: { title: "Chỉnh sửa dữ liệu", description: "Bạn có thể chỉnh sửa trực tiếp các trường dữ liệu trước khi export.", side: "top" },
    },
    {
      element: "#tour-extract-export",
      popover: { title: "Export Excel", description: "Xuất dữ liệu đã bóc tách ra file Excel.", side: "left" },
    },
  ],
  "/reports": [
    {
      element: "#tour-reports-stats",
      popover: { title: "Thống kê báo cáo", description: "Tổng quan số bản ghi, giá trị và bản ghi tháng này.", side: "bottom" },
    },
    {
      element: "#tour-reports-table",
      popover: { title: "Dữ liệu đã import", description: "Xem toàn bộ dữ liệu logistics đã import vào hệ thống.", side: "top" },
    },
    {
      element: "#tour-reports-import-btn",
      popover: { title: "Import mới", description: "Upload file Excel để thêm dữ liệu mới vào báo cáo.", side: "bottom" },
    },
  ],
  "/reports/import": [
    {
      element: "#tour-import-upload",
      popover: { title: "Upload file", description: "Chọn file Excel hoặc CSV để import.", side: "bottom" },
    },
    {
      element: "#tour-import-preview",
      popover: { title: "Preview", description: "Xem trước dữ liệu (10 dòng đầu) trước khi import.", side: "top" },
    },
    {
      element: "#tour-import-btn",
      popover: { title: "Thực hiện Import", description: "Click để import dữ liệu vào báo cáo tổng.", side: "top" },
    },
  ],
  "/admin/users": [
    {
      element: "#tour-users-table",
      popover: { title: "Danh sách tài khoản", description: "Quản lý nhân viên và admin. Xem vai trò và ngày tạo.", side: "top" },
    },
    {
      element: "#tour-users-add",
      popover: { title: "Thêm tài khoản", description: "Tạo tài khoản mới cho nhân viên.", side: "left" },
    },
  ],
  "/admin/settings": [
    {
      element: "#tour-settings-gmail",
      popover: { title: "Gmail", description: "Kết nối và cấu hình tài khoản Gmail đồng bộ email.", side: "bottom" },
    },
    {
      element: "#tour-settings-ai",
      popover: { title: "AI / Rule Engine", description: "Tùy chỉnh prompt và pattern lọc tiêu đề email.", side: "top" },
    },
  ],
  "/admin/logs": [
    {
      element: "#tour-logs-filter",
      popover: { title: "Lọc logs", description: "Lọc theo mức độ: lỗi, cảnh báo, thông tin.", side: "bottom" },
    },
    {
      element: "#tour-logs-table",
      popover: { title: "Danh sách Logs", description: "Xem lịch sử lỗi đồng bộ, AI và import để debug.", side: "top" },
    },
  ],
}

export function useTour() {
  const pathname = usePathname()

  const startTour = useCallback(() => {
    const steps = tourSteps[pathname]
    if (!steps || steps.length === 0) return

    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps,
      nextBtnText: "Tiếp",
      prevBtnText: "Trước",
      doneBtnText: "Xong",
      progressText: "{{current}} / {{total}}",
      overlayColor: "rgba(0,0,0,0.6)",
    })

    driverObj.drive()
  }, [pathname])

  useEffect(() => {
    // Auto-start tour on first visit per session (optional, using sessionStorage)
    const visited = sessionStorage.getItem(`tour-${pathname}`)
    if (!visited) {
      // Delay slightly to ensure DOM is ready
      const timer = setTimeout(() => {
        startTour()
        sessionStorage.setItem(`tour-${pathname}`, "true")
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [pathname, startTour])

  return { startTour }
}

```

---

## File: `lib\api.ts`

```ts
import axios, { AxiosRequestConfig } from "axios"
import type { ApiResponse, MailAccount, MailMessage, MailMessageDetail, EmailAnalysisResult, EmailTemplate, SyncStatus, User, LogEntry, ReportData } from "@/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://vietprodev.duckdns.org/gateway/logistics/api/v1"

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

async function doRefreshToken() {
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) throw new Error("No refresh token")

  const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
  const data = res.data as { accessToken?: string; refreshToken?: string } | undefined
  if (!data?.accessToken) throw new Error("Refresh failed")

  localStorage.setItem("token", data.accessToken)
  if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
  return data.accessToken
}

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (typeof window === "undefined") {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          resolve(api(originalRequest))
        })
      })
    }

    isRefreshing = true

    try {
      const newToken = await doRefreshToken()
      onTokenRefreshed(newToken)
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
      }
      return api(originalRequest)
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userId")
      window.location.href = "/login"
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default api

// Auth
export async function login(email: string, password: string) {
  const res = await api.post<ApiResponse<{
    accessToken: string
    refreshToken: string
    expiresIn: number
    tokenType: string
    user: {
      userId: string
      email: string
      fullName: string
      roles: string[]
      permissions: string[]
    }
  }>>("/auth/login", { email, password })
  return res.data
}

// Mail Accounts
export async function getMailAccounts() {
  const res = await api.get<ApiResponse<MailAccount[]>>("/mail-accounts")
  return res.data.data || []
}

export async function connectAccount(code: string, redirectUri: string) {
  const res = await api.post<ApiResponse<MailAccount>>("/mail-accounts/connect", {
    authorizationCode: code,
    redirectUri,
  })
  return res.data.data
}

export async function getOAuthUrl(redirectUri: string, state: string) {
  const res = await api.post<ApiResponse<{ authUrl: string; provider: string }>>("/mail-auth/oauth-url", {
    redirectUri,
    state,
  })
  return res.data.data
}

export async function deleteAccount(id: string) {
  await api.delete(`/mail-accounts/${id}`)
}

export async function triggerSync(id: string) {
  const res = await api.post<ApiResponse<{ jobId: string; status: string }>>(`/mail-accounts/${id}/sync`, {
    syncType: "MANUAL_RESYNC",
    folderIds: ["INBOX"],
  })
  return res.data.data
}

export async function getSyncStatus(id: string) {
  const res = await api.get<ApiResponse<SyncStatus>>(`/mail-accounts/${id}/sync-status`)
  return res.data.data
}

// Mail Messages
export async function getMailMessages(params?: { accountId?: string; page?: number; pageSize?: number; fromEmail?: string; hasAttachment?: boolean }) {
  const res = await api.get<ApiResponse<MailMessage[]>>("/mail-messages", { params })
  return res.data.data || []
}

export async function getMailMessagesEnvelope(params?: { accountId?: string; page?: number; pageSize?: number; fromEmail?: string; hasAttachment?: boolean }) {
  const res = await api.get<ApiResponse<MailMessage[]>>("/mail-messages", { params })
  return res.data
}

export async function getMailMessage(id: string) {
  const res = await api.get<ApiResponse<MailMessageDetail>>(`/mail-messages/${id}`)
  return res.data.data
}

export async function getMailMessageAttachments(id: string) {
  const res = await api.get<ApiResponse<MailMessageDetail["attachments"]>>(`/mail-messages/${id}/attachments`)
  return res.data.data || []
}

export async function processEmail(id: string) {
  const res = await api.post<ApiResponse<EmailAnalysisResult>>(`/email-messages/${id}/process`)
  return res.data.data
}

export async function classifyEmail(id: string) {
  const res = await api.post<ApiResponse<unknown>>(`/email-messages/${id}/classify`)
  return res.data.data
}

export async function extractEmailFields(id: string, templateCode?: string) {
  const res = await api.post<ApiResponse<unknown>>(`/email-messages/${id}/extract`, { templateCode })
  return res.data.data
}

// Attachments
export async function getAttachmentDownloadUrl(messageId: string, attachmentId: string) {
  return `${API_BASE}/mail-messages/${messageId}/attachments/${attachmentId}/download`
}

// Analysis Results
export async function getAnalysisResults(status?: string) {
  const res = await api.get<ApiResponse<EmailAnalysisResult[]>>("/email-analysis-results", { params: status ? { status } : undefined })
  return res.data.data || []
}

export async function createAnalysisResult(emailMessageId: string) {
  const res = await api.post<ApiResponse<EmailAnalysisResult>>("/email-analysis-results", { emailMessageId })
  return res.data.data
}

export async function getAnalysisResult(id: string) {
  const res = await api.get<ApiResponse<EmailAnalysisResult>>(`/email-analysis-results/${id}`)
  return res.data.data
}

export async function approveAnalysisResult(id: string, userId: string) {
  const res = await api.post<ApiResponse<EmailAnalysisResult>>(`/email-analysis-results/${id}/approve`, { userId })
  return res.data.data
}

export async function rejectAnalysisResult(id: string, userId: string, reason?: string) {
  const res = await api.post<ApiResponse<EmailAnalysisResult>>(`/email-analysis-results/${id}/reject`, { userId, reason })
  return res.data.data
}

export async function updateAnalysisFields(id: string, fields: Record<string, string>) {
  const res = await api.put<ApiResponse<EmailAnalysisResult>>(`/email-analysis-results/${id}/fields`, { extractedFields: fields })
  return res.data.data
}

// Document Processing
export async function processDocument(content: string, prompt?: string) {
  const res = await api.post<ApiResponse<{ result: string; model: string; tokensUsed: number }>>("/document-processor/process", {
    content,
    prompt,
    model: "gpt-4",
    isImage: false,
  })
  return res.data.data
}

// Templates
export async function getTemplates() {
  const res = await api.get<ApiResponse<EmailTemplate[]>>("/email-templates")
  return res.data.data || []
}

// Webhooks
export async function getWebhookSubscriptions() {
  const res = await api.get<ApiResponse<unknown[]>>("/webhook-subscriptions")
  return res.data.data || []
}

// Users
export async function getUsers() {
  const res = await api.get<ApiResponse<User[]>>("/users")
  return res.data.data || []
}

// Logs
export async function getLogs() {
  const res = await api.get<ApiResponse<LogEntry[]>>("/logs")
  return res.data.data || []
}

// Reports
export async function getReports() {
  const res = await api.get<ApiResponse<ReportData[]>>("/reports")
  return res.data.data || []
}

export async function exportReport() {
  const res = await api.get("/reports/export", { responseType: "blob" })
  return res.data
}

export async function importReport(formData: FormData) {
  const res = await api.post<ApiResponse<unknown>>("/reports/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data.data
}

```

---

## File: `lib\generated\mail-connector\endpoints.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type {
  ApproveRequest,
  BatchCompleteUploadRequest,
  BatchDownloadUrlRequest,
  BatchInitiateUploadRequest,
  ChangePasswordRequest,
  CompleteRequest,
  ConfirmPasswordResetCommand,
  ConnectAccountRequest,
  CreateAnalysisResultRequest,
  CreateMailAccountRequest,
  CreateTemplateRequest,
  CreateUserRequest,
  CreateWebhookSubscriptionRequest,
  DocumentProcessingRequest,
  ExchangeTokenRequest,
  ExecuteImportRequest,
  GetApiV1AiOpenaiUsageParams,
  GetApiV1FilesIdDownloadUrlParams,
  GetApiV1FilesParams,
  GetApiV1FilesQuotaParams,
  GetApiV1MailAnalysisResultsParams,
  GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams,
  GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewParams,
  GetApiV1MailMessagesParams,
  GetApiV1OrderDraftsExportParams,
  GetApiV1OrderDraftsParams,
  GetApiV1UsersParams,
  GetApiV1WebhookSubscriptionsParams,
  GetOauthCallbackParams,
  InitiateUploadRequest,
  LoginCommand,
  LogoutAllRequest,
  LogoutCommand,
  OAuthUrlRequest,
  PostApiImportUploadBody,
  PreviewImportRequest,
  ProcessMultipleDocumentsRequest,
  ReassignRequest,
  RefreshLockRequest,
  RefreshMailTokenRequest,
  RefreshTokenCommand,
  RejectRequest,
  ResetPasswordRequest,
  ReviewRequest,
  RevokeSessionRequest,
  SendPasswordResetOtpCommand,
  TestWebhookRequest,
  TriggerSyncDto,
  UnassignRequest,
  UpdateAnalysisResultFieldsRequest,
  UpdateFileMetadataRequest,
  UpdateMailAccountDto,
  UpdateStatusRequest,
  UpdateTemplateRequest,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UpdateUserStatusRequest,
  UpdateWebhookSubscriptionRequest,
  ValidateMappingRequest,
  WebhookPayload
} from './model';

import { mailConnectorInstance } from '../../orval/mail-connector-mutator';
import type { BodyType } from '../../orval/mail-connector-mutator';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];


  export const getLogisticsPlatformAPI = () => {
const getApiV1AiOpenaiUsage = (
    params?: GetApiV1AiOpenaiUsageParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai/openai-usage`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1AiOpenaiUsageCurrentMonth = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/ai/openai-usage/current-month`, method: 'GET'
    },
      options);
    }
  
const putApiAttachmentReviewsMailConnectorAttachmentIdApprove = (
    mailConnectorAttachmentId: string,
    approveRequest: BodyType<ApproveRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/${mailConnectorAttachmentId}/approve`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: approveRequest
    },
      options);
    }
  
const putApiAttachmentReviewsMailConnectorAttachmentIdReject = (
    mailConnectorAttachmentId: string,
    rejectRequest: BodyType<RejectRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/${mailConnectorAttachmentId}/reject`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: rejectRequest
    },
      options);
    }
  
const getApiAttachmentReviewsByMessageMailConnectorMessageId = (
    mailConnectorMessageId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/by-message/${mailConnectorMessageId}`, method: 'GET'
    },
      options);
    }
  
const getApiAttachmentReviewsByStatusStatus = (
    status: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/by-status/${status}`, method: 'GET'
    },
      options);
    }
  
const getApiAttachmentReviewsMy = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/my`, method: 'GET'
    },
      options);
    }
  
const postApiAttachmentReviewsMailConnectorAttachmentIdReset = (
    mailConnectorAttachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/${mailConnectorAttachmentId}/reset`, method: 'POST'
    },
      options);
    }
  
const getApiAttachmentReviewsMailConnectorAttachmentId = (
    mailConnectorAttachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/attachment-reviews/${mailConnectorAttachmentId}`, method: 'GET'
    },
      options);
    }
  
const postApiV1AuthLogin = (
    loginCommand: BodyType<LoginCommand>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/login`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: loginCommand
    },
      options);
    }
  
const postApiV1AuthRefresh = (
    refreshTokenCommand: BodyType<RefreshTokenCommand>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/refresh`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: refreshTokenCommand
    },
      options);
    }
  
const postApiV1AuthLogout = (
    logoutCommand: BodyType<LogoutCommand>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/logout`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: logoutCommand
    },
      options);
    }
  
const getApiV1AuthSessions = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/sessions`, method: 'GET'
    },
      options);
    }
  
const postApiV1AuthSessionsIdRevoke = (
    id: string,
    revokeSessionRequest: BodyType<RevokeSessionRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/sessions/${id}/revoke`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: revokeSessionRequest
    },
      options);
    }
  
const postApiV1AuthLogoutAll = (
    logoutAllRequest: BodyType<LogoutAllRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/logout-all`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: logoutAllRequest
    },
      options);
    }
  
const postApiV1AuthForgotPasswordSendOtp = (
    sendPasswordResetOtpCommand: BodyType<SendPasswordResetOtpCommand>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/forgot-password/send-otp`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: sendPasswordResetOtpCommand
    },
      options);
    }
  
const postApiV1AuthForgotPasswordConfirmReset = (
    confirmPasswordResetCommand: BodyType<ConfirmPasswordResetCommand>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/auth/forgot-password/confirm-reset`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: confirmPasswordResetCommand
    },
      options);
    }
  
const postApiV1DocumentProcessorProcess = (
    documentProcessingRequest: BodyType<DocumentProcessingRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/document-processor/process`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: documentProcessingRequest
    },
      options);
    }
  
const postApiV1DocumentProcessorProcessMultiple = (
    processMultipleDocumentsRequest: BodyType<ProcessMultipleDocumentsRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/document-processor/process-multiple`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: processMultipleDocumentsRequest
    },
      options);
    }
  
const getApiV1MailAnalysisResults = (
    params?: GetApiV1MailAnalysisResultsParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-analysis-results`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1MailAnalysisResults = (
    createAnalysisResultRequest: BodyType<CreateAnalysisResultRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-analysis-results`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createAnalysisResultRequest
    },
      options);
    }
  
const getApiV1MailAnalysisResultsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-analysis-results/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1MailAnalysisResultsIdFields = (
    id: string,
    updateAnalysisResultFieldsRequest: BodyType<UpdateAnalysisResultFieldsRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-analysis-results/${id}/fields`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateAnalysisResultFieldsRequest
    },
      options);
    }
  
const postApiImportUpload = (
    postApiImportUploadBody: BodyType<PostApiImportUploadBody>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {const formData = new FormData();
if(postApiImportUploadBody.file !== undefined) {
 formData.append(`file`, postApiImportUploadBody.file)
 }

      return mailConnectorInstance<void>(
      {url: `/api/import/upload`, method: 'POST',
      headers: {'Content-Type': 'multipart/form-data', },
       data: formData
    },
      options);
    }
  
const postApiImportValidateMapping = (
    validateMappingRequest: BodyType<ValidateMappingRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/import/validate-mapping`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: validateMappingRequest
    },
      options);
    }
  
const postApiImportPreview = (
    previewImportRequest: BodyType<PreviewImportRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {const formData = new FormData();
if(previewImportRequest.mappings !== undefined && previewImportRequest.mappings !== null) {
 previewImportRequest.mappings.forEach(value => formData.append(`mappings`, JSON.stringify(value)));
 }
if(previewImportRequest.previewRows !== undefined) {
 formData.append(`previewRows`, previewImportRequest.previewRows.toString())
 }

      return mailConnectorInstance<void>(
      {url: `/api/import/preview`, method: 'POST',
      headers: {'Content-Type': 'multipart/form-data', },
       data: formData
    },
      options);
    }
  
const postApiImportExecute = (
    executeImportRequest: BodyType<ExecuteImportRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {const formData = new FormData();
if(executeImportRequest.mappings !== undefined && executeImportRequest.mappings !== null) {
 executeImportRequest.mappings.forEach(value => formData.append(`mappings`, JSON.stringify(value)));
 }
if(executeImportRequest.fileName !== undefined && executeImportRequest.fileName !== null) {
 formData.append(`fileName`, executeImportRequest.fileName)
 }

      return mailConnectorInstance<void>(
      {url: `/api/import/execute`, method: 'POST',
      headers: {'Content-Type': 'multipart/form-data', },
       data: formData
    },
      options);
    }
  
const getApiImportHistory = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/import/history`, method: 'GET'
    },
      options);
    }
  
const getApiImportSchema = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/import/schema`, method: 'GET'
    },
      options);
    }
  
const postApiV1FilesInitiateUpload = (
    initiateUploadRequest: BodyType<InitiateUploadRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/initiate-upload`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: initiateUploadRequest
    },
      options);
    }
  
const postApiV1FilesIdCompleteUpload = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}/complete-upload`, method: 'POST'
    },
      options);
    }
  
const postApiV1FilesIdAbortUpload = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}/abort-upload`, method: 'POST'
    },
      options);
    }
  
const getApiV1Files = (
    params?: GetApiV1FilesParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1FilesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}`, method: 'GET'
    },
      options);
    }
  
const deleteApiV1FilesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}`, method: 'DELETE'
    },
      options);
    }
  
const getApiV1FilesIdDownloadUrl = (
    id: string,
    params?: GetApiV1FilesIdDownloadUrlParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}/download-url`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1FilesQuota = (
    params?: GetApiV1FilesQuotaParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/quota`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1FilesBatchInitiateUpload = (
    batchInitiateUploadRequest: BodyType<BatchInitiateUploadRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/batch-initiate-upload`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: batchInitiateUploadRequest
    },
      options);
    }
  
const postApiV1FilesBatchCompleteUpload = (
    batchCompleteUploadRequest: BodyType<BatchCompleteUploadRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/batch-complete-upload`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: batchCompleteUploadRequest
    },
      options);
    }
  
const patchApiV1FilesIdMetadata = (
    id: string,
    updateFileMetadataRequest: BodyType<UpdateFileMetadataRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}/metadata`, method: 'PATCH',
      headers: {'Content-Type': 'application/json', },
      data: updateFileMetadataRequest
    },
      options);
    }
  
const postApiV1FilesIdRestore = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/${id}/restore`, method: 'POST'
    },
      options);
    }
  
const postApiV1FilesBatchDownloadUrl = (
    batchDownloadUrlRequest: BodyType<BatchDownloadUrlRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/files/batch-download-url`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: batchDownloadUrlRequest
    },
      options);
    }
  
const getApiV1MailAccounts = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts`, method: 'GET'
    },
      options);
    }
  
const postApiV1MailAccounts = (
    createMailAccountRequest: BodyType<CreateMailAccountRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createMailAccountRequest
    },
      options);
    }
  
const getApiV1MailAccountsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1MailAccountsId = (
    id: string,
    updateMailAccountDto: BodyType<UpdateMailAccountDto>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateMailAccountDto
    },
      options);
    }
  
const deleteApiV1MailAccountsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}`, method: 'DELETE'
    },
      options);
    }
  
const postApiV1MailAccountsConnect = (
    connectAccountRequest: BodyType<ConnectAccountRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/connect`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: connectAccountRequest
    },
      options);
    }
  
const getApiV1MailAccountsIdSyncStatus = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}/sync-status`, method: 'GET'
    },
      options);
    }
  
const postApiV1MailAccountsIdSync = (
    id: string,
    triggerSyncDto: BodyType<TriggerSyncDto>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}/sync`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: triggerSyncDto
    },
      options);
    }
  
const postApiV1MailAccountsIdSyncDirect = (
    id: string,
    triggerSyncDto: BodyType<TriggerSyncDto>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-accounts/${id}/sync-direct`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: triggerSyncDto
    },
      options);
    }
  
const postApiMailAssignmentsMailConnectorMessageIdAssign = (
    mailConnectorMessageId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/mail-assignments/${mailConnectorMessageId}/assign`, method: 'POST'
    },
      options);
    }
  
const deleteApiMailAssignmentsMailConnectorMessageIdUnassign = (
    mailConnectorMessageId: string,
    unassignRequest: BodyType<UnassignRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/mail-assignments/${mailConnectorMessageId}/unassign`, method: 'DELETE',
      headers: {'Content-Type': 'application/json', },
      data: unassignRequest
    },
      options);
    }
  
const getApiMailAssignmentsMy = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/mail-assignments/my`, method: 'GET'
    },
      options);
    }
  
const getApiMailAssignmentsMailConnectorMessageIdStatus = (
    mailConnectorMessageId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/mail-assignments/${mailConnectorMessageId}/status`, method: 'GET'
    },
      options);
    }
  
const putApiMailAssignmentsMailConnectorMessageIdStatus = (
    mailConnectorMessageId: string,
    updateStatusRequest: BodyType<UpdateStatusRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/mail-assignments/${mailConnectorMessageId}/status`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateStatusRequest
    },
      options);
    }
  
const postApiMailAssignmentsMailConnectorMessageIdReassign = (
    mailConnectorMessageId: string,
    reassignRequest: BodyType<ReassignRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/mail-assignments/${mailConnectorMessageId}/reassign`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: reassignRequest
    },
      options);
    }
  
const postApiMailAssignmentsMailConnectorMessageIdComplete = (
    mailConnectorMessageId: string,
    completeRequest: BodyType<CompleteRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/mail-assignments/${mailConnectorMessageId}/complete`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: completeRequest
    },
      options);
    }
  
const postApiMailAssignmentsMailConnectorMessageIdRefreshLock = (
    mailConnectorMessageId: string,
    refreshLockRequest: BodyType<RefreshLockRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/mail-assignments/${mailConnectorMessageId}/refresh-lock`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: refreshLockRequest
    },
      options);
    }
  
const getApiMailAssignmentsByStatusStatus = (
    status: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/mail-assignments/by-status/${status}`, method: 'GET'
    },
      options);
    }
  
const postApiV1MailAuthOauthUrl = (
    oAuthUrlRequest: BodyType<OAuthUrlRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-auth/oauth-url`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: oAuthUrlRequest
    },
      options);
    }
  
const postApiV1MailAuthExchangeToken = (
    exchangeTokenRequest: BodyType<ExchangeTokenRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-auth/exchange-token`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: exchangeTokenRequest
    },
      options);
    }
  
const postApiV1MailAuthRefreshToken = (
    refreshMailTokenRequest: BodyType<RefreshMailTokenRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-auth/refresh-token`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: refreshMailTokenRequest
    },
      options);
    }
  
const getApiV1MailMessages = (
    params?: GetApiV1MailMessagesParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1MailMessagesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailMessagesIdAttachments = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/attachments`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdDownload = (
    messageId: string,
    attachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/download`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdContent = (
    messageId: string,
    attachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/content`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdExtractText = (
    messageId: string,
    attachmentId: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/extract-text`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreview = (
    messageId: string,
    attachmentId: string,
    params?: GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/preview`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl = (
    messageId: string,
    attachmentId: string,
    params?: GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/presigned-url`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1MailMessagesIdProcess = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/process`, method: 'POST'
    },
      options);
    }
  
const postApiV1MailMessagesIdTriggerPipeline = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/trigger-pipeline`, method: 'POST'
    },
      options);
    }
  
const postApiV1MailMessagesIdNormalize = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/normalize`, method: 'POST'
    },
      options);
    }
  
const postApiV1MailMessagesIdClassify = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/classify`, method: 'POST'
    },
      options);
    }
  
const postApiV1MailMessagesIdExtract = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/extract`, method: 'POST'
    },
      options);
    }
  
const getApiV1MailMessagesIdProcessingJobs = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-messages/${id}/processing-jobs`, method: 'GET'
    },
      options);
    }
  
const getApiV1MailTemplates = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-templates`, method: 'GET'
    },
      options);
    }
  
const postApiV1MailTemplates = (
    createTemplateRequest: BodyType<CreateTemplateRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-templates`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createTemplateRequest
    },
      options);
    }
  
const getApiV1MailTemplatesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-templates/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1MailTemplatesId = (
    id: string,
    updateTemplateRequest: BodyType<UpdateTemplateRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-templates/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateTemplateRequest
    },
      options);
    }
  
const deleteApiV1MailTemplatesId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/mail-templates/${id}`, method: 'DELETE'
    },
      options);
    }
  
const getOauthCallback = (
    params?: GetOauthCallbackParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/oauth/callback`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1OrderDrafts = (
    params?: GetApiV1OrderDraftsParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1OrderDraftsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/${id}`, method: 'GET'
    },
      options);
    }
  
const postApiV1OrderDraftsIdApproveL1 = (
    id: string,
    reviewRequest: BodyType<ReviewRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/${id}/approve-l1`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: reviewRequest
    },
      options);
    }
  
const postApiV1OrderDraftsIdRejectL1 = (
    id: string,
    reviewRequest: BodyType<ReviewRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/${id}/reject-l1`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: reviewRequest
    },
      options);
    }
  
const postApiV1OrderDraftsIdConfirm = (
    id: string,
    reviewRequest: BodyType<ReviewRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/${id}/confirm`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: reviewRequest
    },
      options);
    }
  
const postApiV1OrderDraftsIdReject = (
    id: string,
    reviewRequest: BodyType<ReviewRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/${id}/reject`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: reviewRequest
    },
      options);
    }
  
const getApiV1OrderDraftsExport = (
    params?: GetApiV1OrderDraftsExportParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/order-drafts/export`, method: 'GET',
        params
    },
      options);
    }
  
const getApiV1UsersMe = (
    
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/me`, method: 'GET'
    },
      options);
    }
  
const putApiV1UsersMe = (
    updateUserRequest: BodyType<UpdateUserRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/me`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateUserRequest
    },
      options);
    }
  
const getApiV1Users = (
    params?: GetApiV1UsersParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1Users = (
    createUserRequest: BodyType<CreateUserRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createUserRequest
    },
      options);
    }
  
const getApiV1UsersId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1UsersId = (
    id: string,
    updateUserRequest: BodyType<UpdateUserRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateUserRequest
    },
      options);
    }
  
const deleteApiV1UsersId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}`, method: 'DELETE'
    },
      options);
    }
  
const postApiV1UsersIdRestore = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}/restore`, method: 'POST'
    },
      options);
    }
  
const patchApiV1UsersIdStatus = (
    id: string,
    updateUserStatusRequest: BodyType<UpdateUserStatusRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}/status`, method: 'PATCH',
      headers: {'Content-Type': 'application/json', },
      data: updateUserStatusRequest
    },
      options);
    }
  
const postApiV1UsersMeChangePassword = (
    changePasswordRequest: BodyType<ChangePasswordRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/me/change-password`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: changePasswordRequest
    },
      options);
    }
  
const postApiV1UsersIdResetPassword = (
    id: string,
    resetPasswordRequest: BodyType<ResetPasswordRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}/reset-password`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: resetPasswordRequest
    },
      options);
    }
  
const putApiV1UsersIdRoles = (
    id: string,
    updateUserRolesRequest: BodyType<UpdateUserRolesRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/users/${id}/roles`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateUserRolesRequest
    },
      options);
    }
  
const postApiV1WebhooksMailconnector = (
    webhookPayload: BodyType<WebhookPayload>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhooks/mailconnector`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: webhookPayload
    },
      options);
    }
  
const getApiV1WebhookSubscriptions = (
    params?: GetApiV1WebhookSubscriptionsParams,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions`, method: 'GET',
        params
    },
      options);
    }
  
const postApiV1WebhookSubscriptions = (
    createWebhookSubscriptionRequest: BodyType<CreateWebhookSubscriptionRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: createWebhookSubscriptionRequest
    },
      options);
    }
  
const getApiV1WebhookSubscriptionsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions/${id}`, method: 'GET'
    },
      options);
    }
  
const putApiV1WebhookSubscriptionsId = (
    id: string,
    updateWebhookSubscriptionRequest: BodyType<UpdateWebhookSubscriptionRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions/${id}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: updateWebhookSubscriptionRequest
    },
      options);
    }
  
const deleteApiV1WebhookSubscriptionsId = (
    id: string,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions/${id}`, method: 'DELETE'
    },
      options);
    }
  
const postApiV1WebhookSubscriptionsIdTest = (
    id: string,
    testWebhookRequest: BodyType<TestWebhookRequest>,
 options?: SecondParameter<typeof mailConnectorInstance<void>>,) => {
      return mailConnectorInstance<void>(
      {url: `/api/v1/webhook-subscriptions/${id}/test`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: testWebhookRequest
    },
      options);
    }
  
return {getApiV1AiOpenaiUsage,getApiV1AiOpenaiUsageCurrentMonth,putApiAttachmentReviewsMailConnectorAttachmentIdApprove,putApiAttachmentReviewsMailConnectorAttachmentIdReject,getApiAttachmentReviewsByMessageMailConnectorMessageId,getApiAttachmentReviewsByStatusStatus,getApiAttachmentReviewsMy,postApiAttachmentReviewsMailConnectorAttachmentIdReset,getApiAttachmentReviewsMailConnectorAttachmentId,postApiV1AuthLogin,postApiV1AuthRefresh,postApiV1AuthLogout,getApiV1AuthSessions,postApiV1AuthSessionsIdRevoke,postApiV1AuthLogoutAll,postApiV1AuthForgotPasswordSendOtp,postApiV1AuthForgotPasswordConfirmReset,postApiV1DocumentProcessorProcess,postApiV1DocumentProcessorProcessMultiple,getApiV1MailAnalysisResults,postApiV1MailAnalysisResults,getApiV1MailAnalysisResultsId,putApiV1MailAnalysisResultsIdFields,postApiImportUpload,postApiImportValidateMapping,postApiImportPreview,postApiImportExecute,getApiImportHistory,getApiImportSchema,postApiV1FilesInitiateUpload,postApiV1FilesIdCompleteUpload,postApiV1FilesIdAbortUpload,getApiV1Files,getApiV1FilesId,deleteApiV1FilesId,getApiV1FilesIdDownloadUrl,getApiV1FilesQuota,postApiV1FilesBatchInitiateUpload,postApiV1FilesBatchCompleteUpload,patchApiV1FilesIdMetadata,postApiV1FilesIdRestore,postApiV1FilesBatchDownloadUrl,getApiV1MailAccounts,postApiV1MailAccounts,getApiV1MailAccountsId,putApiV1MailAccountsId,deleteApiV1MailAccountsId,postApiV1MailAccountsConnect,getApiV1MailAccountsIdSyncStatus,postApiV1MailAccountsIdSync,postApiV1MailAccountsIdSyncDirect,postApiMailAssignmentsMailConnectorMessageIdAssign,deleteApiMailAssignmentsMailConnectorMessageIdUnassign,getApiMailAssignmentsMy,getApiMailAssignmentsMailConnectorMessageIdStatus,putApiMailAssignmentsMailConnectorMessageIdStatus,postApiMailAssignmentsMailConnectorMessageIdReassign,postApiMailAssignmentsMailConnectorMessageIdComplete,postApiMailAssignmentsMailConnectorMessageIdRefreshLock,getApiMailAssignmentsByStatusStatus,postApiV1MailAuthOauthUrl,postApiV1MailAuthExchangeToken,postApiV1MailAuthRefreshToken,getApiV1MailMessages,getApiV1MailMessagesId,getApiV1MailMessagesIdAttachments,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdDownload,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdContent,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdExtractText,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreview,getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl,postApiV1MailMessagesIdProcess,postApiV1MailMessagesIdTriggerPipeline,postApiV1MailMessagesIdNormalize,postApiV1MailMessagesIdClassify,postApiV1MailMessagesIdExtract,getApiV1MailMessagesIdProcessingJobs,getApiV1MailTemplates,postApiV1MailTemplates,getApiV1MailTemplatesId,putApiV1MailTemplatesId,deleteApiV1MailTemplatesId,getOauthCallback,getApiV1OrderDrafts,getApiV1OrderDraftsId,postApiV1OrderDraftsIdApproveL1,postApiV1OrderDraftsIdRejectL1,postApiV1OrderDraftsIdConfirm,postApiV1OrderDraftsIdReject,getApiV1OrderDraftsExport,getApiV1UsersMe,putApiV1UsersMe,getApiV1Users,postApiV1Users,getApiV1UsersId,putApiV1UsersId,deleteApiV1UsersId,postApiV1UsersIdRestore,patchApiV1UsersIdStatus,postApiV1UsersMeChangePassword,postApiV1UsersIdResetPassword,putApiV1UsersIdRoles,postApiV1WebhooksMailconnector,getApiV1WebhookSubscriptions,postApiV1WebhookSubscriptions,getApiV1WebhookSubscriptionsId,putApiV1WebhookSubscriptionsId,deleteApiV1WebhookSubscriptionsId,postApiV1WebhookSubscriptionsIdTest}};
export type GetApiV1AiOpenaiUsageResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiOpenaiUsage']>>>
export type GetApiV1AiOpenaiUsageCurrentMonthResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AiOpenaiUsageCurrentMonth']>>>
export type PutApiAttachmentReviewsMailConnectorAttachmentIdApproveResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiAttachmentReviewsMailConnectorAttachmentIdApprove']>>>
export type PutApiAttachmentReviewsMailConnectorAttachmentIdRejectResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiAttachmentReviewsMailConnectorAttachmentIdReject']>>>
export type GetApiAttachmentReviewsByMessageMailConnectorMessageIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiAttachmentReviewsByMessageMailConnectorMessageId']>>>
export type GetApiAttachmentReviewsByStatusStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiAttachmentReviewsByStatusStatus']>>>
export type GetApiAttachmentReviewsMyResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiAttachmentReviewsMy']>>>
export type PostApiAttachmentReviewsMailConnectorAttachmentIdResetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiAttachmentReviewsMailConnectorAttachmentIdReset']>>>
export type GetApiAttachmentReviewsMailConnectorAttachmentIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiAttachmentReviewsMailConnectorAttachmentId']>>>
export type PostApiV1AuthLoginResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthLogin']>>>
export type PostApiV1AuthRefreshResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthRefresh']>>>
export type PostApiV1AuthLogoutResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthLogout']>>>
export type GetApiV1AuthSessionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1AuthSessions']>>>
export type PostApiV1AuthSessionsIdRevokeResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthSessionsIdRevoke']>>>
export type PostApiV1AuthLogoutAllResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthLogoutAll']>>>
export type PostApiV1AuthForgotPasswordSendOtpResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthForgotPasswordSendOtp']>>>
export type PostApiV1AuthForgotPasswordConfirmResetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1AuthForgotPasswordConfirmReset']>>>
export type PostApiV1DocumentProcessorProcessResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1DocumentProcessorProcess']>>>
export type PostApiV1DocumentProcessorProcessMultipleResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1DocumentProcessorProcessMultiple']>>>
export type GetApiV1MailAnalysisResultsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAnalysisResults']>>>
export type PostApiV1MailAnalysisResultsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAnalysisResults']>>>
export type GetApiV1MailAnalysisResultsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAnalysisResultsId']>>>
export type PutApiV1MailAnalysisResultsIdFieldsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1MailAnalysisResultsIdFields']>>>
export type PostApiImportUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiImportUpload']>>>
export type PostApiImportValidateMappingResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiImportValidateMapping']>>>
export type PostApiImportPreviewResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiImportPreview']>>>
export type PostApiImportExecuteResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiImportExecute']>>>
export type GetApiImportHistoryResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiImportHistory']>>>
export type GetApiImportSchemaResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiImportSchema']>>>
export type PostApiV1FilesInitiateUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesInitiateUpload']>>>
export type PostApiV1FilesIdCompleteUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesIdCompleteUpload']>>>
export type PostApiV1FilesIdAbortUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesIdAbortUpload']>>>
export type GetApiV1FilesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1Files']>>>
export type GetApiV1FilesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1FilesId']>>>
export type DeleteApiV1FilesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1FilesId']>>>
export type GetApiV1FilesIdDownloadUrlResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1FilesIdDownloadUrl']>>>
export type GetApiV1FilesQuotaResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1FilesQuota']>>>
export type PostApiV1FilesBatchInitiateUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesBatchInitiateUpload']>>>
export type PostApiV1FilesBatchCompleteUploadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesBatchCompleteUpload']>>>
export type PatchApiV1FilesIdMetadataResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['patchApiV1FilesIdMetadata']>>>
export type PostApiV1FilesIdRestoreResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesIdRestore']>>>
export type PostApiV1FilesBatchDownloadUrlResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1FilesBatchDownloadUrl']>>>
export type GetApiV1MailAccountsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAccounts']>>>
export type PostApiV1MailAccountsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAccounts']>>>
export type GetApiV1MailAccountsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAccountsId']>>>
export type PutApiV1MailAccountsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1MailAccountsId']>>>
export type DeleteApiV1MailAccountsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1MailAccountsId']>>>
export type PostApiV1MailAccountsConnectResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAccountsConnect']>>>
export type GetApiV1MailAccountsIdSyncStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailAccountsIdSyncStatus']>>>
export type PostApiV1MailAccountsIdSyncResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAccountsIdSync']>>>
export type PostApiV1MailAccountsIdSyncDirectResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAccountsIdSyncDirect']>>>
export type PostApiMailAssignmentsMailConnectorMessageIdAssignResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiMailAssignmentsMailConnectorMessageIdAssign']>>>
export type DeleteApiMailAssignmentsMailConnectorMessageIdUnassignResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiMailAssignmentsMailConnectorMessageIdUnassign']>>>
export type GetApiMailAssignmentsMyResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiMailAssignmentsMy']>>>
export type GetApiMailAssignmentsMailConnectorMessageIdStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiMailAssignmentsMailConnectorMessageIdStatus']>>>
export type PutApiMailAssignmentsMailConnectorMessageIdStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiMailAssignmentsMailConnectorMessageIdStatus']>>>
export type PostApiMailAssignmentsMailConnectorMessageIdReassignResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiMailAssignmentsMailConnectorMessageIdReassign']>>>
export type PostApiMailAssignmentsMailConnectorMessageIdCompleteResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiMailAssignmentsMailConnectorMessageIdComplete']>>>
export type PostApiMailAssignmentsMailConnectorMessageIdRefreshLockResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiMailAssignmentsMailConnectorMessageIdRefreshLock']>>>
export type GetApiMailAssignmentsByStatusStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiMailAssignmentsByStatusStatus']>>>
export type PostApiV1MailAuthOauthUrlResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAuthOauthUrl']>>>
export type PostApiV1MailAuthExchangeTokenResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAuthExchangeToken']>>>
export type PostApiV1MailAuthRefreshTokenResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailAuthRefreshToken']>>>
export type GetApiV1MailMessagesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessages']>>>
export type GetApiV1MailMessagesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesId']>>>
export type GetApiV1MailMessagesIdAttachmentsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesIdAttachments']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdDownloadResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdDownload']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdContentResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdContent']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdExtractTextResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdExtractText']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreview']>>>
export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl']>>>
export type PostApiV1MailMessagesIdProcessResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailMessagesIdProcess']>>>
export type PostApiV1MailMessagesIdTriggerPipelineResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailMessagesIdTriggerPipeline']>>>
export type PostApiV1MailMessagesIdNormalizeResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailMessagesIdNormalize']>>>
export type PostApiV1MailMessagesIdClassifyResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailMessagesIdClassify']>>>
export type PostApiV1MailMessagesIdExtractResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailMessagesIdExtract']>>>
export type GetApiV1MailMessagesIdProcessingJobsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailMessagesIdProcessingJobs']>>>
export type GetApiV1MailTemplatesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailTemplates']>>>
export type PostApiV1MailTemplatesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1MailTemplates']>>>
export type GetApiV1MailTemplatesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1MailTemplatesId']>>>
export type PutApiV1MailTemplatesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1MailTemplatesId']>>>
export type DeleteApiV1MailTemplatesIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1MailTemplatesId']>>>
export type GetOauthCallbackResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getOauthCallback']>>>
export type GetApiV1OrderDraftsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1OrderDrafts']>>>
export type GetApiV1OrderDraftsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1OrderDraftsId']>>>
export type PostApiV1OrderDraftsIdApproveL1Result = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1OrderDraftsIdApproveL1']>>>
export type PostApiV1OrderDraftsIdRejectL1Result = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1OrderDraftsIdRejectL1']>>>
export type PostApiV1OrderDraftsIdConfirmResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1OrderDraftsIdConfirm']>>>
export type PostApiV1OrderDraftsIdRejectResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1OrderDraftsIdReject']>>>
export type GetApiV1OrderDraftsExportResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1OrderDraftsExport']>>>
export type GetApiV1UsersMeResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1UsersMe']>>>
export type PutApiV1UsersMeResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1UsersMe']>>>
export type GetApiV1UsersResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1Users']>>>
export type PostApiV1UsersResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1Users']>>>
export type GetApiV1UsersIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1UsersId']>>>
export type PutApiV1UsersIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1UsersId']>>>
export type DeleteApiV1UsersIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1UsersId']>>>
export type PostApiV1UsersIdRestoreResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1UsersIdRestore']>>>
export type PatchApiV1UsersIdStatusResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['patchApiV1UsersIdStatus']>>>
export type PostApiV1UsersMeChangePasswordResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1UsersMeChangePassword']>>>
export type PostApiV1UsersIdResetPasswordResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1UsersIdResetPassword']>>>
export type PutApiV1UsersIdRolesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1UsersIdRoles']>>>
export type PostApiV1WebhooksMailconnectorResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1WebhooksMailconnector']>>>
export type GetApiV1WebhookSubscriptionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1WebhookSubscriptions']>>>
export type PostApiV1WebhookSubscriptionsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1WebhookSubscriptions']>>>
export type GetApiV1WebhookSubscriptionsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['getApiV1WebhookSubscriptionsId']>>>
export type PutApiV1WebhookSubscriptionsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['putApiV1WebhookSubscriptionsId']>>>
export type DeleteApiV1WebhookSubscriptionsIdResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['deleteApiV1WebhookSubscriptionsId']>>>
export type PostApiV1WebhookSubscriptionsIdTestResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getLogisticsPlatformAPI>['postApiV1WebhookSubscriptionsIdTest']>>>

```

---

## File: `lib\generated\mail-connector\model\approveRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ApproveRequest {
  /** @nullable */
  notes?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\batchCompleteUploadRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface BatchCompleteUploadRequest {
  /** @nullable */
  fileIds?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\batchDownloadUrlRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface BatchDownloadUrlRequest {
  /** @nullable */
  fileIds?: string[] | null;
  expiryMinutes?: number;
}

```

---

## File: `lib\generated\mail-connector\model\batchInitiateUploadRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { BatchInitiateUploadRequestItem } from './batchInitiateUploadRequestItem';

export interface BatchInitiateUploadRequest {
  /** @nullable */
  items?: BatchInitiateUploadRequestItem[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\batchInitiateUploadRequestItem.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { DocumentType } from './documentType';
import type { FileVisibility } from './fileVisibility';

export interface BatchInitiateUploadRequestItem {
  /** @nullable */
  fileName?: string | null;
  /** @nullable */
  contentType?: string | null;
  sizeBytes?: number;
  documentType?: DocumentType;
  /** @nullable */
  tenantId?: string | null;
  /** @nullable */
  relatedEntityType?: string | null;
  /** @nullable */
  relatedEntityId?: string | null;
  visibility?: FileVisibility;
  /** @nullable */
  uploadExpirySeconds?: number | null;
}

```

---

## File: `lib\generated\mail-connector\model\changePasswordRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ChangePasswordRequest {
  /** @nullable */
  currentPassword?: string | null;
  /** @nullable */
  newPassword?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\columnMappingDto.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ColumnMappingDto {
  /** @nullable */
  excelColumn?: string | null;
  /** @nullable */
  reportColumn?: string | null;
  /** @nullable */
  dataType?: string | null;
  isRequired?: boolean;
  /** @nullable */
  validationPattern?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\completeRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CompleteRequest {
  /** @nullable */
  notes?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\confirmPasswordResetCommand.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ConfirmPasswordResetCommand {
  /** @nullable */
  email?: string | null;
  /** @nullable */
  token?: string | null;
  /** @nullable */
  newPassword?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\connectAccountRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ConnectAccountRequest {
  /** @nullable */
  authorizationCode?: string | null;
  /** @nullable */
  redirectUri?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\createAnalysisResultRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreateAnalysisResultRequest {
  emailMessageId?: string;
}

```

---

## File: `lib\generated\mail-connector\model\createMailAccountRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreateMailAccountRequest {
  /** @nullable */
  provider?: string | null;
  /** @nullable */
  authorizationCode?: string | null;
  /** @nullable */
  redirectUri?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\createTemplateRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { CreateTemplateRequestExpectedFields } from './createTemplateRequestExpectedFields';

export interface CreateTemplateRequest {
  /** @nullable */
  templateCode?: string | null;
  /** @nullable */
  templateName?: string | null;
  /** @nullable */
  description?: string | null;
  /** @nullable */
  subjectPattern?: string | null;
  /** @nullable */
  bodyPattern?: string | null;
  /** @nullable */
  expectedFields?: CreateTemplateRequestExpectedFields;
  /** @nullable */
  documentTypes?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\createTemplateRequestExpectedFields.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

/**
 * @nullable
 */
export type CreateTemplateRequestExpectedFields = {[key: string]: string} | null;

```

---

## File: `lib\generated\mail-connector\model\createUserRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreateUserRequest {
  /** @nullable */
  email?: string | null;
  /** @nullable */
  password?: string | null;
  /** @nullable */
  fullName?: string | null;
  /** @nullable */
  roles?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\createWebhookSubscriptionRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface CreateWebhookSubscriptionRequest {
  /** @nullable */
  subscriberCode?: string | null;
  /** @nullable */
  callbackUrl?: string | null;
  /** @nullable */
  eventTypes?: string[] | null;
  /** @nullable */
  secretKey?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\documentProcessingRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface DocumentProcessingRequest {
  /** @nullable */
  content?: string | null;
  /** @nullable */
  prompt?: string | null;
  /** @nullable */
  model?: string | null;
  isImage?: boolean;
  /** @nullable */
  mimeType?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\documentType.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];


// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DocumentType = {
  NUMBER_1: 1,
  NUMBER_2: 2,
  NUMBER_3: 3,
  NUMBER_4: 4,
  NUMBER_5: 5,
  NUMBER_6: 6,
  NUMBER_7: 7,
  NUMBER_8: 8,
  NUMBER_9: 9,
  NUMBER_10: 10,
} as const;

```

---

## File: `lib\generated\mail-connector\model\exchangeTokenRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ExchangeTokenRequest {
  /** @nullable */
  authorizationCode?: string | null;
  /** @nullable */
  redirectUri?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\executeImportRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { ColumnMappingDto } from './columnMappingDto';

export interface ExecuteImportRequest {
  /** @nullable */
  mappings?: ColumnMappingDto[] | null;
  /** @nullable */
  fileName?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\fileContentDto.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface FileContentDto {
  /** @nullable */
  fileName?: string | null;
  /** @nullable */
  content?: string | null;
  /** @nullable */
  type?: string | null;
  /** @nullable */
  mimeType?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\fileVisibility.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type FileVisibility = typeof FileVisibility[keyof typeof FileVisibility];


// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FileVisibility = {
  NUMBER_1: 1,
  NUMBER_2: 2,
  NUMBER_3: 3,
} as const;

```

---

## File: `lib\generated\mail-connector\model\getApiV1AiOpenaiUsageParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1AiOpenaiUsageParams = {
startDate?: string;
endDate?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1FilesIdDownloadUrlParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1FilesIdDownloadUrlParams = {
expiryMinutes?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1FilesParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1FilesParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1FilesQuotaParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1FilesQuotaParams = {
tenantId?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1MailAnalysisResultsParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1MailAnalysisResultsParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams = {
expiryMinutes?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewParams = {
variant?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1MailMessagesParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1MailMessagesParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1OrderDraftsExportParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1OrderDraftsExportParams = {
status?: string;
from?: string;
to?: string;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1OrderDraftsParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1OrderDraftsParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1UsersParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1UsersParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getApiV1WebhookSubscriptionsParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetApiV1WebhookSubscriptionsParams = {
filters?: string;
sortField?: string;
sortOrder?: string;
page?: number;
pageSize?: number;
};

```

---

## File: `lib\generated\mail-connector\model\getOauthCallbackParams.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type GetOauthCallbackParams = {
code?: string;
state?: string;
};

```

---

## File: `lib\generated\mail-connector\model\index.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export * from './approveRequest';
export * from './batchCompleteUploadRequest';
export * from './batchDownloadUrlRequest';
export * from './batchInitiateUploadRequest';
export * from './batchInitiateUploadRequestItem';
export * from './changePasswordRequest';
export * from './columnMappingDto';
export * from './completeRequest';
export * from './confirmPasswordResetCommand';
export * from './connectAccountRequest';
export * from './createAnalysisResultRequest';
export * from './createMailAccountRequest';
export * from './createTemplateRequest';
export * from './createTemplateRequestExpectedFields';
export * from './createUserRequest';
export * from './createWebhookSubscriptionRequest';
export * from './documentProcessingRequest';
export * from './documentType';
export * from './exchangeTokenRequest';
export * from './executeImportRequest';
export * from './fileContentDto';
export * from './fileVisibility';
export * from './getApiV1AiOpenaiUsageParams';
export * from './getApiV1FilesIdDownloadUrlParams';
export * from './getApiV1FilesParams';
export * from './getApiV1FilesQuotaParams';
export * from './getApiV1MailAnalysisResultsParams';
export * from './getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrlParams';
export * from './getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPreviewParams';
export * from './getApiV1MailMessagesParams';
export * from './getApiV1OrderDraftsExportParams';
export * from './getApiV1OrderDraftsParams';
export * from './getApiV1UsersParams';
export * from './getApiV1WebhookSubscriptionsParams';
export * from './getOauthCallbackParams';
export * from './initiateUploadRequest';
export * from './loginCommand';
export * from './logoutAllRequest';
export * from './logoutCommand';
export * from './oAuthUrlRequest';
export * from './postApiImportUploadBody';
export * from './previewImportRequest';
export * from './processMultipleDocumentsRequest';
export * from './reassignRequest';
export * from './refreshLockRequest';
export * from './refreshMailTokenRequest';
export * from './refreshTokenCommand';
export * from './rejectRequest';
export * from './resetPasswordRequest';
export * from './reviewRequest';
export * from './revokeSessionRequest';
export * from './sendPasswordResetOtpCommand';
export * from './testWebhookRequest';
export * from './testWebhookRequestPayload';
export * from './triggerSyncDto';
export * from './unassignRequest';
export * from './updateAnalysisResultFieldsRequest';
export * from './updateAnalysisResultFieldsRequestExtractedFields';
export * from './updateFileMetadataRequest';
export * from './updateMailAccountDto';
export * from './updateStatusRequest';
export * from './updateTemplateRequest';
export * from './updateTemplateRequestExpectedFields';
export * from './updateUserRequest';
export * from './updateUserRolesRequest';
export * from './updateUserStatusRequest';
export * from './updateWebhookSubscriptionRequest';
export * from './validateMappingRequest';
export * from './webhookPayload';
```

---

## File: `lib\generated\mail-connector\model\initiateUploadRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { DocumentType } from './documentType';
import type { FileVisibility } from './fileVisibility';

export interface InitiateUploadRequest {
  /** @nullable */
  fileName?: string | null;
  /** @nullable */
  contentType?: string | null;
  sizeBytes?: number;
  documentType?: DocumentType;
  /** @nullable */
  tenantId?: string | null;
  /** @nullable */
  relatedEntityType?: string | null;
  /** @nullable */
  relatedEntityId?: string | null;
  visibility?: FileVisibility;
  /** @nullable */
  uploadExpirySeconds?: number | null;
}

```

---

## File: `lib\generated\mail-connector\model\loginCommand.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface LoginCommand {
  /** @nullable */
  email?: string | null;
  /** @nullable */
  password?: string | null;
  /** @nullable */
  ipAddress?: string | null;
  /** @nullable */
  userAgent?: string | null;
  /** @nullable */
  deviceId?: string | null;
  /** @nullable */
  platform?: string | null;
  /** @nullable */
  deviceName?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\logoutAllRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface LogoutAllRequest {
  /** @nullable */
  reason?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\logoutCommand.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface LogoutCommand {
  /** @nullable */
  refreshToken?: string | null;
  /** @nullable */
  ipAddress?: string | null;
  /** @nullable */
  userAgent?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\oAuthUrlRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface OAuthUrlRequest {
  /** @nullable */
  redirectUri?: string | null;
  /** @nullable */
  state?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\postApiImportUploadBody.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export type PostApiImportUploadBody = {
  file?: Blob;
};

```

---

## File: `lib\generated\mail-connector\model\previewImportRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { ColumnMappingDto } from './columnMappingDto';

export interface PreviewImportRequest {
  /** @nullable */
  mappings?: ColumnMappingDto[] | null;
  previewRows?: number;
}

```

---

## File: `lib\generated\mail-connector\model\processMultipleDocumentsRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { FileContentDto } from './fileContentDto';

export interface ProcessMultipleDocumentsRequest {
  /** @nullable */
  files?: FileContentDto[] | null;
  /** @nullable */
  prompt?: string | null;
  /** @nullable */
  model?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\reassignRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ReassignRequest {
  toUserId?: string;
  /** @nullable */
  lockToken?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\refreshLockRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface RefreshLockRequest {
  /** @nullable */
  lockToken?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\refreshMailTokenRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface RefreshMailTokenRequest {
  /** @nullable */
  refreshToken?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\refreshTokenCommand.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface RefreshTokenCommand {
  /** @nullable */
  refreshToken?: string | null;
  /** @nullable */
  ipAddress?: string | null;
  /** @nullable */
  userAgent?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\rejectRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface RejectRequest {
  /** @nullable */
  reason?: string | null;
  /** @nullable */
  notes?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\resetPasswordRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ResetPasswordRequest {
  /** @nullable */
  newPassword?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\reviewRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface ReviewRequest {
  /** @nullable */
  note?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\revokeSessionRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface RevokeSessionRequest {
  /** @nullable */
  reason?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\sendPasswordResetOtpCommand.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface SendPasswordResetOtpCommand {
  /** @nullable */
  email?: string | null;
  /** @nullable */
  ipAddress?: string | null;
  /** @nullable */
  userAgent?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\testWebhookRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { TestWebhookRequestPayload } from './testWebhookRequestPayload';

export interface TestWebhookRequest {
  /** @nullable */
  eventType?: string | null;
  /** @nullable */
  payload?: TestWebhookRequestPayload;
}

```

---

## File: `lib\generated\mail-connector\model\testWebhookRequestPayload.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

/**
 * @nullable
 */
export type TestWebhookRequestPayload = unknown | null;

```

---

## File: `lib\generated\mail-connector\model\triggerSyncDto.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface TriggerSyncDto {
  /** @nullable */
  syncType?: string | null;
  /** @nullable */
  folderIds?: string[] | null;
  /** @nullable */
  fromDate?: string | null;
  /** @nullable */
  toDate?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\unassignRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UnassignRequest {
  /** @nullable */
  lockToken?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateAnalysisResultFieldsRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { UpdateAnalysisResultFieldsRequestExtractedFields } from './updateAnalysisResultFieldsRequestExtractedFields';

export interface UpdateAnalysisResultFieldsRequest {
  /** @nullable */
  extractedFields?: UpdateAnalysisResultFieldsRequestExtractedFields;
  /** @nullable */
  missingFields?: string[] | null;
  /** @nullable */
  warnings?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateAnalysisResultFieldsRequestExtractedFields.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

/**
 * @nullable
 */
export type UpdateAnalysisResultFieldsRequestExtractedFields = {[key: string]: string} | null;

```

---

## File: `lib\generated\mail-connector\model\updateFileMetadataRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { FileVisibility } from './fileVisibility';

export interface UpdateFileMetadataRequest {
  /** @nullable */
  relatedEntityType?: string | null;
  /** @nullable */
  relatedEntityId?: string | null;
  visibility?: FileVisibility;
}

```

---

## File: `lib\generated\mail-connector\model\updateMailAccountDto.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateMailAccountDto {
  /** @nullable */
  displayName?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateStatusRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateStatusRequest {
  /** @nullable */
  status?: string | null;
  /** @nullable */
  notes?: string | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateTemplateRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { UpdateTemplateRequestExpectedFields } from './updateTemplateRequestExpectedFields';

export interface UpdateTemplateRequest {
  /** @nullable */
  templateName?: string | null;
  /** @nullable */
  description?: string | null;
  /** @nullable */
  subjectPattern?: string | null;
  /** @nullable */
  bodyPattern?: string | null;
  /** @nullable */
  expectedFields?: UpdateTemplateRequestExpectedFields;
  /** @nullable */
  documentTypes?: string[] | null;
  /** @nullable */
  isActive?: boolean | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateTemplateRequestExpectedFields.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

/**
 * @nullable
 */
export type UpdateTemplateRequestExpectedFields = {[key: string]: string} | null;

```

---

## File: `lib\generated\mail-connector\model\updateUserRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateUserRequest {
  /** @nullable */
  fullName?: string | null;
  /** @nullable */
  roles?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateUserRolesRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateUserRolesRequest {
  /** @nullable */
  roles?: string[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\updateUserStatusRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateUserStatusRequest {
  isActive?: boolean;
}

```

---

## File: `lib\generated\mail-connector\model\updateWebhookSubscriptionRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface UpdateWebhookSubscriptionRequest {
  /** @nullable */
  callbackUrl?: string | null;
  /** @nullable */
  eventTypes?: string[] | null;
  /** @nullable */
  isActive?: boolean | null;
}

```

---

## File: `lib\generated\mail-connector\model\validateMappingRequest.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */
import type { ColumnMappingDto } from './columnMappingDto';

export interface ValidateMappingRequest {
  /** @nullable */
  mappings?: ColumnMappingDto[] | null;
}

```

---

## File: `lib\generated\mail-connector\model\webhookPayload.ts`

```ts
/**
 * Generated by orval v7.21.0 🍺
 * Do not edit manually.
 * Logistics Platform API
 * OpenAPI spec version: v1
 */

export interface WebhookPayload {
  /** @nullable */
  event?: string | null;
  eventId?: string;
  occurredAt?: string;
  /** @nullable */
  correlationId?: string | null;
  data?: unknown;
}

```

---

## File: `lib\generated\mail-connector-api.ts`

```ts
export * from "./mail-connector/endpoints"
export * from "./mail-connector/model"

```

---

## File: `lib\get-error-message.ts`

```ts
import axios from "axios"

type ApiErrorShape = {
  errors?: Array<{ message?: string }>
  message?: string
}

export function getErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra"): string {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    const firstApiError = error.response?.data?.errors?.[0]?.message
    if (firstApiError) return firstApiError
    if (typeof error.response?.data?.message === "string") return error.response.data.message
    if (error.message) return error.message
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}

```

---

## File: `lib\orval\mail-connector-mutator.ts`

```ts
import Axios, { AxiosError, AxiosRequestConfig } from "axios"
import { RefreshTokenCommand } from "@/lib/generated/mail-connector/model"
import { useAuthStore } from "@/lib/stores/auth-store"

const MAIL_CONNECTOR_BASE_URL =
  process.env.NEXT_PUBLIC_MAIL_CONNECTOR_API_URL ??
  "https://vietprodev.duckdns.org/gateway/logistics"

// Separate axios instance without interceptors for refresh token to avoid loop
const REFRESH_AXIOS = Axios.create({
  baseURL: MAIL_CONNECTOR_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const MAIL_CONNECTOR_AXIOS = Axios.create({
  baseURL: MAIL_CONNECTOR_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

async function doRefreshToken() {
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) throw new Error("No refresh token")

  const refreshTokenCommand: RefreshTokenCommand = { refreshToken }

  // Use Orval-generated model but direct axios call to avoid interceptor loop
  const res = await REFRESH_AXIOS.post<{ accessToken?: string; refreshToken?: string }>(
    "/api/v1/auth/refresh",
    refreshTokenCommand
  )

  const data = res.data
  if (!data?.accessToken) throw new Error("Refresh failed: no accessToken in response")

  localStorage.setItem("token", data.accessToken)
  if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
  return data.accessToken
}

MAIL_CONNECTOR_AXIOS.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

MAIL_CONNECTOR_AXIOS.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (typeof window === "undefined") {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          resolve(MAIL_CONNECTOR_AXIOS(originalRequest))
        })
      })
    }

    isRefreshing = true

    try {
      const newToken = await doRefreshToken()
      onTokenRefreshed(newToken)
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
      }
      return MAIL_CONNECTOR_AXIOS(originalRequest)
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userId")
      useAuthStore.getState().clearAuth()
      window.location.href = "/login"
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export const mailConnectorInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return MAIL_CONNECTOR_AXIOS({
    ...config,
    ...options,
  }).then(({ data }) => data)
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData

```

---

## File: `lib\orval\user-api-mutator.ts`

```ts
import { MAIL_CONNECTOR_AXIOS } from "./mail-connector-mutator"
import type { AxiosError, AxiosRequestConfig } from "axios"

export const userApiInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return MAIL_CONNECTOR_AXIOS({
    ...config,
    ...options,
  }).then(({ data }) => data)
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData

```

---

## File: `lib\stores\auth-store.ts`

```ts
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

```

---

## File: `lib\utils.ts`

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

---

## File: `luong-app.md`

```md
# Luồng Ứng Dụng Bóc Tách Dữ Liệu Logistics

## Tổng quan
Ứng dụng xử lý email logistics tự động bằng AI, từ việc đồng bộ email đến bóc tách dữ liệu và xuất báo cáo.

---

## Giai đoạn 1: Đồng bộ Email

### 1.1 Kết nối Gmail
- **Đầu vào**: Tài khoản Gmail
- **Hành động**: Đồng bộ email về hệ thống

### 1.2 Kiểm tra đồng bộ
- **Điều kiện**: Đồng bộ thành công?
  - **❌ Không**: Ghi log lỗi & Thông báo Admin → Quay lại bước 1.1
  - **✅ Có**: Tiếp tục

---

## Giai đoạn 2: Lọc Email

### 2.1 Kiểm tra trùng lặp
- **Điều kiện**: Email trùng lặp?
  - **✅ Có**: Bỏ qua / Gộp vào email đã tồn tại → Kết thúc luồng
  - **❌ Không**: Tiếp tục

### 2.2 Lọc tiêu đề email
- **Hành động**: AI / Rule Engine lọc tiêu đề email

### 2.3 Kiểm tra nhóm Logistics
- **Điều kiện**: Thuộc nhóm Logistics?
  - **❌ Không**: Không xử lý → Kết thúc luồng
  - **✅ Có**: Tiếp tục

---

## Giai đoạn 3: Xử lý bởi Nhân viên

### 3.1 Xem danh sách email
- **Hành động**: Nhân viên xem danh sách email

### 3.2 Chọn email xử lý
- **Điều kiện**: Chọn email để xử lý?
  - **❌ Không**: Quay lại xem danh sách
  - **✅ Có**: Tiếp tục

### 3.3 Kiểm tra trạng thái email
- **Điều kiện**: Email đã được nhân viên khác xác nhận?
  - **✅ Rồi**: Thông báo "Email đã có người xử lý" → Quay lại danh sách
  - **❌ Chưa**: Tiếp tục

---

## Giai đoạn 4: Xem Chi tiết Email

### 4.1 Mở chi tiết
- **Hành động**: Mở Chi tiết Email
- **Dữ liệu hiển thị**:
  - 📝 Nội dung email
  - 📎 Tệp đính kèm

### 4.2 Kiểm tra nội dung
- **Điều kiện**: Nội dung đầy đủ?
  - **❌ Không**: Yêu cầu bổ sung → Quay lại chi tiết
  - **✅ Có**: Tiếp tục

### 4.3 Kiểm tra tệp đính kèm
- **Điều kiện**: Có tệp đính kèm?
  - **❌ Không**: Gửi nội dung vào AI
  - **✅ Có**: Kiểm tra từng tệp

#### 4.3.1 Kiểm tra tệp
- **Hành động**: Kiểm tra từng tệp
- **Điều kiện**: Tệp hợp lệ?
  - **❌ Không hợp lệ**: Bỏ qua tệp → Kiểm tra tệp tiếp theo
  - **🟡 Đang kiểm tra**: Đang kiểm tra
  - **✅ Đã duyệt**: Gửi vào AI

---

## Giai đoạn 5: Bóc Tách bằng AI

### 5.1 Gửi dữ liệu vào AI
- **Dữ liệu gửi**: Nội dung + Tệp đính kèm (PDF, Excel, Word...)
- **Hành động**: AI bóc tách dữ liệu

### 5.2 Kiểm tra kết quả bóc tách
- **Điều kiện**: AI bóc tách thành công?
  - **❌ Thất bại**: Ghi log lỗi → Quay lại gửi lại
  - **✅ Thành công**: Tiếp tục

---

## Giai đoạn 6: Xử lý Dữ Liệu Bóc Tách

### 6.1 Nhận dữ liệu
- **Hành động**: Dữ liệu bóc tách được trả về

### 6.2 Kiểm tra dữ liệu
- **Điều kiện**: Dữ liệu thiếu / sai cấu trúc?
  - **✅ Có**: Cảnh báo & Cho phép chỉnh sửa → Export
  - **❌ Không**: Export trực tiếp

---

## Giai đoạn 7: Export Dữ Liệu

### 7.1 Export Excel
- **Hành động**: Export dữ liệu ra file Excel

### 7.2 Kiểm tra export
- **Điều kiện**: Export thành công?
  - **❌ Không**: Ghi log lỗi export lại → Quay lại export
  - **✅ Có**: Tiếp tục

---

## Giai đoạn 8: Import vào Báo cáo Tổng

### 8.1 Chọn file import
- **Hành động**: Người dùng chọn Import vào Báo cáo Tổng

### 8.2 Kiểm tra file Excel
- **Điều kiện**: File Excel hợp lệ?
  - **❌ Không**: Thông báo lỗi file sai định dạng / hỏng → Dừng import
  - **✅ Có**: Tiếp tục

### 8.3 Thực hiện import
- **Hành động**: Thực hiện Import dữ liệu

### 8.4 Kiểm tra import
- **Điều kiện**: Import thành công?
  - **❌ Không**: Rollback / Ghi log thông báo dòng lỗi
  - **✅ Có**: Hoàn thành

---

## Trạng thái Kết thúc

### 🟢 TRẠNG THÁI: Đã bóc tách
- Email đã được xử lý hoàn tất
- Dữ liệu đã được import vào Báo cáo Tổng

---

## Các điểm lưu ý

1. **Xử lý lỗi**: Mỗi bước đều có cơ chế xử lý lỗi và ghi log
2. **Kiểm tra trùng lặp**: Tránh xử lý email nhiều lần
3. **Kiểm tra đồng thời**: Tránh xung đột khi nhiều nhân viên xử lý cùng một email
4. **Validation**: Kiểm tra tính hợp lệ của tệp đính kèm trước khi gửi AI
5. **Rollback**: Có cơ chế rollback khi import thất bại

```

---

## File: `next-env.d.ts`

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

---

## File: `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```

---

## File: `orval.config.ts`

```ts
import { defineConfig } from "orval"

export default defineConfig({
  mailConnector: {
    input: {
      target: "https://vietprodev.duckdns.org/gateway/logistics/swagger/v1/swagger.json",
    },
    output: {
      mode: "split",
      target: "./lib/generated/mail-connector/endpoints.ts",
      schemas: "./lib/generated/mail-connector/model",
      client: "axios",
      clean: true,
      override: {
        mutator: {
          path: "./lib/orval/mail-connector-mutator.ts",
          name: "mailConnectorInstance",
        },
      },
    },
  },
})

```

---

## File: `package.json`

```json
{
  "name": "logistics",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "api:gen": "pnpm run api:gen:mail-connector",
    "api:gen:mail-connector": "orval --config orval.config.ts"
  },
  "dependencies": {
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-toast": "^1.2.15",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^5.100.14",
    "axios": "^1.16.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dayjs": "^1.11.20",
    "docx-preview": "^0.3.7",
    "driver.js": "^1.4.0",
    "framer-motion": "^12.40.0",
    "lucide-react": "^1.16.0",
    "mammoth": "^1.12.0",
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "recharts": "^3.8.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.6.0",
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@tanstack/react-query-devtools": "^5.100.14",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "orval": "^7.15.0",
    "sharp": "^0.34.5",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}

```

---

## File: `postcss.config.mjs`

```mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

```

---

## File: `README.md`

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

---

## File: `session-summary.md`

```md
# Session Summary — 26/05/2026

## 1. Trang Emails (Danh sách)
- `@/app/(app)/emails/page.tsx`
  - Đổi `sortField` mặc định từ `"receivedAt"` → `"sentAt"`
  - Thêm `whitespace-nowrap` cho cột thời gian, badge trạng thái, cột đính kèm → fix UI xộc xệch
- `@/hooks/use-mail-queries.ts`
  - Đổi `SortField` mặc định trong hook thành `"sentAt"`
  - Đổi `syncType` từ `"full"` → `"MANUAL_RESYNC"`

## 2. API Endpoint — Chuyển sang Logistics
- `@/orval.config.ts`
  - Swagger spec: `gateway/mail-connector/...` → `gateway/logistics/...`
- `@/lib/orval/mail-connector-mutator.ts`
  - Base URL default: `gateway/mail-connector` → `gateway/logistics`
- `@/lib/api.ts`
  - `API_BASE`: `"/api/v1"` → `"https://vietprodev.duckdns.org/gateway/logistics/api/v1"`
  - Login type: cập nhật khớp response logistics (`accessToken`, `refreshToken`, `expiresIn`, `user.userId`, `permissions`)
- Chạy `pnpm run api:gen:mail-connector` → regenerate generated code
- User tự đổi `getMailConnectorAPI` → `getLogisticsPlatformAPI` trong hooks

## 3. Login Page
- `@/app/login/page.tsx`
  - Gắn API `login()` từ `@/lib/api`
  - Lưu `accessToken`, `refreshToken`, `userId` vào `localStorage`
  - Thêm loading state, error message, disable button khi đang xử lý
  - Thêm `text-neutral-800` cho input để chữ nhập hiện màu đen (thay vì xám)
  - Thêm `placeholder:text-neutral-200` cho placeholder

## 4. Trang Chi tiết Email (70/30 Layout)
- `@/app/(app)/emails/[id]/page.tsx`
  - Chia layout: **70%** nội dung email (trái) + **30%** file đính kèm (phải)
  - Thêm state `selectedForAI: Set<string>` để chọn file gửi AI
  - Mỗi file đính kèm có nút toggle **"AI"** (xanh khi chọn, xám khi không)
  - Thu gọn tên file + contentType bằng JS truncate (max 22 & 10 ký tự)
  - Rút gọn button: `AI | Text | Xem | ↓ | ✓` — text 11px, padding nhỏ
  - Thêm `min-w-0`, `overflow-hidden`, `w-full` cho chain flex để tránh tràn

## 5. Cơ chế Token
- Interceptor request: gắn `Authorization: Bearer <token>` từ `localStorage`
- Interceptor response: khi **401** → xóa token, redirect `/login`
- **Chưa có** auto-refresh token (backend có endpoint `/auth/refresh` nhưng chưa tích hợp tự động)

## 6. Lỗi đã fix
- **"Invalid sync type 'full'"** → đổi thành `MANUAL_RESYNC`
- **401 redirect liên tục** → sửa login lấy đúng field `accessToken` thay vì `token`
- **UI item file đính kèm tràn** → JS truncate + compact button + overflow-hidden chain

```

---

## File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}

```

---

## File: `types\index.ts`

```ts
export interface ApiResponse<T> {
  correlationId: string
  traceId: string
  timestamp: string
  data: T | null
  meta: ApiMeta
  errors: ApiError[]
}

export interface ApiMeta {
  pagination?: PaginationMeta
  job?: JobMeta
  extra?: Record<string, unknown>
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface JobMeta {
  jobId: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  pollUrl?: string
}

export interface ApiError {
  field?: string
  code: string
  message: string
  messageKey?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export interface MailAccount {
  id: string
  provider: string
  emailAddress: string
  displayName?: string
  status: 'active' | 'inactive' | 'error'
  lastSyncedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SyncStatus {
  accountId: string
  status: 'idle' | 'syncing' | 'completed' | 'failed'
  totalMessages: number
  syncedMessages: number
  failedMessages: number
  currentFolder?: string
  lastSyncedAt?: string
}

export interface MailMessage {
  id: string
  provider: string
  subject?: string
  fromEmail?: string
  fromName?: string
  receivedAt?: string
  hasAttachments: boolean
  syncStatus: string
  processStatus: string
}

export interface MailMessageDetail {
  id: string
  subject?: string
  fromEmail?: string
  fromName?: string
  toEmails: string[]
  ccEmails: string[]
  receivedAt?: string
  bodyText?: string
  bodyHtml?: string
  attachments: Attachment[]
}

export interface Attachment {
  id: string
  fileName: string
  contentType?: string
  fileSize?: number
  downloadStatus: string
  downloadUrl?: string
}

export interface EmailAnalysisResult {
  id: string
  emailMessageId: string
  category?: string
  detectedIntent?: string
  status: 'pending' | 'completed' | 'approved' | 'rejected'
  confidenceScore?: number
  extractedFields?: Record<string, string>
  missingFields?: string[]
  warnings?: string[]
  modelName?: string
  inputTokenCount?: number
  outputTokenCount?: number
  costEstimate?: number
  reviewedByUserId?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface EmailTemplate {
  id: string
  templateCode: string
  templateName: string
  description?: string
  subjectPattern?: string
  bodyPattern?: string
  expectedFields?: Record<string, string>
  documentTypes?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
  avatar?: string
  createdAt: string
}

export interface LogEntry {
  id: string
  level: 'info' | 'warning' | 'error'
  source: string
  message: string
  details?: string
  createdAt: string
}

export interface ReportData {
  id: string
  invoiceNumber?: string
  sender?: string
  amount?: number
  currency?: string
  date?: string
  status: string
  importedAt: string
}

```

---

## File: `user-api.md`

```md
# User Management API Documentation

**Version:** 1.0  
**Module:** Identity  
**Target Audience:** Frontend Developers

---

## Overview

User Management API cung cấp các endpoint để quản lý người dùng trong hệ thống, bao gồm tạo, cập nhật, xóa, activate/deactivate và quản lý roles.

**Base URL:** `https://{domain}/api/v1/users`

**Authentication:** Tất cả endpoints yêu cầu Bearer token (Access Token)

---

## Endpoints

### 1. Get Current User

Lấy thông tin người dùng hiện tại (đang đăng nhập).

**Endpoint:** `GET /api/v1/users/me`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**

```json
{
  "correlationId": "9b7b7f6e-4b5c-4c3d-b7d4-9cc3f6e4d888",
  "traceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "roles": ["admin", "user"],
    "isActive": true
  },
  "meta": {},
  "errors": []
}
```

**Error Response (401 Unauthorized):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "UNAUTHORIZED",
      "message": "User claims not found",
      "messageKey": "auth.unauthorized",
      "severity": "high"
    }
  ]
}
```

---

### 2. Update My Profile

Cập nhật thông tin profile của chính người dùng đang đăng nhập.

**Endpoint:** `PUT /api/v1/users/me`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "fullName": "Updated Name"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | No | Tên đầy đủ mới |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Updated Name",
    "roles": ["viewer"],
    "isActive": true
  },
  "meta": {},
  "errors": []
}
```

**Error Response (401 Unauthorized):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "UNAUTHORIZED",
      "message": "User not found or inactive",
      "messageKey": "auth.unauthorized",
      "severity": "high"
    }
  ]
}
```

**Note:** Endpoint này chỉ cho phép user cập nhật thông tin của chính mình. Không thể cập nhật email hoặc roles qua endpoint này.

---

### 3. List Users

Lấy danh sách người dùng với pagination, filtering và sorting.

**Endpoint:** `GET /api/v1/users`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filters` | string | No | Filter expression DSL (xem bên dưới) |
| `sortField` | string | No | Field để sort (mặc định: `CreatedAtUtc`). Các field có thể: `CreatedAtUtc`, `UpdatedAtUtc`, `Email`, `FullName` |
| `sortOrder` | string | No | Thứ tự sort: `asc` hoặc `desc` (mặc định: `desc`) |
| `page` | integer | No | Số trang (mặc định: 1) |
| `pageSize` | integer | No | Số items mỗi trang (mặc định: 20, max: 100) |

**Filter DSL Syntax:**

Endpoint sử dụng filter DSL tương tự Bekind backend convention:

- **Operators:**
  - `==` - Equal: `email==admin@example.com`
  - `@=` - Contains: `email@=gmail`, `fullName@=John`
  - `!=` - Not equal
  - `>=`, `<=`, `>`, `<` - Comparison
  - `@` - Starts with
  - `_=` - Ends with
  - `!@=`, `!_=` - Not contains, not ends with
  - `[]` - Is null

- **AND conditions:** Separated by comma
  - `email@=gmail,isActive==true`

- **OR conditions:** Pipe within one term
  - `isActive==true|isActive==false`

**Supported Filters:**

| Filter | Example | Description |
|--------|---------|-------------|
| `email@=` | `email@=gmail` | Email contains text (case-insensitive) |
| `email==` | `email==admin@example.com` | Email exact match |
| `fullName@=` | `fullName@=John` | Full name contains text |
| `fullName==` | `fullName==John Doe` | Full name exact match |
| `isActive==` | `isActive==true` | Filter by active status |
| `role==` | `role==admin` | Filter by role code |

**Examples:**

```
# Get all users with pagination
GET /api/v1/users?page=1&pageSize=20

# Filter by email contains gmail
GET /api/v1/users?filters=email@=gmail

# Filter by active status and role
GET /api/v1/users?filters=isActive==true,role==admin

# Search by full name
GET /api/v1/users?filters=fullName@=John

# Sort by creation date descending
GET /api/v1/users?sortField=CreatedAtUtc&sortOrder=desc

# Combine filters with pagination
GET /api/v1/users?filters=email@=gmail,isActive==true&sortField=CreatedAtUtc&sortOrder=desc&page=1&pageSize=10
```

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "roles": ["admin"],
      "isActive": true,
      "isLocked": false,
      "createdAtUtc": "2026-05-24T17:16:30.545Z",
      "updatedAtUtc": "2026-05-26T14:05:34.540Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "email": "user@example.com",
      "fullName": "Regular User",
      "roles": ["viewer"],
      "isActive": true,
      "isLocked": false,
      "createdAtUtc": "2026-05-26T14:05:41.592Z",
      "updatedAtUtc": "2026-05-26T14:05:41.593Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 45,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "job": null,
    "extra": {}
  },
  "errors": []
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `data` | array[] | Danh sách users trong trang hiện tại |
| `meta.pagination.page` | integer | Số trang hiện tại |
| `meta.pagination.pageSize` | integer | Số items mỗi trang |
| `meta.pagination.totalItems` | integer | Tổng số users (không phân trang) |
| `meta.pagination.totalPages` | integer | Tổng số trang |
| `meta.pagination.hasNextPage` | boolean | Có trang sau không |
| `meta.pagination.hasPreviousPage` | boolean | Có trang trước không |

---

### 4. Get User by ID

Lấy thông tin chi tiết của một người dùng cụ thể.

**Endpoint:** `GET /api/v1/users/{id}`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "roles": ["viewer", "editor"],
    "isActive": true,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:07:15.403Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

---

### 5. Create User

Tạo người dùng mới.

**Endpoint:** `POST /api/v1/users`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "fullName": "New User",
  "roles": ["viewer"]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Email người dùng (unique) |
| `password` | string | Yes | Mật khẩu (tối thiểu 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt) |
| `fullName` | string | Yes | Tên đầy đủ |
| `roles` | string[] | No | Danh sách roles (mặc định: ["VIEWER"]) |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "7f6b4795-3a7a-4f99-80fd-913e9f190874",
    "email": "newuser@example.com",
    "fullName": "New User",
    "roles": ["viewer"],
    "isActive": true,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:05:41.593Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": "email",
      "code": "EMAIL_EXISTS",
      "message": "Email already registered",
      "messageKey": "user.email_exists",
      "severity": "medium"
    }
  ]
}
```

**Error Codes:**
- `EMAIL_EXISTS` - Email đã được đăng ký
- `VALIDATION_PASSWORD_REQUIREMENTS` - Mật khẩu không đáp ứng yêu cầu

---

### 6. Update User

Cập nhật thông tin người dùng (FullName).

**Endpoint:** `PUT /api/v1/users/{id}`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Request Body:**

```json
{
  "fullName": "Updated Name"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | No | Tên đầy đủ mới |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Updated Name",
    "roles": ["viewer"],
    "isActive": true,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:06:48.315Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Note:** Để cập nhật roles, sử dụng endpoint `PUT /api/v1/users/{id}/roles`.

---

### 7. Update User Roles

Cập nhật roles của người dùng.

**Endpoint:** `PUT /api/v1/users/{id}/roles`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Request Body:**

```json
{
  "roles": ["viewer", "editor", "admin"]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roles` | string[] | Yes | Danh sách roles mới (sẽ thay thế toàn bộ roles hiện tại) |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "User Name",
    "roles": ["viewer", "editor"],
    "isActive": true,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:09:08.060Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Note:** Endpoint này sẽ thay thế toàn bộ roles hiện tại bằng roles mới. Không support partial update.

---

### 8. Update User Status

Cập nhật trạng thái active/inactive của người dùng.

**Endpoint:** `PATCH /api/v1/users/{id}/status`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Request Body:**

```json
{
  "isActive": false
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isActive` | boolean | Yes | `true` để activate, `false` để deactivate |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "User Name",
    "roles": ["viewer"],
    "isActive": false,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:07:15.403Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Note:** User bị deactivate sẽ không thể đăng nhập.

---

### 8. Delete User

Soft delete người dùng (đánh dấu là deleted, không xóa thực tế).

**Endpoint:** `DELETE /api/v1/users/{id}`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deleted": true
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Note:** Đây là soft delete, user vẫn tồn tại trong database nhưng được đánh dấu `isDeleted = true`. User bị delete sẽ không thể đăng nhập.

---

### 9. Restore User

Khôi phục user đã bị soft delete.

**Endpoint:** `POST /api/v1/users/{id}/restore`

**Headers:**

```http
Authorization: Bearer {accessToken}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID cần restore |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "User Name",
    "roles": ["viewer"],
    "isActive": true,
    "isLocked": false,
    "createdAtUtc": "2026-05-26T14:05:41.592Z",
    "updatedAtUtc": "2026-05-26T14:10:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_DELETED",
      "message": "User is not deleted",
      "messageKey": "user.not_deleted",
      "severity": "low"
    }
  ]
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Note:** Chỉ restore được user đã bị soft delete. User sẽ có thể đăng nhập lại sau khi restore.

---

### 10. Change My Password

Đổi mật khẩu của chính người dùng đang đăng nhập.

**Endpoint:** `POST /api/v1/users/me/change-password`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | string | Yes | Mật khẩu hiện tại |
| `newPassword` | string | Yes | Mật khẩu mới |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "passwordChanged": true
  },
  "meta": {},
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "INVALID_PASSWORD",
      "message": "Current password is incorrect",
      "messageKey": "user.invalid_password",
      "severity": "medium"
    }
  ]
}
```

**Error Response (401 Unauthorized):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "UNAUTHORIZED",
      "message": "User not found or inactive",
      "messageKey": "auth.unauthorized",
      "severity": "high"
    }
  ]
}
```

**Error Codes:**
- `INVALID_PASSWORD` - Mật khẩu hiện tại không đúng
- `VALIDATION_PASSWORD_REQUIREMENTS` - Mật khẩu mới không đáp ứng yêu cầu
- `UNAUTHORIZED` - User không tồn tại hoặc đã bị deactivate

**Note:** Endpoint này chỉ cho phép user đổi mật khẩu của chính mình. Không cần truyền user ID.

---

### 11. Reset User Password (Admin)

Reset mật khẩu của một người dùng (chỉ dành cho admin).

**Endpoint:** `POST /api/v1/users/{id}/reset-password`

**Headers:**

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID cần reset mật khẩu |

**Request Body:**

```json
{
  "newPassword": "NewSecurePassword456!"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `newPassword` | string | Yes | Mật khẩu mới |

**Success Response (200 OK):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "passwordReset": true
  },
  "meta": {},
  "errors": []
}
```

**Error Response (404 Not Found):**

```json
{
  "correlationId": "...",
  "traceId": "...",
  "timestamp": "2026-05-26T10:30:00.000Z",
  "data": null,
  "meta": {},
  "errors": [
    {
      "field": null,
      "code": "USER_NOT_FOUND",
      "message": "User not found",
      "messageKey": "user.not_found",
      "severity": "medium"
    }
  ]
}
```

**Error Codes:**
- `USER_NOT_FOUND` - User không tồn tại
- `VALIDATION_PASSWORD_REQUIREMENTS` - Mật khẩu mới không đáp ứng yêu cầu

**Note:** Endpoint này yêu cầu quyền admin. Không cần verify mật khẩu hiện tại. Nên sử dụng kết hợp với gửi email thông báo cho user về việc mật khẩu đã được reset.

---

## TypeScript Interfaces

```typescript
// User DTO
interface UserDto {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
  isLocked: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

// Current User Response
interface CurrentUserResponse {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
}

// Update My Profile Response
interface UpdateMyProfileResponse {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
}

// Create User Request
interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  roles?: string[];
}

// Update User Request
interface UpdateUserRequest {
  fullName?: string;
}

// Update User Roles Request
interface UpdateUserRolesRequest {
  roles: string[];
}

// Update User Status Request
interface UpdateUserStatusRequest {
  isActive: boolean;
}

// Change Password Request
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Reset Password Request
interface ResetPasswordRequest {
  newPassword: string;
}

// Delete User Response
interface DeleteUserResponse {
  id: string;
  deleted: boolean;
}

// Change Password Response
interface ChangePasswordResponse {
  id: string;
  passwordChanged: boolean;
}

// Reset Password Response
interface ResetPasswordResponse {
  id: string;
  passwordReset: boolean;
}

// API Response Wrapper
interface ApiResponse<T> {
  correlationId: string;
  traceId: string;
  timestamp: string;
  data: T | null;
  meta: Record<string, unknown>;
  errors: ApiError[];
}

interface ApiError {
  field: string | null;
  code: string;
  message: string;
  messageKey?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}
```

---

## Frontend Implementation Guide

### 1. User Service

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://{domain}/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Get current user
async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await api.get<ApiResponse<CurrentUserResponse>>('/users/me');
  return response.data.data;
}

// Update my profile
async function updateMyProfile(data: UpdateUserRequest): Promise<UpdateMyProfileResponse> {
  const response = await api.put<ApiResponse<UpdateMyProfileResponse>>('/users/me', data);
  return response.data.data;
}

// List all users with pagination and filters
async function listUsers(query: PagedQuery): Promise<UserDto[]> {
  const params = new URLSearchParams();
  if (query.filters) params.append('filters', query.filters);
  if (query.sortField) params.append('sortField', query.sortField);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  params.append('page', query.page.toString());
  params.append('pageSize', query.pageSize.toString());

  const response = await api.get<ApiResponse<UserDto[]>>(`/users?${params.toString()}`);
  return response.data.data;
}

// Get user by ID
async function getUserById(id: string): Promise<UserDto> {
  const response = await api.get<ApiResponse<UserDto>>(`/users/${id}`);
  return response.data.data;
}

// Create user
async function createUser(data: CreateUserRequest): Promise<UserDto> {
  const response = await api.post<ApiResponse<UserDto>>('/users', data);
  return response.data.data;
}

// Update user
async function updateUser(id: string, data: UpdateUserRequest): Promise<UserDto> {
  const response = await api.put<ApiResponse<UserDto>>(`/users/${id}`, data);
  return response.data.data;
}

// Update user roles
async function updateUserRoles(id: string, data: UpdateUserRolesRequest): Promise<UserDto> {
  const response = await api.put<ApiResponse<UserDto>>(`/users/${id}/roles`, data);
  return response.data.data;
}

// Update user status
async function updateUserStatus(id: string, isActive: boolean): Promise<UserDto> {
  const response = await api.patch<ApiResponse<UserDto>>(
    `/users/${id}/status`,
    { isActive }
  );
  return response.data.data;
}

// Change my password
async function changeMyPassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const response = await api.post<ApiResponse<ChangePasswordResponse>>(
    '/users/me/change-password',
    data
  );
  return response.data.data;
}

// Reset user password (admin)
async function resetUserPassword(id: string, data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response = await api.post<ApiResponse<ResetPasswordResponse>>(
    `/users/${id}/reset-password`,
    data
  );
  return response.data.data;
}

// Delete user
async function deleteUser(id: string): Promise<DeleteUserResponse> {
  const response = await api.delete<ApiResponse<DeleteUserResponse>>(`/users/${id}`);
  return response.data.data;
}

// Restore user
async function restoreUser(id: string): Promise<UserDto> {
  const response = await api.post<ApiResponse<UserDto>>(`/users/${id}/restore`);
  return response.data.data;
}
```

### 2. React Component Example

```typescript
import React, { useState, useEffect } from 'react';

interface UserListProps {}

const UserList: React.FC<UserListProps> = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(id, !currentStatus);
      await loadUsers();
    } catch (err) {
      setError('Failed to update user status');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>User Management</h1>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Full Name</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.fullName}</td>
              <td>{user.roles.join(', ')}</td>
              <td>
                <span style={{ color: user.isActive ? 'green' : 'red' }}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button onClick={() => handleToggleActive(user.id, user.isActive)}>
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
```

---

## Security Best Practices

1. **Authorization:**
   - Chỉ admin hoặc user có quyền `user.manage` mới có thể truy cập các endpoint quản lý user
   - User thường chỉ có thể xem thông tin của chính mình qua `/users/me`

2. **Password Requirements:**
   - Tối thiểu 8 ký tự
   - Phải chứa chữ hoa, chữ thường, số
   - Khuyến khích có ký tự đặc biệt

3. **Soft Delete:**
   - Sử dụng soft delete thay vì hard delete
   - User bị delete vẫn có thể restore nếu cần

4. **Role Management:**
   - Role update là thay thế toàn bộ, không phải partial update
   - Luôn validate roles trước khi update

5. **Audit Trail:**
   - Mọi thay đổi user đều được log qua `updatedAtUtc`
   - Có thể thêm audit log chi tiết trong tương lai

---

## Error Handling

### Common Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `USER_NOT_FOUND` | User không tồn tại | Hiển thị thông báo, redirect về list |
| `EMAIL_EXISTS` | Email đã tồn tại | Hiển thị thông báo lỗi cho user |
| `INVALID_PASSWORD` | Mật khẩu sai | Yêu cầu nhập lại mật khẩu hiện tại |
| `VALIDATION_PASSWORD_REQUIREMENTS` | Mật khẩu không đủ mạnh | Hiển thị yêu cầu mật khẩu |
| `UNAUTHORIZED` | Không có quyền truy cập | Redirect về login hoặc hiển thị lỗi quyền |

---

## Testing

### User Management Flow Test

```bash
# Get current user
curl -X GET https://{domain}/api/v1/users/me \
  -H "Authorization: Bearer {accessToken}"

# Update my profile
curl -X PUT https://{domain}/api/v1/users/me \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name"
  }'

# List all users with pagination and filters
curl -X GET "https://{domain}/api/v1/users?filters=email@=gmail,isActive==true&sortField=CreatedAtUtc&sortOrder=desc&page=1&pageSize=20" \
  -H "Authorization: Bearer {accessToken}"

# Create user
curl -X POST https://{domain}/api/v1/users \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!",
    "fullName": "Test User",
    "roles": ["VIEWER"]
  }'

# Get user by ID
curl -X GET https://{domain}/api/v1/users/{userId} \
  -H "Authorization: Bearer {accessToken}"

# Update user
curl -X PUT https://{domain}/api/v1/users/{userId} \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name"
  }'

# Update user roles
curl -X PUT https://{domain}/api/v1/users/{userId}/roles \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["VIEWER", "EDITOR"]
  }'

# Update user status
curl -X PATCH https://{domain}/api/v1/users/{userId}/status \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'

# Delete user
curl -X DELETE https://{domain}/api/v1/users/{userId} \
  -H "Authorization: Bearer {accessToken}"

# Restore user
curl -X POST https://{domain}/api/v1/users/{userId}/restore \
  -H "Authorization: Bearer {accessToken}"

# Change my password
curl -X POST https://{domain}/api/v1/users/me/change-password \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword456!"
  }'

# Reset user password (admin)
curl -X POST https://{domain}/api/v1/users/{userId}/reset-password \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewPassword456!"
  }'
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-26 | Initial version - Full CRUD user management |

```

---
