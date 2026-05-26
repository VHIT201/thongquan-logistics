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
