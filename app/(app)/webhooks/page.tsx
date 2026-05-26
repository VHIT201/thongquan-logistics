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
