"use client"
// ADMIN ROUTE: Quản lý template nhận diện và bóc tách email — chỉ admin

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

type TemplateItem = {
  id?: string | null
  templateCode?: string | null
  templateName?: string | null
  description?: string | null
  subjectPattern?: string | null
  bodyPattern?: string | null
  expectedFields?: Record<string, string> | null
  documentTypes?: string[] | null
  isActive?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
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

  const templates: TemplateItem[] = (templatesQuery.data ?? []) as TemplateItem[]
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
